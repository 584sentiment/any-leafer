import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@resume-editor/templates': path.resolve(__dirname, '../templates/src/index.ts'),
      '@resume-editor/shared': path.resolve(__dirname, '../shared/src/index.ts'),
      'leafer-x-dotwuxian': path.resolve(__dirname, './src/__tests__/mocks/leafer-x-dotwuxian.ts'),
    },
  },
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./src/__tests__/setup.ts'],
    typecheck: {
      tsconfig: './tsconfig.test.json',
    },
  },
})
