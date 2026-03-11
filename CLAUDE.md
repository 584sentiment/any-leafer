# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

基于 LeaferJS 的 AI 驱动简历编辑器。支持通过自然语言与 AI 交互来编辑画布元素。

## 常用命令

```bash
# 安装依赖
pnpm install

# 开发模式（需要两个终端）
cd packages/worker && pnpm dev    # 启动 Worker 后端 (localhost:8787)
cd apps/demo && pnpm dev          # 启动前端演示应用 (localhost:3000)

# 构建所有包
pnpm build

# 类型检查
pnpm typecheck

# 代码检查
pnpm lint

# 清理构建产物
pnpm clean
```

## 项目结构

Monorepo 结构，使用 pnpm workspace + Turborepo：

```
packages/
├── client/      # @resume-editor/client - React 前端
│   ├── src/agent/     # AI 代理模块（LeaferAgent + 管理器）
│   ├── src/canvas/    # 画布引擎（LeaferEditor）
│   ├── src/components/ # UI 组件
│   └── src/store/     # Zustand 状态管理
│
├── worker/      # @resume-editor/worker - Cloudflare Worker 后端
│   ├── src/routes/    # Hono API 路由
│   ├── src/prompt/    # AI 系统提示词
│   └── src/do/        # Durable Objects（可选）
│
├── shared/      # @resume-editor/shared - 共享类型和 Zod Schema
│   ├── src/types/     # TypeScript 类型定义
│   └── src/schema/    # AgentAction Schema（Zod 验证）
│
└── templates/   # @resume-editor/templates - 简历模板

apps/
└── demo/        # 演示应用
```

## 核心架构

### 1. LeaferEditor（`packages/client/src/canvas/LeaferEditor.ts`）

画布编辑器核心类，封装 LeaferJS：
- 管理 Leafer 实例和元素映射（`elementsMap`）
- 创建/更新/删除画布元素
- 导出画布（PNG/JPG/PDF）
- 快照保存与恢复

### 2. LeaferAgent（`packages/client/src/agent/LeaferAgent.ts`）

AI 代理核心类，协调以下管理器：
- **AgentActionManager** - 执行画布操作（创建/更新/删除元素等）
- **AgentChatManager** - 管理聊天历史
- **AgentContextManager** - 构建 AI 上下文（画布状态描述）
- **CanvasHistoryManager** - 撤销/重做历史记录
- **TemplateManager** - 模板管理
- **ExportManager** - 导出功能
- **AgentRequestManager** - 与 Worker API 通信

### 3. AgentAction Schema（`packages/shared/src/schema/index.ts`）

使用 Zod 定义的 AI 操作 Schema，支持的操作类型：
- `create-element` / `update-element` / `delete-element`
- `move-element` / `resize-element`
- `edit-text` / `set-style`
- `align-elements` / `distribute-elements`
- `apply-template` / `generate-template`
- `message` / `think` / `clear-canvas` / `undo` / `redo`

### 4. Worker API（`packages/worker/`）

Cloudflare Worker 后端，使用 Hono 框架：
- 接收聊天请求，调用 AI 模型
- 使用 Vercel AI SDK 流式返回 Actions
- 支持多种 AI 模型（Claude、GPT-4o、Gemini）

## 开发注意事项

### 元素类型映射

`ResumeElement` 类型定义在 `@resume-editor/shared/types`，包含：
- `text` / `heading` - 文本元素
- `rect` / `ellipse` - 形状元素
- `line` / `divider` - 线条元素
- `image` - 图片元素
- `group` - 分组元素

### 添加新的 Agent Action

1. 在 `packages/shared/src/schema/index.ts` 中定义新的 Action Schema
2. 添加到 `AgentActionSchema` 联合类型
3. 在 `AgentActionManager` 中实现执行逻辑
4. 在 Worker 的系统提示词中添加说明

### 环境变量

Worker 需要配置 `.dev.vars`：
```
ANTHROPIC_API_KEY=your_key
OPENAI_API_KEY=your_key
GOOGLE_API_KEY=your_key
```

Demo 应用需要配置 `.env`：
```
VITE_API_ENDPOINT=http://localhost:8787
```

## 进程清理规则

在执行任务过程中，需要遵循以下清理规则：

1. **不要长期占用端口**：用户会自己启动开发服务器，不需要 Claude 自动启动并长期占用端口
2. **临时测试后立即清理**：如果需要临时启动服务进行测试，测试完成后必须立即清理占用的端口
3. **构建验证后清理**：代码修改后，确认能正确打包/运行后，需要及时清理占用的端口
4. **资源清理命令**：
   ```bash
   # 查找占用端口的进程
   netstat -ano | findstr :<端口号>

   # 终止进程（Windows）
   taskkill //F //PID <进程ID>
   ```
