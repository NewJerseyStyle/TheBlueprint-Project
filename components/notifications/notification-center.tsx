"use client"

import { useState } from "react"
import { Bell, Check, Settings } from "lucide-react"
import { cn } from "@/lib/utils"
import { useCanvasStore } from "@/lib/canvas-store"

export default function NotificationCenter() {
  const {
    notifications,
    subscriptions,
    markNotificationRead,
    toggleSubscription,
  } = useCanvasStore()

  const [open, setOpen] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  // Filter by active subscriptions
  const visibleNotifications = notifications.filter(
    (n) => subscriptions[n.type]
  )
  const unreadCount = visibleNotifications.filter((n) => !n.read).length

  return (
    <div className="relative">
      <button
        onClick={() => {
          setOpen(!open)
          setShowSettings(false)
        }}
        className="relative flex items-center justify-center rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-full z-50 mt-1 w-80 rounded-xl border border-border bg-card shadow-xl">
            <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
              <h3 className="text-xs font-semibold text-foreground">
                Notifications
              </h3>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className={cn(
                  "rounded-md p-1 transition-colors",
                  showSettings
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
                aria-label="Manage subscriptions"
              >
                <Settings className="h-3.5 w-3.5" />
              </button>
            </div>

            {showSettings ? (
              <div className="p-4">
                <h4 className="mb-3 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Manage Subscriptions
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-foreground">
                        Coordinator Tips
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        Leadership advice, contributor recognition prompts
                      </p>
                    </div>
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
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-foreground">
                        Contributor Reminders
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        Task updates, rewards, team priority reminders
                      </p>
                    </div>
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
                  </div>
                </div>
              </div>
            ) : (
              <div className="max-h-80 overflow-y-auto">
                {visibleNotifications.length === 0 ? (
                  <div className="px-4 py-8 text-center">
                    <Bell className="mx-auto h-6 w-6 text-muted" />
                    <p className="mt-2 text-xs text-muted-foreground">
                      No notifications
                    </p>
                  </div>
                ) : (
                  visibleNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={cn(
                        "flex items-start gap-3 border-b border-border px-4 py-3 last:border-0",
                        !notification.read && "bg-primary/5"
                      )}
                    >
                      <div
                        className={cn(
                          "mt-0.5 h-2 w-2 flex-shrink-0 rounded-full",
                          !notification.read ? "bg-primary" : "bg-transparent"
                        )}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={cn(
                              "rounded-full px-1.5 py-px text-[9px] font-medium",
                              notification.type === "coordinator"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-sky-100 text-sky-700"
                            )}
                          >
                            {notification.type === "coordinator"
                              ? "Coordinator"
                              : "Contributor"}
                          </span>
                        </div>
                        <p className="mt-1 text-[11px] font-medium text-foreground">
                          {notification.title}
                        </p>
                        <p className="mt-0.5 text-[10px] leading-relaxed text-muted-foreground">
                          {notification.message}
                        </p>
                        <div className="mt-1.5 flex items-center justify-between">
                          <span className="text-[9px] text-muted-foreground">
                            {new Date(
                              notification.timestamp
                            ).toLocaleDateString()}
                          </span>
                          {!notification.read && (
                            <button
                              onClick={() =>
                                markNotificationRead(notification.id)
                              }
                              className="flex items-center gap-0.5 text-[9px] text-primary hover:underline"
                            >
                              <Check className="h-2.5 w-2.5" />
                              Mark read
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
