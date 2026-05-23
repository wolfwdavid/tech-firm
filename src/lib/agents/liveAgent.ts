import type {
  AgentDriver,
  AgentReplyRequest,
  AgentReplyResult,
  ReplyOptions,
} from './types'

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

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(new DOMException('Aborted', 'AbortError'))
    const t = setTimeout(resolve, ms)
    signal?.addEventListener(
      'abort',
      () => {
        clearTimeout(t)
        reject(new DOMException('Aborted', 'AbortError'))
      },
      { once: true },
    )
  })
}

function chunkResponse(text: string): string[] {
  return text.match(/\S+\s*/g) ?? [text]
}

export const liveAgentDriver: AgentDriver = {
  async reply(
    req: AgentReplyRequest,
    opts?: ReplyOptions,
  ): Promise<AgentReplyResult> {
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
      voiceSamples: req.cannedResponses.slice(0, 4),
      business: req.business
        ? {
            name: req.business.name,
            niche: req.business.niche,
            mrr: req.business.mrr,
            customerCount: req.business.customerCount,
          }
        : undefined,
    }
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
      signal: opts?.signal,
    })
    if (!res.ok) {
      const detail = await res.text().catch(() => '')
      throw new Error(`live agent ${res.status}: ${detail || res.statusText}`)
    }
    const data = (await res.json()) as ChatApiResponse
    if (data.error) throw new Error(data.error)
    if (!data.text) throw new Error('live agent returned empty text')

    if (opts?.onPartial) {
      // Server returns whole text in one shot; chunk it on the client so the
      // typing UX is consistent with the mock path. (Once /api/chat is upgraded
      // to SSE we replace this with delta parsing — interface stays the same.)
      const chunks = chunkResponse(data.text)
      const perChunkMs = Math.max(18, Math.floor(900 / Math.max(chunks.length, 1)))
      for (const chunk of chunks) {
        opts.onPartial(chunk)
        await sleep(perChunkMs, opts.signal)
      }
    }

    return {
      text: data.text,
      source: 'live',
      latencyMs: Math.round(performance.now() - start),
    }
  },
}
