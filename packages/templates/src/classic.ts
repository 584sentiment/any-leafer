/**
 * 示例简历模板
 */

import type { ResumeTemplate, ResumeElement } from '@resume-editor/shared'

/**
 * 经典简历模板
 */
export const classicTemplate: ResumeTemplate = {
  id: 'classic-1',
  name: '经典简历',
  description: '简洁专业的经典简历模板',
  category: 'classic',
  canvasSize: { width: 800, height: 1000 },
  createdAt: Date.now(),
  updatedAt: Date.now(),
  elements: [
    // 姓名标题
    {
      id: 'name-title',
      type: 'heading',
      x: 50,
      y: 40,
      width: 700,
      height: 50,
      content: '张三',
      fontSize: 32,
      fontFamily: 'Arial',
      fontWeight: 'bold',
      fontStyle: 'normal',
      fill: '#333333',
      textAlign: 'center',
    },
    // 联系信息
    {
      id: 'contact-info',
      type: 'text',
      x: 50,
      y: 100,
      width: 700,
      height: 30,
      content: '电话: 138-0000-0000 | 邮箱: zhangsan@email.com | 地址: 北京市',
      fontSize: 14,
      fontFamily: 'Arial',
      fontWeight: 'normal',
      fontStyle: 'normal',
      fill: '#666666',
      textAlign: 'center',
    },
    // 分隔线
    {
      id: 'divider-1',
      type: 'divider',
      x: 50,
      y: 150,
      width: 700,
      height: 1,
      stroke: '#cccccc',
      strokeWidth: 1,
    },
    // 工作经历标题
    {
      id: 'work-title',
      type: 'heading',
      x: 50,
      y: 170,
      width: 700,
      height: 30,
      content: '工作经历',
      fontSize: 20,
      fontFamily: 'Arial',
      fontWeight: 'bold',
      fontStyle: 'normal',
      fill: '#333333',
      textAlign: 'left',
    },
    // 工作经历内容
    {
      id: 'work-content',
      type: 'text',
      x: 50,
      y: 210,
      width: 700,
      height: 150,
      content: `高级前端工程师 | ABC科技有限公司 | 2020.01 - 至今
• 负责公司核心产品的前端架构设计和开发
• 带领5人团队完成多个大型项目
• 优化前端性能，页面加载速度提升50%`,
      fontSize: 14,
      fontFamily: 'Arial',
      fontWeight: 'normal',
      fontStyle: 'normal',
      fill: '#333333',
      textAlign: 'left',
      lineHeight: 1.6,
    },
    // 分隔线2
    {
      id: 'divider-2',
      type: 'divider',
      x: 50,
      y: 380,
      width: 700,
      height: 1,
      stroke: '#cccccc',
      strokeWidth: 1,
    },
    // 教育背景标题
    {
      id: 'edu-title',
      type: 'heading',
      x: 50,
      y: 400,
      width: 700,
      height: 30,
      content: '教育背景',
      fontSize: 20,
      fontFamily: 'Arial',
      fontWeight: 'bold',
      fontStyle: 'normal',
      fill: '#333333',
      textAlign: 'left',
    },
    // 教育背景内容
    {
      id: 'edu-content',
      type: 'text',
      x: 50,
      y: 440,
      width: 700,
      height: 80,
      content: `计算机科学与技术 学士 | 北京大学 | 2016.09 - 2020.06
• GPA: 3.8/4.0
• 主修课程：数据结构、算法、计算机网络、操作系统`,
      fontSize: 14,
      fontFamily: 'Arial',
      fontWeight: 'normal',
      fontStyle: 'normal',
      fill: '#333333',
      textAlign: 'left',
      lineHeight: 1.6,
    },
  ] as ResumeElement[],
}

/**
 * 现代简历模板
 */
export const modernTemplate: ResumeTemplate = {
  id: 'modern-1',
  name: '现代简历',
  description: '现代简约风格的简历模板',
  category: 'modern',
  canvasSize: { width: 800, height: 1000 },
  createdAt: Date.now(),
  updatedAt: Date.now(),
  elements: [
    // 左侧背景条
    {
      id: 'sidebar-bg',
      type: 'rect',
      x: 0,
      y: 0,
      width: 250,
      height: 1000,
      fill: '#2c3e50',
    },
    // 姓名标题
    {
      id: 'name-title',
      type: 'heading',
      x: 280,
      y: 40,
      width: 470,
      height: 50,
      content: '李四',
      fontSize: 36,
      fontFamily: 'Arial',
      fontWeight: 'bold',
      fontStyle: 'normal',
      fill: '#2c3e50',
      textAlign: 'left',
    },
    // 职位
    {
      id: 'position',
      type: 'text',
      x: 280,
      y: 100,
      width: 470,
      height: 30,
      content: '产品经理',
      fontSize: 18,
      fontFamily: 'Arial',
      fontWeight: 'normal',
      fontStyle: 'normal',
      fill: '#7f8c8d',
      textAlign: 'left',
    },
    // 左侧联系信息
    {
      id: 'contact-label',
      type: 'heading',
      x: 20,
      y: 200,
      width: 210,
      height: 30,
      content: '联系方式',
      fontSize: 16,
      fontFamily: 'Arial',
      fontWeight: 'bold',
      fontStyle: 'normal',
      fill: '#ffffff',
      textAlign: 'left',
    },
    {
      id: 'contact-info',
      type: 'text',
      x: 20,
      y: 240,
      width: 210,
      height: 100,
      content: `📧 lisi@email.com
📱 139-0000-0000
📍 上海市浦东新区`,
      fontSize: 13,
      fontFamily: 'Arial',
      fontWeight: 'normal',
      fontStyle: 'normal',
      fill: '#bdc3c7',
      textAlign: 'left',
      lineHeight: 1.8,
    },
  ] as ResumeElement[],
}

/**
 * 所有模板
 */
export const allTemplates: ResumeTemplate[] = [classicTemplate, modernTemplate]
