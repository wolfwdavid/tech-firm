import { memo } from 'react'
import { Handle, Position, type NodeProps } from 'reactflow'
import { motion } from 'framer-motion'
import {
  BarChart3,
  Brain,
  CreditCard,
  Mail,
  MessageCircle,
  PenTool,
  Store,
  Zap,
  type LucideIcon,
} from 'lucide-react'
import type { NodeRole, NodeStatus } from '../../store/types'
import { cn } from '../../lib/utils'

export interface CrystalNodeData {
  role: NodeRole
  name: string
  status: NodeStatus
  specialization?: string
  isClone?: boolean
}

interface RoleVisual {
  base: string
  bright: string
  glow: string
  icon: LucideIcon
}

export const roleVisuals: Record<NodeRole, RoleVisual> = {
  manager: {
    base: '#9c7a2e',
    bright: '#f5c45e',
    glow: 'rgba(245,196,94,0.55)',
    icon: Brain,
  },
  storefront: {
    base: '#9c5f2e',
    bright: '#f59a4f',
    glow: 'rgba(245,154,79,0.50)',
    icon: Store,
  },
  customer: {
    base: '#2e7d8c',
    bright: '#4fd0e8',
    glow: 'rgba(79,208,232,0.50)',
    icon: MessageCircle,
  },
  email: {
    base: '#3a649c',
    bright: '#5fa3f0',
    glow: 'rgba(95,163,240,0.50)',
    icon: Mail,
  },
  content: {
    base: '#9c3a64',
    bright: '#f06aa3',
    glow: 'rgba(240,106,163,0.50)',
    icon: PenTool,
  },
  payments: {
    base: '#3a8c64',
    bright: '#5fdba0',
    glow: 'rgba(95,219,160,0.50)',
    icon: CreditCard,
  },
  analytics: {
    base: '#7a8099',
    bright: '#cfd6f0',
    glow: 'rgba(207,214,240,0.45)',
    icon: BarChart3,
  },
  automations: {
    base: '#643a9c',
    bright: '#a878f0',
    glow: 'rgba(168,120,240,0.55)',
    icon: Zap,
  },
}

const statusLabel: Record<NodeStatus, string> = {
  idle: 'idle',
  thinking: 'thinking…',
  active: 'active',
}

// Stable per-id offset so each node breathes off-phase
function hashOffset(id: string): number {
  let h = 0
  for (let i = 0; i < id.length; i++) {
    h = (h * 31 + id.charCodeAt(i)) >>> 0
  }
  return (h % 1000) / 1000 // 0..1
}

interface FullProps extends NodeProps<CrystalNodeData> {
  selected: boolean
}

function CrystalNodeImpl({ id, data, selected }: FullProps) {
  const visual = roleVisuals[data.role]
  const Icon = visual.icon
  const offset = hashOffset(id)
  const isClone = data.isClone || !!data.specialization
  const size = isClone ? 92 : 120
  const iconSize = isClone ? 22 : 28

  return (
    <div className="relative flex flex-col items-center" style={{ width: size + 24 }}>
      <Handle type="target" position={Position.Top} />

      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{
          opacity: 1,
          scale: [1, 1.035, 1],
          filter: [
            `drop-shadow(0 0 0px ${visual.glow})`,
            `drop-shadow(0 0 12px ${visual.glow})`,
            `drop-shadow(0 0 0px ${visual.glow})`,
          ],
        }}
        transition={{
          opacity: { duration: 0.4 },
          scale: { duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: offset * 2 },
          filter: { duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: offset * 2 },
        }}
        whileHover={{ scale: 1.08 }}
        className={cn(
          'relative flex items-center justify-center cursor-pointer',
          'transition-shadow duration-200',
        )}
        style={{
          width: size,
          height: size,
        }}
      >
        {/* outer glow halo (two layers) */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            filter: `blur(20px)`,
            background: `radial-gradient(circle, ${visual.glow} 0%, transparent 70%)`,
            opacity: selected ? 0.95 : 0.7,
            transform: 'scale(1.6)',
          }}
        />
        {/* crystal shape */}
        <div
          className="relative flex items-center justify-center"
          style={{
            width: size,
            height: size,
            clipPath:
              'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
            background: `radial-gradient(circle at 50% 38%, ${visual.bright}, ${visual.base})`,
            boxShadow: `inset 0 0 24px rgba(255,255,255,0.18), inset 0 0 60px ${visual.glow}`,
          }}
        >
          {/* inner ring border */}
          <div
            className="pointer-events-none absolute inset-[3px]"
            style={{
              clipPath:
                'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
              border: '1px solid rgba(255,255,255,0.18)',
              boxSizing: 'border-box',
            }}
          />
          <Icon
            size={iconSize}
            strokeWidth={1.6}
            color="rgba(255,255,255,0.94)"
            style={{
              filter: 'drop-shadow(0 0 4px rgba(0,0,0,0.5))',
            }}
          />
        </div>

        {/* selected ring */}
        {selected && (
          <div
            className="pointer-events-none absolute"
            style={{
              top: -6,
              left: -6,
              right: -6,
              bottom: -6,
              clipPath:
                'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
              border: `2px solid ${visual.bright}`,
              opacity: 0.85,
            }}
          />
        )}
      </motion.div>

      <div className="mt-2 text-center">
        <div
          className="font-semibold uppercase tracking-[0.08em]"
          style={{ fontSize: isClone ? 11 : 13, color: '#e8e9ff' }}
        >
          {data.name}
        </div>
        <div
          className="mt-0.5 lowercase"
          style={{
            fontSize: 11,
            color: data.status === 'thinking' ? visual.bright : '#a8aacc',
          }}
        >
          {statusLabel[data.status]}
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} />
    </div>
  )
}

export const CrystalNode = memo(CrystalNodeImpl)
