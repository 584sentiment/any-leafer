/**
 * 示例简历模板
 */

import type { ResumeTemplate, ResumeElement } from '@resume-editor/shared'

/**
 * 生成 SVG 缩略图的辅助函数
 */
const createSvgThumbnail = (svgContent: string): string => {
  return `data:image/svg+xml,${encodeURIComponent(svgContent)}`
}

/**
 * 经典简历模板
 */
export const classicTemplate: ResumeTemplate = {
  id: 'classic-1',
  name: '经典简历',
  description: '简洁专业的经典简历模板',
  category: 'classic',
  canvasSize: { width: 800, height: 1000 },
  thumbnail: createSvgThumbnail(`
    <svg xmlns="http://www.w3.org/2000/svg" width="200" height="260" viewBox="0 0 200 260">
      <defs>
        <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.1"/>
        </filter>
      </defs>
      <!-- 背景 -->
      <rect fill="#ffffff" width="200" height="260" rx="8" filter="url(#shadow)"/>

      <!-- 姓名区域 -->
      <rect fill="#3498db" x="15" y="15" width="170" height="45" rx="4"/>
      <rect fill="#ffffff" x="60" y="30" width="80" height="12" rx="2" opacity="0.9"/>
      <rect fill="#ffffff" x="40" y="47" width="120" height="6" rx="1" opacity="0.5"/>

      <!-- 分隔线 -->
      <line x1="15" y1="75" x2="185" y2="75" stroke="#e0e0e0" stroke-width="1"/>

      <!-- 工作经历区块 -->
      <rect fill="#3498db" x="15" y="85" width="50" height="8" rx="2" opacity="0.8"/>
      <rect fill="#666" x="15" y="100" width="170" height="5" rx="1"/>
      <rect fill="#999" x="15" y="110" width="150" height="4" rx="1"/>
      <rect fill="#999" x="15" y="118" width="160" height="4" rx="1"/>
      <rect fill="#999" x="15" y="126" width="140" height="4" rx="1"/>

      <!-- 教育背景区块 -->
      <rect fill="#3498db" x="15" y="145" width="50" height="8" rx="2" opacity="0.8"/>
      <rect fill="#666" x="15" y="160" width="170" height="5" rx="1"/>
      <rect fill="#999" x="15" y="170" width="150" height="4" rx="1"/>
      <rect fill="#999" x="15" y="178" width="130" height="4" rx="1"/>

      <!-- 技能区块 -->
      <rect fill="#3498db" x="15" y="195" width="40" height="8" rx="2" opacity="0.8"/>
      <rect fill="#3498db" x="15" y="210" width="45" height="12" rx="3" opacity="0.3"/>
      <rect fill="#3498db" x="65" y="210" width="50" height="12" rx="3" opacity="0.3"/>
      <rect fill="#3498db" x="120" y="210" width="40" height="12" rx="3" opacity="0.3"/>

      <!-- 分类标签 -->
      <rect fill="#3498db" x="15" y="235" width="35" height="14" rx="3" opacity="0.15"/>
      <text x="32" y="246" font-size="8" fill="#3498db" text-anchor="middle" font-family="Arial">经典</text>
    </svg>
  `),
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
  thumbnail: createSvgThumbnail(`
    <svg xmlns="http://www.w3.org/2000/svg" width="200" height="260" viewBox="0 0 200 260">
      <defs>
        <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.1"/>
        </filter>
      </defs>
      <!-- 背景 -->
      <rect fill="#ffffff" width="200" height="260" rx="8" filter="url(#shadow)"/>

      <!-- 左侧深色侧边栏 -->
      <rect fill="#2c3e50" x="0" y="0" width="65" height="260" rx="8 0 0 8"/>

      <!-- 侧边栏头像占位 -->
      <circle fill="#34495e" cx="32" cy="40" r="20"/>
      <circle fill="#3b5998" cx="32" cy="35" r="8"/>
      <ellipse fill="#3b5998" cx="32" cy="55" rx="12" ry="8"/>

      <!-- 侧边栏文字区域 -->
      <rect fill="#ecf0f1" x="10" y="75" width="45" height="5" rx="1" opacity="0.5"/>
      <rect fill="#bdc3c7" x="10" y="85" width="40" height="3" rx="1" opacity="0.4"/>
      <rect fill="#bdc3c7" x="10" y="92" width="42" height="3" rx="1" opacity="0.4"/>
      <rect fill="#bdc3c7" x="10" y="99" width="35" height="3" rx="1" opacity="0.4"/>

      <rect fill="#ecf0f1" x="10" y="115" width="45" height="5" rx="1" opacity="0.5"/>
      <rect fill="#bdc3c7" x="10" y="125" width="38" height="3" rx="1" opacity="0.4"/>
      <rect fill="#bdc3c7" x="10" y="132" width="42" height="3" rx="1" opacity="0.4"/>

      <!-- 右侧主内容区 -->
      <rect fill="#2c3e50" x="75" y="20" width="110" height="14" rx="2"/>
      <rect fill="#7f8c8d" x="75" y="40" width="70" height="8" rx="1"/>

      <rect fill="#2c3e50" x="75" y="60" width="50" height="6" rx="1"/>
      <rect fill="#95a5a6" x="75" y="72" width="110" height="4" rx="1"/>
      <rect fill="#95a5a6" x="75" y="80" width="100" height="4" rx="1"/>
      <rect fill="#95a5a6" x="75" y="88" width="105" height="4" rx="1"/>

      <rect fill="#2c3e50" x="75" y="105" width="60" height="6" rx="1"/>
      <rect fill="#95a5a6" x="75" y="117" width="110" height="4" rx="1"/>
      <rect fill="#95a5a6" x="75" y="125" width="95" height="4" rx="1"/>
      <rect fill="#95a5a6" x="75" y="133" width="100" height="4" rx="1"/>

      <!-- 分类标签 -->
      <rect fill="#9b59b6" x="75" y="235" width="35" height="14" rx="3" opacity="0.15"/>
      <text x="92" y="246" font-size="8" fill="#9b59b6" text-anchor="middle" font-family="Arial">现代</text>
    </svg>
  `),
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
 * 模板分类信息
 */
export const templateCategories = [
  { id: 'classic', name: '经典', description: '简洁专业的经典风格' },
  { id: 'modern', name: '现代', description: '现代简约的设计风格' },
  { id: 'minimal', name: '简约', description: '极简主义风格' },
  { id: 'creative', name: '创意', description: '富有创意的设计' },
] as const
