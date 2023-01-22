import { Duration } from 'aws-cdk-lib'
import { Code, Runtime, Function } from 'aws-cdk-lib/aws-lambda'
import { BaseLambdaTrigger } from '../triggers/triggers.types'
import { Construct } from 'constructs'
import { RetentionDays } from 'aws-cdk-lib/aws-logs'

export const createLambdaFunction = (
  scope: Construct,
  lambdaName: string,
  trigger: BaseLambdaTrigger,
): {
  lambdaFunction: Function
  lambdaName: string
} => {
  const lastIndexOfSlash = trigger.handler.lastIndexOf('/')

  const lambdaFunction = new Function(scope, lambdaName, {
    functionName: lambdaName,
    runtime: Runtime.NODEJS_16_X,
    memorySize: trigger.memorySize,
    code: Code.fromAsset('cdk/build/' + trigger.handler.substr(0, lastIndexOfSlash)),
    handler: trigger.handler.substr(lastIndexOfSlash + 1),
    timeout: Duration.seconds(trigger.timeout),
    ...(trigger.reservedConcurrentExecutions && {
      reservedConcurrentExecutions: trigger.reservedConcurrentExecutions,
    }),
    logRetention: RetentionDays.ONE_WEEK,
    environment: {
      ...trigger.environment,
    },
  })

  return {
    lambdaFunction,
    lambdaName,
  }
}
