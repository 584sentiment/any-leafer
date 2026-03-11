# 技术方案文档

本文档记录项目中遇到的技术难题及其解决方案。

## 目录

1. [无限画布实现](#无限画布实现)
2. [平移模式禁用框选矩形](#平移模式禁用框选矩形)

---

## 无限画布实现

### 问题描述

需要实现一个可以无限平移和缩放的画布，类似于 Figma、Miro 等设计工具的画布体验。

### 解决方案

使用 LeaferJS 的 `App` 类配合 `type: 'design'` 配置来实现无限画布功能。

### 实现代码

```typescript
import { App } from 'leafer-ui'
import '@leafer-in/editor'
import '@leafer-in/viewport'

const app = new App({
  view: container,
  type: 'design',  // 关键配置：启用视口功能
  tree: {},        // 主内容层
  sky: {},         // 覆盖层（编辑器 UI）
  editor: {},      // 启用编辑器
})
```

### 核心要点

1. **使用 App 而非 Leafer**
   - `App` 类支持多层结构（tree、sky、ground）
   - `type: 'design'` 启用视口功能，支持无限平移和缩放

2. **层级说明**
   - `tree` - 主内容层，放置所有可编辑元素
   - `sky` - 覆盖层，编辑器的选择框、控制点等 UI 元素
   - `ground` - 背景层（可选）

3. **视口控制**
   ```typescript
   // 平移画布
   app.tree.x = deltaX
   app.tree.y = deltaY

   // 缩放画布
   app.tree.scaleX = zoom
   app.tree.scaleY = zoom

   // 获取当前缩放
   const zoom = app.tree.scaleX
   ```

4. **点阵背景**
   使用 `leafer-x-dotwuxian` 插件实现无限点阵背景：
   ```typescript
   import { DotMatrix } from 'leafer-x-dotwuxian'

   const dotMatrix = new DotMatrix(app, {
     dotColor: '#D2D4D7',
     gridGap: 45,
     gridType: 'dots',  // 'dots' | 'lines'
   })
   dotMatrix.enableDotMatrix(true)
   ```

### 相关依赖

```json
{
  "dependencies": {
    "leafer-ui": "^1.4.0",
    "@leafer-in/editor": "^1.4.0",
    "@leafer-in/viewport": "^2.0.3",
    "leafer-x-dotwuxian": "^0.0.3"
  }
}
```

---

## 平移模式禁用框选矩形

### 问题描述

在实现画布平移功能时，当用户点击"小手"图标进入平移模式后，拖动画布时会出现框选矩形（选择框），这是不期望的行为。

### 问题分析

LeaferJS 的编辑器插件（`@leafer-in/editor`）默认会在拖动空白区域时显示框选矩形，用于多选元素。在平移模式下，我们需要禁用这个功能。

### 解决方案

通过设置编辑器的 `selector` 配置来禁用选择器功能。

### 实现代码

```typescript
// LeaferEditor.ts

private isPanModeEnabled: boolean = false

setPanMode(enabled: boolean): void {
  if (!this.app) return

  this.isPanModeEnabled = enabled

  if (enabled) {
    // 进入平移模式
    this.clearSelection()

    // 禁用编辑器
    if (this.app.editor) {
      this.app.editor.disabled = true
      // 关键：禁用选择器（包括框选功能）
      const editorConfig = this.app.editor.config as any
      if (editorConfig) {
        editorConfig.selector = false
      }
    }

    // 添加鼠标事件监听
    this.container.addEventListener('mousedown', this.handlePanMouseDown, true)
    this.container.style.cursor = 'grab'
  } else {
    // 退出平移模式
    if (this.app.editor) {
      this.app.editor.disabled = false
      // 恢复选择器
      const editorConfig = this.app.editor.config as any
      if (editorConfig) {
        editorConfig.selector = true
      }
    }

    this.removePanListeners()
    this.container.style.cursor = 'default'
  }
}
```

### 核心要点

1. **selector 配置**
   - `editor.config.selector = false` - 禁用整个选择器（包括框选）
   - `editor.config.selector = true` - 启用选择器（默认值）

2. **事件拦截**
   使用捕获阶段（`capture: true`）来确保在 LeaferJS 处理事件之前拦截：
   ```typescript
   this.container.addEventListener('mousedown', handler, true)
   ```

3. **阻止事件传播**
   ```typescript
   private handlePanMouseDown(e: MouseEvent): void {
     // 只响应左键
     if (e.button !== 0) return

     // 阻止事件传递到 LeaferJS
     e.stopPropagation()
     e.preventDefault()

     // 开始拖动逻辑...
   }
   ```

4. **鼠标样式**
   - 进入平移模式：`cursor: 'grab'`
   - 拖动中：`cursor: 'grabbing'`
   - 退出平移模式：`cursor: 'default'`

### 尝试过的其他方案（无效）

1. **设置 `continuousSelect = false`** - 只禁用连续选择，框选矩形仍然出现
2. **设置 `sky.editable = false`** - 属性是函数，会报错
3. **设置 `skyCanvas.style.pointerEvents = 'none'`** - 无法阻止框选
4. **仅设置 `editor.disabled = true`** - 只禁用编辑，不禁用框选

### 编辑器配置参考

LeaferJS 编辑器的主要配置项：

| 配置项 | 说明 | 默认值 |
|--------|------|--------|
| `selector` | 是否启用选择器 | `true` |
| `continuousSelect` | 是否启用连续选择 | `true` |
| `multipleSelect` | 是否启用多选 | `true` |
| `editBox` | 是否显示编辑框 | `true` |
| `moveCursor` | 移动光标样式 | `'move'` |

### 相关源码位置

- 编辑器选择器实现：`@leafer-in/editor/src/display/EditSelect.ts`
- 配置定义：`@leafer-in/editor/src/config.ts`

---

## 文本双击编辑

### 问题描述

文本元素双击后无法进入编辑状态。

### 解决方案

安装 `@leafer-in/text-editor` 插件并在初始化时导入。

### 实现代码

```typescript
// 安装依赖
// pnpm add @leafer-in/text-editor

// LeaferEditor.ts
import '@leafer-in/text-editor'

// 文本元素创建时设置 editable: true
private createTextElement(element: TextElement, id: string): Text {
  return new Text({
    id,
    text: element.content,
    editable: true,  // 关键：启用编辑
    // ...其他属性
  })
}
```

### 相关依赖

```json
{
  "dependencies": {
    "@leafer-in/text-editor": "^2.0.3"
  }
}
```

---

## 更新日志

| 日期 | 内容 |
|------|------|
| 2025-03-11 | 初始化文档，记录无限画布、平移模式、文本编辑方案 |
