import { QUEUES_NAME, SNS_TOPIC_NAME } from '../../../src/shared'
import { baseEnvs } from '../../config/environment'
import { ApiTrigger } from './triggers.types'

export const routes = (): ApiTrigger[] => {
  const envs = baseEnvs()

  return [
    {
      id: 'orderController',
      handler: 'application/http/controllers/orders/index.handler',
      secure: true,
      paths: ['/orders/{any+}', '/orders'],
      timeout: 30,
      environment: envs,
      memorySize: 128,
      reservedConcurrentExecutions: 5,
      queues: [{ name: QUEUES_NAME.ORDER_CREATED_SEND_EMAIL }],
      topics: [{ name: SNS_TOPIC_NAME.ORDER_CREATED }],
    },
  ]
}
