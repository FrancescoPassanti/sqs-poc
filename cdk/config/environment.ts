import * as dotenv from 'dotenv'

enum Stage {
  LOCAL = 'local',
  STAGING = 'staging',
  PRODUCTION = 'production',
}
const stage: Stage = (process.env.STAGE ?? Stage.PRODUCTION) as Stage

dotenv.config({ path: `${__dirname}/.env.${stage}` })

export const getEnv = (key: string, fallback = ''): string => {
  return process.env[key] ?? fallback
}

export const getStage = (): Stage => stage

export const isProdStage = (): boolean => stage === Stage.PRODUCTION

export const isLocalStage = (): boolean => stage === Stage.LOCAL

export const getServiceName = (): string => getEnv('serviceName')

export const getRegion = (): string => getEnv('region')

export const getAccount = (): string => getEnv('account')

export const getDomain = (): string => getEnv('domain')

export const getSubdomain = (): string => getEnv('subdomain')

export const getCertArn = (): string => getEnv('certArn')

// Compose BASE ENVS
type BaseEnvs = {
  STAGE: string
  region: string
  sqsQueueBaseUrl: string
}

export const baseEnvs = (): BaseEnvs => ({
  STAGE: getStage(),
  region: getRegion(),
  sqsQueueBaseUrl: `https://sqs.${getRegion()}.amazonaws.com/${getAccount()}/`,
})
