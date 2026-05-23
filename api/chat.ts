import type { VercelRequest, VercelResponse } from '@vercel/node'
import { handleChat, type ChatRequest } from './_chat-handler'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS — let Claude-A's deployed storefront hit this if they ever want a /api/chat proxy
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

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

  const result = await handleChat(body)
  res.status(result.error ? 502 : 200).json(result)
}
