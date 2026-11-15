import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
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
