import { defineConfig } from 'vitest/config'

// Firestore and Storage security-rules tests (`npm run test:rules`). That
// script starts the emulators first, so the tests can reach them.
export default defineConfig({
  test: {
    include: ['tests/rules/**/*.test.js'],
    environment: 'node',
    fileParallelism: false,
    testTimeout: 20000,
    hookTimeout: 30000,
  },
})
