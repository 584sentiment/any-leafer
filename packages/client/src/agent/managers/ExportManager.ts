/**
 * ExportManager - 导出管理器
 * 管理画布导出功能
 */

import type { LeaferEditor } from '../../canvas/LeaferEditor'
import type { ExportFormat, ExportOptions } from '@resume-editor/shared'

export interface ExportManagerConfig {
  editor: LeaferEditor
}

export class ExportManager {
  private editor: LeaferEditor

  constructor(config: ExportManagerConfig) {
    this.editor = config.editor
  }

  /**
   * 导出为图片
   */
  async exportImage(options: Omit<ExportOptions, 'format'> & { format: 'png' | 'jpg' }): Promise<Blob> {
    return this.editor.export(options)
  }

  /**
   * 导出为 PDF
   */
  async exportPDF(options?: Omit<ExportOptions, 'format'>): Promise<Blob> {
    // 先导出为图片
    const imageBlob = await this.editor.export({
      ...options,
      format: 'jpg',
      quality: options?.quality ?? 0.95,
    })

    // 使用 jsPDF 生成 PDF（需要在使用时动态导入）
    // 这里返回图片，由调用方处理 PDF 生成
    return imageBlob
  }

  /**
   * 导出并下载
   */
  async exportAndDownload(options: ExportOptions, filename?: string): Promise<void> {
    const blob = await this.editor.export(options)

    // 生成文件名
    const defaultName = `resume-${Date.now()}`
    const extension = options.format === 'pdf' ? 'pdf' : options.format
    const finalFilename = filename || `${defaultName}.${extension}`

    // 创建下载链接
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = finalFilename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  /**
   * 导出为 Data URL
   */
  async exportDataUrl(format: 'png' | 'jpg' = 'png', quality: number = 1): Promise<string> {
    const blob = await this.editor.export({ format, quality })
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  }

  /**
   * 复制到剪贴板
   */
  async copyToClipboard(): Promise<boolean> {
    try {
      const blob = await this.editor.export({ format: 'png' })
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob }),
      ])
      return true
    } catch {
      return false
    }
  }
}
