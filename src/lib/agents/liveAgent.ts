import type {
  AgentDriver,
  AgentReplyRequest,
  AgentReplyResult,
  ReplyOptions,
} from './types'

function endpointUrl(): string {
  return import.meta.env.VITE_AGENT_API_URL || '/api/chat'
}

/** Mirrors server `StreamEvent` in `api/_chat-handler.ts`. */
type StreamEvent =
  | { type: 'delta'; delta: string }
  | { type: 'done'; text: string; latencyMs: number }
  | { type: 'error'; error: string; latencyMs: number }

interface NonStreamingResponse {
  text?: string
  error?: string
}

function buildBody(req: AgentReplyRequest) {
  return {
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
}

/** Parse an SSE response body into a stream of StreamEvents. */
async function* parseSseStream(
  res: Response,
  signal?: AbortSignal,
): AsyncGenerator<StreamEvent, void, unknown> {
  if (!res.body) {
    throw new Error('SSE response had no body')
  }
  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  try {
    while (true) {
      if (signal?.aborted) throw new DOMException('Aborted', 'AbortError')
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })

      let eventEnd: number
      // SSE events are separated by a blank line (\n\n)
      while ((eventEnd = buffer.indexOf('\n\n')) !== -1) {
        const rawEvent = buffer.slice(0, eventEnd)
        buffer = buffer.slice(eventEnd + 2)
        const dataLine = rawEvent
          .split('\n')
          .find((line) => line.startsWith('data: '))
        if (!dataLine) continue
        const payload = dataLine.slice('data: '.length).trim()
        if (!payload) continue
        try {
          yield JSON.parse(payload) as StreamEvent
        } catch (err) {
          console.warn('[crystarium] malformed SSE payload', payload, err)
        }
      }
    }
  } finally {
    reader.releaseLock()
  }
}

export const liveAgentDriver: AgentDriver = {
  async reply(
    req: AgentReplyRequest,
    opts?: ReplyOptions,
  ): Promise<AgentReplyResult> {
    const start = performance.now()
    const url = endpointUrl()
    const body = buildBody(req)
    const streaming = !!opts?.onPartial

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        ...(streaming ? { accept: 'text/event-stream' } : {}),
      },
      body: JSON.stringify(body),
      signal: opts?.signal,
    })

    if (!res.ok) {
      const detail = await res.text().catch(() => '')
      throw new Error(`live agent ${res.status}: ${detail || res.statusText}`)
    }

    if (streaming && res.headers.get('content-type')?.startsWith('text/event-stream')) {
      let accumulated = ''
      let finalText = ''
      for await (const event of parseSseStream(res, opts?.signal)) {
        if (event.type === 'delta') {
          accumulated += event.delta
          opts!.onPartial!(event.delta)
        } else if (event.type === 'done') {
          finalText = event.text || accumulated
          break
        } else if (event.type === 'error') {
          throw new Error(event.error)
        }
      }
      if (!finalText) finalText = accumulated
      if (!finalText) throw new Error('live agent stream ended with no text')
      return {
        text: finalText,
        source: 'live',
        latencyMs: Math.round(performance.now() - start),
      }
    }

    // Non-streaming fallback (server didn't honor stream request, or no onPartial)
    const data = (await res.json()) as NonStreamingResponse
    if (data.error) throw new Error(data.error)
    if (!data.text) throw new Error('live agent returned empty text')
    return {
      text: data.text,
      source: 'live',
      latencyMs: Math.round(performance.now() - start),
    }
  },
}
