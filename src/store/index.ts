import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  Agent,
  AutomationEvent,
  BusinessSeed,
  CapabilityNode,
  ChatMessage,
  EdgeData,
  NodeStatus,
} from './types'
import {
  seedAgents,
  seedBusiness,
  seedEdges,
  seedNodes,
} from '../data/seed'
import { pickResponse } from '../lib/responseMatcher'

interface CloneInput {
  parentId: string
  specialization: string
}

interface CrystariumState {
  business: BusinessSeed
  nodes: CapabilityNode[]
  edges: EdgeData[]
  agents: Record<string, Agent>
  chat: ChatMessage[]
  automationLog: AutomationEvent[]
  selectedNodeId: string | null
  bootSeen: boolean
  pulsingEdgeId: string | null

  // actions
  setSelectedNodeId: (id: string | null) => void
  setNodeStatus: (id: string, status: NodeStatus) => void
  appendChat: (msg: Omit<ChatMessage, 'id' | 'ts'>) => void
  appendRecentAction: (nodeId: string, text: string) => void
  logAutomation: (evt: Omit<AutomationEvent, 'id' | 'ts'>) => void
  fireAutomation: (fromNodeId: string, toNodeId: string, label: string) => void
  sendUserMessage: (nodeId: string, text: string) => void
  addClone: (input: CloneInput) => string
  resetToSeed: () => void
  markBootSeen: () => void
}

const initialState: Pick<
  CrystariumState,
  | 'business'
  | 'nodes'
  | 'edges'
  | 'agents'
  | 'chat'
  | 'automationLog'
  | 'selectedNodeId'
  | 'bootSeen'
  | 'pulsingEdgeId'
> = {
  business: seedBusiness,
  nodes: seedNodes,
  edges: seedEdges,
  agents: seedAgents,
  chat: [],
  automationLog: [],
  selectedNodeId: null,
  bootSeen: false,
  pulsingEdgeId: null,
}

