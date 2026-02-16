"use client"

import { useEffect, useState } from "react"
import { Megaphone, ListTodo, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useCanvasStore } from "@/lib/canvas-store"
import {
  COORDINATOR_NOTIFICATIONS,
  CONTRIBUTOR_NOTIFICATIONS,
} from "@/lib/mock-data"

export default function StartupPrompt() {
  const {
    hasSeenStartupPrompt,
    setHasSeenStartupPrompt,
    subscriptions,
    toggleSubscription,
    isTutorial,
    showTutorial,
  } = useCanvasStore()

  const [open, setOpen] = useState(false)

  // Show prompt after a short delay when canvas loads (not during tutorial)
  useEffect(() => {
    if (hasSeenStartupPrompt || showTutorial) return
    const timer = setTimeout(() => {
      if (subscriptions.coordinator || subscriptions.contributor) {
        setOpen(true)
      }
    }, 1500)
    return () => clearTimeout(timer)
  }, [hasSeenStartupPrompt, subscriptions, showTutorial])

  const handleDismiss = () => {
    setOpen(false)
    setHasSeenStartupPrompt(true)
  }

  const handleDontShowAgain = () => {
    setOpen(false)
    setHasSeenStartupPrompt(true)
    // Unsubscribe from all
    if (subscriptions.coordinator) toggleSubscription("coordinator")
    if (subscriptions.contributor) toggleSubscription("contributor")
  }

  if (!open) return null

  const coordinatorTips = subscriptions.coordinator
    ? COORDINATOR_NOTIFICATIONS.filter((n) => !n.read)
    : []
  const contributorTips = subscriptions.contributor
    ? CONTRIBUTOR_NOTIFICATIONS.filter((n) => !n.read)
    : []

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 backdrop-blur-sm">
      <div className="relative mx-4 w-full max-w-md rounded-xl border border-border bg-card p-5 shadow-2xl">
        <button
          onClick={handleDismiss}
          className="absolute right-3 top-3 text-muted-foreground transition-colors hover:text-foreground"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>

        <h2 className="text-base font-semibold text-foreground">
          Welcome back!
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          {"Here are your updates since last visit."}
        </p>

        <div className="mt-4 space-y-4">
          {coordinatorTips.length > 0 && (
            <div>
              <div className="mb-2 flex items-center gap-1.5">
                <Megaphone className="h-3.5 w-3.5 text-amber-600" />
                <span className="text-[10px] font-semibold uppercase tracking-wide text-amber-700">
                  Coordinator Tips
                </span>
              </div>
              <div className="space-y-2">
                {coordinatorTips.map((tip) => (
                  <div
                    key={tip.id}
                    className="rounded-lg border border-amber-200 bg-amber-50 p-2.5"
                  >
                    <p className="text-[11px] font-medium text-amber-900">
                      {tip.title}
                    </p>
                    <p className="mt-0.5 text-[10px] leading-relaxed text-amber-700">
                      {tip.message}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {contributorTips.length > 0 && (
            <div>
              <div className="mb-2 flex items-center gap-1.5">
                <ListTodo className="h-3.5 w-3.5 text-sky-600" />
                <span className="text-[10px] font-semibold uppercase tracking-wide text-sky-700">
                  Contributor Updates
                </span>
              </div>
              <div className="space-y-2">
                {contributorTips.map((tip) => (
                  <div
                    key={tip.id}
                    className="rounded-lg border border-sky-200 bg-sky-50 p-2.5"
                  >
                    <p className="text-[11px] font-medium text-sky-900">
                      {tip.title}
                    </p>
                    <p className="mt-0.5 text-[10px] leading-relaxed text-sky-700">
                      {tip.message}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-5 flex items-center justify-between">
          <button
            onClick={handleDontShowAgain}
            className="text-[10px] text-muted-foreground underline-offset-2 hover:underline"
          >
            {"Don't show again"}
          </button>
          <button
            onClick={handleDismiss}
            className="rounded-lg bg-primary px-4 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  )
}
