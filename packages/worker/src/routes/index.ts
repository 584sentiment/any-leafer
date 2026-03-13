/**
 * API 路由
 */

import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { handleChatRequest, type AgentServiceRequest, type Env } from '../do/AgentService'

import {
  handleLangChainChatRequest,
  type LangChainAgentRequest,
} from '../agent/LangChainAgentService'

// 创建 Hono 应用
const app = new Hono()

// CORS 配置
app.use(
  '/*',
  cors({
    origin: '*',
    allowMethods: ['GET', 'POST', 'OPTIONS'],
    allowHeaders: ['Content-Type'],
  })
)

// 健康检查
app.get('/', (c) => {
  return c.json({ status: 'ok', version: '0.1.0' })
})

// 获取环境变量（兼容 Cloudflare Workers 和 Node.js）
function getEnv(c: any): Env | undefined {
  // Cloudflare Workers 环境
  if (c.env) {
    return c.env
  }
  // Node.js 环境
  return {
    DEEPSEEK_API_KEY: process.env.DEEPSEEK_API_KEY,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
    ENVIRONMENT: process.env.ENVIRONMENT || 'development',
  }
}

// 聊天接口（传统模式）
app.post('/chat', async (c) => {
  try {
    const body = await c.req.json<AgentServiceRequest>()

    if (!body.messages || !Array.isArray(body.messages)) {
      return c.json({ error: 'Invalid messages' }, 400)
    }

    const stream = await handleChatRequest({
      messages: body.messages,
      model: body.model || 'deepseek-chat',
      context: body.context,
      mode: body.mode,
    }, getEnv(c))

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (error) {
    return c.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      500
    )
  }
})

// LangChain 模式聊天接口（带执行验证）
app.post('/chat/langchain', async (c) => {
  try {
    const body = await c.req.json<LangChainAgentRequest & { model?: string }>()

    if (!body.message) {
      return c.json({ error: 'Invalid message' }, 400)
    }

    const stream = await handleLangChainChatRequest(
      {
        message: body.message,
        canvasContext: body.canvasContext,
        mode: body.mode || 'edit',
        history: body.history,
      },
      body.model || 'deepseek-chat',
      getEnv(c)
    )

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error) {
    return c.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      500
    )
  }
})

// 获取可用模型列表
app.get('/models', (c) => {
  return c.json({
    models: [
      { id: 'deepseek-chat', name: 'DeepSeek Chat', provider: 'deepseek' },
      { id: 'deepseek-reasoner', name: 'DeepSeek Reasoner', provider: 'deepseek' },
      { id: 'gpt-4o', name: 'GPT-4o', provider: 'openai' },
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'openai' },
    ],
  })
})

// 获取模板列表
app.get('/templates', (c) => {
  // TODO: 从数据库或 KV 存储获取模板
  return c.json({
    templates: [],
  })
})

export default app
