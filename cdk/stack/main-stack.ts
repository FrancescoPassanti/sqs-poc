import * as cdk from 'aws-cdk-lib'
import { HttpApi, HttpMethod } from '@aws-cdk/aws-apigatewayv2-alpha'
import { Function } from 'aws-cdk-lib/aws-lambda'
import { HttpLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations-alpha'
import { routes } from './triggers/triggers.routes'
import { getServiceName } from '../config/environment'
import { SQSTrigger } from './triggers/triggers.types'
import { createLambdaFunction, configureApiGateway } from './utils'
import { QUEUES_NAME, SNS_TOPIC_NAME } from '../../src/shared'
import { Queue } from 'aws-cdk-lib/aws-sqs'
import { sqsHandlers } from './triggers/triggers.sqs'
import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources'
import { Duration } from 'aws-cdk-lib'
import { Topic } from 'aws-cdk-lib/aws-sns'
import { SqsSubscription } from 'aws-cdk-lib/aws-sns-subscriptions'

export class MainStack extends cdk.Stack {
  private api?: HttpApi
  private queuesProducers: Record<QUEUES_NAME, Function[]> = {
    OrderCreatedSendEmail: [],
    OrderCreatedConsumer1: [],
    OrderCreatedConsumer2: [],
  }
  private snsTopics: Record<SNS_TOPIC_NAME, Function[]> = {
    OrderCreated: [],
  }

  private createdTopics: Record<string, Topic> = {}

  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props)
    this.initResources()
  }

  private initResources(): void {
    this.api = configureApiGateway({
      scope: this,
      serviceName: getServiceName(),
    })
    if (!this.api) {
      return
    }

    routes().forEach((route) => {
      const lambdaName = this.getResourceName(route.id)
      const { lambdaFunction } = createLambdaFunction(this, lambdaName, route)

      route.paths.forEach((path) => {
        this.api!.addRoutes({
          path: path,
          methods: [HttpMethod.POST, HttpMethod.GET],
          integration: new HttpLambdaIntegration(route.id, lambdaFunction),
        })
      })

      route?.queues?.forEach((queue) => {
        if (this.queuesProducers[queue.name]) {
          this.queuesProducers[queue.name].push(lambdaFunction)
        } else {
          this.queuesProducers[queue.name] = [lambdaFunction]
        }
      })

      route?.topics?.forEach(({ name }) => {
        if (this.snsTopics[name]) {
          this.snsTopics[name].push(lambdaFunction)
        } else {
          this.snsTopics[name] = [lambdaFunction]
        }
      })
    })

    sqsHandlers().forEach((handler) => {
      const lambdaName = this.getResourceName(handler.id)
      const { lambdaFunction } = createLambdaFunction(this, lambdaName, handler)
      this.configureSQSRule(lambdaFunction, handler)
    })
  }

  private configureSQSRule(
    lambdaFunction: Function,
    { queue, queueSettings, topic: topicName }: SQSTrigger,
  ): void {
    const batchWindow = 30
    const functionTimeout = lambdaFunction.timeout?.toSeconds()!
    const queueVisibilityTimeout = batchWindow + functionTimeout + 30

    const createdQueue = new Queue(this, queue as unknown as string, {
      queueName: queue as unknown as string,
      visibilityTimeout: Duration.seconds(queueVisibilityTimeout),
      receiveMessageWaitTime: Duration.seconds(queueSettings.receiveMessageWaitTime),
      retentionPeriod: Duration.days(queueSettings.retentionPeriod),
      deadLetterQueue: {
        maxReceiveCount: 2,
        queue: new Queue(this, `${queue}-dlq`, {
          queueName: `${queue}-dlq`,
          retentionPeriod: Duration.days(7),
        }),
      },
    })

    if (!createdQueue) {
      return
    }

    const eventSource = new SqsEventSource(createdQueue, {
      batchSize: 10,
      maxBatchingWindow: Duration.seconds(batchWindow),
      reportBatchItemFailures: true,
    })
    lambdaFunction.addEventSource(eventSource)

    this.queuesProducers?.[queue]?.forEach((lambda) => {
      createdQueue.grantSendMessages(lambda)
    })

    if (topicName) {
      this.snsTopics?.[topicName]?.forEach((lambda) => {
        const topic = (() => {
          if (this.createdTopics[topicName]) {
            return this.createdTopics[topicName]
          }
          const createdTopic = new Topic(this, `${topicName}`, {
            topicName: `${topicName}`,
            displayName: `${topicName}`,
          })

          this.createdTopics[topicName] = createdTopic

          return createdTopic
        })()
        topic.grantPublish(lambda)
        lambda.addEnvironment('ORDER_CREATED_ARN', topic.topicArn)
        topic.addSubscription(new SqsSubscription(createdQueue, { rawMessageDelivery: true }))
      })
    }
  }

  private getResourceName(postfix: string): string {
    return `${getServiceName()}-${postfix}`
  }
}
