import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  server: {
    host: true // 允许通过IP地址访问
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  }
})