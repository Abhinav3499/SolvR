import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@solvr/shared': path.resolve(__dirname, 'packages/shared/src/index.ts')
    }
  },
  base: process.env.VERCEL ? '/' : './',
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-vue': ['vue', 'pinia'],
          'vendor-supabase': ['@supabase/supabase-js'],
          'vendor-icons': ['lucide-vue-next']
        }
      }
    }
  }
})
