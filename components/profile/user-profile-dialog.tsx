"use client"

import { useState } from "react"
import { User, ChevronDown, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { useCanvasStore } from "@/lib/canvas-store"
import { MOCK_USERS, MOCK_PROJECTS } from "@/lib/mock-data"
import type { CanvasRole } from "@/lib/types"

const ROLE_DISPLAY: Record<CanvasRole, { label: string; className: string }> = {
  edit: { label: "Edit", className: "bg-teal-100 text-teal-700" },
  comment: { label: "Comment Only", className: "bg-sky-100 text-sky-700" },
  view: { label: "View Only", className: "bg-slate-100 text-slate-600" },
}

export default function UserProfileDialog() {
  const {
    currentUser,
    setCurrentUser,
    currentRole,
    setCurrentRole,
    subscriptions,
    toggleSubscription,
  } = useCanvasStore()

  const [open, setOpen] = useState(false)

  const handleSwitchUser = (userId: string) => {
    const user = MOCK_USERS.find((u) => u.id === userId)
    if (!user) return
    setCurrentUser(user)

    // Set role based on mock project membership
    const project = MOCK_PROJECTS[0]
    const member = project.members.find((m) => m.userId === userId)
    if (member) {
      setCurrentRole(member.role)
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs transition-colors hover:bg-secondary"
      >
        <div
          className={cn(
            "flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold text-primary-foreground",
            currentUser.avatarColor
          )}
        >
          {currentUser.initials}
        </div>
        <span className="hidden text-xs font-medium text-foreground sm:inline">
          {currentUser.name}
        </span>
        <ChevronDown className="h-3 w-3 text-muted-foreground" />
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-full z-50 mt-1 w-72 rounded-xl border border-border bg-card p-4 shadow-xl">
            {/* Current user info */}
            <div className="mb-3 flex items-center gap-3">
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-primary-foreground",
                  currentUser.avatarColor
                )}
              >
                {currentUser.initials}
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {currentUser.name}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {currentUser.email}
                </p>
              </div>
            </div>

            {/* Current role */}
            <div className="mb-3 rounded-lg bg-muted px-3 py-2">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                Canvas Role
              </span>
              <span
                className={cn(
                  "ml-2 rounded-full px-2 py-0.5 text-[10px] font-medium",
                  ROLE_DISPLAY[currentRole].className
                )}
              >
                {ROLE_DISPLAY[currentRole].label}
              </span>
            </div>

            {/* Notification subscriptions */}
            <div className="mb-3 border-t border-border pt-3">
              <h4 className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                Notification Subscriptions
              </h4>
              <div className="space-y-2">
                <label className="flex cursor-pointer items-center justify-between">
                  <span className="text-xs text-foreground">
                    Coordinator Tips
                  </span>
                  <button
                    onClick={() => toggleSubscription("coordinator")}
                    className={cn(
                      "h-5 w-9 rounded-full transition-colors",
                      subscriptions.coordinator ? "bg-primary" : "bg-muted"
                    )}
                  >
                    <div
                      className={cn(
                        "h-4 w-4 rounded-full bg-card shadow-sm transition-transform",
                        subscriptions.coordinator
                          ? "translate-x-4"
                          : "translate-x-0.5"
                      )}
                    />
                  </button>
                </label>
                <label className="flex cursor-pointer items-center justify-between">
                  <span className="text-xs text-foreground">
                    Contributor Reminders
                  </span>
                  <button
                    onClick={() => toggleSubscription("contributor")}
                    className={cn(
                      "h-5 w-9 rounded-full transition-colors",
                      subscriptions.contributor ? "bg-primary" : "bg-muted"
                    )}
                  >
                    <div
                      className={cn(
                        "h-4 w-4 rounded-full bg-card shadow-sm transition-transform",
                        subscriptions.contributor
                          ? "translate-x-4"
                          : "translate-x-0.5"
                      )}
                    />
                  </button>
                </label>
              </div>
            </div>

            {/* Switch user */}
            <div className="border-t border-border pt-3">
              <h4 className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                Switch User (Demo)
              </h4>
              <div className="space-y-1">
                {MOCK_USERS.map((user) => {
                  const project = MOCK_PROJECTS[0]
                  const member = project.members.find(
                    (m) => m.userId === user.id
                  )
                  const role = member?.role || "view"
                  const isActive = currentUser.id === user.id

                  return (
                    <button
                      key={user.id}
                      onClick={() => {
                        handleSwitchUser(user.id)
                        setOpen(false)
                      }}
                      className={cn(
                        "flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs transition-colors",
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-foreground hover:bg-secondary"
                      )}
                    >
                      <div
                        className={cn(
                          "flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-bold text-primary-foreground",
                          user.avatarColor
                        )}
                      >
                        {user.initials}
                      </div>
                      <span className="flex-1 text-left">{user.name}</span>
                      <span
                        className={cn(
                          "rounded-full px-1.5 py-px text-[9px] font-medium",
                          ROLE_DISPLAY[role].className
                        )}
                      >
                        {ROLE_DISPLAY[role].label}
                      </span>
                      {isActive && <Check className="h-3 w-3" />}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
