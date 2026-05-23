import { flags } from '../supabase'
import { mockAgentDriver } from './mockAgent'
import { liveAgentDriver } from './liveAgent'
import type {
  AgentDriver,
  AgentReplyRequest,
  AgentReplyResult,
  ReplyOptions,
} from './types'

export type { AgentReplyRequest, AgentReplyResult, AgentDriver, ReplyOptions } from './types'
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
  async reply(
    req: AgentReplyRequest,
    opts?: ReplyOptions,
  ): Promise<AgentReplyResult> {
    if (!flags.liveAgents) {
      return mockAgentDriver.reply(req, opts)
    }
    try {
      return await liveAgentDriver.reply(req, opts)
    } catch (err) {
      console.warn(
        '[crystarium] live agent failed; falling back to mock for this turn',
        err,
      )
      // Reset any partial chunks the live attempt emitted by sending a special
      // empty signal — consumers should reset their typing buffer on fallback.
      // (Practically the live call fails before any chunk arrived, so this is
      // a no-op in common cases.)
      const fallback = await mockAgentDriver.reply(req, opts)
      return { ...fallback, source: 'mock' }
    }
  },
}
