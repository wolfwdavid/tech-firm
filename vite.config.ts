import { defineConfig, loadEnv, type PluginOption } from 'vite'
import react from '@vitejs/plugin-react'
import { handleChat, type ChatRequest } from './api/_chat-handler'

/**
 * Local /api/chat middleware — shares the same handler the Vercel function uses,
 * so dev and prod behave identically. Reads ANTHROPIC_API_KEY from .env.local
 * via Node's process.env (Vite loads .env files into the dev server's env).
 */
function devChatApi(): PluginOption {
  return {
    name: 'dev-chat-api',
    configureServer(server) {
      server.middlewares.use('/api/chat', async (req, res) => {
        if (req.method === 'OPTIONS') {
          res.statusCode = 204
          res.setHeader('Access-Control-Allow-Origin', '*')
          res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
          res.end()
          return
        }
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.end(JSON.stringify({ error: 'Method not allowed' }))
          return
        }
        try {
          let raw = ''
          for await (const chunk of req) raw += chunk
          const body = JSON.parse(raw) as ChatRequest
          const result = await handleChat(body)
          res.statusCode = result.error ? 502 : 200
          res.setHeader('content-type', 'application/json')
          res.setHeader('Access-Control-Allow-Origin', '*')
          res.end(JSON.stringify(result))
        } catch (err) {
          res.statusCode = 500
          res.setHeader('content-type', 'application/json')
          res.end(
            JSON.stringify({
              error: err instanceof Error ? err.message : 'Internal error',
            }),
          )
        }
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  // Expose ALL env vars (not just VITE_*) to process.env so the dev /api/chat
  // handler can read ANTHROPIC_API_KEY from .env.local without a VITE_ prefix.
  // Without this, only VITE_-prefixed vars would be in scope for the dev server.
  const env = loadEnv(mode, process.cwd(), '')
  for (const [k, v] of Object.entries(env)) {
    if (!(k in process.env)) process.env[k] = v
  }
  return {
    plugins: [react(), devChatApi()],
    server: { port: 5173, open: false },
  }
})
