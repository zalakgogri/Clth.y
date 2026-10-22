import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// The Express server (server/index.js) holds the Anthropic key; Vite proxies /api to it in dev.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { proxy: { '/api': { target: 'http://localhost:4000', changeOrigin: true } } },
})
