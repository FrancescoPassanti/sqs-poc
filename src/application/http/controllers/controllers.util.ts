import fastify, { FastifyInstance } from 'fastify'
import awsLambdaFastify, {
  LambdaFastifyOptions,
  LambdaResponse,
  PromiseHandler,
} from '@fastify/aws-lambda'

export const baseRouter = fastify({
  logger: false,
  ignoreTrailingSlash: true,
  ignoreDuplicateSlashes: true,
})

export const wrapAwsLambdaFastify = (
  router: FastifyInstance,
  options?: LambdaFastifyOptions,
): PromiseHandler<LambdaResponse> =>
  awsLambdaFastify(router, { callbackWaitsForEmptyEventLoop: false, ...options })
