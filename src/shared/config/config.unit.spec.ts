import { getEnv, getStage } from './config'

beforeEach(() => {
  process.env = {}
})
afterAll(() => {
  process.env = {}
})
describe('config', () => {
  describe('getEnv', () => {
    test('getEnv fetches value from process.env environment', () => {
      process.env = {
        test: 'test123',
      }

      expect(getEnv('test')).toBe('test123')
    })

    test('non existent variable returns undefined', () => {
      expect(getEnv('test')).toBe(undefined)
    })

    test('non existent variable returns fallback value', () => {
      expect(getEnv('test', 'fallback')).toBe('fallback')
    })
  })

  describe('getStage', () => {
    test('returns value from STAGE', () => {
      process.env = {
        STAGE: 'local',
      }
      expect(getStage()).toBe('local')
    })
  })
})
