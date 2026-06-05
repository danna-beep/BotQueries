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
    proxy: {
      // Proxy /bff to remote dev backend so localhost avoids CORS when using VITE_API_BASE_URL=/bff
      '/bff': {
        target: 'https://dev-fo-trustee-portal.app.getvaas.com',
        changeOrigin: true,
        secure: true,
      },
      // Proxy /api to the local DBChat backend (FastAPI on :8000, same as the
      // original project) so the app is single-origin: no CORS, leave
      // VITE_API_BASE_URL empty. The DB host (e.g. dbro.app.getvaas.com) goes in
      // the connection form — the backend connects to it, not the browser.
      // Override the target with DBCHAT_BACKEND_URL if the backend runs elsewhere.
      '/api': {
        target: process.env.DBCHAT_BACKEND_URL || 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
  },
})
