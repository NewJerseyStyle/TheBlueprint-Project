"use client"

import { Play, Target, Columns } from "lucide-react"
import { cn } from "@/lib/utils"
import { useCanvasStore } from "@/lib/canvas-store"
import type { NodeState } from "@/lib/types"
import { useReactFlow } from "@xyflow/react"
import { useCallback } from "react"

/**
 * Toolbar only provides Begin, Goal, and Swim Lane.
 * All other node types (draft, question, decision, doing) are created
 * from existing nodes via the + extend button or right-click menu.
 */
const TOOLBAR_NODES: {
  state: NodeState
  icon: React.ElementType
  label: string
  tip: string
}[] = [
  {
    state: "begin",
    icon: Play,
    label: "Begin",
    tip: "Add a starting point",
  },
  {
    state: "goal",
    icon: Target,
    label: "Goal",
    tip: "Add a target outcome",
  },
]

let nodeIdCounter = 100

export default function CanvasToolbar() {
  const { addNode, currentRole } = useCanvasStore()
  const { screenToFlowPosition } = useReactFlow()

  const handleAddNode = useCallback(
    (state: NodeState) => {
      if (currentRole === "view") return

      const id = `node-new-${nodeIdCounter++}`
      const position = screenToFlowPosition({
        x: window.innerWidth / 2 - 100,
        y: window.innerHeight / 2 - 50,
      })

      addNode({
        id,
        type: "strategic",
        position,
        data: {
          title: state === "begin" ? "New starting point" : "New goal",
          description: "",
          state,
          comments: [],
        },
      })
    },
    [addNode, currentRole, screenToFlowPosition]
  )

  const handleAddSwimLane = useCallback(() => {
    if (currentRole === "view") return

    const id = `lane-new-${nodeIdCounter++}`
    const position = screenToFlowPosition({
      x: window.innerWidth / 2 - 200,
      y: window.innerHeight / 2 - 150,
    })

    addNode({
      id,
      type: "swimlane",
      position,
      data: {
        label: "New Lane",
        orientation: "vertical",
        color: "rgba(148, 163, 184, 0.08)",
        showComments: false,
      },
      style: { width: 400, height: 400 },
    })
  }, [addNode, currentRole, screenToFlowPosition])

  if (currentRole === "view") return null

  return (
    <div className="absolute left-1/2 top-4 z-10 flex -translate-x-1/2 items-center gap-1 rounded-xl border border-border bg-card/95 px-2 py-1.5 shadow-lg backdrop-blur-sm">
      {TOOLBAR_NODES.map(({ state, icon: Icon, label, tip }) => (
        <button
          key={state}
          onClick={() => handleAddNode(state)}
          className={cn(
            "flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          )}
          title={tip}
        >
          <Icon className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}

      <div className="mx-1 h-5 w-px bg-border" />

      <button
        onClick={handleAddSwimLane}
        className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        title="Add Swim Lane to organize nodes"
      >
        <Columns className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Lane</span>
      </button>

      <div className="mx-1 h-5 w-px bg-border" />

      <div className="px-2 py-1 text-[10px] text-muted-foreground/60">
        Hover a node and click <kbd className="mx-0.5 rounded border border-border bg-secondary px-1 py-0.5 font-mono text-[9px]">+</kbd> or right-click to add more
      </div>
    </div>
  )
}
