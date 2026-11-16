import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@solvr/shared': path.resolve(__dirname, 'packages/shared/src/index.ts')
    }
  },
  test: {
    globals: true,
    environment: 'happy-dom',
  },
})
