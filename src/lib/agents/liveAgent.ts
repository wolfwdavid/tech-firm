import type { AgentDriver, AgentReplyRequest, AgentReplyResult } from './types'

/**
 * Endpoint the live agent driver POSTs to. Defaults to same-origin /api/chat.
 * Override with VITE_AGENT_API_URL when the SvelteKit storefront's /api/chat lives
 * on a different domain.
 */
function endpointUrl(): string {
  return import.meta.env.VITE_AGENT_API_URL || '/api/chat'
}

/** Server contract — keep in sync with whichever side implements /api/chat. */
interface ChatApiResponse {
  text: string
  error?: string
}

export const liveAgentDriver: AgentDriver = {
  async reply(req: AgentReplyRequest): Promise<AgentReplyResult> {
    const start = performance.now()
    const url = endpointUrl()
    const body = {
      nodeId: req.nodeId,
      role: req.role,
      agentName: req.agentName,
      persona: req.persona,
      specialization: req.specialization,
      history: req.history,
      userText: req.userText,
      // canned responses passed as voice samples for the server to seed system prompt with
      voiceSamples: req.cannedResponses.slice(0, 4),
    }
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      const detail = await res.text().catch(() => '')
      throw new Error(`live agent ${res.status}: ${detail || res.statusText}`)
    }
    const data = (await res.json()) as ChatApiResponse
    if (data.error) throw new Error(data.error)
    if (!data.text) throw new Error('live agent returned empty text')
    return {
      text: data.text,
      source: 'live',
      latencyMs: Math.round(performance.now() - start),
    }
  },
}
