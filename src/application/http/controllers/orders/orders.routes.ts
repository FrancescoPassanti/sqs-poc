import { getSqsQueueBaseUrl, QUEUES_NAME } from '@src/shared'
import SQS from 'aws-sdk/clients/sqs'
import SNS from 'aws-sdk/clients/sns'
import { FastifyRequest } from 'fastify'
import { baseRouter } from '../controllers.util'
import { OrderRequest, orderRequest } from './orders.dtos'

const basePath = '/orders/'

const sqsClient = new SQS({ apiVersion: '2012-11-05' })
const snsClient = new SNS({ apiVersion: '2010-03-31' })

baseRouter.post(
  `${basePath}`,
  {
    schema: {
      body: orderRequest,
    },
  },
  async (
    request: FastifyRequest<{
      Body: OrderRequest
    }>,
    reply,
  ) => {
    try {
      await sqsClient
        .sendMessage({
          MessageBody: JSON.stringify({
            orderId: request.body.orderId,
            now: new Date().toUTCString(),
          }),
          QueueUrl: `${getSqsQueueBaseUrl()}${QUEUES_NAME.ORDER_CREATED_SEND_EMAIL}`,
        })
        .promise()
    } catch (exception) {
      console.error(exception)
    }

    return reply.send(request.body)
  },
)

baseRouter.post(
  `${basePath}/fanout`,
  {
    schema: {
      body: orderRequest,
    },
  },
  async (
    request: FastifyRequest<{
      Body: OrderRequest
    }>,
    reply,
  ) => {
    try {
      await snsClient
        .publish({
          Message: JSON.stringify({
            orderId: request.body.orderId,
            now: new Date().toUTCString(),
          }),
          TopicArn: process.env.ORDER_CREATED_ARN,
        })
        .promise()
    } catch (exception) {
      console.error(exception)
    }

    return reply.send(request.body)
  },
)

export const router = baseRouter
