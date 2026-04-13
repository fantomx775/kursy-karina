/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    pool: 'vmThreads',
    testTimeout: 30000,
    hookTimeout: 30000,
    exclude: ['tests/e2e/**', 'node_modules/**', '.next/**'],
  },
  resolve: {
    alias: {
      '@': resolve(process.cwd(), './src'),
    },
  },
})
