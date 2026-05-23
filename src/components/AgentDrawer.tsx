import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X, Wand2 } from 'lucide-react'
import {
  useAgent,
  useChat,
  useCrystariumStore,
  useNodes,
  useSelectedNodeId,
  useStreamingText,
} from '../store'
import { roleVisuals } from './nodes/CrystalNode'
import { RecentActions } from './drawer/RecentActions'
import { ChatThread } from './drawer/ChatThread'
import { ChatInput } from './drawer/ChatInput'
import { ManagerBriefing } from './drawer/ManagerBriefing'

export function AgentDrawer() {
  const selectedNodeId = useSelectedNodeId()
  const nodes = useNodes()
  const agent = useAgent(selectedNodeId)
  const chat = useChat(selectedNodeId)
  const streamingText = useStreamingText(selectedNodeId)
  const setSelectedNodeId = useCrystariumStore((s) => s.setSelectedNodeId)
  const sendUserMessage = useCrystariumStore((s) => s.sendUserMessage)
  const addClone = useCrystariumStore((s) => s.addClone)

  const node = useMemo(
    () => (selectedNodeId ? nodes.find((n) => n.id === selectedNodeId) : null),
    [nodes, selectedNodeId],
  )

  const [showCloneInput, setShowCloneInput] = useState(false)
  const [cloneText, setCloneText] = useState('')

  // ESC closes
  useEffect(() => {
    if (!selectedNodeId) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedNodeId(null)
        setShowCloneInput(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selectedNodeId, setSelectedNodeId])

  // Reset clone UI when switching nodes
  useEffect(() => {
    setShowCloneInput(false)
    setCloneText('')
  }, [selectedNodeId])

  const handleClone = () => {
    if (!selectedNodeId) return
    const spec = cloneText.trim()
    if (!spec) return
    const newId = addClone({ parentId: selectedNodeId, specialization: spec })
    setShowCloneInput(false)
    setCloneText('')
    if (newId) setSelectedNodeId(newId)
  }

  const open = !!selectedNodeId && !!node && !!agent

  return (
    <AnimatePresence>
      {open && (
        <motion.aside
          key={selectedNodeId}
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-0 right-0 top-16 z-40 flex w-[420px] flex-col"
          style={{
            background: 'rgba(31,34,71,0.92)',
            borderLeft: '1px solid rgba(160,180,255,0.18)',
            backdropFilter: 'blur(16px)',
            boxShadow: '-12px 0 40px rgba(0,0,0,0.45)',
          }}
        >
          <DrawerHeader
            node={node!}
            onClose={() => setSelectedNodeId(null)}
            onCloneClick={() => setShowCloneInput((v) => !v)}
            cloneActive={showCloneInput}
          />

          <div className="px-5 pt-3">
            <p
              className="italic"
              style={{
                color: '#a8aacc',
                fontSize: 12.5,
                lineHeight: 1.55,
              }}
            >
              "{agent!.persona}"
            </p>
          </div>

          {showCloneInput && (
            <CloneInputRow
              role={node!.role}
              text={cloneText}
              setText={setCloneText}
              onSubmit={handleClone}
              onCancel={() => {
                setShowCloneInput(false)
                setCloneText('')
              }}
            />
          )}

          <RecentActions actions={agent!.recentActions} role={node!.role} />

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }} />

          {node!.role === 'manager' && <ManagerBriefing />}

          <ChatThread
            messages={chat}
            role={node!.role}
            agentName={node!.name}
            isThinking={node!.status === 'thinking'}
            streamingText={streamingText}
            emptyHint={
              node!.role === 'manager'
                ? 'Ask your AI CEO what to prioritize this morning.'
                : `Ask ${node!.name} anything about your business.`
            }
          />

          <ChatInput
            onSend={(text) => sendUserMessage(selectedNodeId!, text)}
            role={node!.role}
            disabled={node!.status === 'thinking'}
            placeholder={
              node!.status === 'thinking'
                ? `${node!.name} is thinking…`
                : `Message ${node!.name}…`
            }
          />
        </motion.aside>
      )}
    </AnimatePresence>
  )
}

