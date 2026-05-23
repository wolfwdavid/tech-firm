import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useBootSeen, useCrystariumStore } from '../store'

export function BootIntro() {
  const bootSeen = useBootSeen()
  const markBootSeen = useCrystariumStore((s) => s.markBootSeen)
  const setSelectedNodeId = useCrystariumStore((s) => s.setSelectedNodeId)
  const [visible, setVisible] = useState(!bootSeen)

  useEffect(() => {
    if (bootSeen) return
    const t1 = setTimeout(() => setVisible(false), 2400)
    const t2 = setTimeout(() => {
      markBootSeen()
      // Auto-open Manager drawer so the morning briefing greets the user
      setSelectedNodeId('node-manager')
    }, 3100)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [bootSeen, markBootSeen, setSelectedNodeId])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="pointer-events-none fixed inset-0 z-[100] flex items-center justify-center"
          style={{
            background: 'radial-gradient(circle at 50% 50%, #10112a 0%, #05060d 70%)',
          }}
        >
          {/* particle field replica for parity */}
          <BootStars />

          <div className="relative flex flex-col items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.9, ease: 'easeOut' }}
              className="mb-6"
            >
              <Hexagon />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 12, letterSpacing: '0.5em' }}
              animate={{ opacity: 1, y: 0, letterSpacing: '0.32em' }}
              transition={{ duration: 1.0, ease: 'easeOut', delay: 0.3 }}
              className="font-display text-[26px] uppercase"
              style={{
                color: '#e8e9ff',
                textShadow: '0 0 24px rgba(245,196,94,0.45)',
              }}
            >
              Entering the Crystarium
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 1.0 }}
              className="mt-2 text-[11px] uppercase"
              style={{
                color: '#a8aacc',
                letterSpacing: '0.30em',
              }}
            >
              Pour Decisions · A one-person AI business
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function Hexagon() {
  return (
    <div
      className="flex items-center justify-center"
      style={{
        width: 96,
        height: 96,
        clipPath:
          'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
        background: 'radial-gradient(circle at 50% 40%, #f5c45e, #9c7a2e)',
        boxShadow:
          '0 0 48px rgba(245,196,94,0.55), 0 0 120px rgba(245,196,94,0.25)',
      }}
    >
      <div
        style={{
          width: 14,
          height: 14,
          borderRadius: 999,
          background: 'rgba(255,255,255,0.95)',
          boxShadow: '0 0 18px rgba(255,255,255,0.85)',
        }}
      />
    </div>
  )
}

function BootStars() {
  const stars = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    top: Math.random() * 100,
    left: Math.random() * 100,
    size: Math.random() < 0.6 ? 1 : 2,
    opacity: 0.15 + Math.random() * 0.25,
  }))
  return (
    <div className="pointer-events-none absolute inset-0">
      {stars.map((s) => (
        <div
          key={s.id}
          className="absolute rounded-full bg-white"
          style={{
            top: `${s.top}%`,
            left: `${s.left}%`,
            width: s.size,
            height: s.size,
            opacity: s.opacity,
          }}
        />
      ))}
    </div>
  )
}
