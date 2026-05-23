import type { AgentDriver, AgentReplyRequest, AgentReplyResult } from './types'
import { pickResponse } from '../responseMatcher'

/** Random 700-1100ms — matches v1's "thinking" feel. */
function thinkingDelay(): number {
  return 700 + Math.random() * 400
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export const mockAgentDriver: AgentDriver = {
  async reply(req: AgentReplyRequest): Promise<AgentReplyResult> {
    const start = performance.now()
    await sleep(thinkingDelay())
    // Use the last 3 agent responses as "recently used" to dedupe
    const recentlyUsed = req.history
      .filter((m) => m.from === 'agent')
      .slice(-3)
      .map((m) => m.text)
    const text = pickResponse(req.userText, req.cannedResponses, recentlyUsed)
    return {
      text,
      source: 'mock',
      latencyMs: Math.round(performance.now() - start),
    }
  },
}
