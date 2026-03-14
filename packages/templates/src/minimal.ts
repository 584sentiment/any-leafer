/**
 * 简约风格简历模板
 */

import type { ResumeTemplate, ResumeElement } from '@resume-editor/shared'

/**
 * 生成 SVG 缩略图的辅助函数
 * 包含 A4 纸张效果：浅灰背景 + 白色纸张 + 阴影
 */
const createSvgThumbnail = (content: string): string => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="260" viewBox="0 0 200 260"><rect fill="#ffffff" width="200" height="260"/><g>${content}</g></svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

/**
 * 简约简历模板 - 大量留白
 */
export const minimalTemplate: ResumeTemplate = {
  id: 'minimal-1',
  name: '简约简历',
  description: '极简设计，大量留白，突出内容',
  category: 'minimal',
  // A4 标准尺寸 @ 96dpi
  canvasSize: { width: 794, height: 1123 },
  thumbnail: createSvgThumbnail(`
    <!-- 姓名标题 -->
    <rect fill="#1a1a1a" x="18" y="23" width="55" height="12" rx="2"/>
    <rect fill="#666" x="18" y="40" width="70" height="5" rx="1"/>
    <!-- 短分隔线 -->
    <rect fill="#1a1a1a" x="18" y="56" width="25" height="2" rx="1"/>
    <!-- 联系信息 -->
    <rect fill="#999" x="18" y="68" width="164" height="3" rx="1"/>
    <!-- 关于我区块 -->
    <rect fill="#1a1a1a" x="18" y="86" width="30" height="4" rx="1"/>
    <rect fill="#333" x="18" y="96" width="164" height="3" rx="1"/>
    <rect fill="#666" x="18" y="103" width="154" height="3" rx="1"/>
    <!-- 工作经历区块 -->
    <rect fill="#1a1a1a" x="18" y="123" width="45" height="4" rx="1"/>
    <rect fill="#333" x="18" y="133" width="164" height="3" rx="1"/>
    <rect fill="#666" x="18" y="140" width="144" height="3" rx="1"/>
    <rect fill="#666" x="18" y="147" width="159" height="3" rx="1"/>
    <!-- 技能区块 -->
    <rect fill="#1a1a1a" x="18" y="168" width="45" height="4" rx="1"/>
    <rect fill="#333" x="18" y="178" width="164" height="3" rx="1"/>
    <!-- 分类标签 -->
    <rect fill="#1abc9c" x="18" y="220" width="30" height="12" rx="2" opacity="0.15"/>
    <text x="33" y="229" font-size="7" fill="#1abc9c" text-anchor="middle" font-family="Arial">简约</text>
  `),
  createdAt: Date.now(),
  updatedAt: Date.now(),
  elements: [
    // 姓名标题
    {
      id: 'name-title',
      type: 'heading',
      x: 80,
      y: 60,
      width: 640,
      height: 50,
      content: '王五',
      fontSize: 28,
      fontFamily: 'Georgia',
      fontWeight: 'normal',
      fontStyle: 'normal',
      fill: '#1a1a1a',
      textAlign: 'left',
    },
    // 职位
    {
      id: 'position',
      type: 'text',
      x: 80,
      y: 115,
      width: 640,
      height: 25,
      content: 'UI/UX 设计师',
      fontSize: 16,
      fontFamily: 'Georgia',
      fontWeight: 'normal',
      fontStyle: 'normal',
      fill: '#666666',
      textAlign: 'left',
    },
    // 分隔线
    {
      id: 'divider-1',
      type: 'divider',
      x: 80,
      y: 160,
      width: 100,
      height: 1,
      stroke: '#1a1a1a',
      strokeWidth: 2,
    },
    // 联系信息
    {
      id: 'contact-info',
      type: 'text',
      x: 80,
      y: 180,
      width: 640,
      height: 30,
      content: 'wangwu@email.com | +86 137-0000-0000 | 深圳市',
      fontSize: 12,
      fontFamily: 'Georgia',
      fontWeight: 'normal',
      fontStyle: 'normal',
      fill: '#999999',
      textAlign: 'left',
    },
    // 个人简介标题
    {
      id: 'summary-title',
      type: 'heading',
      x: 80,
      y: 250,
      width: 640,
      height: 25,
      content: '关于我',
      fontSize: 14,
      fontFamily: 'Georgia',
      fontWeight: 'bold',
      fontStyle: 'normal',
      fill: '#1a1a1a',
      textAlign: 'left',
    },
    // 个人简介内容
    {
      id: 'summary-content',
      type: 'text',
      x: 80,
      y: 280,
      width: 640,
      height: 60,
      content: '拥有5年UI/UX设计经验，专注于移动端和Web端产品设计。擅长将复杂的业务需求转化为简洁优雅的用户界面。',
      fontSize: 13,
      fontFamily: 'Georgia',
      fontWeight: 'normal',
      fontStyle: 'normal',
      fill: '#333333',
      textAlign: 'left',
      lineHeight: 1.8,
    },
    // 工作经历标题
    {
      id: 'work-title',
      type: 'heading',
      x: 80,
      y: 370,
      width: 640,
      height: 25,
      content: '工作经历',
      fontSize: 14,
      fontFamily: 'Georgia',
      fontWeight: 'bold',
      fontStyle: 'normal',
      fill: '#1a1a1a',
      textAlign: 'left',
    },
    // 工作经历内容
    {
      id: 'work-content',
      type: 'text',
      x: 80,
      y: 400,
      width: 640,
      height: 120,
      content: `腾讯科技 | 高级设计师 | 2021.03 - 至今
负责微信支付相关产品的UI设计，主导设计规范制定。

字节跳动 | UI设计师 | 2019.06 - 2021.02
参与抖音APP多个核心功能模块的视觉设计工作。`,
      fontSize: 13,
      fontFamily: 'Georgia',
      fontWeight: 'normal',
      fontStyle: 'normal',
      fill: '#333333',
      textAlign: 'left',
      lineHeight: 1.8,
    },
    // 技能标题
    {
      id: 'skills-title',
      type: 'heading',
      x: 80,
      y: 550,
      width: 640,
      height: 25,
      content: '专业技能',
      fontSize: 14,
      fontFamily: 'Georgia',
      fontWeight: 'bold',
      fontStyle: 'normal',
      fill: '#1a1a1a',
      textAlign: 'left',
    },
    // 技能内容
    {
      id: 'skills-content',
      type: 'text',
      x: 80,
      y: 580,
      width: 640,
      height: 80,
      content: 'Figma / Sketch / Adobe XD / Photoshop / Illustrator / 原型设计 / 用户研究 / 设计系统',
      fontSize: 13,
      fontFamily: 'Georgia',
      fontWeight: 'normal',
      fontStyle: 'normal',
      fill: '#333333',
      textAlign: 'left',
      lineHeight: 1.8,
    },
  ] as ResumeElement[],
  smartConfig: {
    stylePrompt: '极简设计风格，大量留白，使用衬线字体，整体感觉优雅、专业、高端',
    layoutHints: [
      { section: 'header', position: 'top', style: '左对齐，简洁标题' },
      { section: 'experience', position: 'left', style: '紧凑列表' },
      { section: 'education', position: 'left', style: '简洁列表' },
      { section: 'skills', position: 'left', style: '横向排列' },
    ],
    colorScheme: {
      primary: '#1a1a1a',
      secondary: '#666666',
      background: '#ffffff',
      text: '#333333',
    },
    typography: {
      headingFont: 'Georgia',
      bodyFont: 'Georgia',
      headingSizes: { min: 14, max: 28 },
      bodySizes: { min: 12, max: 16 },
    },
  },
}

