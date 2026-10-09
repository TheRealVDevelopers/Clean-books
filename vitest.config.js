import { defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config.js'

// Unit tests (`npm test`). Security-rules tests need the emulators and run
// separately through `npm run test:rules` (vitest.rules.config.js).
export default defineConfig((env) => mergeConfig(viteConfig(env), {
  test: {
    include: ['src/**/*.test.{js,jsx}', 'tests/unit/**/*.test.js'],
    environment: 'node',
  },
}))
