"use client"

import { useEffect, useRef } from "react"
import {
  FileEdit,
  HelpCircle,
  Zap,
  MessageCircleQuestion,
  Copy,
  Archive,
  Sparkles,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { NodeState, StrategicNodeData } from "@/lib/types"

interface NodeContextMenuProps {
  x: number
  y: number
  nodeId: string
  nodeState: NodeState
  forceSuggestionShow?: boolean
  onClose: () => void
  onAddChild: (parentId: string, state: NodeState) => void
  onDuplicate: (nodeId: string) => void
  onArchive: (nodeId: string) => void
  onToggleSuggestions: (nodeId: string, show: boolean) => void
}

const CHILD_OPTIONS: {
  state: NodeState
  icon: React.ElementType
  label: string
  description: string
}[] = [
  {
    state: "draft",
    icon: FileEdit,
    label: "Add Draft",
    description: "Propose an idea or option",
  },
  {
    state: "question",
    icon: MessageCircleQuestion,
    label: "Add Question",
    description: "Create a branching point",
  },
  {
    state: "decision",
    icon: HelpCircle,
    label: "Add Decision",
    description: "Add a decision / todo",
  },
  {
    state: "doing",
    icon: Zap,
    label: "Add Action",
    description: "Add an active task",
  },
]

export default function NodeContextMenu({
  x,
  y,
  nodeId,
  nodeState,
  onClose,
  onAddChild,
  onDuplicate,
  onArchive,
}: NodeContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as HTMLElement)) {
        onClose()
      }
    }
    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("mousedown", handleClick)
    document.addEventListener("keydown", handleEsc)
    return () => {
      document.removeEventListener("mousedown", handleClick)
      document.removeEventListener("keydown", handleEsc)
    }
  }, [onClose])

  // Don't show "add child" for goal nodes
  const isGoal = nodeState === "goal"
  const isHistory = nodeState === "history"

  return (
    <div
      ref={menuRef}
      className="fixed z-50 min-w-48 rounded-xl border border-border bg-card py-1.5 shadow-xl"
      style={{ left: x, top: y }}
      role="menu"
      aria-label="Node actions"
    >
      {!isGoal && !isHistory && (
        <>
          <div className="px-3 py-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Add connected node
            </span>
          </div>
          {CHILD_OPTIONS.map(({ state, icon: Icon, label, description }) => (
            <button
              key={state}
              onClick={() => {
                onAddChild(nodeId, state)
                onClose()
              }}
              className="flex w-full items-center gap-2.5 px-3 py-1.5 text-left transition-colors hover:bg-secondary"
              role="menuitem"
            >
              <Icon className="h-3.5 w-3.5 text-muted-foreground" />
              <div>
                <span className="text-xs font-medium text-foreground">
                  {label}
                </span>
                <p className="text-[10px] text-muted-foreground">
                  {description}
                </p>
              </div>
            </button>
          ))}
          <div className="mx-2 my-1 h-px bg-border" />
        </>
      )}

      <button
        onClick={() => {
          onDuplicate(nodeId)
          onClose()
        }}
        className="flex w-full items-center gap-2.5 px-3 py-1.5 text-left transition-colors hover:bg-secondary"
        role="menuitem"
      >
        <Copy className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-xs font-medium text-foreground">Duplicate</span>
      </button>

      <button
        onClick={() => {
          onToggleSuggestions(nodeId, !forceSuggestionShow)
          onClose()
        }}
        className="flex w-full items-center gap-2.5 px-3 py-1.5 text-left transition-colors hover:bg-secondary"
        role="menuitem"
      >
        <Sparkles className={cn("h-3.5 w-3.5", forceSuggestionShow ? "text-indigo-500" : "text-muted-foreground")} />
        <span className="text-xs font-medium text-foreground">
          {forceSuggestionShow ? "Hide suggestions" : "Show suggestions"}
        </span>
      </button>

      {!isHistory && (
        <button
          onClick={() => {
            onArchive(nodeId)
            onClose()
          }}
          className={cn(
            "flex w-full items-center gap-2.5 px-3 py-1.5 text-left transition-colors hover:bg-secondary"
          )}
          role="menuitem"
        >
          <Archive className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs font-medium text-foreground">
            Archive (terminate branch)
          </span>
        </button>
      )}
    </div>
  )
}
