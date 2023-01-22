import { Optional } from '../types'

type WhenStringThanStringElseCustom<T, K> = T extends string ? string : K

export const getEnv = <T extends Optional<string>>(
  key: string,
  fallback?: T,
): WhenStringThanStringElseCustom<T, Optional<string>> => {
  return process.env[key] ?? (fallback as WhenStringThanStringElseCustom<T, Optional<string>>)
}

export enum Stage {
  LOCAL = 'local',
  STAGING = 'staging',
}

export const getStage = (): Stage => getEnv('STAGE', Stage.LOCAL) as Stage

export const getSqsQueueBaseUrl = (): string => getEnv('sqsQueueBaseUrl', '')
