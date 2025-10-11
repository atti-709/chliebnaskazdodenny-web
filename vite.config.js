import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { notionApiPlugin } from './server-simple.js'

export default defineConfig({
  plugins: [react(), notionApiPlugin()],
})
