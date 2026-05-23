import { useState, useRef, useEffect, type KeyboardEvent } from 'react'
import { SendHorizonal } from 'lucide-react'
import type { NodeRole } from '../../store/types'
import { roleVisuals } from '../nodes/CrystalNode'

interface Props {
  onSend: (text: string) => void
  role: NodeRole
  disabled: boolean
  placeholder: string
}

export function ChatInput({ onSend, role, disabled, placeholder }: Props) {
  const [text, setText] = useState('')
  const taRef = useRef<HTMLTextAreaElement>(null)
  const visual = roleVisuals[role]
  const trimmed = text.trim()
  const canSend = !disabled && trimmed.length > 0

  // auto-grow up to ~3 lines
  useEffect(() => {
    const el = taRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 96) + 'px'
  }, [text])

  const submit = () => {
    if (!canSend) return
    onSend(trimmed)
    setText('')
    requestAnimationFrame(() => taRef.current?.focus())
  }

  const handleKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  return (
    <div
      className="sticky bottom-0 flex items-end gap-2 px-4 py-3"
      style={{
        background: 'rgba(31,34,71,0.95)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <textarea
        ref={taRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKey}
        placeholder={placeholder}
        rows={1}
        className="scrollbar-mystic flex-1 resize-none rounded-xl px-3.5 py-2.5 text-[13px] outline-none placeholder:italic"
        style={{
          background: 'rgba(10,11,26,0.75)',
          color: '#e8e9ff',
          border: '1px solid rgba(160,180,255,0.18)',
          maxHeight: 96,
        }}
      />
      <button
        onClick={submit}
        disabled={!canSend}
        aria-label="Send message"
        className="flex h-10 w-10 items-center justify-center rounded-xl transition-all"
        style={{
          background: canSend
            ? `radial-gradient(circle at 40% 40%, ${visual.bright}, ${visual.base})`
            : 'rgba(91,93,128,0.25)',
          boxShadow: canSend ? `0 0 16px ${visual.glow}` : 'none',
          cursor: canSend ? 'pointer' : 'not-allowed',
        }}
      >
        <SendHorizonal
          size={16}
          color={canSend ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.35)'}
          strokeWidth={1.8}
        />
      </button>
    </div>
  )
}