let idCounter = 0
const nextId = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${(idCounter++).toString(36)}`

export const useCrystariumStore = create<CrystariumState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setSelectedNodeId: (id) => set({ selectedNodeId: id }),

      setNodeStatus: (id, status) =>
        set((s) => ({
          nodes: s.nodes.map((n) => (n.id === id ? { ...n, status } : n)),
        })),

      appendChat: (msg) =>
        set((s) => ({
          chat: [
            ...s.chat,
            { ...msg, id: nextId('m'), ts: Date.now() },
          ],
        })),

      appendRecentAction: (nodeId, text) =>
        set((s) => {
          const agent = s.agents[nodeId]
          if (!agent) return {}
          const updated: Agent = {
            ...agent,
            recentActions: [
              { ts: Date.now(), text },
              ...agent.recentActions,
            ].slice(0, 5),
          }
          return { agents: { ...s.agents, [nodeId]: updated } }
        }),

      logAutomation: (evt) =>
        set((s) => ({
          automationLog: [
            { ...evt, id: nextId('a'), ts: Date.now() },
            ...s.automationLog,
          ].slice(0, 50),
        })),

      fireAutomation: (fromNodeId, toNodeId, label) => {
        const { edges, logAutomation } = get()
        const edge = edges.find(
          (e) =>
            (e.source === fromNodeId && e.target === toNodeId) ||
            (e.source === toNodeId && e.target === fromNodeId),
        )
        logAutomation({ fromNodeId, toNodeId, label })
        if (edge) {
          set({ pulsingEdgeId: edge.id })
          setTimeout(() => {
            // Only clear if it's still the same pulse
            if (get().pulsingEdgeId === edge.id) {
              set({ pulsingEdgeId: null })
            }
          }, 1600)
        }
      },

      sendUserMessage: (nodeId, text) => {
        const trimmed = text.trim()
        if (!trimmed) return
        const { appendChat, setNodeStatus, appendRecentAction } = get()
        appendChat({ nodeId, from: 'user', text: trimmed })
        setNodeStatus(nodeId, 'thinking')
        const delay = 700 + Math.random() * 400
        setTimeout(() => {
          const state = get()
          const agent = state.agents[nodeId]
          if (!agent) {
            setNodeStatus(nodeId, 'idle')
            return
          }
          const recentAgentMsgs = state.chat
            .filter((m) => m.nodeId === nodeId && m.from === 'agent')
            .slice(-3)
            .map((m) => m.text)
          const reply = pickResponse(trimmed, agent.cannedResponses, recentAgentMsgs)
          appendChat({ nodeId, from: 'agent', text: reply })
          appendRecentAction(
            nodeId,
            `Replied: "${trimmed.length > 40 ? trimmed.slice(0, 40) + '…' : trimmed}"`,
          )
          setNodeStatus(nodeId, 'idle')

          // Phase 3 hook: chat-triggered automation
          const triggerMap: Record<string, [string, string]> = {
            'node-storefront': ['node-content', 'Storefront → Content: idea queued'],
            'node-customer': ['node-email', 'Customer → Email: nurture queued'],
            'node-email': ['node-payments', 'Email → Payments: receipt sync'],
            'node-content': ['node-email', 'Content → Email: campaign asset ready'],
            'node-payments': ['node-analytics', 'Payments → Analytics: txn logged'],
            'node-analytics': ['node-manager', 'Analytics → Manager: insight flagged'],
            'node-automations': ['node-manager', 'Automations → Manager: wire active'],
            'node-manager': ['node-analytics', 'Manager → Analytics: priority shifted'],
          }
          const trigger = triggerMap[nodeId]
          if (trigger && Math.random() > 0.35) {
            const [target, label] = trigger
            setTimeout(() => get().fireAutomation(nodeId, target, label), 400)
          }
        }, delay)
      },

      addClone: ({ parentId, specialization }) => {
        const parent = get().nodes.find((n) => n.id === parentId)
        if (!parent) return ''
        const cloneId = nextId('clone')
        const angle = Math.random() * Math.PI * 2
        const radius = 140
        const newNode: CapabilityNode = {
          id: cloneId,
          role: parent.role,
          name: `${parent.name} · ${specialization}`,
          position: {
            x: parent.position.x + Math.cos(angle) * radius,
            y: parent.position.y + Math.sin(angle) * radius,
          },
          status: 'idle',
          parentId,
          specialization,
        }
        const parentAgent = get().agents[parentId]
        const cloneAgent: Agent = {
          nodeId: cloneId,
          persona: parentAgent
            ? `${parentAgent.persona} I'm the ${specialization} specialist — same role, narrower lens.`
            : `Specialist for ${specialization}.`,
          recentActions: [
            { ts: Date.now(), text: `Spun up as a ${specialization} specialist.` },
          ],
          cannedResponses: parentAgent
            ? parentAgent.cannedResponses.map(
                (r) => `[${specialization}] ${r}`,
              )
            : [`I focus on ${specialization}. Tell me what you need.`],
        }
        set((s) => ({
          nodes: [...s.nodes, newNode],
          edges: [
            ...s.edges,
            { id: nextId('e'), source: parentId, target: cloneId },
          ],
          agents: { ...s.agents, [cloneId]: cloneAgent },
        }))
        return cloneId
      },

      resetToSeed: () => set(initialState),

      markBootSeen: () => set({ bootSeen: true }),
    }),
    {
      name: 'crystarium-v1',
      version: 1,
      partialize: (state) => ({
        business: state.business,
        nodes: state.nodes.map((n) => ({ ...n, status: 'idle' as const })),
        edges: state.edges,
        agents: state.agents,
        chat: state.chat,
        automationLog: state.automationLog,
        bootSeen: state.bootSeen,
      }),
    },
  ),
)

export const usePulsingEdgeId = () => useCrystariumStore((s) => s.pulsingEdgeId)

// Selectors
export const useBusiness = () => useCrystariumStore((s) => s.business)
export const useNodes = () => useCrystariumStore((s) => s.nodes)
export const useEdges = () => useCrystariumStore((s) => s.edges)
export const useAgent = (nodeId: string | null) =>
  useCrystariumStore((s) => (nodeId ? s.agents[nodeId] : undefined))
export const useChat = (nodeId: string | null) =>
  useCrystariumStore((s) =>
    nodeId ? s.chat.filter((m) => m.nodeId === nodeId) : [],
  )
export const useAutomationLog = () => useCrystariumStore((s) => s.automationLog)
export const useSelectedNodeId = () => useCrystariumStore((s) => s.selectedNodeId)
export const useBootSeen = () => useCrystariumStore((s) => s.bootSeen)
