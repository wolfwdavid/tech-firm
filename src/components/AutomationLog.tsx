import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, ChevronDown, Zap } from 'lucide-react'
import { useAutomationLog, useCrystariumStore } from '../store'
import { roleVisuals } from './nodes/CrystalNode'
import { formatTime } from '../lib/utils'
import type { NodeRole } from './../store/types'

export function AutomationLog() {
  const log = useAutomationLog()
  const nodes = useCrystariumStore((s) => s.nodes)
  const [expanded, setExpanded] = useState(false)
  const [lastSeenId, setLastSeenId] = useState<string | null>(null)

  // Build a lookup nodeId → { role, name }
  const nodeInfo = useMemo(() => {
    const m = new Map<string, { role: NodeRole; name: string }>()
    for (const n of nodes) m.set(n.id, { role: n.role, name: n.name })
    return m
  }, [nodes])

  // When new event arrives, flash
  const latestId = log[0]?.id ?? null
  const isFresh = latestId && latestId !== lastSeenId

  useEffect(() => {
    if (!latestId) return
    if (latestId !== lastSeenId) {
      const t = setTimeout(() => setLastSeenId(latestId), 1200)
      return () => clearTimeout(t)
    }
  }, [latestId, lastSeenId])

  if (log.length === 0 && !expanded) {
    // Show a quiet collapsed pill even with empty log
  }

  return (
    <div
      className="fixed bottom-5 left-5 z-30"
      style={{ pointerEvents: 'auto' }}
    >
      <AnimatePresence mode="wait">
        {expanded ? (
          <motion.div
            key="expanded"
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="flex flex-col overflow-hidden rounded-xl"
            style={{
              width: 380,
              maxHeight: 360,
              background: 'rgba(22,24,48,0.92)',
              border: '1px solid rgba(160,180,255,0.18)',
              boxShadow: '0 12px 48px rgba(0,0,0,0.45)',
              backdropFilter: 'blur(16px)',
            }}
          >
            <div
              className="flex items-center justify-between px-4 py-3"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div className="flex items-center gap-2">
                <Zap size={14} color={roleVisuals.automations.bright} />
                <div
                  className="text-[11px] font-semibold uppercase"
                  style={{
                    letterSpacing: '0.20em',
                    color: '#e8e9ff',
                  }}
                >
                  Automation Log
                </div>
                <span
                  className="ml-1 rounded-full px-2 py-0.5 text-[10px] font-semibold"
                  style={{
                    background: `${roleVisuals.automations.glow}`,
                    color: '#e8e9ff',
                  }}
                >
                  {log.length}
                </span>
              </div>
              <button
                onClick={() => setExpanded(false)}
                aria-label="Collapse log"
                className="rounded p-1 transition-colors hover:bg-white/5"
                style={{ color: '#a8aacc' }}
              >
                <ChevronDown size={14} />
              </button>
            </div>
            <div className="scrollbar-mystic flex-1 overflow-y-auto px-4 py-2">
              {log.length === 0 ? (
                <div className="py-6 text-center text-[12px] italic" style={{ color: '#5b5d80' }}>
                  No automations yet. Sit tight — the system is quiet but awake.
                </div>
              ) : (
                <ul className="flex flex-col gap-1.5">
                  {log.slice(0, 30).map((evt) => {
                    const from = nodeInfo.get(evt.fromNodeId)
                    const to = nodeInfo.get(evt.toNodeId)
                    if (!from || !to) return null
                    const fv = roleVisuals[from.role]
                    const tv = roleVisuals[to.role]
                    const fresh = evt.id === latestId && isFresh
                    return (
                      <li
                        key={evt.id}
                        className="flex items-center gap-2 rounded-md px-2 py-1.5 text-[12px] leading-tight transition-colors"
                        style={{
                          background: fresh ? `${tv.glow}` : 'transparent',
                          color: '#e8e9ff',
                        }}
                      >
                        <span
                          className="tabular-nums"
                          style={{ color: '#5b5d80', fontSize: 10.5, minWidth: 38 }}
                        >
                          {formatTime(evt.ts)}
                        </span>
                        <span
                          className="inline-block flex-shrink-0 rounded-full"
                          style={{
                            width: 7,
                            height: 7,
                            background: fv.bright,
                            boxShadow: `0 0 6px ${fv.glow}`,
                          }}
                          aria-hidden
                        />
                        <ArrowRight size={11} color="#a8aacc" />
                        <span
                          className="inline-block flex-shrink-0 rounded-full"
                          style={{
                            width: 7,
                            height: 7,
                            background: tv.bright,
                            boxShadow: `0 0 6px ${tv.glow}`,
                          }}
                          aria-hidden
                        />
                        <span className="flex-1 truncate">{evt.label}</span>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.button
            key="collapsed"
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            onClick={() => setExpanded(true)}
            className="flex items-center gap-2.5 rounded-full px-4 py-2.5 text-[12px] font-semibold uppercase transition-all hover:scale-[1.03]"
            style={{
              background: 'rgba(22,24,48,0.9)',
              border: `1px solid ${roleVisuals.automations.glow}`,
              color: '#e8e9ff',
              letterSpacing: '0.16em',
              backdropFilter: 'blur(8px)',
              boxShadow: isFresh
                ? `0 0 24px ${roleVisuals.automations.glow}`
                : '0 6px 24px rgba(0,0,0,0.35)',
            }}
          >
            <Zap
              size={14}
              color={roleVisuals.automations.bright}
              style={{
                filter: isFresh
                  ? `drop-shadow(0 0 6px ${roleVisuals.automations.bright})`
                  : 'none',
              }}
            />
            <span>Automations</span>
            <span
              className="rounded-full px-2 py-0.5 text-[10px]"
              style={{
                background: roleVisuals.automations.glow,
                color: '#e8e9ff',
                letterSpacing: '0.05em',
              }}
            >
              {log.length}
            </span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}
