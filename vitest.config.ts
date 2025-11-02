import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/setupTests.ts'],
    css: true,
    include: [
      'src/components/Header/Header.test.tsx',  // Correct path
      'src/**/*.test.tsx'  // Include all other working tests
    ],
    exclude: [
      'src/components/organisms/Header/Header.test.tsx'  // Exclude wrong path
    ],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/setupTests.ts',
        '**/*.d.ts',
        '**/*.config.*',
        'dist/'
      ]
    }
  }
})