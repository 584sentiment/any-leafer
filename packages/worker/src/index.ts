/**
 * Cloudflare Worker 入口
 */

import app from './routes'

// 导出 Fetch Handler
export default app

// 类型声明
export type Env = {
  DEEPSEEK_API_KEY?: string
  OPENAI_API_KEY?: string
  ANTHROPIC_API_KEY?: string
  ENVIRONMENT: string
}

// Durable Objects（可选）
// export { AgentService } from './do/AgentService'
