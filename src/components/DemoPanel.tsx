import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  CreditCard,
  Mail,
  PenTool,
  Play,
  Sparkles,
  TrendingDown,
  X,
  Zap,
} from 'lucide-react'
import { useCrystariumStore, useSelectedNodeId } from '../store'
import { roleVisuals } from './nodes/CrystalNode'
import type { NodeRole } from '../store/types'

/**
 * Demo control panel. Lets the presenter fire automation events on demand so
 * the magic pulse + log row are guaranteed to land during the demo — works
 * with or without Claude-A's storefront wiring it from the other end.
 *
 * Hotkeys:
 *   Shift+D  — toggle panel
 *   1..4     — fire scenario when panel is open
 */

interface Scenario {
  id: string
  label: string
  hint: string
  from: string
  to: string
  fromRole: NodeRole
  toRole: NodeRole
  /** Function returns the label text — randomized per call so successive fires read different. */
  buildLabel: () => string
  icon: typeof Sparkles
}

const FAKE_NAMES = [
  'Sam from Brooklyn',
  'Avery (decaf)',
  'Jordan',
  'Riya · house blend',
  'Marco · whole-bean',
  'Lena (NYC)',
  'Chris from Portland',
]

const pickName = (): string =>
  FAKE_NAMES[Math.floor(Math.random() * FAKE_NAMES.length)]

const SCENARIOS: Scenario[] = [
  {
    id: 'signup',
    label: 'New customer signup',
    hint: 'Storefront → Email',
    from: 'node-storefront',
    to: 'node-email',
    fromRole: 'storefront',
    toRole: 'email',
    buildLabel: () => `New signup → welcome sequence (${pickName()})`,
    icon: Sparkles,
  },
  {
    id: 'order',
    label: 'Big purchase',
    hint: 'Payments → Manager',
    from: 'node-payments',
    to: 'node-manager',
    fromRole: 'payments',
    toRole: 'manager',
    buildLabel: () => {
      const amount = (180 + Math.floor(Math.random() * 200))
      return `VIP order flagged → $${amount} (${pickName()})`
    },
    icon: CreditCard,
  },
  {
    id: 'cold',
    label: 'Cold customer detected',
    hint: 'Analytics → Email',
    from: 'node-analytics',
    to: 'node-email',
    fromRole: 'analytics',
    toRole: 'email',
    buildLabel: () => `Churn risk on ${pickName()} → re-engagement queued`,
    icon: TrendingDown,
  },
  {
    id: 'idea',
    label: 'Content idea spotted',
    hint: 'Content → Email',
    from: 'node-content',
    to: 'node-email',
    fromRole: 'content',
    toRole: 'email',
    buildLabel: () =>
      `New campaign asset ready → "the morning ritual" angle`,
    icon: PenTool,
  },
]

