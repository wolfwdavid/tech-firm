import type { VercelRequest, VercelResponse } from '@vercel/node'
import {
  handleChat,
  handleChatStream,
  type ChatRequest,
  type StreamEvent,
} from './_chat-handler'

function setCors(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept')
}

function wantsStream(req: VercelRequest): boolean {
  const accept = (req.headers.accept || req.headers.Accept || '').toString()
  if (accept.includes('text/event-stream')) return true
  // Also honor ?stream=1 in the URL for easier curl testing
  const url = req.url || ''
  if (url.includes('stream=1')) return true
  return false
}

function formatSseEvent(event: StreamEvent): string {
  return `data: ${JSON.stringify(event)}\n\n`
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res)

  if (req.method === 'OPTIONS') {
    res.status(204).end()
    return
  }
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const body =
    typeof req.body === 'string'
      ? (JSON.parse(req.body) as ChatRequest)
      : (req.body as ChatRequest)

  if (wantsStream(req)) {
    res.statusCode = 200
    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache, no-transform')
    res.setHeader('Connection', 'keep-alive')
    res.setHeader('X-Accel-Buffering', 'no') // disable nginx buffering for SSE

    try {
      for await (const event of handleChatStream(body)) {
        res.write(formatSseEvent(event))
        if (event.type === 'error' || event.type === 'done') break
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'unexpected error'
      res.write(formatSseEvent({ type: 'error', error: msg, latencyMs: 0 }))
    }
    res.end()
    return
  }

  // Non-streaming legacy path — full JSON response
  const result = await handleChat(body)
  res.status(result.error ? 502 : 200).json(result)
}
