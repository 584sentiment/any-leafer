import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      // 让 demo 应用直接使用 workspace 包的源文件，实现热更新
      '@resume-editor/client': resolve(__dirname, '../../packages/client/src/index.ts'),
      '@resume-editor/client/canvas': resolve(__dirname, '../../packages/client/src/canvas/index.ts'),
      '@resume-editor/client/agent': resolve(__dirname, '../../packages/client/src/agent/index.ts'),
      '@resume-editor/client/components': resolve(__dirname, '../../packages/client/src/components/index.ts'),
      '@resume-editor/client/store': resolve(__dirname, '../../packages/client/src/store/index.ts'),
      '@resume-editor/shared': resolve(__dirname, '../../packages/shared/src/index.ts'),
      '@resume-editor/templates': resolve(__dirname, '../../packages/templates/src/index.ts'),
    },
  },
  optimizeDeps: {
    // 排除 workspace 包，避免预构建缓存
    exclude: ['@resume-editor/client', '@resume-editor/shared', '@resume-editor/templates'],
  },
})
