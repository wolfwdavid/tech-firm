export type NodeRole =
  | 'manager'
  | 'storefront'
  | 'customer'
  | 'email'
  | 'content'
  | 'payments'
  | 'analytics'
  | 'automations'

export type NodeStatus = 'idle' | 'thinking' | 'active'

export interface CapabilityNode {
  id: string
  role: NodeRole
  name: string
  position: { x: number; y: number }
  status: NodeStatus
  parentId?: string
  specialization?: string
}

export interface Agent {
  nodeId: string
  persona: string
  recentActions: { ts: number; text: string }[]
  cannedResponses: string[]
}

export interface ChatMessage {
  id: string
  nodeId: string
  from: 'user' | 'agent'
  text: string
  ts: number
}

export interface AutomationEvent {
  id: string
  fromNodeId: string
  toNodeId: string
  label: string
  ts: number
}

export interface BusinessSeed {
  name: string
  /** Optional one-line niche, set during onboarding. Feeds the live agent system prompt. */
  niche?: string
  mrr: number
  customerCount: number
  todayActivity: number
}

export interface EdgeData {
  id: string
  source: string
  target: string
}
