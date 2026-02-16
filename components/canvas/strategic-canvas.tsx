"use client"

import { useCallback, useEffect, useState, useRef } from "react"
import {
  ReactFlow,
  Background,
  MiniMap,
  Controls,
  BackgroundVariant,
  ConnectionLineType,
  type NodeTypes,
  type Node,
  useReactFlow,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"

import { useCanvasStore } from "@/lib/canvas-store"
import type { NodeState, StrategicNodeData } from "@/lib/types"
import StrategicNodeComponent from "./nodes/strategic-node"
import SwimLaneNodeComponent from "./nodes/swim-lane-node"
import CanvasToolbar from "./canvas-toolbar"
import NodeContextMenu from "./node-context-menu"

const nodeTypes: NodeTypes = {
  strategic: StrategicNodeComponent,
  swimlane: SwimLaneNodeComponent,
}

let childIdCounter = 200

/**
 * Finds the next sequential swim lane to the right
 */
function getNextLane(currentLaneId: string, allNodes: Node[]): Node | undefined {
  const allLanes = allNodes
    .filter((n) => n.type === "swimlane")
    .sort((a, b) => (a.position?.x || 0) - (b.position?.x || 0))

  const currentIndex = allLanes.findIndex((n) => n.id === currentLaneId)
  if (currentIndex === -1 || currentIndex === allLanes.length - 1) return undefined
  return allLanes[currentIndex + 1]
}

/**
 * Suggestions for MCTS Lookahead
 */
const GET_SUGGESTIONS = (node: Node, allNodes: Node[]) => {
  const data = node.data as StrategicNodeData
  const { state, title } = data
  const suggestions: { state: NodeState; title: string; laneShift?: "next" | "none"; isAI?: boolean }[] = []

  if (state === "begin") {
    suggestions.push({ state: "question", title: "Which strategy should we follow?", isAI: true })
    suggestions.push({ state: "draft", title: "Draft Project Manifesto", isAI: true })
  } else if (state === "question") {
    suggestions.push({ state: "draft", title: "Option A: Pilot Phase", isAI: true })
    suggestions.push({ state: "draft", title: "Option B: Community Survey", isAI: true })
  } else if (state === "doing") {
    suggestions.push({ state: "decision", title: "Review Milestone Progress", isAI: true })
    
    // If in a lane, suggest advancing to next phase/lane
    if (node.parentId) {
      const nextLane = getNextLane(node.parentId, allNodes)
      if (nextLane) {
        suggestions.push({ 
          state: "draft", 
          title: `Advance to ${nextLane.data.label}`,
          laneShift: "next",
          isAI: true
        })
      }
    }
  }

  // Always offer a blank draft
  suggestions.push({ state: "draft", title: "New proposal", isAI: false })

  return suggestions
}

/**
 * Determine the position for a new child node.
 *
 * Inside a swim lane: stack BELOW the parent (same column, +180y)
 * to keep the vertical flow clean and prevent horizontal overflow.
 *
 * Outside a swim lane: place to the RIGHT (+280x) for the natural
 * left-to-right reading direction.
 *
 * In both cases we nudge further if siblings already occupy the
 * target slot so nodes never stack on top of each other.
 */
function getChildPosition(
  parent: Node,
  allNodes: Node[],
  targetParentId?: string
): { position: { x: number; y: number }; parentId?: string } {
  const px = parent.position?.x || 0
  const py = parent.position?.y || 0
  
  // Cross-lane placement logic
  if (targetParentId && targetParentId !== parent.parentId) {
    const nodesInTarget = allNodes.filter((n) => n.parentId === targetParentId)
    const maxY = nodesInTarget.reduce((m, n) => Math.max(m, n.position?.y || 0), 44) // 44 is header
    
    return {
      position: { x: 44, y: maxY + (nodesInTarget.length === 0 ? 24 : 180) },
      parentId: targetParentId,
    }
  }

  const isInLane = !!parent.parentId
  const effectiveParentId = targetParentId || parent.parentId

  // Count siblings already placed near the target to avoid overlap
  const siblingsAtTarget = allNodes.filter(
    (n) =>
      n.type === "strategic" &&
      n.id !== parent.id &&
      n.parentId === effectiveParentId
  )

  if (isInLane) {
    // Inside lane: go below
    // Find the lowest node in this lane to place underneath
    const laneNodes = siblingsAtTarget.filter(
      (n) => n.parentId === effectiveParentId
    )
    const maxY = laneNodes.reduce(
      (m, n) => Math.max(m, n.position?.y || 0),
      py
    )
    // Increased gap to 200 for better vertical separation
    return {
      position: { x: px, y: maxY + 200 },
      parentId: effectiveParentId,
    }
  }

  // Outside lane: go right, stagger vertically significantly to avoid edge overlap
  const siblingOffset = siblingsAtTarget.length * 60
  return {
    position: { x: px + 320, y: py + siblingOffset },
  }
}

export default function StrategicCanvas() {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    changeNodeState,
    setSelectedNodeId,
    currentRole,
    setEdges,
    setNodes,
  } = useCanvasStore()
  const { screenToFlowPosition, getNode, getNodes } = useReactFlow()

  // Context menu state
  const [contextMenu, setContextMenu] = useState<{
    x: number
    y: number
    nodeId: string
    nodeState: NodeState
    forceSuggestionShow?: boolean
  } | null>(null)

  // Ref for tracking connectEnd
  const connectingNodeId = useRef<string | null>(null)

  const isEditable = currentRole === "edit"

  /**
   * Remove all ghost nodes from the canvas
   */
  const clearGhosts = useCallback(() => {
    setNodes((prev) => prev.filter((n) => !(n.data as unknown as StrategicNodeData).isGhost))
    setEdges((prev) => prev.filter((e) => !e.id.startsWith("ghost-")))
  }, [setNodes, setEdges])

    /**

     * Realize a ghost node into a real node

     */

    const realizeNode = useCallback((nodeId: string) => {

      let parentId: string | undefined;

  

      setNodes((nds) => {

        const realizingNode = nds.find(n => n.id === nodeId)

        if (!realizingNode) return nds

        const data = realizingNode.data as StrategicNodeData

        parentId = data.ghostParentId

  

        return nds

          .filter(n => {

            if (n.id === nodeId) return true

            const d = n.data as StrategicNodeData

            return !(d.isGhost && d.ghostParentId === parentId)

          })

          .map(n => {

            if (n.id === nodeId) {

              return {

                ...n,

                data: {

                  ...n.data as StrategicNodeData,

                  isGhost: false

                }

              }

            }

            return n

          })

      })

  

      setEdges((eds) => {

        let updatedEdges = eds.map(e => {

          if (e.target === nodeId && e.id.startsWith("ghost-")) {

            return {

              ...e,

              id: e.id.replace("ghost-", "e-"),

              style: { ...e.style, opacity: 1 }

            }

          }

          return e

        }).filter(e => {

          if (e.target === nodeId) return true

          return !e.id.startsWith("ghost-")

        });

  

        // Handle Path TBD Transfer

        if (parentId) {

          const tbdEdges = updatedEdges.filter(e => e.source === parentId && (e.data as any)?.isPathTBD);

          tbdEdges.forEach(tbdEdge => {

            // Add new edge from realized node to the same target

            updatedEdges.push({

              ...tbdEdge,

              id: `e-tbd-transfer-${nodeId}-${tbdEdge.target}-${Date.now()}`,

              source: nodeId,

              // Keep the data so it remains a Path TBD

            });

            // Remove the old TBD edge from the parent

            updatedEdges = updatedEdges.filter(e => e.id !== tbdEdge.id);

          });

        }

  

        return updatedEdges;

      })

  

      setSelectedNodeId(nodeId)

    }, [setNodes, setEdges, setSelectedNodeId])

  

  /**
   * Handle node drag stop to allow moving between swim lanes
   */
  const onNodeDragStop = useCallback(
    (_: any, node: Node) => {
      if (node.type !== "strategic") return

      const currentNodes = getNodes()
      // Find all swimlanes
      const lanes = currentNodes.filter((n) => n.type === "swimlane")
      
      // Calculate absolute position of the node
      let absX = node.position.x
      let absY = node.position.y
      if (node.parentId) {
        const parent = currentNodes.find(p => p.id === node.parentId)
        if (parent) {
          absX += parent.position.x
          absY += parent.position.y
        }
      }

      // Find if any lane contains this absolute position
      const laneUnderNode = lanes.find((lane) => {
        const lx = lane.position.x
        const ly = lane.position.y
        const lw = (lane.style?.width as number) || 400
        const lh = (lane.style?.height as number) || 800
        
        return absX >= lx && absX <= lx + lw && absY >= ly && absY <= ly + lh
      })

      if (laneUnderNode) {
        if (node.parentId !== laneUnderNode.id) {
          // Move to new lane
          const newRelX = absX - laneUnderNode.position.x
          const newRelY = absY - laneUnderNode.position.y
          
          setNodes((nds) => nds.map((n) => {
            if (n.id === node.id) {
              return {
                ...n,
                parentId: laneUnderNode.id,
                position: { x: newRelX, y: newRelY }
              }
            }
            return n
          }))
        }
      } else if (node.parentId) {
        // Move out of current lane to main canvas
        setNodes((nds) => nds.map((n) => {
          if (n.id === node.id) {
            return {
              ...n,
              parentId: undefined,
              position: { x: absX, y: absY }
            }
          }
          return n
        }))
      }
    },
    [nodes, setNodes]
  )

  /**
   * Core function: create a child node connected to a parent.
   * Handles swim lane scoping automatically.
   */
  const addChildNode = useCallback(
    (
      parentNodeId: string, 
      state: NodeState, 
      titleOverride?: string, 
      positionOverride?: { x: number; y: number }, 
      isGhost = false, 
      laneShift: "next" | "none" = "none", 
      isAI = false,
      ghostIndex = 0
    ) => {
      const parentNode = nodes.find((n) => n.id === parentNodeId)
      if (!parentNode) return

      const id = isGhost ? `ghost-${parentNodeId}-${state}-${childIdCounter++}` : `node-child-${childIdCounter++}`
      
      // Determine target lane
      let targetParentId = parentNode.parentId
      if (laneShift === "next" && parentNode.parentId) {
        const nextLane = getNextLane(parentNode.parentId, nodes)
        if (nextLane) targetParentId = nextLane.id
      }

      // Calculate position
      let { position, parentId } = positionOverride
        ? { position: positionOverride, parentId: targetParentId || undefined }
        : getChildPosition(parentNode, nodes, targetParentId)

      if (isGhost && !positionOverride) {
        // Stagger ghosts vertically and slightly horizontally to avoid edge and node overlap
        // We use ghostIndex to ensure they don't stack even when nodes state hasn't updated yet
        position = { 
          x: position.x + (ghostIndex * 40), 
          y: position.y + (ghostIndex * 150) 
        }
      }

      const nodeData: StrategicNodeData = {
        title: titleOverride || (
          state === "question"
            ? "What should we do next?"
            : state === "draft"
              ? "New proposal"
              : state === "decision"
                ? "New decision"
                : state === "doing"
                  ? "New action"
                  : `New ${state} node`
        ),
        description: "",
        state,
        comments: [],
        isGhost,
        isSystemGenerated: isAI, // Store AI status
        ghostParentId: isGhost ? parentNodeId : undefined,
        questionHint:
          state === "question"
            ? "Anyone can propose a drafted next step. Click + or draw an arrow to create one."
            : undefined,
        searchQuery: state === "draft" ? "" : undefined,
      }

      const newNode: Node = {
        id,
        type: "strategic",
        position,
        data: nodeData as Record<string, unknown>,
        ...(parentId ? { parentId } : {}),
      }

      addNode(newNode as never)

      // Auto-connect edge from parent to child
      const parentData = parentNode.data as unknown as StrategicNodeData | undefined
      const parentState = parentData?.state
      const isParentDoing = parentState === "doing"

      // Use addEdge via setEdges
      setEdges((eds) => [
        ...eds,
        {
          id: isGhost ? `ghost-e-${parentNodeId}-${id}` : `e-${parentNodeId}-${id}`,
          source: parentNodeId,
          target: id,
          type: "smoothstep",
          animated: isParentDoing && !isGhost,
          style: {
            stroke: isParentDoing ? "#14b8a6" : "#94a3b8",
            strokeWidth: isParentDoing ? 2 : 1.5,
            opacity: isGhost ? 0.4 : 1,
            // Drafts get dashed edges
            strokeDasharray: state === "draft" || isGhost ? "6 4" : undefined,
          },
        },
      ])

      // Select the new node so user can immediately edit it (only if not ghost)
      if (!isGhost) {
        setSelectedNodeId(id)
      }
    },
    [nodes, addNode, setEdges, setSelectedNodeId]
  )

  // Duplicate a node (creates a sibling next to the original)
  const duplicateNode = useCallback(
    (nodeId: string) => {
      const original = nodes.find((n) => n.id === nodeId)
      if (!original) return

      const id = `node-dup-${childIdCounter++}`
      const origData = original.data as unknown as StrategicNodeData

      const newNode: Node = {
        id,
        type: "strategic",
        position: {
          x: (original.position?.x || 0) + 30,
          y: (original.position?.y || 0) + 80,
        },
        data: {
          ...origData,
          title: `${origData.title} (copy)`,
          comments: [],
        } as Record<string, unknown>,
        ...(original.parentId
          ? { parentId: original.parentId }
          : {}),
      }

      addNode(newNode as never)
    },
    [nodes, addNode]
  )

  // Archive a node (change state to history -- edge cleanup happens in changeNodeState)
  const archiveNode = useCallback(
    (nodeId: string) => {
      changeNodeState(nodeId, "history")
    },
    [changeNodeState]
  )

  // Listen for "extend-node" event from the + button on nodes
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail
      if (detail?.nodeId) {
        const node = nodes.find(n => n.id === detail.nodeId)
        if (!node) return
        
        const suggestions = GET_SUGGESTIONS(node, nodes)
        
        // Add ghost nodes for each suggestion
        suggestions.forEach((s, i) => {
          addChildNode(detail.nodeId, s.state, s.title, undefined, true, s.laneShift, s.isAI, i)
        })
      }
    }
    window.addEventListener("extend-node", handler)
    return () => window.removeEventListener("extend-node", handler)
  }, [nodes, addChildNode])

  // Listen for "realize-ghost" event
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail
      if (detail?.nodeId) {
        realizeNode(detail.nodeId)
      }
    }
    window.addEventListener("realize-ghost", handler)
    return () => window.removeEventListener("realize-ghost", handler)
  }, [realizeNode])

  // Node click
  const handleNodeClick = useCallback(
    (_: React.MouseEvent, node: { id: string; type?: string }) => {
      if (node.type === "swimlane") return
      const n = nodes.find(item => item.id === node.id)
      if ((n?.data as unknown as StrategicNodeData)?.isGhost) return // Handled by realize-ghost event

      setContextMenu(null)
      setSelectedNodeId(node.id)
      clearGhosts()
    },
    [setSelectedNodeId, clearGhosts, nodes]
  )

  // Pane click closes everything
  const handlePaneClick = useCallback(() => {
    setSelectedNodeId(null)
    setContextMenu(null)
    clearGhosts()
  }, [setSelectedNodeId, clearGhosts])

  // Right-click context menu on a node
  const handleNodeContextMenu = useCallback(
    (e: React.MouseEvent, node: Node) => {
      if (node.type === "swimlane") return
      e.preventDefault()
      const data = node.data as unknown as StrategicNodeData
      setContextMenu({
        x: e.clientX,
        y: e.clientY,
        nodeId: node.id,
        nodeState: data.state,
        forceSuggestionShow: data.forceSuggestionShow,
      })
      clearGhosts()
    },
    [clearGhosts]
  )

  // Track which node the user is connecting FROM
  const handleConnectStart = useCallback(
    (_: React.MouseEvent | React.TouchEvent, params: { nodeId: string | null }) => {
      connectingNodeId.current = params.nodeId
    },
    []
  )

  // When a connection ends on empty space, create a new draft node there
  const handleConnectEnd = useCallback(
    (event: MouseEvent | TouchEvent, connectionState: { isValid: boolean }) => {
      // Only create a node if the connection was NOT successfully dropped on a handle
      if (connectionState.isValid) return

      const sourceId = connectingNodeId.current
      if (!sourceId) return

      // Get the canvas coordinates from the mouse/touch position
      const clientX =
        "clientX" in event ? event.clientX : event.changedTouches[0].clientX
      const clientY =
        "clientY" in event ? event.clientY : event.changedTouches[0].clientY

      // Convert screen position to flow position
      const flowPosition = screenToFlowPosition({ x: clientX, y: clientY })

      // Get parent node to determine if it's in a swim lane
      const sourceNode = getNode(sourceId)
      if (!sourceNode) return

      // If parent is in a swim lane, calculate relative position
      let finalPosition = flowPosition
      if (sourceNode.parentId) {
        const laneNode = getNode(sourceNode.parentId)
        if (laneNode) {
          finalPosition = {
            x: flowPosition.x - (laneNode.position?.x || 0),
            y: flowPosition.y - (laneNode.position?.y || 0),
          }
        }
      }

      const suggestions = GET_SUGGESTIONS(sourceNode, nodes)
      
      // Add ghost nodes for each suggestion at the drop location (staggered)
      suggestions.forEach((s, i) => {
        const pos = { x: finalPosition.x, y: finalPosition.y }
        addChildNode(sourceId, s.state, s.title, pos, true, s.laneShift, s.isAI, i)
      })
      
      connectingNodeId.current = null
    },
    [addChildNode, screenToFlowPosition, getNode, nodes]
  )

  return (
    <div className="canvas-dotgrid relative h-full w-full">
      <CanvasToolbar />
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={isEditable ? onNodesChange : undefined}
        onEdgesChange={isEditable ? onEdgesChange : undefined}
        onConnect={isEditable ? onConnect : undefined}
        onConnectStart={isEditable ? handleConnectStart : undefined}
        onConnectEnd={isEditable ? handleConnectEnd : undefined}
        onNodeClick={handleNodeClick}
        onNodeContextMenu={isEditable ? handleNodeContextMenu : undefined}
        onNodeDragStop={isEditable ? onNodeDragStop : undefined}
        onPaneClick={handlePaneClick}
        nodeTypes={nodeTypes}
        onConnect={isEditable ? onConnect : undefined}
        fitView
        fitViewOptions={{ padding: 0.15 }}
        minZoom={0.2}
        maxZoom={2}
        nodesDraggable={isEditable}
        nodesConnectable={isEditable}
        defaultEdgeOptions={{
          type: "smoothstep",
          style: { strokeWidth: 2, stroke: "#94a3b8" },
        }}
        connectionLineStyle={{ stroke: "#94a3b8", strokeWidth: 2 }}
        connectionLineType={ConnectionLineType.SmoothStep}
        proOptions={{ hideAttribution: true }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1}
          color="hsl(220 10% 82%)"
        />
        <MiniMap
          nodeStrokeWidth={3}
          zoomable
          pannable
          className="!bottom-4 !right-4"
          maskColor="rgba(255,255,255,0.7)"
        />
        <Controls className="!bottom-4 !left-4" />
      </ReactFlow>

      {/* Right-click context menu */}
      {contextMenu && (
        <NodeContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          nodeId={contextMenu.nodeId}
          nodeState={contextMenu.nodeState}
          forceSuggestionShow={contextMenu.forceSuggestionShow}
          onClose={() => setContextMenu(null)}
          onAddChild={addChildNode}
          onDuplicate={duplicateNode}
          onArchive={archiveNode}
          onToggleSuggestions={(id, show) => updateNodeData(id, { forceSuggestionShow: show })}
        />
      )}
    </div>
  )
}
