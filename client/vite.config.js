import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const API_HOST = 'https://fund-manager-admin-webapp-0f5d289987ef.herokuapp.com'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: API_HOST,
        changeOrigin: true,
      }
    }
  }
})
