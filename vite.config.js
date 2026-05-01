import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/metaapi': {
        target: 'https://mt-provisioning-api-v1.agiliumtrade.agiliumtrade.ai',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/metaapi/, '')
      },
      '/metaclient': {
        target: 'https://mt-client-api-v1.agiliumtrade.agiliumtrade.ai',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/metaclient/, '')
      }
    }
  }
})
