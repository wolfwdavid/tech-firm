import type { Agent } from '../../store/types'
import type { NodeRole } from '../../store/types'
import { roleVisuals } from '../nodes/CrystalNode'
import { formatRelativeTime } from '../../lib/utils'

interface Props {
  actions: Agent['recentActions']
  role: NodeRole
}

export function RecentActions({ actions, role }: Props) {
  const visual = roleVisuals[role]

  return (
    <div className="px-5 py-3">
      <div
        className="mb-2 text-[10px] font-semibold uppercase"
        style={{ letterSpacing: '0.20em', color: '#a8aacc' }}
      >
        Recent
      </div>
      {actions.length === 0 ? (
        <div className="text-[12px]" style={{ color: '#5b5d80' }}>
          No recent activity
        </div>
      ) : (
        <ul
          className="scrollbar-mystic flex flex-col gap-1.5 overflow-y-auto pr-1"
          style={{ maxHeight: 160 }}
        >
          {actions.slice(0, 5).map((a, i) => (
            <li
              key={`${a.ts}-${i}`}
              className="flex items-start gap-2.5 text-[12.5px] leading-snug"
            >
              <span
                className="mt-1.5 inline-block flex-shrink-0 rounded-full"
                style={{
                  width: 6,
                  height: 6,
                  background: visual.bright,
                  boxShadow: `0 0 6px ${visual.glow}`,
                }}
                aria-hidden
              />
              <span className="flex-1" style={{ color: '#e8e9ff' }}>
                {a.text}
              </span>
              <span
                className="flex-shrink-0 text-[10.5px] tabular-nums"
                style={{ color: '#5b5d80' }}
              >
                {formatRelativeTime(a.ts)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
