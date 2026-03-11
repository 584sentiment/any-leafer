/**
 * 演示应用主组件
 */

import React from 'react'
import { ResumeEditor } from '@resume-editor/client'
import { allTemplates } from '@resume-editor/templates'

const App: React.FC = () => {
  // API 端点（本地开发）
  const apiEndpoint = import.meta.env.VITE_API_ENDPOINT || 'http://localhost:8787'

  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <ResumeEditor
        canvasWidth={800}
        canvasHeight={1000}
        apiEndpoint={apiEndpoint}
        defaultModel="deepseek-chat"
        templates={allTemplates}
        chatWidth={360}
        initialMode="edit"
        onExport={(blob, format) => {
          // 导出完成回调
        }}
      />
    </div>
  )
}

export default App
