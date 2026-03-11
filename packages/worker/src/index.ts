/**
 * Cloudflare Worker 入口
 */

import app from './routes'

// 导出 Fetch Handler
export default app

// 类型声明
export type Env = {
  AI: Ai
  ENVIRONMENT: string
}

// Durable Objects（可选）
// export { AgentService } from './do/AgentService'
