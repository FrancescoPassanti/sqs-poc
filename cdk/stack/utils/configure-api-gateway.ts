import { HttpApi, HttpApiProps, CorsHttpMethod } from '@aws-cdk/aws-apigatewayv2-alpha'
import { LogGroup, RetentionDays } from 'aws-cdk-lib/aws-logs'
import { Construct } from 'constructs'
import { CfnStage } from 'aws-cdk-lib/aws-apigatewayv2'
import { ServicePrincipal } from 'aws-cdk-lib/aws-iam'

export const configureApiGateway = ({
  serviceName,
  scope,
}: {
  scope: Construct
  serviceName: string
}): HttpApi | undefined => {
  const apiName = `${serviceName}-api-gateway`

  const apiProps: HttpApiProps = {
    description: `Api Gateway for ${serviceName}`,
    apiName,
    corsPreflight: {
      allowOrigins: ['*'],
      allowMethods: [CorsHttpMethod.ANY],
    },
  }

  const api = new HttpApi(scope, serviceName, apiProps)

  const logGroup = new LogGroup(api, `${apiName}-Log`, {
    logGroupName: `/aws/http/${apiName}`,
    retention: RetentionDays.ONE_WEEK,
  })

  const cfnStage = api.defaultStage?.node.defaultChild as CfnStage
  cfnStage.addPropertyOverride('DefaultRouteSettings', {
    ThrottlingBurstLimit: 50, // Concurrent requests
    ThrottlingRateLimit: 25,
    DetailedMetricsEnabled: true,
  })

  cfnStage.accessLogSettings = {
    destinationArn: logGroup.logGroupArn,
    format: JSON.stringify({
      requestId: '$context.requestId',
      userAgent: '$context.identity.userAgent',
      sourceIp: '$context.identity.sourceIp',
      requestTime: '$context.requestTime',
      httpMethod: '$context.httpMethod',
      path: '$context.path',
      status: '$context.status',
      responseLength: '$context.responseLength',
    }),
  }
  logGroup.grantWrite(new ServicePrincipal('apigateway.amazonaws.com'))

  return api
}
