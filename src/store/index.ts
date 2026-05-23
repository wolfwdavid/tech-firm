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

  // actions
  setSelectedNodeId: (id: string | null) => void
  setNodeStatus: (id: string, status: NodeStatus) => void
  appendChat: (msg: Omit<ChatMessage, 'id' | 'ts'>) => void
  logAutomation: (evt: Omit<AutomationEvent, 'id' | 'ts'>) => void
  addClone: (input: CloneInput) => string
  resetToSeed: () => void
  markBootSeen: () => void
}

const initialState: Pick<
  CrystariumState,
  'business' | 'nodes' | 'edges' | 'agents' | 'chat' | 'automationLog' | 'selectedNodeId' | 'bootSeen'
> = {
  business: seedBusiness,
  nodes: seedNodes,
  edges: seedEdges,
  agents: seedAgents,
  chat: [],
  automationLog: [],
  selectedNodeId: null,
  bootSeen: false,
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

      logAutomation: (evt) =>
        set((s) => ({
          automationLog: [
            { ...evt, id: nextId('a'), ts: Date.now() },
            ...s.automationLog,
          ].slice(0, 50),
        })),

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
      partialize: (state) => ({
        business: state.business,
        nodes: state.nodes,
        edges: state.edges,
        agents: state.agents,
        chat: state.chat,
        automationLog: state.automationLog,
        bootSeen: state.bootSeen,
      }),
    },
  ),
)

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
