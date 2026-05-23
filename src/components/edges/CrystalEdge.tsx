import { memo } from 'react'
import {
  BaseEdge,
  getBezierPath,
  type EdgeProps,
} from 'reactflow'
import { roleVisuals } from '../nodes/CrystalNode'
import type { NodeRole } from '../../store/types'

export interface CrystalEdgeData {
  sourceRole: NodeRole
  targetRole: NodeRole
  pulse?: boolean
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
  const [path] = getBezierPath({
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
    </>
  )
}

export const CrystalEdge = memo(CrystalEdgeImpl)
