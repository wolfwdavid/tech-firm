import { useMemo, useState } from 'react'
import { RotateCw } from 'lucide-react'
import { useCrystariumStore } from '../../store'
import { roleVisuals } from '../nodes/CrystalNode'
import type { NodeRole } from '../../store/types'

interface Bullet {
  nodeId: string
  role: NodeRole
  agentName: string
  text: string
}

function todayLabel(): string {
  const d = new Date()
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })
}

export function ManagerBriefing() {
  const agents = useCrystariumStore((s) => s.agents)
  const nodes = useCrystariumStore((s) => s.nodes)
  const [salt, setSalt] = useState(0)

  const bullets: Bullet[] = useMemo(() => {
    const candidates: Bullet[] = []
    for (const node of nodes) {
      if (node.role === 'manager' || node.parentId) continue
      const agent = agents[node.id]
      if (!agent || agent.recentActions.length === 0) continue
      const offset = salt % agent.recentActions.length
      const action = agent.recentActions[offset] || agent.recentActions[0]
      candidates.push({
        nodeId: node.id,
        role: node.role,
        agentName: node.name,
        text: action.text,
      })
    }
    // sort by recency of chosen action
    return candidates.slice(0, 5)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agents, nodes, salt])

  return (
    <div className="mx-5 mb-3 mt-4 overflow-hidden rounded-xl">
      <div
        style={{
          height: 3,
          background: `linear-gradient(90deg, ${roleVisuals.manager.bright}, ${roleVisuals.manager.base}, ${roleVisuals.manager.bright})`,
        }}
      />
      <div
        className="px-4 pb-4 pt-3"
        style={{
          background: 'rgba(22,24,48,0.78)',
          border: '1px solid rgba(245,196,94,0.18)',
          borderTop: 'none',
          boxShadow: `0 0 24px ${roleVisuals.manager.glow.replace(/[\d.]+\)$/, '0.20)')}`,
        }}
      >
        <div className="mb-1 flex items-center justify-between">
          <div
            className="text-[11px] font-semibold uppercase"
            style={{ letterSpacing: '0.20em', color: roleVisuals.manager.bright }}
          >
            Morning Briefing
          </div>
          <button
            onClick={() => setSalt((s) => s + 1)}
            aria-label="Reroll briefing"
            className="flex h-6 w-6 items-center justify-center rounded transition-colors"
            style={{ color: '#a8aacc' }}
          >
            <RotateCw size={12} />
          </button>
        </div>
        <div className="mb-3 text-[10.5px]" style={{ color: '#a8aacc' }}>
          {todayLabel()} · overnight summary
        </div>
        <ul className="flex flex-col gap-2">
          {bullets.map((b) => {
            const v = roleVisuals[b.role]
            return (
              <li key={b.nodeId} className="flex items-start gap-2.5 text-[12.5px] leading-snug">
                <span
                  className="mt-1.5 inline-block flex-shrink-0 rounded-full"
                  style={{
                    width: 6,
                    height: 6,
                    background: v.bright,
                    boxShadow: `0 0 6px ${v.glow}`,
                  }}
                  aria-hidden
                />
                <span className="flex-1" style={{ color: '#e8e9ff' }}>
                  {b.text}
                  <span className="ml-1.5 text-[10.5px]" style={{ color: '#5b5d80' }}>
                    · via {b.agentName}
                  </span>
                </span>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
