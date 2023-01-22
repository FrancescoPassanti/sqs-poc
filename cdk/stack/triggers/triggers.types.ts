import { QUEUES_NAME, SNS_TOPIC_NAME } from '../../../src/shared'

export type BaseLambdaTrigger = {
  id: string
  handler: string
  environment?: Record<string, string>
  timeout: number
  memorySize: number
  reservedConcurrentExecutions?: number
}

export type SQSTrigger = BaseLambdaTrigger & {
  queue: QUEUES_NAME
  topic?: SNS_TOPIC_NAME
  queueSettings: {
    receiveMessageWaitTime: number
    retentionPeriod: number
  }
}

export type ApiTrigger = BaseLambdaTrigger & {
  secure: boolean
  paths: string[]
  queues?: { name: QUEUES_NAME }[]
  topics?: { name: SNS_TOPIC_NAME }[]
}
