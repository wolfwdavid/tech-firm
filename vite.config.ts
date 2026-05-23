import { defineConfig, loadEnv, type PluginOption } from 'vite'
import react from '@vitejs/plugin-react'
import {
  handleChat,
  handleChatStream,
  type ChatRequest,
  type StreamEvent,
} from './api/_chat-handler'

/**
 * Local /api/chat middleware — shares the same handler the Vercel function uses,
 * so dev and prod behave identically. Reads ANTHROPIC_API_KEY from .env.local
 * via Node's process.env (Vite loads .env files into the dev server's env).
 *
 * Supports both modes:
 *   - Non-streaming: POST application/json → full JSON response
 *   - Streaming:     POST + Accept: text/event-stream → SSE
 */
function devChatApi(): PluginOption {
  return {
    name: 'dev-chat-api',
    configureServer(server) {
      server.middlewares.use('/api/chat', async (req, res) => {
        // CORS / preflight
        res.setHeader('Access-Control-Allow-Origin', '*')
        res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept')
        if (req.method === 'OPTIONS') {
          res.statusCode = 204
          res.end()
          return
        }
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.end(JSON.stringify({ error: 'Method not allowed' }))
          return
        }

        // Parse body
        let body: ChatRequest
        try {
          let raw = ''
          for await (const chunk of req) raw += chunk
          body = JSON.parse(raw) as ChatRequest
        } catch (err) {
          res.statusCode = 400
          res.setHeader('content-type', 'application/json')
          res.end(
            JSON.stringify({
              error: err instanceof Error ? err.message : 'Bad JSON',
            }),
          )
          return
        }

        const accept = (req.headers.accept || '').toString()
        const url = req.url || ''
        const wantsStream =
          accept.includes('text/event-stream') || url.includes('stream=1')

        if (wantsStream) {
          res.statusCode = 200
          res.setHeader('Content-Type', 'text/event-stream')
          res.setHeader('Cache-Control', 'no-cache, no-transform')
          res.setHeader('Connection', 'keep-alive')
          res.setHeader('X-Accel-Buffering', 'no')

          try {
            for await (const event of handleChatStream(body)) {
              res.write(`data: ${JSON.stringify(event)}\n\n`)
              if (event.type === 'error' || event.type === 'done') break
            }
          } catch (err) {
            const msg = err instanceof Error ? err.message : 'unexpected error'
            const errorEvent: StreamEvent = {
              type: 'error',
              error: msg,
              latencyMs: 0,
            }
            res.write(`data: ${JSON.stringify(errorEvent)}\n\n`)
          }
          res.end()
          return
        }

        // Non-streaming JSON
        try {
          const result = await handleChat(body)
          res.statusCode = result.error ? 502 : 200
          res.setHeader('content-type', 'application/json')
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
  const env = loadEnv(mode, process.cwd(), '')
  for (const [k, v] of Object.entries(env)) {
    if (!(k in process.env)) process.env[k] = v
  }

  // GitHub Pages serves the repo at /<repo-name>/ — set base so asset URLs resolve.
  // Override with VITE_BASE='/' for root-domain hosts (Vercel, custom domain).
  const base = env.VITE_BASE ?? (mode === 'production' ? '/tech-firm/' : '/')

  return {
    base,
    plugins: [react(), devChatApi()],
    server: { port: 5173, open: false },
  }
})
