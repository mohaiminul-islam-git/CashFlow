
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // This ensures paths work correctly on GitHub Pages
  base: './',
})
