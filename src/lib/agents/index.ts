import { flags } from '../supabase'
import { mockAgentDriver } from './mockAgent'
import { liveAgentDriver } from './liveAgent'
import type { AgentDriver, AgentReplyRequest, AgentReplyResult } from './types'

export type { AgentReplyRequest, AgentReplyResult, AgentDriver } from './types'
export { buildRequest } from './types'

/**
 * The composite driver used by the store.
 *
 * When VITE_LIVE_AGENTS=true → call the live API; if it fails, fall back to the mock so the
 * demo never breaks mid-conversation. We log the failure so it's visible during rehearsal.
 *
 * When VITE_LIVE_AGENTS!=true → mock only. No network call, no fallback machinery.
 */
export const agentDriver: AgentDriver = {
  async reply(req: AgentReplyRequest): Promise<AgentReplyResult> {
    if (!flags.liveAgents) {
      return mockAgentDriver.reply(req)
    }
    try {
      return await liveAgentDriver.reply(req)
    } catch (err) {
      console.warn(
        '[crystarium] live agent failed; falling back to mock for this turn',
        err,
      )
      const fallback = await mockAgentDriver.reply(req)
      return { ...fallback, source: 'mock' }
    }
  },
}
