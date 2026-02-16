"use client"

import {
  X,
  ExternalLink,
  CheckSquare,
  Square,
  Clock,
  MessageCircle,
  Tag,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useCanvasStore } from "@/lib/canvas-store"
import { TRELLO_CARD_DATA, MOCK_USERS } from "@/lib/mock-data"

export default function TrelloPanel() {
  const { showTrelloFor, setShowTrelloFor } = useCanvasStore()
  if (!showTrelloFor) return null

  const cardData =
    TRELLO_CARD_DATA[showTrelloFor] || TRELLO_CARD_DATA["default"]
  const checkedCount = cardData.checklist.filter((c) => c.done).length

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-sm">
      <div className="relative mx-4 w-full max-w-lg rounded-xl border border-border bg-card shadow-2xl">
        {/* Banner */}
        <div className="rounded-t-xl bg-primary/10 px-4 py-2">
          <p className="text-center text-[10px] font-medium text-primary">
            This is a preview of Trello integration
          </p>
        </div>

        {/* Close */}
        <button
          onClick={() => setShowTrelloFor(null)}
          className="absolute right-3 top-3 text-muted-foreground transition-colors hover:text-foreground"
          aria-label="Close Trello preview"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="px-5 pb-5 pt-4">
          {/* Title */}
          <h2 className="pr-8 text-base font-semibold text-foreground">
            {cardData.title}
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            in list{" "}
            <span className="font-medium text-foreground">
              {cardData.list}
            </span>
          </p>

          {/* Labels */}
          <div className="mt-3 flex flex-wrap gap-1.5">
            {cardData.labels.map((label) => (
              <span
                key={label.text}
                className={cn(
                  "flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-medium text-card",
                  label.color
                )}
              >
                <Tag className="h-2.5 w-2.5" />
                {label.text}
              </span>
            ))}
          </div>

          {/* Description */}
          <div className="mt-4">
            <h4 className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              Description
            </h4>
            <p className="text-xs leading-relaxed text-foreground">
              {cardData.description}
            </p>
          </div>

          {/* Checklist */}
          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between">
              <h4 className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                Checklist
              </h4>
              <span className="text-[10px] text-muted-foreground">
                {checkedCount}/{cardData.checklist.length}
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{
                  width: `${(checkedCount / cardData.checklist.length) * 100}%`,
                }}
              />
            </div>
            <div className="mt-2 space-y-1.5">
              {cardData.checklist.map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  {item.done ? (
                    <CheckSquare className="h-3.5 w-3.5 text-primary" />
                  ) : (
                    <Square className="h-3.5 w-3.5 text-muted-foreground" />
                  )}
                  <span
                    className={cn(
                      "text-xs",
                      item.done
                        ? "text-muted-foreground line-through"
                        : "text-foreground"
                    )}
                  >
                    {item.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Members + Due Date */}
          <div className="mt-4 flex items-center gap-4">
            <div>
              <h4 className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                Members
              </h4>
              <div className="flex -space-x-1">
                {cardData.members.map((memberId) => {
                  const user = MOCK_USERS.find((u) => u.id === memberId)
                  if (!user) return null
                  return (
                    <div
                      key={user.id}
                      className={cn(
                        "flex h-6 w-6 items-center justify-center rounded-full border-2 border-card text-[9px] font-bold text-primary-foreground",
                        user.avatarColor
                      )}
                      title={user.name}
                    >
                      {user.initials}
                    </div>
                  )
                })}
              </div>
            </div>
            <div>
              <h4 className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                Due Date
              </h4>
              <div className="flex items-center gap-1 text-xs text-foreground">
                <Clock className="h-3 w-3" />
                {cardData.dueDate}
              </div>
            </div>
          </div>

          {/* Activity */}
          <div className="mt-4 border-t border-border pt-3">
            <h4 className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              <MessageCircle className="h-3 w-3" />
              Activity
            </h4>
            <div className="space-y-2">
              {cardData.activity.map((act, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div className="mt-0.5 h-4 w-4 rounded-full bg-muted" />
                  <div>
                    <p className="text-[11px] text-foreground">
                      <span className="font-medium">{act.user}</span>{" "}
                      {act.text}
                    </p>
                    <p className="text-[9px] text-muted-foreground">
                      {act.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* External link */}
          <div className="mt-4 flex justify-center">
            <a
              href="https://trello.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-lg bg-secondary px-4 py-2 text-xs font-medium text-foreground transition-colors hover:bg-secondary/80"
              title="Will link to real board in full version"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Open in Trello
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
