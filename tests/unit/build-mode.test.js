import { describe, it, expect } from 'vitest'
import { resolveAppMode } from '../../vite.config.js'

describe('build mode', () => {
  it('is live unless asked for the demo', () => {
    expect(resolveAppMode('development')).toBe('live')
    expect(resolveAppMode('production')).toBe('live')
  })

  it('is the demo with --mode demo, whatever VITE_APP_MODE says', () => {
    expect(resolveAppMode('demo')).toBe('demo')
    expect(resolveAppMode('demo', { VITE_APP_MODE: 'live' })).toBe('demo')
  })

  it('follows VITE_APP_MODE otherwise', () => {
    expect(resolveAppMode('production', { VITE_APP_MODE: 'demo' })).toBe('demo')
    expect(resolveAppMode('production', { VITE_APP_MODE: 'live' })).toBe('live')
  })

  it('refuses an unknown mode', () => {
    expect(() => resolveAppMode('production', { VITE_APP_MODE: 'staging' })).toThrow(/demo" or "live/)
  })
})
