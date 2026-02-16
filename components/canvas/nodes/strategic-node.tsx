"use client"

import { memo, useState, useMemo } from "react"
import { Handle, Position, type NodeProps, useReactFlow } from "@xyflow/react"
import {
  Play,
  FileEdit,
  HelpCircle,
  Zap,
  CheckCircle2,
  Target,
  MessageSquare,
  Star,
  Sparkles,
  MessageCircleQuestion,
  Search,
  UserCircle2,
  Plus,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useCanvasStore } from "@/lib/canvas-store"
import {
  NODE_STATE_CONFIG,
  type StrategicNodeData,
  type NodeState,
} from "@/lib/types"
import { MOCK_USERS } from "@/lib/mock-data"

const STATE_ICONS: Record<NodeState, React.ElementType> = {
  begin: Play,
  draft: FileEdit,
  question: MessageCircleQuestion,
  decision: HelpCircle,
  doing: Zap,
  history: CheckCircle2,
  goal: Target,
}

function StrategicNodeComponent({ id: nodeId, data, selected }: NodeProps) {
  const nodeData = data as unknown as StrategicNodeData
  const { nodes, edges } = useCanvasStore()
  
  const config = NODE_STATE_CONFIG[nodeData.state]
  const Icon = STATE_ICONS[nodeData.state]
  const assignee = nodeData.assigneeId
    ? MOCK_USERS.find((u) => u.id === nodeData.assigneeId)
    : null
  const commentCount = nodeData.comments?.length || 0
  const isDraft = nodeData.state === "draft"
  const isQuestion = nodeData.state === "question"
  const isDoing = nodeData.state === "doing"
  const isDecision = nodeData.state === "decision"
  const isSystemGenerated = nodeData.isSystemGenerated
  const isGhost = nodeData.isGhost

  // Logic for showing 'Suggest next step' hint
  const shouldShowSuggestionHint = useMemo(() => {
    if (isGhost) return false
    if (nodeData.state === "goal" || nodeData.state === "history") return false
    
    // Always show if manually toggled on
    if (nodeData.forceSuggestionShow) return true

    // Always show if it has a 'Path TBD' edge coming out of it
    const hasPathTBD = edges.some(e => e.source === nodeId && (e.data as any)?.isPathTBD)
    if (hasPathTBD) return true

    // Check if any path leads to an active task (up to 3 hops for safety)
    const checkActivePath = (currentId: string, depth = 0): boolean => {
      if (depth > 2) return false
      
      const outgoingEdges = edges.filter(e => e.source === currentId)
      for (const edge of outgoingEdges) {
        const targetNode = nodes.find(n => n.id === edge.target)
        if (!targetNode) continue
        
        const targetData = targetNode.data as StrategicNodeData
        // Found an active task with assignee
        if ((targetData.state === "doing" || targetData.state === "decision") && targetData.assigneeId) {
          return true
        }
        
        // Follow the path (especially through questions)
        if (checkActivePath(targetNode.id, depth + 1)) {
          return true
        }
      }
      return false
    }

    if (checkActivePath(nodeId)) return false

    // Default to showing for 'begin' or 'question' or if no clear next step
    return isQuestion || nodeData.state === "begin"
  }, [nodeId, nodeData, edges, nodes, isQuestion, isGhost])

  const [searchValue, setSearchValue] = useState("")

  return (
    <div
      className={cn(
        "group relative w-56 rounded-lg border-2 bg-card shadow-sm transition-all",
        config.borderClass,
        // Drafts: dashed border + translucent
        isDraft && "border-dashed opacity-70",
        // Ghost nodes: even more translucent, grayscale, and interactive
        isGhost && "opacity-40 grayscale border-dotted cursor-pointer hover:opacity-100 hover:scale-105 hover:grayscale-0 hover:shadow-lg hover:border-indigo-400",
        // Question nodes: slightly wider, prominent
        isQuestion && "w-60",
        // Next small goal pulsing
        nodeData.isNextSmallGoal && "animate-pulse-ring border-amber-400",
        // Selected state
        selected && !isGhost && "ring-2 ring-ring ring-offset-2"
      )}
      onClick={(e) => {
        if (isGhost) {
          e.stopPropagation()
          window.dispatchEvent(
            new CustomEvent("realize-ghost", {
              detail: { nodeId },
            })
          )
        }
      }}
    >
      <Handle
        type="target"
        position={Position.Left}
        className={cn("!h-2.5 !w-2.5 !border-2 !border-card !bg-muted-foreground", isGhost && "opacity-0")}
      />

      {/* Suggestion badge: Only for AI-suggested ghost nodes */}
      {isGhost && isSystemGenerated && (
        <div className="absolute -top-2.5 right-3 z-10 flex items-center gap-1 rounded-full border border-indigo-200 bg-white px-2 py-0.5 shadow-sm">
          <Sparkles className="h-2.5 w-2.5 text-indigo-400" />
          <span className="text-[8px] font-bold uppercase tracking-tight text-indigo-400">
            Potential Path
          </span>
        </div>
      )}

      {/* Header with state badge */}
      <div
        className={cn(
          "flex items-center gap-1.5 rounded-t-md px-3 py-1.5 transition-colors",
          isGhost ? "bg-slate-50" : config.bgClass
        )}
      >
        <Icon className={cn("h-3.5 w-3.5", isGhost ? "text-slate-400" : config.color)} />
        <span className={cn("text-xs font-medium", isGhost ? "text-slate-400" : config.color)}>
          {isGhost ? "Click to realize" : config.label}
        </span>
        {nodeData.isNextSmallGoal && (
          <Star className="ml-auto h-3.5 w-3.5 fill-amber-400 text-amber-500" />
        )}
      </div>

      {/* Body */}
      <div className="px-3 py-2.5">
        <h3 className={cn("text-sm font-semibold leading-snug", isGhost ? "text-slate-500" : "text-foreground")}>
          {nodeData.title}
        </h3>
        {nodeData.description && !isGhost && (
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
            {nodeData.description}
          </p>
        )}
        
        {isGhost && (
          <p className="mt-1 text-[10px] italic leading-tight text-slate-400">
            Suggested based on successful projects at this stage.
          </p>
        )}

        {/* Coordination Tip for the Demo */}
        {nodeId === "node-canvas" && isDoing && assignee?.id === "david" && (
          <div className="mt-2 rounded-md border border-teal-200 bg-teal-50 px-2 py-1.5 flex items-start gap-1.5 animate-in fade-in slide-in-from-top-1 duration-500">
            <Sparkles className="h-3 w-3 text-teal-600 shrink-0 mt-0.5" />
            <p className="text-[9px] leading-tight text-teal-700">
              <b>Coordination Tip:</b> David has been consistent this week. Give him credit and see if he needs any support!
            </p>
          </div>
        )}

        {/* Question node: hint to encourage drafts */}
        {isQuestion && nodeData.questionHint && (
          <div className="mt-2 rounded-md border border-indigo-200 bg-indigo-50/60 px-2 py-1.5">
            <p className="text-[10px] leading-relaxed text-indigo-600">
              {nodeData.questionHint}
            </p>
          </div>
        )}

        {/* Search bar for finding similar projects (blank/new nodes) */}
        {nodeData.searchQuery !== undefined && (
          <div className="mt-2">
            <div className="flex items-center gap-1.5 rounded-md border border-border bg-background px-2 py-1">
              <Search className="h-3 w-3 text-muted-foreground" />
              <input
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Search similar projects..."
                className="w-full bg-transparent text-[10px] text-foreground outline-none placeholder:text-muted-foreground"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
        )}
      </div>

      {/* Footer: assignee (or empty slot) + comments */}
      <div className={cn("flex items-center gap-2 border-t border-border px-3 py-1.5", isGhost && "opacity-0")}>
        {/* Assignee slot: always visible for doing/decision so people know who's on it */}
        {(isDoing || isDecision || assignee) && (
          <div className="flex items-center gap-1.5">
            {assignee ? (
              <div
                className={cn(
                  "flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-primary-foreground",
                  assignee.avatarColor
                )}
                title={assignee.name}
              >
                {assignee.initials}
              </div>
            ) : (
              <div
                className="flex h-5 w-5 items-center justify-center rounded-full border border-dashed border-muted-foreground/40 text-muted-foreground/40"
                title="Unassigned - click to claim"
              >
                <UserCircle2 className="h-3.5 w-3.5" />
              </div>
            )}
            {assignee && (
              <span className="text-[10px] text-muted-foreground">
                {assignee.name.split(" ")[0]}
              </span>
            )}
            {!assignee && (isDoing || isDecision) && (
              <span className="text-[9px] text-muted-foreground/50">
                Open slot
              </span>
            )}
          </div>
        )}
        {commentCount > 0 && (
          <div className="ml-auto flex items-center gap-0.5 text-muted-foreground">
            <MessageSquare className="h-3 w-3" />
            <span className="text-[10px]">{commentCount}</span>
          </div>
        )}
        {/* For nodes without assignee/comments, still show something */}
        {!assignee && !isDoing && !isDecision && commentCount === 0 && (
          <span className="text-[9px] text-muted-foreground/40">
            {isDraft ? "Proposal" : ""}
          </span>
        )}
      </div>

      {/* Extend button: create a child node */}
      {nodeData.state !== "goal" && nodeData.state !== "history" && !isGhost && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            window.dispatchEvent(
              new CustomEvent("extend-node", {
                detail: { nodeId },
              })
            )
          }}
          className={cn(
            "absolute -right-3.5 top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full border-2 border-border bg-card text-muted-foreground shadow-md transition-all hover:border-primary hover:text-primary",
            shouldShowSuggestionHint 
              ? "opacity-100 animate-pulse-ring-indigo border-indigo-400 text-indigo-500 shadow-indigo-200" 
              : "opacity-0 group-hover:opacity-100"
          )}
          title="Explore possible next steps"
          aria-label="Explore possible next steps"
        >
          <Plus className="h-3.5 w-3.5" />
          {shouldShowSuggestionHint && (
            <span className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-indigo-600 px-2 py-1 text-[9px] font-bold text-white shadow-lg animate-bounce">
              Suggest next step
            </span>
          )}
        </button>
      )}

      <Handle
        type="source"
        position={Position.Right}
        className={cn("!h-2.5 !w-2.5 !border-2 !border-card !bg-muted-foreground", isGhost && "opacity-0")}
      />

      {/* Bottom handle for vertical connections when needed */}
      <Handle
        type="source"
        id="bottom"
        position={Position.Bottom}
        className={cn("!h-2.5 !w-2.5 !border-2 !border-card !bg-muted-foreground", isGhost && "opacity-0")}
      />
      <Handle
        type="target"
        id="top"
        position={Position.Top}
        className={cn("!h-2.5 !w-2.5 !border-2 !border-card !bg-muted-foreground", isGhost && "opacity-0")}
      />
    </div>
  )
}

export default memo(StrategicNodeComponent)
