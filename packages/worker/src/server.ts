/**
 * Node.js 服务器入口
 * 用于本地开发，无需 Cloudflare Workers
 */

import 'dotenv/config'
import { serve } from '@hono/node-server'
import app from './routes'

const port = 8787

serve({
  fetch: app.fetch,
  port,
})
