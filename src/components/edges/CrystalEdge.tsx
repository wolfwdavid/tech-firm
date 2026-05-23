import { memo } from 'react'
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  type EdgeProps,
} from 'reactflow'
import { roleVisuals } from '../nodes/CrystalNode'
import type { NodeRole } from '../../store/types'

export interface CrystalEdgeData {
  sourceRole: NodeRole
  targetRole: NodeRole
  pulse?: boolean
  /** Set only on the actively-pulsing edge — surfaced as a floating tag at the midpoint. */
  label?: string
}

function CrystalEdgeImpl({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
}: EdgeProps<CrystalEdgeData>) {
  const [path, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    curvature: 0.35,
  })

  const sourceColor = data
    ? roleVisuals[data.sourceRole].bright
    : '#a0a0c0'
  const targetColor = data
    ? roleVisuals[data.targetRole].bright
    : '#a0a0c0'
  const pulse = data?.pulse

  const gradId = `grad-${id}`

  return (
    <>
      <defs>
        <linearGradient
          id={gradId}
          gradientUnits="userSpaceOnUse"
          x1={sourceX}
          y1={sourceY}
          x2={targetX}
          y2={targetY}
        >
          <stop offset="0%" stopColor={sourceColor} stopOpacity={pulse ? 0.95 : 0.45} />
          <stop offset="50%" stopColor="#cfd6f0" stopOpacity={pulse ? 0.95 : 0.55} />
          <stop offset="100%" stopColor={targetColor} stopOpacity={pulse ? 0.95 : 0.45} />
        </linearGradient>
        {pulse && (
          <linearGradient
            id={`${gradId}-pulse`}
            gradientUnits="userSpaceOnUse"
            x1={sourceX}
            y1={sourceY}
            x2={targetX}
            y2={targetY}
          >
            <stop offset="0%" stopColor={sourceColor} stopOpacity={0} />
            <stop offset="35%" stopColor={sourceColor} stopOpacity={0} />
            <stop offset="50%" stopColor="#ffffff" stopOpacity={1} />
            <stop offset="65%" stopColor={targetColor} stopOpacity={0} />
            <stop offset="100%" stopColor={targetColor} stopOpacity={0} />
            <animateTransform
              attributeName="gradientTransform"
              type="translate"
              from={`${-(targetX - sourceX)} ${-(targetY - sourceY)}`}
              to={`${targetX - sourceX} ${targetY - sourceY}`}
              dur="1.2s"
              repeatCount="indefinite"
            />
          </linearGradient>
        )}
      </defs>
      <BaseEdge
        id={id}
        path={path}
        style={{
          stroke: `url(#${gradId})`,
          strokeWidth: pulse ? 2.4 : 1.5,
          fill: 'none',
          opacity: pulse ? 0.9 : 0.45,
        }}
      />
      {pulse && (
        <path
          d={path}
          fill="none"
          stroke={`url(#${gradId}-pulse)`}
          strokeWidth={3}
          style={{ mixBlendMode: 'screen' }}
        />
      )}
      {pulse && data?.label && (
        <EdgeLabelRenderer>
          <div
            className="edge-pulse-label"
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              pointerEvents: 'none',
              padding: '5px 10px',
              borderRadius: 999,
              background: 'rgba(10,11,26,0.92)',
              border: `1px solid ${targetColor}88`,
              boxShadow: `0 0 16px ${targetColor}55`,
              color: '#e8e9ff',
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '0.04em',
              whiteSpace: 'nowrap',
              maxWidth: 260,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              backdropFilter: 'blur(6px)',
            }}
          >
            {data.label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  )
}

export const CrystalEdge = memo(CrystalEdgeImpl)
