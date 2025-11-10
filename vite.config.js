import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  server: {
    port: process.env.PORT ? parseInt(process.env.PORT) : 3000,
    open: false
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        silenceDeprecations: ['legacy-js-api'], // ← Add this
      },
    },
  },
  build: {
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          lucide: ['lucide-react'],
        },
      },
    },
  },
  optimizeDeps: {
    exclude: ['@rollup/rollup-darwin-arm64', '@rollup/rollup-darwin-x64', '@rollup/rollup-linux-arm64-gnu', '@rollup/rollup-linux-arm64-musl', '@rollup/rollup-linux-x64-gnu', '@rollup/rollup-win32-x64-msvc'],
  },
})
