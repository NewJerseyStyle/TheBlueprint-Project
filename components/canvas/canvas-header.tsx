"use client"

import { ArrowLeft, Lightbulb, Map } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { useCanvasStore } from "@/lib/canvas-store"
import type { CanvasRole } from "@/lib/types"
import NotificationCenter from "@/components/notifications/notification-center"
import UserProfileDialog from "@/components/profile/user-profile-dialog"

const ROLE_BADGE: Record<CanvasRole, { label: string; className: string }> = {
  edit: { label: "Edit", className: "bg-teal-100 text-teal-700" },
  comment: { label: "Comment Only", className: "bg-sky-100 text-sky-700" },
  view: { label: "View Only", className: "bg-slate-100 text-slate-600" },
}

export default function CanvasHeader() {
  const {
    showIntelligence,
    setShowIntelligence,
    currentRole,
    isTutorial,
  } = useCanvasStore()

  const roleBadge = ROLE_BADGE[currentRole]
  const projectName = isTutorial
    ? "Strategic Planning Tool MVP"
    : "Untitled Canvas"

  return (
    <header className="flex h-12 items-center justify-between border-b border-border bg-card px-4">
      {/* Left: back + project name */}
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="flex items-center gap-1 text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex items-center gap-2">
          <Map className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">
            {projectName}
          </span>
        </div>
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-[10px] font-medium",
            roleBadge.className
          )}
        >
          {roleBadge.label}
        </span>
      </div>

      {/* Right: intelligence + notifications + profile */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowIntelligence(!showIntelligence)}
          className={cn(
            "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
            showIntelligence
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-secondary hover:text-foreground"
          )}
        >
          <Lightbulb className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Insights</span>
        </button>

        <NotificationCenter />
        <UserProfileDialog />
      </div>
    </header>
  )
}