export function DemoPanel() {
  const fireAutomation = useCrystariumStore((s) => s.fireAutomation)
  const appendRecentAction = useCrystariumStore((s) => s.appendRecentAction)
  const selectedNodeId = useSelectedNodeId()
  const drawerOpen = !!selectedNodeId
  const [open, setOpen] = useState(false)
  const [lastFiredId, setLastFiredId] = useState<string | null>(null)

  // Hotkeys
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Skip if user is typing in an input
      const target = e.target as HTMLElement
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return
      }

      if (e.shiftKey && (e.key === 'D' || e.key === 'd')) {
        e.preventDefault()
        setOpen((v) => !v)
        return
      }

      if (open && /^[1-4]$/.test(e.key)) {
        e.preventDefault()
        const idx = parseInt(e.key, 10) - 1
        const scenario = SCENARIOS[idx]
        if (scenario) fire(scenario)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const fire = (s: Scenario) => {
    const label = s.buildLabel()
    fireAutomation(s.from, s.to, label)
    appendRecentAction(s.from, label)
    setLastFiredId(s.id)
    setTimeout(() => {
      setLastFiredId((cur) => (cur === s.id ? null : cur))
    }, 1400)
  }

  // When the agent drawer is open (right-side, 420px wide), slide the panel
  // to the left of the drawer so the presenter can still reach it. Otherwise
  // sit in the bottom-right corner.
  const rightOffset = drawerOpen ? 440 : 20
  return (
    <div
      className="fixed bottom-5 z-30 transition-[right] duration-200 ease-out"
      style={{ right: rightOffset, pointerEvents: 'auto' }}
    >
      <AnimatePresence mode="wait">
        {open ? (
          <motion.div
            key="expanded"
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="flex w-[320px] flex-col overflow-hidden rounded-xl"
            style={{
              background: 'rgba(22,24,48,0.95)',
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
                <Zap size={13} color={roleVisuals.automations.bright} />
                <div
                  className="text-[11px] font-semibold uppercase"
                  style={{
                    letterSpacing: '0.20em',
                    color: '#e8e9ff',
                  }}
                >
                  Demo Controls
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close demo controls"
                className="rounded p-1 transition-colors hover:bg-white/5"
                style={{ color: '#a8aacc' }}
              >
                <X size={13} />
              </button>
            </div>

            <div className="px-3 py-2">
              <div
                className="mb-2 px-1 text-[10.5px]"
                style={{ color: '#5b5d80' }}
              >
                Fire a customer event to make the Crystarium pulse on demand.
                Hotkeys 1-4 also work when this panel is open.
              </div>
              <div className="flex flex-col gap-1.5">
                {SCENARIOS.map((s, i) => {
                  const fromV = roleVisuals[s.fromRole]
                  const toV = roleVisuals[s.toRole]
                  const Icon = s.icon
                  const flashing = lastFiredId === s.id
                  return (
                    <button
                      key={s.id}
                      onClick={() => fire(s)}
                      className="flex items-center gap-2.5 rounded-md px-2.5 py-2 text-left transition-all"
                      style={{
                        background: flashing
                          ? `${toV.glow}`
                          : 'rgba(10,11,26,0.65)',
                        border: `1px solid ${flashing ? toV.bright : 'rgba(160,180,255,0.10)'}`,
                        boxShadow: flashing
                          ? `0 0 14px ${toV.glow}`
                          : 'none',
                      }}
                    >
                      <span
                        className="flex h-7 w-7 flex-shrink-0 items-center justify-center"
                        style={{
                          clipPath:
                            'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                          background: `radial-gradient(circle at 50% 40%, ${fromV.bright}, ${fromV.base})`,
                          boxShadow: `0 0 8px ${fromV.glow}`,
                        }}
                      >
                        <Icon size={12} color="rgba(255,255,255,0.95)" strokeWidth={1.8} />
                      </span>
                      <span className="flex-1 leading-tight">
                        <span
                          className="block text-[12px] font-medium"
                          style={{ color: '#e8e9ff' }}
                        >
                          {s.label}
                        </span>
                        <span
                          className="block text-[10px] uppercase"
                          style={{
                            color: '#5b5d80',
                            letterSpacing: '0.14em',
                          }}
                        >
                          {s.hint}
                        </span>
                      </span>
                      <span
                        className="flex-shrink-0 text-[10px] tabular-nums"
                        style={{ color: '#5b5d80' }}
                      >
                        {i + 1}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.button
            key="collapsed"
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            onClick={() => setOpen(true)}
            aria-label="Open demo controls"
            className="flex items-center gap-2 rounded-full px-4 py-2.5 text-[12px] font-semibold uppercase transition-all hover:scale-[1.03]"
            style={{
              background: 'rgba(22,24,48,0.9)',
              border: '1px solid rgba(245,196,94,0.32)',
              color: '#e8e9ff',
              letterSpacing: '0.16em',
              backdropFilter: 'blur(8px)',
              boxShadow: '0 6px 24px rgba(0,0,0,0.35)',
            }}
          >
            <Play
              size={12}
              color={roleVisuals.manager.bright}
              fill={roleVisuals.manager.bright}
              strokeWidth={1.6}
            />
            <span>Demo</span>
            <kbd
              className="ml-1 rounded px-1.5 py-0.5 text-[9.5px]"
              style={{
                background: 'rgba(255,255,255,0.06)',
                color: '#a8aacc',
                letterSpacing: '0.08em',
              }}
            >
              ⇧D
            </kbd>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}
