import type { Agent, BusinessSeed, ChatMessage, NodeRole } from '../../store/types'

export interface AgentReplyRequest {
  /** The capability node's id (e.g. node-manager, node-storefront, or a clone id). */
  nodeId: string
  /** The agent's role — used by liveAgent to select a system prompt template. */
  role: NodeRole
  /** Human-readable node name (e.g. "Storefront", "Manager · VIP retention"). */
  agentName: string
  /** Full persona block from seed data + any specialization additions. */
  persona: string
  /** Canned responses (used by mockAgent for keyword matching; passed to liveAgent as fallback hints). */
  cannedResponses: string[]
  /** Specialization label if this is a cloned node ("VIP retention", etc.). */
  specialization?: string
  /** Recent conversation history for this node, oldest → newest. */
  history: Pick<ChatMessage, 'from' | 'text'>[]
  /** The user's current message. */
  userText: string
  /** Business context — niche, name, KPIs — so live agents know what business they staff. */
  business?: BusinessSeed
}

export interface AgentReplyResult {
  text: string
  /** Implementations may surface latency for instrumentation. */
  latencyMs?: number
  /** True if this came from the live API; false if it's a mocked canned response. */
  source: 'mock' | 'live'
}

export interface ReplyOptions {
  /**
   * Called with each incremental chunk as the reply is produced. The chunks
   * concatenated equal the final text. Drivers MAY emit a single chunk equal
   * to the final text (non-streaming behavior); consumers must handle both.
   */
  onPartial?: (chunk: string) => void
  /** Abort signal — drivers should respect it and stop producing chunks. */
  signal?: AbortSignal
}

export interface AgentDriver {
  reply(req: AgentReplyRequest, opts?: ReplyOptions): Promise<AgentReplyResult>
}

/** Convenience: build a request from a store snapshot + the user's typed text. */
export function buildRequest(
  agent: Agent,
  role: NodeRole,
  agentName: string,
  specialization: string | undefined,
  history: Pick<ChatMessage, 'from' | 'text'>[],
  userText: string,
  business?: BusinessSeed,
): AgentReplyRequest {
  return {
    nodeId: agent.nodeId,
    role,
    agentName,
    persona: agent.persona,
    cannedResponses: agent.cannedResponses,
    specialization,
    history,
    userText,
    business,
  }
}
