import { baseEnvs } from '../../config/environment'
import { SQSTrigger } from './triggers.types'
import { QUEUES_NAME, SNS_TOPIC_NAME } from '../../../src/shared'

export const sqsHandlers = (): SQSTrigger[] => {
  const envs = baseEnvs()

  return [
    {
      id: 'orderCreatedSendEmailSQSHandler',
      handler: `application/sqs/handlers/order-created-send-email/index.handler`,
      timeout: 60,
      environment: envs,
      memorySize: 256,
      queue: QUEUES_NAME.ORDER_CREATED_SEND_EMAIL,
      reservedConcurrentExecutions: 5,
      queueSettings: {
        receiveMessageWaitTime: 20,
        retentionPeriod: 1,
      },
    },
    {
      id: 'orderCreatedConsumer1',
      handler: `application/sqs/handlers/order-created-consumer-1/index.handler`,
      timeout: 60,
      environment: envs,
      memorySize: 256,
      queue: QUEUES_NAME.ORDER_CREATED_CONSUMER_1,
      topic: SNS_TOPIC_NAME.ORDER_CREATED,
      reservedConcurrentExecutions: 5,
      queueSettings: {
        receiveMessageWaitTime: 20,
        retentionPeriod: 1,
      },
    },
    {
      id: 'orderCreatedConsumer2',
      handler: `application/sqs/handlers/order-created-consumer-2/index.handler`,
      timeout: 60,
      environment: envs,
      memorySize: 256,
      queue: QUEUES_NAME.ORDER_CREATED_CONSUMER_2,
      topic: SNS_TOPIC_NAME.ORDER_CREATED,
      reservedConcurrentExecutions: 5,
      queueSettings: {
        receiveMessageWaitTime: 20,
        retentionPeriod: 1,
      },
    },
  ]
}
