import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Keyboard, X } from 'lucide-react'
import { useOnboarded } from '../store'
import { roleVisuals } from './nodes/CrystalNode'

/**
 * Presenter cheat sheet. Three layers:
 *  - Thin ribbon at bottom-center: shows the 4-5 most useful hotkeys
 *  - Press '?' (or click ribbon) → expands to a full card
 *  - Auto-fades the ribbon after 10s on first session view; '?' brings it back
 */

interface KeyTip {
  keys: string[]
  label: string
  detail?: string
}

const RIBBON_TIPS: KeyTip[] = [
  { keys: ['⇧', 'D'], label: 'Demo panel' },
  { keys: ['1'], label: 'Fake signup' },
  { keys: ['Esc'], label: 'Close drawer' },
  { keys: ['?'], label: 'All shortcuts' },
]

const FULL_TIPS: KeyTip[] = [
  { keys: ['Click crystal'], label: 'Open agent drawer', detail: 'Right-side panel with persona, recent actions, chat' },
  { keys: ['Type → Enter'], label: 'Send a message', detail: 'Agent types a reply word-by-word' },
  { keys: ['⇧', 'D'], label: 'Toggle demo controls', detail: 'Bottom-right panel with 4 fake-event buttons' },
  { keys: ['1', '–', '4'], label: 'Fire demo scenario', detail: 'When demo panel is open: signup / purchase / churn / content idea' },
  { keys: ['Wand icon'], label: 'Clone & specialize', detail: 'Spawns a child crystal with a narrowed agent (e.g. "VIP retention")' },
  { keys: ['Esc'], label: 'Close drawer / dialogs', detail: 'Also dismisses the demo panel' },
  { keys: ['↺ in header'], label: 'Reset demo', detail: 'Wipes localStorage and replays the boot intro' },
  { keys: ['?'], label: 'This sheet', detail: 'Toggle this overlay' },
]

export function HotkeyOverlay() {
  const onboarded = useOnboarded()
  const [expanded, setExpanded] = useState(false)
  const [ribbonVisible, setRibbonVisible] = useState(true)

  // Auto-fade the ribbon after 10s on first show
  useEffect(() => {
    if (!onboarded) return
    const t = setTimeout(() => setRibbonVisible(false), 10000)
    return () => clearTimeout(t)
  }, [onboarded])

  // Keyboard listener for ?
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return
      }
      if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault()
        setExpanded((v) => !v)
        setRibbonVisible(true)
      } else if (e.key === 'Escape' && expanded) {
        setExpanded(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [expanded])

  if (!onboarded) return null

  return (
    <>
      {/* Ribbon */}
      <AnimatePresence>
        {ribbonVisible && !expanded && (
          <motion.div
            key="ribbon"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.28 }}
            className="pointer-events-none fixed bottom-5 left-1/2 z-20 -translate-x-1/2"
          >
            <button
              onClick={() => setExpanded(true)}
              aria-label="Show all shortcuts"
              className="pointer-events-auto flex items-center gap-3 rounded-full px-3.5 py-1.5"
              style={{
                background: 'rgba(22,24,48,0.78)',
                border: '1px solid rgba(160,180,255,0.14)',
                backdropFilter: 'blur(8px)',
                boxShadow: '0 6px 18px rgba(0,0,0,0.35)',
              }}
            >
              <Keyboard size={11} color="#a8aacc" />
              {RIBBON_TIPS.map((tip, i) => (
                <span
                  key={i}
                  className="flex items-center gap-1.5 text-[10px] uppercase"
                  style={{
                    color: '#a8aacc',
                    letterSpacing: '0.12em',
                  }}
                >
                  {tip.keys.map((k, j) => (
                    <kbd
                      key={j}
                      className="rounded px-1.5 py-0.5 text-[9.5px] font-medium normal-case"
                      style={{
                        background: 'rgba(255,255,255,0.06)',
                        color: '#e8e9ff',
                        letterSpacing: '0.05em',
                      }}
                    >
                      {k}
                    </kbd>
                  ))}
                  <span>{tip.label}</span>
                  {i < RIBBON_TIPS.length - 1 && (
                    <span style={{ color: '#3a3c5c' }}>·</span>
                  )}
                </span>
              ))}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expanded card */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            key="expanded"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-[80] flex items-center justify-center px-6"
            style={{ background: 'rgba(5,6,13,0.62)', backdropFilter: 'blur(6px)' }}
            onClick={() => setExpanded(false)}
          >
            <motion.div
              initial={{ y: 12, scale: 0.97, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              exit={{ y: 12, scale: 0.97, opacity: 0 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-[560px] overflow-hidden rounded-2xl"
              style={{
                background: 'rgba(22,24,48,0.95)',
                border: '1px solid rgba(160,180,255,0.18)',
                boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
              }}
            >
              <div
                className="flex items-center justify-between px-5 py-3.5"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
              >
                <div className="flex items-center gap-2.5">
                  <Keyboard size={14} color={roleVisuals.manager.bright} />
                  <div
                    className="text-[11px] font-semibold uppercase"
                    style={{ color: '#e8e9ff', letterSpacing: '0.22em' }}
                  >
                    Demo Shortcuts
                  </div>
                </div>
                <button
                  onClick={() => setExpanded(false)}
                  aria-label="Close shortcuts"
                  className="rounded p-1 transition-colors hover:bg-white/5"
                  style={{ color: '#a8aacc' }}
                >
                  <X size={14} />
                </button>
              </div>
              <div className="px-5 py-4">
                <ul className="flex flex-col gap-2.5">
                  {FULL_TIPS.map((tip, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div
                        className="flex flex-shrink-0 items-center gap-1"
                        style={{ minWidth: 130 }}
                      >
                        {tip.keys.map((k, j) => (
                          <kbd
                            key={j}
                            className="rounded px-1.5 py-0.5 text-[10.5px] font-medium"
                            style={{
                              background: 'rgba(255,255,255,0.06)',
                              border: '1px solid rgba(160,180,255,0.10)',
                              color: '#e8e9ff',
                              letterSpacing: '0.05em',
                            }}
                          >
                            {k}
                          </kbd>
                        ))}
                      </div>
                      <div className="flex-1 leading-tight">
                        <div
                          className="text-[12.5px] font-semibold"
                          style={{ color: '#e8e9ff' }}
                        >
                          {tip.label}
                        </div>
                        {tip.detail && (
                          <div
                            className="mt-0.5 text-[11.5px]"
                            style={{ color: '#a8aacc' }}
                          >
                            {tip.detail}
                          </div>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
                <div
                  className="mt-4 rounded-md px-3 py-2.5 text-[11px] italic"
                  style={{
                    background: 'rgba(10,11,26,0.6)',
                    color: '#a8aacc',
                    border: '1px solid rgba(160,180,255,0.08)',
                  }}
                >
                  Tip: the Crystarium runs whether you touch it or not. Seeded
                  automations fire every 15-22s, so if you stop talking for a
                  moment, the room still sees the system breathing.
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
