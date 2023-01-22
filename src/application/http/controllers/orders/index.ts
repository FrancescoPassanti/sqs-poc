import { wrapAwsLambdaFastify } from '../controllers.util'
import { router } from './orders.routes'

exports.handler = wrapAwsLambdaFastify(router)