/**
 * 简约简历模板2 - 双栏布局
 */
export const minimalTwoColumnTemplate: ResumeTemplate = {
  id: 'minimal-2',
  name: '双栏简约',
  description: '双栏布局，信息密度适中',
  category: 'minimal',
  // A4 标准尺寸 @ 96dpi
  canvasSize: { width: 794, height: 1123 },
  thumbnail: createSvgThumbnail(`
    <!-- 姓名标题 -->
    <rect fill="#2d3436" x="18" y="18" width="60" height="10" rx="2"/>
    <rect fill="#636e72" x="18" y="33" width="45" height="4" rx="1"/>
    <!-- 右侧联系信息 -->
    <rect fill="#636e72" x="110" y="30" width="75" height="3" rx="1" opacity="0.6"/>
    <!-- 分隔线 -->
    <rect fill="#dfe6e9" x="18" y="46" width="164" height="1" rx="0.5"/>
    <!-- 左栏 -->
    <rect fill="#2d3436" x="18" y="58" width="45" height="4" rx="1"/>
    <rect fill="#2d3436" x="18" y="68" width="60" height="3" rx="1"/>
    <rect fill="#636e72" x="18" y="76" width="55" height="2" rx="1" opacity="0.6"/>
    <rect fill="#636e72" x="18" y="83" width="60" height="2" rx="1" opacity="0.6"/>
    <rect fill="#636e72" x="18" y="90" width="50" height="2" rx="1" opacity="0.6"/>
    <rect fill="#2d3436" x="18" y="108" width="60" height="3" rx="1"/>
    <rect fill="#2d3436" x="18" y="116" width="55" height="2" rx="1" opacity="0.8"/>
    <rect fill="#636e72" x="18" y="123" width="60" height="2" rx="1" opacity="0.6"/>
    <rect fill="#636e72" x="18" y="130" width="50" height="2" rx="1" opacity="0.6"/>
    <!-- 右栏 -->
    <rect fill="#2d3436" x="108" y="58" width="45" height="4" rx="1"/>
    <rect fill="#636e72" x="108" y="68" width="74" height="2" rx="1" opacity="0.6"/>
    <rect fill="#636e72" x="108" y="76" width="69" height="2" rx="1" opacity="0.6"/>
    <rect fill="#636e72" x="108" y="83" width="74" height="2" rx="1" opacity="0.6"/>
    <rect fill="#2d3436" x="108" y="103" width="45" height="4" rx="1"/>
    <rect fill="#636e72" x="108" y="113" width="74" height="2" rx="1" opacity="0.6"/>
    <rect fill="#636e72" x="108" y="120" width="69" height="2" rx="1" opacity="0.6"/>
    <rect fill="#636e72" x="108" y="127" width="64" height="2" rx="1" opacity="0.6"/>
    <!-- 中间分隔线 -->
    <rect fill="#dfe6e9" x="100" y="50" width="1" height="90" rx="0.5"/>
    <!-- 分类标签 -->
    <rect fill="#1abc9c" x="18" y="220" width="30" height="12" rx="2" opacity="0.15"/>
    <text x="33" y="229" font-size="7" fill="#1abc9c" text-anchor="middle" font-family="Arial">简约</text>
  `),
  createdAt: Date.now(),
  updatedAt: Date.now(),
  elements: [
    // 姓名标题
    {
      id: 'name-title',
      type: 'heading',
      x: 50,
      y: 50,
      width: 700,
      height: 50,
      content: '赵六',
      fontSize: 32,
      fontFamily: 'Helvetica',
      fontWeight: 'bold',
      fontStyle: 'normal',
      fill: '#2d3436',
      textAlign: 'left',
    },
    // 职位
    {
      id: 'position',
      type: 'text',
      x: 50,
      y: 105,
      width: 350,
      height: 25,
      content: '全栈工程师',
      fontSize: 16,
      fontFamily: 'Helvetica',
      fontWeight: 'normal',
      fontStyle: 'normal',
      fill: '#636e72',
      textAlign: 'left',
    },
    // 联系信息
    {
      id: 'contact-info',
      type: 'text',
      x: 400,
      y: 105,
      width: 350,
      height: 25,
      content: 'zhaoliu@email.com | 138-0000-0000',
      fontSize: 12,
      fontFamily: 'Helvetica',
      fontWeight: 'normal',
      fontStyle: 'normal',
      fill: '#636e72',
      textAlign: 'right',
    },
    // 分隔线
    {
      id: 'divider-1',
      type: 'divider',
      x: 50,
      y: 150,
      width: 700,
      height: 1,
      stroke: '#dfe6e9',
      strokeWidth: 1,
    },
    // 左栏 - 工作经历标题
    {
      id: 'work-title',
      type: 'heading',
      x: 50,
      y: 180,
      width: 350,
      height: 25,
      content: '工作经历',
      fontSize: 14,
      fontFamily: 'Helvetica',
      fontWeight: 'bold',
      fontStyle: 'normal',
      fill: '#2d3436',
      textAlign: 'left',
    },
    // 左栏 - 工作经历内容
    {
      id: 'work-content',
      type: 'text',
      x: 50,
      y: 210,
      width: 350,
      height: 200,
      content: `阿里巴巴 | 高级工程师
2020.07 - 至今
负责电商平台核心服务开发，使用 Node.js 和 React 技术栈。

美团 | 前端工程师
2018.06 - 2020.06
参与外卖商家端管理系统开发。`,
      fontSize: 12,
      fontFamily: 'Helvetica',
      fontWeight: 'normal',
      fontStyle: 'normal',
      fill: '#2d3436',
      textAlign: 'left',
      lineHeight: 1.7,
    },
    // 右栏 - 技能标题
    {
      id: 'skills-title',
      type: 'heading',
      x: 430,
      y: 180,
      width: 320,
      height: 25,
      content: '专业技能',
      fontSize: 14,
      fontFamily: 'Helvetica',
      fontWeight: 'bold',
      fontStyle: 'normal',
      fill: '#2d3436',
      textAlign: 'left',
    },
    // 右栏 - 技能内容
    {
      id: 'skills-content',
      type: 'text',
      x: 430,
      y: 210,
      width: 320,
      height: 100,
      content: `前端: React, Vue, TypeScript, Tailwind
后端: Node.js, Python, PostgreSQL
工具: Docker, Git, CI/CD`,
      fontSize: 12,
      fontFamily: 'Helvetica',
      fontWeight: 'normal',
      fontStyle: 'normal',
      fill: '#2d3436',
      textAlign: 'left',
      lineHeight: 1.7,
    },
    // 右栏 - 教育标题
    {
      id: 'edu-title',
      type: 'heading',
      x: 430,
      y: 340,
      width: 320,
      height: 25,
      content: '教育背景',
      fontSize: 14,
      fontFamily: 'Helvetica',
      fontWeight: 'bold',
      fontStyle: 'normal',
      fill: '#2d3436',
      textAlign: 'left',
    },
    // 右栏 - 教育内容
    {
      id: 'edu-content',
      type: 'text',
      x: 430,
      y: 370,
      width: 320,
      height: 80,
      content: `浙江大学
计算机科学与技术 | 学士
2014.09 - 2018.06`,
      fontSize: 12,
      fontFamily: 'Helvetica',
      fontWeight: 'normal',
      fontStyle: 'normal',
      fill: '#2d3436',
      textAlign: 'left',
      lineHeight: 1.7,
    },
  ] as ResumeElement[],
  smartConfig: {
    stylePrompt: '双栏布局简约风格，左栏放主要经历，右栏放技能和教育，整体清晰专业',
    layoutHints: [
      { section: 'header', position: 'top', style: '标题左对齐，联系方式右对齐' },
      { section: 'experience', position: 'left', style: '左栏' },
      { section: 'skills', position: 'right', style: '右栏' },
      { section: 'education', position: 'right', style: '右栏' },
    ],
    colorScheme: {
      primary: '#2d3436',
      secondary: '#636e72',
      background: '#ffffff',
      text: '#2d3436',
    },
    typography: {
      headingFont: 'Helvetica',
      bodyFont: 'Helvetica',
      headingSizes: { min: 14, max: 32 },
      bodySizes: { min: 12, max: 16 },
    },
  },
}
