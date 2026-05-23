import type {
  AgentDriver,
  AgentReplyRequest,
  AgentReplyResult,
  ReplyOptions,
} from './types'
import { pickResponse } from '../responseMatcher'

/** Random 500-900ms total response time — broken across chunked emissions for the streaming feel. */
function thinkingDelay(): number {
  return 500 + Math.random() * 400
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

/**
 * Tokenize a response into emission chunks. We split on whitespace but keep the
 * trailing space attached to each chunk so the consumer can naively concatenate.
 *
 * Result preserves punctuation and re-renders identically to the source.
 */
function chunkResponse(text: string): string[] {
  const matches = text.match(/\S+\s*/g)
  return matches ?? [text]
}

export const mockAgentDriver: AgentDriver = {
  async reply(
    req: AgentReplyRequest,
    opts?: ReplyOptions,
  ): Promise<AgentReplyResult> {
    const start = performance.now()

    // Pre-think delay
    await sleep(220 + Math.random() * 220, opts?.signal)

    const recentlyUsed = req.history
      .filter((m) => m.from === 'agent')
      .slice(-3)
      .map((m) => m.text)
    const fullText = pickResponse(req.userText, req.cannedResponses, recentlyUsed)

    if (!opts?.onPartial) {
      // Non-streaming consumer — preserve v1 thinking-then-reply timing
      await sleep(thinkingDelay(), opts?.signal)
      return {
        text: fullText,
        source: 'mock',
        latencyMs: Math.round(performance.now() - start),
      }
    }

    // Streaming consumer — chunk and emit
    const chunks = chunkResponse(fullText)
    // Total emission time scales with length but stays inside ~600-1500ms
    const targetTotalMs = Math.min(1500, Math.max(600, chunks.length * 55))
    const perChunkMs = Math.max(20, Math.floor(targetTotalMs / chunks.length))

    for (const chunk of chunks) {
      opts.onPartial(chunk)
      await sleep(perChunkMs + Math.random() * 18, opts.signal)
    }

    return {
      text: fullText,
      source: 'mock',
      latencyMs: Math.round(performance.now() - start),
    }
  },
}
