import { useEffect, useRef } from 'react'
import type { ChatMessage, NodeRole } from '../../store/types'
import { roleVisuals } from '../nodes/CrystalNode'
import { formatTime } from '../../lib/utils'

interface Props {
  messages: ChatMessage[]
  role: NodeRole
  agentName: string
  isThinking: boolean
  emptyHint: string
}

export function ChatThread({
  messages,
  role,
  agentName,
  isThinking,
  emptyHint,
}: Props) {
  const visual = roleVisuals[role]
  const scrollerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = scrollerRef.current
    if (!el) return
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  }, [messages.length, isThinking])

  const hasContent = messages.length > 0 || isThinking

  return (
    <div
      ref={scrollerRef}
      className="scrollbar-mystic flex-1 overflow-y-auto px-5 py-3"
    >
      {!hasContent && (
        <div
          className="flex h-full items-center justify-center px-6 text-center text-[12.5px] italic"
          style={{ color: '#5b5d80' }}
        >
          {emptyHint}
        </div>
      )}

      <div className="flex flex-col gap-3">
        {messages.map((m) =>
          m.from === 'user' ? (
            <div key={m.id} className="flex flex-col items-end">
              <div
                className="max-w-[80%] rounded-2xl rounded-br-md px-3.5 py-2 text-[13px]"
                style={{
                  background: 'rgba(231,233,255,0.12)',
                  color: '#e8e9ff',
                  border: '1px solid rgba(231,233,255,0.10)',
                }}
              >
                {m.text}
              </div>
              <div className="mt-1 text-[10px]" style={{ color: '#5b5d80' }}>
                {formatTime(m.ts)}
              </div>
            </div>
          ) : (
            <div key={m.id} className="flex flex-col items-start">
              <div
                className="mb-0.5 text-[10px] font-semibold uppercase"
                style={{ color: visual.bright, letterSpacing: '0.15em' }}
              >
                {agentName}
              </div>
              <div
                className="max-w-[88%] rounded-2xl rounded-bl-md px-3.5 py-2 text-[13px]"
                style={{
                  background: 'rgba(22,24,48,0.85)',
                  color: '#e8e9ff',
                  borderLeft: `2px solid ${visual.bright}`,
                  boxShadow: `0 0 12px ${visual.glow.replace(/[\d.]+\)$/, '0.18)')}`,
                }}
              >
                {m.text}
              </div>
              <div className="mt-1 text-[10px]" style={{ color: '#5b5d80' }}>
                {formatTime(m.ts)}
              </div>
            </div>
          ),
        )}

        {isThinking && (
          <div className="flex flex-col items-start">
            <div
              className="mb-0.5 text-[10px] font-semibold uppercase"
              style={{ color: visual.bright, letterSpacing: '0.15em' }}
            >
              {agentName}
            </div>
            <div
              className="flex items-center gap-1.5 rounded-2xl rounded-bl-md px-3.5 py-2.5"
              style={{
                background: 'rgba(22,24,48,0.85)',
                borderLeft: `2px solid ${visual.bright}`,
              }}
            >
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="thinking-dot inline-block rounded-full"
                  style={{
                    width: 6,
                    height: 6,
                    background: visual.bright,
                    animationDelay: `${i * 0.15}s`,
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
