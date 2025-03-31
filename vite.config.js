import { defineConfig } from 'vite'

export default defineConfig({
  base: '/book-finder/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
})