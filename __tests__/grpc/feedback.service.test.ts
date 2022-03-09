import { DeepRequired, GrpcClient } from '../../src/grpc/type'
import { FeedbackService, FeedbackType } from '../../generated'
import { ServiceClientConstructor } from '@grpc/grpc-js/build/src/make-client'
import { startGrpcServer, stopGrpcServer } from '../../src/grpc'
import { Status } from '@grpc/grpc-js/build/src/constants'
import * as grpc from '@grpc/grpc-js'
import * as protoLoader from '@grpc/proto-loader'
import axios from "axios"
import fs from "fs"
import path from 'path'

const def = protoLoader.loadSync(
  path.resolve(__dirname, `../../protos/FeedbackService.proto`)
)
const pkg = grpc.loadPackageDefinition(def)
const ClientConstructor = pkg.FeedbackService as ServiceClientConstructor
let client: GrpcClient<FeedbackService>

beforeAll(async () => {
  await startGrpcServer()
  client = (new ClientConstructor(
    'localhost:50051',
    grpc.ChannelCredentials.createInsecure()
  ) as unknown) as GrpcClient<FeedbackService>
})

test('with a screenshot (Actually call trello api)', (done) => {
  const screenshot = fs.readFileSync("./__tests__/grpc/sample-screenshot.png")
  const feedback = {
    userId: "00000000-0000-0000-0000-000000000000",
    type: FeedbackType.OTHER,
    content: "Bug. Bug. Bug.",
    email: "hoge@example.com",
    userAgent: "Mozilla/5.0 (hogehogehoge)",
    screenshot,
  }

  client.feedback(feedback, (err, res) => {
    expect(err).toBeNull()
    expect(res?.message).toEqual(``)
    done()
  })
})

test('without a screenshot', (done) => {
  const feedback = {
    userId: "00000000-0000-0000-0000-000000000000",
    type: FeedbackType.OTHER,
    content: "Bug. Bug. Bug.",
    email: "hoge@example.com",
    userAgent: "Mozilla/5.0 (hogehogehoge)",
  }

  const spy = jest.spyOn(axios, "post")
  spy.mockResolvedValueOnce({ data: { id: "XXX" } }).mockResolvedValue({})

  client.feedback(feedback, (err, res) => {
    expect(err).toBeNull()
    expect(res?.message).toEqual(``)
    spy.mockRestore()
    done()
  })
})

test('userId, content, email, userAgent are emtry strings.', (done) => {
  const feedback = {
    userId: "",
    type: FeedbackType.OTHER,
    content: "",
    email: "",
    userAgent: "",
  }

  const spy = jest.spyOn(axios, "post")
  spy.mockResolvedValueOnce({ data: { id: "XXX" } }).mockResolvedValue({})

  client.feedback(feedback, (err, res) => {
    expect(err).toBeNull()
    expect(res?.message).toEqual(``)
    spy.mockRestore()
    done()
  })
})

describe('Feedback type is ', () => {
  const feedback = {
    userId: "00000000-0000-0000-0000-000000000000",
    content: "Bug. Bug. Bug.",
    email: "hoge@example.com",
    userAgent: "Mozilla/5.0 (hogehogehoge)",
  }

  test('BUG_REPORT', (done) => {
    const spy = jest.spyOn(axios, "post")
    spy.mockResolvedValueOnce({ data: { id: "XXX" } }).mockResolvedValue({})

    client.feedback({
      type: FeedbackType.BUG_REPORT,
      ...feedback
    }, (err, res) => {
      expect(err).toBeNull()
      expect(res?.message).toEqual(``)
      spy.mockRestore()
      done()
    })
  })

  test('FEATURE_REQUEST,', (done) => {
    const spy = jest.spyOn(axios, "post")
    spy.mockResolvedValueOnce({ data: { id: "XXX" } }).mockResolvedValue({})

    client.feedback({
      type: FeedbackType.FEATURE_REQUEST,
      ...feedback
    }, (err, res) => {
      expect(err).toBeNull()
      expect(res?.message).toEqual(``)
      spy.mockRestore()
      done()
    })
  })

  test('CONTACT', (done) => {
    const spy = jest.spyOn(axios, "post")
    spy.mockResolvedValueOnce({ data: { id: "XXX" } }).mockResolvedValue({})

    client.feedback({
      type: FeedbackType.CONTACT,
      ...feedback
    }, (err, res) => {
      expect(err).toBeNull()
      expect(res?.message).toEqual(``)
      spy.mockRestore()
      done()
    })
  })

  test('OHTER', (done) => {
    const spy = jest.spyOn(axios, "post")
    spy.mockResolvedValueOnce({ data: { id: "XXX" } }).mockResolvedValue({})

    client.feedback({
      type: FeedbackType.OTHER,
      ...feedback
    }, (err, res) => {
      expect(err).toBeNull()
      expect(res?.message).toEqual(``)
      spy.mockRestore()
      done()
    })
  })
})

test('Card creation api call fails.', (done) => {
  const feedback = {
    userId: "00000000-0000-0000-0000-000000000000",
    type: FeedbackType.OTHER,
    content: "Bug. Bug. Bug.",
    email: "hoge@example.com",
    userAgent: "Mozilla/5.0 (hogehogehoge)",
  }

  const spy = jest.spyOn(axios, "post")
  spy.mockImplementation(() => { throw new Error() })

  client.feedback(feedback, (err, _) => {
    expect(err?.code).toBe(Status.INVALID_ARGUMENT)
    expect(err?.details).toBe("Failed to create new card.")
    spy.mockRestore()
    done()
  })
})

test('Attaching a file api call fails.', (done) => {
  const screenshot = fs.readFileSync("./__tests__/grpc/sample-screenshot.png")
  const feedback = {
    userId: "00000000-0000-0000-0000-000000000000",
    type: FeedbackType.OTHER,
    content: "Bug. Bug. Bug.",
    email: "hoge@example.com",
    userAgent: "Mozilla/5.0 (hogehogehoge)",
    screenshot
  }

  const spy = jest.spyOn(axios, "post")
  spy.mockResolvedValueOnce({ data: { id: "XXX" } }).mockImplementationOnce(() => { throw new Error() })

  client.feedback(feedback, (err, _) => {
    expect(err?.code).toBe(Status.INVALID_ARGUMENT)
    expect(err?.details).toBe("Failed to attach a screenshot with ID XXX")
    spy.mockRestore()
    done()
  })
})

afterAll(stopGrpcServer)
