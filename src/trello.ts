import 'dotenv/config'
import { DeepRequired } from './grpc/type'
import axios from 'axios'
import FormData from 'form-data'
import { logger } from './logger'

type FeedbackType = 'BUG_REPORT' | 'FEATURE_REQUEST' | 'CONTACT' | 'OTHER'

const formatContent = (
  userId: string,
  content: string,
  email: string,
  userEgent: string
) => `
# 内容
${content}

# 連絡先
${email}

# ユーザエージェント
${userEgent}

# ユーザID
${userId}
`

const authorization = {
  Authorization: `OAuth oauth_consumer_key="${process.env.TRELLO_KEY}", oauth_token="${process.env.TRELLO_TOKEN}"`,
}

const createCard = async (
  userId: string,
  type: FeedbackType,
  content: string,
  email: string,
  userEgent: string
) => {
  try {
    const res = await axios.post(
      `https://api.trello.com/1/cards?idList=${process.env.LIST_ID}`,
      {
        name: content.slice(0, 15) + '…',
        desc: formatContent(content, email, userEgent, userId),
        idLabels: [process.env[type]],
      },
      {
        headers: {
          ...authorization,
        },
      }
    )
    return res.data.id as string
  } catch (error) {
    logger.error(error)
    throw new Error('Failed to create new card.')
  }
}

const attachScreenshot = async (
  screenshot: DeepRequired<Uint8Array>,
  cardId: string
) => {
  const formData = new FormData()
  formData.append('file', screenshot, 'file')

  try {
    await axios.post(
      `https://api.trello.com/1/cards/${cardId}/attachments`,
      formData,
      {
        headers: {
          'content-length': formData.getLengthSync(),
          ...formData.getHeaders(),
          ...authorization,
        },
      }
    )
  } catch (error) {
    logger.error(error)
    throw new Error(`Failed to attach a screenshot with ID ${cardId}`)
  }
}

export const sendFeedback = async (
  userId: string,
  type: FeedbackType,
  content: string,
  email: string,
  userEgent: string,
  screenshot?: DeepRequired<Uint8Array>
) => {
  const cardId = await createCard(userId, type, content, email, userEgent)

  if (!screenshot || !cardId) return

  await attachScreenshot(screenshot, cardId)
}
