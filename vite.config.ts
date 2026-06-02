import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: path.join(__dirname, 'build'),
  },
  server: {
    // Proxy /bff to remote dev backend so localhost avoids CORS when using VITE_API_BASE_URL=/bff
    proxy: {
      '/bff': {
        target: 'https://dev-fo-trustee-portal.app.getvaas.com',
        changeOrigin: true,
        secure: true,
      },
    },
  },
})
