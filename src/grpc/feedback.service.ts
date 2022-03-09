import { Status } from '@grpc/grpc-js/build/src/constants'
import {
  FeedbackResponse,
  FeedbackService,
  FeedbackType,
} from '../../generated'
import { sendFeedback } from '../trello'
import { GrpcServer } from './type'

const convRequestType = (type: FeedbackType) => {
  switch (type) {
    case FeedbackType.BUG_REPORT:
      return 'BUG_REPORT'
    case FeedbackType.FEATURE_REQUEST:
      return 'FEATURE_REQUEST'
    case FeedbackType.CONTACT:
      return 'CONTACT'
    case FeedbackType.OTHER:
      return 'OTHER'
  }
}

export const feedbackService: GrpcServer<FeedbackService> = {
  async feedback({ request }, callback) {
    try {
      await sendFeedback(
        request.userId,
        convRequestType(request.type),
        request.content,
        request.email,
        request.userAgent,
        request.screenshot.byteLength ? request.screenshot : undefined
      )
      callback(null, FeedbackResponse.create({ message: `` }))
    } catch (error) {
      if (error instanceof Error) {
        callback({ code: Status.INVALID_ARGUMENT, details: error.message })
      } else {
        callback({ code: Status.INVALID_ARGUMENT })
      }
    }
  },
}