function DrawerHeader({
  node,
  onClose,
  onCloneClick,
  cloneActive,
}: {
  node: { id: string; role: keyof typeof roleVisuals; name: string; specialization?: string }
  onClose: () => void
  onCloneClick: () => void
  cloneActive: boolean
}) {
  const v = roleVisuals[node.role]
  const Icon = v.icon
  return (
    <div
      className="relative flex items-center gap-3 px-5"
      style={{
        height: 64,
        background: `linear-gradient(135deg, ${v.base}33 0%, ${v.bright}1f 100%)`,
        borderBottom: `1px solid ${v.glow}`,
      }}
    >
      <div
        className="flex h-10 w-10 items-center justify-center"
        style={{
          clipPath:
            'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
          background: `radial-gradient(circle at 50% 40%, ${v.bright}, ${v.base})`,
          boxShadow: `0 0 16px ${v.glow}`,
        }}
      >
        <Icon size={18} color="rgba(255,255,255,0.95)" strokeWidth={1.8} />
      </div>
      <div className="flex-1">
        <div
          className="text-[10px] font-medium uppercase"
          style={{ color: v.bright, letterSpacing: '0.22em' }}
        >
          Crystarium · Agent
        </div>
        <div
          className="text-[16px] font-semibold"
          style={{ color: '#e8e9ff', letterSpacing: '0.02em' }}
        >
          {node.name}
        </div>
      </div>
      <button
        onClick={onCloneClick}
        aria-label="Clone and specialize"
        title="Clone & Specialize"
        className="flex h-8 w-8 items-center justify-center rounded-md transition-colors"
        style={{
          background: cloneActive ? `${v.glow}` : 'rgba(255,255,255,0.04)',
          color: '#e8e9ff',
        }}
      >
        <Wand2 size={14} />
      </button>
      <button
        onClick={onClose}
        aria-label="Close drawer"
        className="flex h-8 w-8 items-center justify-center rounded-md transition-colors hover:bg-white/10"
        style={{ color: '#a8aacc' }}
      >
        <X size={16} />
      </button>
    </div>
  )
}

function CloneInputRow({
  role,
  text,
  setText,
  onSubmit,
  onCancel,
}: {
  role: keyof typeof roleVisuals
  text: string
  setText: (s: string) => void
  onSubmit: () => void
  onCancel: () => void
}) {
  const v = roleVisuals[role]
  return (
    <div
      className="mx-5 mt-3 rounded-xl p-3"
      style={{
        background: 'rgba(10,11,26,0.7)',
        border: `1px solid ${v.glow}`,
      }}
    >
      <div
        className="mb-2 text-[10px] font-semibold uppercase"
        style={{ letterSpacing: '0.20em', color: v.bright }}
      >
        Clone & Specialize
      </div>
      <input
        type="text"
        autoFocus
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') onSubmit()
          else if (e.key === 'Escape') onCancel()
        }}
        placeholder='e.g. "decaf-only buyers"'
        className="mb-2 w-full rounded-md px-3 py-2 text-[13px] outline-none"
        style={{
          background: 'rgba(5,6,13,0.85)',
          color: '#e8e9ff',
          border: '1px solid rgba(160,180,255,0.18)',
        }}
      />
      <div className="flex gap-2">
        <button
          onClick={onSubmit}
          disabled={!text.trim()}
          className="rounded-md px-3 py-1.5 text-[11px] font-semibold uppercase transition-all"
          style={{
            background: text.trim()
              ? `linear-gradient(135deg, ${v.bright}, ${v.base})`
              : 'rgba(91,93,128,0.25)',
            color: '#0a0b1a',
            letterSpacing: '0.10em',
            cursor: text.trim() ? 'pointer' : 'not-allowed',
            boxShadow: text.trim() ? `0 0 12px ${v.glow}` : 'none',
          }}
        >
          Spawn
        </button>
        <button
          onClick={onCancel}
          className="rounded-md px-3 py-1.5 text-[11px] font-semibold uppercase"
          style={{
            background: 'transparent',
            color: '#a8aacc',
            letterSpacing: '0.10em',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
