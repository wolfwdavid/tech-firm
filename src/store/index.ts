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
import { agentDriver, buildRequest } from '../lib/agents'
import { personalizedActionsFor } from '../lib/personalize'

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
  onboarded: boolean
  pulsingEdgeId: string | null
  /** Per-node in-flight streaming text. Not persisted. ChatThread renders this as the typing bubble. */
  streamingByNodeId: Record<string, string>
  /** Supabase Realtime connection state. Shown as the LIVE/LOCAL pill in the header. */
  realtimeStatus: 'idle' | 'connecting' | 'live' | 'error'

  // actions
  setSelectedNodeId: (id: string | null) => void
  setNodeStatus: (id: string, status: NodeStatus) => void
  appendChat: (msg: Omit<ChatMessage, 'id' | 'ts'>) => void
  appendRecentAction: (nodeId: string, text: string) => void
  logAutomation: (evt: Omit<AutomationEvent, 'id' | 'ts'>) => void
  fireAutomation: (fromNodeId: string, toNodeId: string, label: string) => void
  sendUserMessage: (nodeId: string, text: string) => Promise<void>
  addClone: (input: CloneInput) => string
  resetToSeed: () => void
  markBootSeen: () => void
  completeOnboarding: (business: BusinessSeed, niche: string) => void
  appendStreamChunk: (nodeId: string, chunk: string) => void
  clearStreamBuffer: (nodeId: string) => void
  setRealtimeStatus: (status: CrystariumState['realtimeStatus']) => void
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
  | 'onboarded'
  | 'pulsingEdgeId'
  | 'streamingByNodeId'
  | 'realtimeStatus'
> = {
  business: seedBusiness,
  nodes: seedNodes,
  edges: seedEdges,
  agents: seedAgents,
  chat: [],
  automationLog: [],
  selectedNodeId: null,
  bootSeen: false,
  onboarded: false,
  pulsingEdgeId: null,
  streamingByNodeId: {},
  realtimeStatus: 'idle',
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

      appendStreamChunk: (nodeId, chunk) =>
        set((s) => ({
          streamingByNodeId: {
            ...s.streamingByNodeId,
            [nodeId]: (s.streamingByNodeId[nodeId] ?? '') + chunk,
          },
        })),

      clearStreamBuffer: (nodeId) =>
        set((s) => {
          if (!(nodeId in s.streamingByNodeId)) return {}
          const next = { ...s.streamingByNodeId }
          delete next[nodeId]
          return { streamingByNodeId: next }
        }),

      setRealtimeStatus: (status) => set({ realtimeStatus: status }),

      sendUserMessage: async (nodeId, text) => {
        const trimmed = text.trim()
        if (!trimmed) return
        const {
          appendChat,
          setNodeStatus,
          appendRecentAction,
          appendStreamChunk,
          clearStreamBuffer,
        } = get()
        appendChat({ nodeId, from: 'user', text: trimmed })
        setNodeStatus(nodeId, 'thinking')
        clearStreamBuffer(nodeId)

        const state = get()
        const agent = state.agents[nodeId]
        const node = state.nodes.find((n) => n.id === nodeId)
        if (!agent || !node) {
          setNodeStatus(nodeId, 'idle')
          return
        }

        const history = state.chat
          .filter((m) => m.nodeId === nodeId)
          .map((m) => ({ from: m.from, text: m.text }))

        try {
          const result = await agentDriver.reply(
            buildRequest(
              agent,
              node.role,
              node.name,
              node.specialization,
              history,
              trimmed,
              state.business,
            ),
            {
              onPartial: (chunk) => appendStreamChunk(nodeId, chunk),
            },
          )
          // Commit the final message + clear the buffer atomically so the UI swaps
          // from "agent typing" to "agent message" in a single render.
          set((s) => {
            const nextStreaming = { ...s.streamingByNodeId }
            delete nextStreaming[nodeId]
            return {
              chat: [
                ...s.chat,
                {
                  id: nextId('m'),
                  ts: Date.now(),
                  nodeId,
                  from: 'agent',
                  text: result.text,
                },
              ],
              streamingByNodeId: nextStreaming,
            }
          })
          appendRecentAction(
            nodeId,
            `Replied: "${trimmed.length > 40 ? trimmed.slice(0, 40) + '…' : trimmed}"`,
          )
        } catch (err) {
          console.error('[crystarium] agent reply failed', err)
          clearStreamBuffer(nodeId)
          appendChat({
            nodeId,
            from: 'agent',
            text: '(I lost my thread for a second — try that again?)',
          })
        } finally {
          setNodeStatus(nodeId, 'idle')
        }

        // Phase 3 hook: chat-triggered automation (unchanged behavior)
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

      completeOnboarding: (business, niche) => {
        set((s) => {
          // refresh each non-clone agent's recentActions to be niche-generic
          const refreshedAgents: typeof s.agents = { ...s.agents }
          for (const node of s.nodes) {
            if (node.parentId) continue
            const agent = refreshedAgents[node.id]
            if (!agent) continue
            const personalized = personalizedActionsFor(node.role, niche)
            if (personalized.length) {
              refreshedAgents[node.id] = {
                ...agent,
                recentActions: personalized,
              }
            }
          }
          return {
            business: { ...business, niche },
            agents: refreshedAgents,
            onboarded: true,
          }
        })
      },
    }),
    {
      name: 'crystarium-v1',
      version: 2,
      partialize: (state) => ({
        business: state.business,
        nodes: state.nodes.map((n) => ({ ...n, status: 'idle' as const })),
        edges: state.edges,
        agents: state.agents,
        chat: state.chat,
        automationLog: state.automationLog,
        bootSeen: state.bootSeen,
        onboarded: state.onboarded,
      }),
    },
  ),
)

export const usePulsingEdgeId = () => useCrystariumStore((s) => s.pulsingEdgeId)
export const useOnboarded = () => useCrystariumStore((s) => s.onboarded)
export const useStreamingText = (nodeId: string | null) =>
  useCrystariumStore((s) =>
    nodeId ? s.streamingByNodeId[nodeId] ?? null : null,
  )
export const useRealtimeStatus = () => useCrystariumStore((s) => s.realtimeStatus)

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
