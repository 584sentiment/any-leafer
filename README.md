# Resume Editor Leafer

基于 LeaferJS 的 AI 驱动简历编辑器

## 项目简介

这是一个基于 LeaferJS 构建的图形编辑器，专门用于创建和编辑简历。集成了 AI 代理功能，支持通过自然语言进行交互式编辑。

### 主要特性

- 🎨 **高性能画布** - 基于 LeaferJS 的 GPU 加速渲染
- 🤖 **AI 辅助编辑** - 支持对话式编辑，通过自然语言操作画布
- 📄 **模板系统** - 内置多种简历模板，支持自定义
- 📤 **多格式导出** - 支持 PNG、JPG、PDF 导出
- ↩️ **撤销/重做** - 完整的历史记录管理
- 🔧 **可扩展** - 模块化架构，易于扩展

## 项目结构

```
resume-editor-leafer/
├── packages/
│   ├── client/              # React 前端应用
│   │   ├── src/
│   │   │   ├── agent/       # AI 代理模块
│   │   │   ├── canvas/      # 画布引擎
│   │   │   ├── components/  # UI 组件
│   │   │   └── store/       # 状态管理
│   │   └── package.json
│   │
│   ├── worker/              # Cloudflare Worker 后端
│   │   └── src/
│   │       ├── do/          # 业务逻辑
│   │       ├── routes/      # API 路由
│   │       └── prompt/      # AI 提示词
│   │
│   ├── shared/              # 共享类型和工具
│   │   └── src/
│   │       ├── types/       # TypeScript 类型
│   │       └── schema/      # Zod Schema
│   │
│   └── templates/           # 简历模板
│
└── apps/
    └── demo/                # 演示应用
```

## 快速开始

### 安装依赖

```bash
pnpm install
```

### 开发模式

1. 启动 Worker 后端：
```bash
cd packages/worker
pnpm dev
```

2. 启动前端演示应用：
```bash
cd apps/demo
pnpm dev
```

3. 访问 http://localhost:3000

### 构建

```bash
pnpm build
```

## AI 功能

### 支持的操作

| Action | 功能 |
|--------|------|
| `create-element` | 创建新元素（文本、形状、图片等） |
| `update-element` | 更新元素属性 |
| `delete-element` | 删除元素 |
| `move-element` | 移动元素位置 |
| `resize-element` | 调整元素大小 |
| `edit-text` | 编辑文本内容和样式 |
| `set-style` | 批量设置样式 |
| `align-elements` | 对齐元素 |
| `distribute-elements` | 均匀分布元素 |
| `clear-canvas` | 清空画布 |

### 工作模式

- **编辑模式** - 直接编辑画布元素
- **模板模式** - AI 生成完整简历模板
- **助手模式** - 提供优化建议和内容润色

### 支持的 AI 模型

- Claude Sonnet 4.5
- Claude Opus 4.5
- GPT-4o
- GPT-4o Mini
- Gemini 2.0 Flash

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端框架 | React 18+ |
| 状态管理 | Zustand |
| 画布引擎 | LeaferJS |
| AI SDK | Vercel AI SDK |
| 后端 | Cloudflare Workers |
| 构建工具 | Turborepo + Vite |
| 类型验证 | Zod |

## 集成到 Next.js 项目

```bash
npm install @resume-editor/client @resume-editor/templates
```

```tsx
import { ResumeEditor } from '@resume-editor/client'
import { allTemplates } from '@resume-editor/templates'

export default function EditorPage() {
  return (
    <ResumeEditor
      apiEndpoint="/api/ai"
      templates={allTemplates}
      canvasWidth={800}
      canvasHeight={1000}
    />
  )
}
```

## 环境变量

### Worker

```env
# AI API Keys (根据使用的模型配置)
ANTHROPIC_API_KEY=your_key
OPENAI_API_KEY=your_key
GOOGLE_API_KEY=your_key
```

### Demo App

```env
VITE_API_ENDPOINT=http://localhost:8787
```

## 开发路线

- [x] 基础架构
- [x] LeaferJS 画布集成
- [x] AI 代理系统
- [ ] 文本格式化工具栏
- [ ] 图片上传/裁剪
- [ ] 模板库 UI
- [ ] PDF 导出优化
- [ ] NPM 包发布

## 许可证

MIT


  下一步

  1. 安装依赖：
  cd /Users/wang/Documents/study/resume-editor-leafer
  pnpm install

  2. 启动开发：
  # 终端 1 - 启动 Worker
  cd packages/worker && pnpm dev

  # 终端 2 - 启动 Demo
  cd apps/demo && pnpm dev

  3. 配置 AI API Key（在 Worker 的 .dev.vars 中）

  待完成功能

  - 文本格式化工具栏（加粗/斜体/颜色）
  - 图片上传和裁剪
  - PDF 导出优化（使用 jsPDF）
  - 完善的模板库 UI
  - 单元测试
  - NPM 包发布配置