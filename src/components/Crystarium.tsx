import { useCallback, useMemo } from 'react'
import ReactFlow, {
  Background,
  Controls,
  type Edge,
  type Node,
  type NodeMouseHandler,
  type EdgeTypes,
  type NodeTypes,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { StarField } from './layout/StarField'
import { CrystalNode, type CrystalNodeData } from './nodes/CrystalNode'
import { CrystalEdge, type CrystalEdgeData } from './edges/CrystalEdge'
import {
  useCrystariumStore,
  useEdges,
  useNodes,
  usePulsingEdgeId,
  usePulsingEdgeLabel,
  useSelectedNodeId,
} from '../store'

const nodeTypes: NodeTypes = { crystal: CrystalNode as never }
const edgeTypes: EdgeTypes = { crystal: CrystalEdge as never }

export function Crystarium() {
  const storeNodes = useNodes()
  const storeEdges = useEdges()
  const selectedNodeId = useSelectedNodeId()
  const pulsingEdgeId = usePulsingEdgeId()
  const pulsingEdgeLabel = usePulsingEdgeLabel()
  const setSelectedNodeId = useCrystariumStore((s) => s.setSelectedNodeId)

  const rfNodes = useMemo<Node<CrystalNodeData>[]>(
    () =>
      storeNodes.map((n) => ({
        id: n.id,
        type: 'crystal',
        position: n.position,
        data: {
          role: n.role,
          name: n.name,
          status: n.status,
          specialization: n.specialization,
          isClone: !!n.parentId,
        },
        selected: selectedNodeId === n.id,
        draggable: false,
        connectable: false,
        selectable: true,
      })),
    [storeNodes, selectedNodeId],
  )

  const rfEdges = useMemo<Edge<CrystalEdgeData>[]>(() => {
    const roleById = new Map(storeNodes.map((n) => [n.id, n.role]))
    return storeEdges.map((e) => {
      const sourceRole = roleById.get(e.source) ?? 'manager'
      const targetRole = roleById.get(e.target) ?? 'manager'
      const isPulsing = e.id === pulsingEdgeId
      return {
        id: e.id,
        source: e.source,
        target: e.target,
        type: 'crystal',
        data: {
          sourceRole,
          targetRole,
          pulse: isPulsing,
          label: isPulsing ? pulsingEdgeLabel ?? undefined : undefined,
        },
      }
    })
  }, [storeEdges, storeNodes, pulsingEdgeId, pulsingEdgeLabel])

  const handleNodeClick: NodeMouseHandler = useCallback(
    (_evt, node) => {
      setSelectedNodeId(node.id)
    },
    [setSelectedNodeId],
  )

  const handlePaneClick = useCallback(() => {
    setSelectedNodeId(null)
  }, [setSelectedNodeId])

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-deep pt-16">
      {/* nebula radial behind everything */}
      <div className="pointer-events-none absolute inset-0 bg-radial-nebula" />
      {/* particle field */}
      <StarField />

      <div className="relative h-full w-full">
        <ReactFlow
          nodes={rfNodes}
          edges={rfEdges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          onNodeClick={handleNodeClick}
          onPaneClick={handlePaneClick}
          defaultViewport={{ x: 0, y: 0, zoom: 0.9 }}
          fitView
          fitViewOptions={{ padding: 0.25, includeHiddenNodes: false }}
          proOptions={{ hideAttribution: true }}
          panOnDrag
          zoomOnScroll
          zoomOnPinch
          minZoom={0.4}
          maxZoom={1.6}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable
          panOnScroll={false}
          selectionOnDrag={false}
        >
          <Background
            gap={64}
            size={0}
            color="transparent"
            style={{ background: 'transparent' }}
          />
          <Controls
            position="bottom-right"
            showInteractive={false}
            style={{
              background: 'rgba(22,24,48,0.8)',
              border: '1px solid rgba(160,180,255,0.18)',
              borderRadius: 8,
              padding: 4,
            }}
          />
        </ReactFlow>
      </div>
    </div>
  )
}
