"use client"

import { useState } from "react"
import {
  X,
  MessageSquare,
  ExternalLink,
  Star,
  StarOff,
  Send,
  Sparkles,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useCanvasStore } from "@/lib/canvas-store"
import {
  NODE_STATE_CONFIG,
  type NodeState,
  type StrategicNodeData,
} from "@/lib/types"
import { MOCK_USERS } from "@/lib/mock-data"

export default function NodeDetailPanel() {
  const {
    nodes,
    selectedNodeId,
    setSelectedNodeId,
    updateNodeData,
    addComment,
    changeNodeState,
    setShowTrelloFor,
    currentUser,
    currentRole,
  } = useCanvasStore()

  const [commentText, setCommentText] = useState("")

  const node = nodes.find((n) => n.id === selectedNodeId)
  if (!node || node.type !== "strategic") return null

  const data = node.data as unknown as StrategicNodeData
  const config = NODE_STATE_CONFIG[data.state]
  const assignee = data.assigneeId
    ? MOCK_USERS.find((u) => u.id === data.assigneeId)
    : null
  const canEdit = currentRole === "edit"
  const canComment = currentRole === "edit" || currentRole === "comment"

  const handleStateChange = (newState: NodeState) => {
    if (!canEdit) return
    // Use changeNodeState to also update edge styles
    changeNodeState(node.id, newState)
  }

  const handleToggleNextGoal = () => {
    if (!canEdit) return
    updateNodeData(node.id, { isNextSmallGoal: !data.isNextSmallGoal })
  }

  const handleSubmitComment = () => {
    if (!commentText.trim() || !canComment) return
    addComment(node.id, {
      id: `c-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      text: commentText.trim(),
      timestamp: new Date().toISOString(),
    })
    setCommentText("")
  }

  // Helper to highlight @mentions and #references
  const renderCommentText = (text: string) => {
    const parts = text.split(/(@\w+|#\w+)/g)
    return parts.map((part, i) => {
      if (part.startsWith("@")) {
        return (
          <span key={i} className="font-bold text-indigo-600">
            {part}
          </span>
        )
      }
      if (part.startsWith("#")) {
        return (
          <span key={i} className="font-bold text-primary underline cursor-help" title="Card reference">
            {part}
          </span>
        )
      }
      return part
    })
  }

  return (
    <div className="flex h-full w-80 flex-col border-l border-border bg-card">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold text-foreground">Node Details</h2>
        <button
          onClick={() => setSelectedNodeId(null)}
          className="text-muted-foreground transition-colors hover:text-foreground"
          aria-label="Close detail panel"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Title and Description */}
        <div className="border-b border-border px-4 py-4">
          {canEdit ? (
            <input
              value={data.title}
              onChange={(e) =>
                updateNodeData(node.id, { title: e.target.value })
              }
              className="w-full bg-transparent text-sm font-semibold text-foreground outline-none focus:underline focus:decoration-primary"
            />
          ) : (
            <h3 className="text-sm font-semibold text-foreground">
              {data.title}
            </h3>
          )}
          {canEdit ? (
            <textarea
              value={data.description}
              onChange={(e) =>
                updateNodeData(node.id, { description: e.target.value })
              }
              className="mt-2 w-full resize-none bg-transparent text-xs leading-relaxed text-muted-foreground outline-none focus:underline focus:decoration-primary"
              rows={3}
            />
          ) : (
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              {data.description}
            </p>
          )}
        </div>

        {/* State selector */}
        <div className="border-b border-border px-4 py-3">
          <label className="mb-2 block text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            State
          </label>
          <div className="flex flex-wrap gap-1.5">
            {(Object.keys(NODE_STATE_CONFIG) as NodeState[]).map((state) => {
              const sc = NODE_STATE_CONFIG[state]
              return (
                <button
                  key={state}
                  disabled={!canEdit}
                  onClick={() => handleStateChange(state)}
                  className={cn(
                    "rounded-full border px-2.5 py-0.5 text-[10px] font-medium transition-colors",
                    data.state === state
                      ? `${sc.bgClass} ${sc.borderClass} ${sc.color}`
                      : "border-border text-muted-foreground hover:bg-secondary",
                    !canEdit && "cursor-default opacity-60"
                  )}
                >
                  {sc.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Assignee */}
        <div className="border-b border-border px-4 py-3">
          <label className="mb-2 block text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            Assignee
          </label>
          {assignee ? (
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold text-primary-foreground",
                  assignee.avatarColor
                )}
              >
                {assignee.initials}
              </div>
              <span className="text-xs text-foreground">{assignee.name}</span>
            </div>
          ) : (
            <span className="text-xs text-muted-foreground">Unassigned</span>
          )}
        </div>

        {/* Coordination Actions (Demo specific for David) */}
        {node.id === "node-canvas" && data.state === "doing" && assignee?.id === "david" && (
          <div className="border-b border-border px-4 py-3 bg-teal-50/30">
            <label className="mb-2 block text-[10px] font-semibold uppercase tracking-wide text-teal-700 flex items-center gap-1.5">
              <Sparkles className="h-3 w-3" />
              Suggested Coordination
            </label>
            <div className="rounded-lg border border-teal-200 bg-white p-2.5 shadow-sm">
              <p className="text-[11px] leading-relaxed text-teal-900">
                David has been active for 3 days. Community project research shows that <b>acknowledging individual progress</b> at this stage increases long-term retention by 40%.
              </p>
              <button 
                onClick={() => {
                  setCommentText("Great progress on the canvas prototype, David! The team really appreciates the focus on non-linear mapping.")
                }}
                className="mt-2.5 w-full rounded-md border border-teal-200 bg-teal-50 py-1.5 text-[10px] font-bold text-teal-700 transition-colors hover:bg-teal-100"
              >
                Draft appreciation comment
              </button>
            </div>
          </div>
        )}

        {/* Next Small Goal toggle */}
        <div className="border-b border-border px-4 py-3 space-y-2">
          <button
            onClick={handleToggleNextGoal}
            disabled={!canEdit}
            className={cn(
              "flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
              data.isNextSmallGoal
                ? "bg-amber-50 text-amber-700"
                : "text-muted-foreground hover:bg-secondary",
              !canEdit && "cursor-default opacity-60"
            )}
          >
            {data.isNextSmallGoal ? (
              <>
                <Star className="h-3.5 w-3.5 fill-amber-400" />
                {"Next Small Goal (active)"}
              </>
            ) : (
              <>
                <StarOff className="h-3.5 w-3.5" />
                Mark as Next Small Goal
              </>
            )}
          </button>

          <button
            onClick={() => updateNodeData(node.id, { forceSuggestionShow: !data.forceSuggestionShow })}
            disabled={!canEdit}
            className={cn(
              "flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
              data.forceSuggestionShow
                ? "bg-indigo-50 text-indigo-700"
                : "text-muted-foreground hover:bg-secondary",
              !canEdit && "cursor-default opacity-60"
            )}
          >
            <Sparkles className={cn("h-3.5 w-3.5", data.forceSuggestionShow && "fill-indigo-400")} />
            {data.forceSuggestionShow ? "Suggestions enabled" : "Show suggestions"}
          </button>
        </div>

        {/* System-generated indicator */}
        {data.isSystemGenerated && (
          <div className="border-b border-border px-4 py-3">
            <div className="flex items-center gap-2 rounded-lg bg-indigo-50 px-3 py-2 text-xs">
              <span className="text-indigo-600 font-medium">Suggested by system</span>
              <span className="text-indigo-500/70 text-[10px]">
                Based on historical project data
              </span>
            </div>
          </div>
        )}

        {/* Trello integration */}
        <div className="border-b border-border px-4 py-3">
          <button
            onClick={() => setShowTrelloFor(node.id)}
            className="flex w-full items-center gap-2 rounded-lg bg-secondary px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-secondary/80"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Open in Trello
            <span className="ml-auto text-[10px] text-muted-foreground">
              Mockup
            </span>
          </button>
        </div>

        {/* Comments */}
        <div className="px-4 py-3">
          <div className="mb-3 flex items-center gap-1.5">
            <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              Comments ({data.comments?.length || 0})
            </span>
          </div>

          <div className="space-y-3">
            {data.comments?.map((comment) => {
              const commentUser = MOCK_USERS.find(
                (u) => u.id === comment.userId
              )
              return (
                <div key={comment.id} className="flex gap-2">
                  <div
                    className={cn(
                      "mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-[9px] font-bold text-primary-foreground",
                      commentUser?.avatarColor || "bg-slate-400"
                    )}
                  >
                    {commentUser?.initials || "?"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-[11px] font-semibold text-foreground">
                        {comment.userName}
                      </span>
                      <span className="text-[9px] text-muted-foreground">
                        {new Date(comment.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
                      {renderCommentText(comment.text)}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Comment input */}
          {canComment && (
            <div className="mt-3 flex gap-2">
              <input
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSubmitComment()
                  }
                }}
                placeholder="Add a comment..."
                className="flex-1 rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs text-foreground outline-none placeholder:text-muted-foreground focus:ring-1 focus:ring-ring"
              />
              <button
                onClick={handleSubmitComment}
                disabled={!commentText.trim()}
                className="rounded-lg bg-primary p-1.5 text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-40"
              >
                <Send className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
