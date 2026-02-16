"use client"

import { memo, useMemo } from "react"
import { type NodeProps, NodeResizer, useNodes } from "@xyflow/react"
import { MessageSquare, Eye, EyeOff } from "lucide-react"
import { cn } from "@/lib/utils"
import { useCanvasStore } from "@/lib/canvas-store"
import type { SwimLaneData, StrategicNodeData, NodeComment } from "@/lib/types"
import { MOCK_USERS } from "@/lib/mock-data"

interface ThreadItem {
  nodeId: string
  nodeTitle: string
  nodeState: string
  comments: NodeComment[]
}

function SwimLaneNodeComponent({ id, data, selected }: NodeProps) {
  const laneData = data as unknown as SwimLaneData
  const allNodes = useNodes()
  const { setSelectedNodeId } = useCanvasStore()

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
          <span key={i} className="font-bold text-primary underline">
            {part}
          </span>
        )
      }
      return part
    })
  }

  // Find all strategic child nodes inside this swim lane
  const threads = useMemo<ThreadItem[]>(() => {
    return allNodes
      .filter((n) => n.parentId === id && n.type === "strategic")
      .map((n) => {
        const nd = n.data as unknown as StrategicNodeData
        return {
          nodeId: n.id,
          nodeTitle: nd.title || "Untitled",
          nodeState: nd.state || "draft",
          comments: nd.comments || [],
        }
      })
      .filter((t) => t.comments.length > 0)
  }, [allNodes, id])

  const totalComments = threads.reduce(
    (sum, t) => sum + t.comments.length,
    0
  )

  return (
    <div
      className="swimlane-node relative h-full w-full rounded-xl"
      style={{ backgroundColor: laneData.color }}
    >
      <NodeResizer
        isVisible={selected}
        minWidth={300}
        minHeight={200}
        lineClassName="!border-primary/30"
        handleClassName="!h-2.5 !w-2.5 !border-2 !border-primary !bg-card"
      />

      {/* Lane header */}
      <div className="absolute left-4 top-3 flex items-center gap-2">
        <div className="rounded-md bg-card/80 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-foreground shadow-sm backdrop-blur-sm">
          {laneData.label}
        </div>
        {totalComments > 0 && (
          <div className="flex items-center gap-1 rounded-md bg-card/80 px-2 py-1 text-muted-foreground shadow-sm backdrop-blur-sm">
            <MessageSquare className="h-3 w-3" />
            <span className="text-[10px] font-medium">{totalComments}</span>
          </div>
        )}
      </div>

      {/* Toggle comment view button */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          // Toggle is handled by parent store through data update
          // For now, toggle the showComments in data
          const event = new CustomEvent("toggle-lane-comments", {
            detail: { laneId: id },
          })
          window.dispatchEvent(event)
        }}
        className="absolute right-4 top-3 flex items-center gap-1 rounded-md bg-card/80 px-2 py-1 text-[10px] font-medium text-muted-foreground shadow-sm backdrop-blur-sm transition-colors hover:text-foreground"
        title={laneData.showComments ? "Hide comment threads" : "Show comment threads"}
      >
        {laneData.showComments ? (
          <>
            <EyeOff className="h-3 w-3" />
            <span>Hide threads</span>
          </>
        ) : (
          <>
            <Eye className="h-3 w-3" />
            <span>Threads</span>
          </>
        )}
      </button>

      {/* Forum-style comment thread view */}
      {laneData.showComments && threads.length > 0 && (
        <div className="absolute bottom-0 left-0 right-0 max-h-52 overflow-y-auto rounded-b-xl bg-card/95 backdrop-blur-sm">
          <div className="border-t border-border px-4 py-2">
            <h4 className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Comment Threads
            </h4>
            <div className="space-y-3 pb-2">
              {threads.map((thread) => (
                <button 
                  key={thread.nodeId} 
                  onClick={() => setSelectedNodeId(thread.nodeId)}
                  className="w-full text-left rounded-lg border border-border bg-background p-2 transition-colors hover:border-primary/50 hover:shadow-sm"
                >
                  {/* Thread header = node title */}
                  <div className="mb-1.5 flex items-center gap-1.5">
                    <div className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      thread.nodeState === "doing" ? "bg-teal-500" :
                      thread.nodeState === "decision" ? "bg-amber-500" :
                      thread.nodeState === "draft" ? "bg-slate-400" :
                      thread.nodeState === "goal" ? "bg-rose-500" :
                      "bg-sky-500"
                    )} />
                    <span className="text-[11px] font-semibold text-foreground">
                      {thread.nodeTitle}
                    </span>
                    <span className="text-[9px] text-muted-foreground">
                      ({thread.comments.length})
                    </span>
                  </div>
                  {/* Latest comments */}
                  <div className="space-y-1">
                    {thread.comments.slice(-2).map((comment) => {
                      const user = MOCK_USERS.find((u) => u.id === comment.userId)
                      return (
                        <div key={comment.id} className="flex gap-1.5">
                          <div
                            className={cn(
                              "mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full text-[7px] font-bold text-primary-foreground",
                              user?.avatarColor || "bg-slate-400"
                            )}
                          >
                            {user?.initials || "?"}
                          </div>
                          <p className="text-[10px] leading-relaxed text-muted-foreground line-clamp-1">
                            <span className="font-medium text-foreground">
                              {comment.userName.split(" ")[0]}:
                            </span>{" "}
                            {renderCommentText(comment.text)}
                          </p>
                        </div>
                      )
                    })}
                    {thread.comments.length > 2 && (
                      <p className="text-[9px] text-muted-foreground/70">
                        +{thread.comments.length - 2} more
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default memo(SwimLaneNodeComponent)
