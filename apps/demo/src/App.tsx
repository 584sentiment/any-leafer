/**
 * 演示应用主组件
 * 展示模板选择和编辑功能
 */

import React, { useState } from 'react'
import {
  ResumeEditor,
  TemplateSelector,
  ResumeForm
} from '@resume-editor/client'
import { allTemplates } from '@resume-editor/templates'
import type {
  ResumeTemplate,
  TemplateApplyMode,
  ResumeData,
  ResumeElement
} from '@resume-editor/shared'

type View = 'selector' | 'form' | 'editor'

const App: React.FC = () => {
  // 视图状态
  const [view, setView] = useState<View>('selector')
  const [selectedTemplate, setSelectedTemplate] = useState<ResumeTemplate | undefined>()
  const [applyMode, setApplyMode] = useState<TemplateApplyMode>('quick')
  const [resumeData, setResumeData] = useState<ResumeData | undefined>()
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedElements, setGeneratedElements] = useState<ResumeElement[] | undefined>()

  // API 端点
  const apiEndpoint = import.meta.env.VITE_API_ENDPOINT || 'http://localhost:8787'
  // 默认模型
  const defaultModel = 'deepseek-chat'

  // 确认模板选择
  const handleConfirmTemplate = (template: ResumeTemplate, mode: TemplateApplyMode) => {
    setSelectedTemplate(template)
    setApplyMode(mode)
    if (mode === 'quick') {
      // 快速应用 - 直接渲染模板元素
      setView('editor')
    } else {
      // 智能生成 - 显示表单填写简历信息
      setView('form')
    }
  }

  // 处理模板选择
  const handleTemplateSelect = (template: ResumeTemplate) => {
    setSelectedTemplate(template)
  }

  // 处理应用模式变更
  const handleApplyModeChange = (mode: TemplateApplyMode) => {
    setApplyMode(mode)
  }

  // 处理表单提交
  const handleFormSubmit = async (data: ResumeData) => {
    setResumeData(data)
    setIsGenerating(true)

    try {
      // 调用后端 API 生成简历元素
      const response = await fetch(`${apiEndpoint}/api/template/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          templateId: selectedTemplate?.id,
          templateConfig: {
            category: selectedTemplate?.category,
            smartConfig: selectedTemplate?.smartConfig,
            canvasSize: selectedTemplate?.canvasSize
          },
          resumeData: data
        })
      })

      if (!response.ok) {
        console.error('智能生成失败')
        setView('editor')
        return
      }

      const result = await response.json()

      // 保存生成的元素
      setGeneratedElements(result.elements)
    } catch (err) {
      console.error('智能生成失败:', err)
    } finally {
      setIsGenerating(false)
      setView('editor')
    }
  }

  // 处理返回模板选择
  const handleBackToSelector = () => {
    setView('selector')
    setSelectedTemplate(undefined)
    setResumeData(undefined)
    setGeneratedElements(undefined)
  }

  // 处理取消
  const handleCancel = () => {
    setIsGenerating(false)
    setView('selector')
  }

  // 处理导出
  const handleExport = (blob: Blob, format: string) => {
    // 下载导出文件
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `resume.${format === 'pdf' ? 'pdf' : format}`
    a.click()
    URL.revokeObjectURL(url)
    console.log(`导出完成: resume.${format}`)
  }

  // 根据视图渲染不同界面
  if (view === 'selector') {
    return (
      <div style={{ width: '100%', height: '100vh' }}>
        <TemplateSelector
          templates={allTemplates}
          selectedTemplate={selectedTemplate}
          applyMode={applyMode}
          onTemplateSelect={handleTemplateSelect}
          onApplyModeChange={handleApplyModeChange}
          onConfirm={handleConfirmTemplate}
        />
      </div>
    )
  }

  if (view === 'form') {
    return (
      <div style={{ width: '100%', height: '100vh' }}>
        <ResumeForm
          initialData={resumeData}
          onSubmit={handleFormSubmit}
          onBack={handleBackToSelector}
          loading={isGenerating}
          onCancel={handleCancel}
        />
      </div>
    )
  }

  if (view === 'editor') {
    return (
      <div style={{ width: '100%', height: '100vh' }}>
        <ResumeEditor
          apiEndpoint={apiEndpoint}
          defaultModel={defaultModel}
          templates={allTemplates}
          chatWidth={360}
          initialMode="edit"
          onExport={handleExport}
          initialTemplateId={selectedTemplate?.id}
          initialElements={generatedElements}
        />
      </div>
    )
  }

  return null
}

export default App
