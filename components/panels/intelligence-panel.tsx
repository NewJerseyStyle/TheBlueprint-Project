"use client"

import { Sparkles, TrendingUp, Compass, BookOpen, Cog } from "lucide-react"
import { INTELLIGENCE_SUGGESTIONS } from "@/lib/mock-data"
import { toast } from "sonner"

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  Process: TrendingUp,
  Strategy: Compass,
  Approach: Sparkles,
  Onboarding: BookOpen,
}

export default function IntelligencePanel() {
  return (
    <div className="flex h-full w-72 flex-col border-r border-border bg-card">
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <Sparkles className="h-4 w-4 text-accent" />
        <h2 className="text-sm font-semibold text-foreground">
          Suggested Paths
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        <div className="space-y-3">
          {INTELLIGENCE_SUGGESTIONS.map((suggestion) => {
            const Icon = CATEGORY_ICONS[suggestion.category] || Cog
            return (
              <div
                key={suggestion.id}
                className="rounded-lg border border-border bg-background p-3 transition-shadow hover:shadow-sm"
              >
                <div className="mb-2 flex items-center gap-1.5">
                  <Icon className="h-3.5 w-3.5 text-accent" />
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-accent">
                    {suggestion.category}
                  </span>
                </div>
                <p className="text-xs leading-relaxed text-foreground">
                  {suggestion.text}
                </p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-[9px] text-muted-foreground">
                    {suggestion.confidence}
                  </span>
                  <button
                    onClick={() =>
                      toast.info("Coming soon in the full version", {
                        description:
                          "This feature will automatically apply suggestions to your canvas.",
                      })
                    }
                    className="rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary transition-colors hover:bg-primary/20"
                  >
                    Apply
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-4 rounded-lg bg-muted px-3 py-2">
          <p className="text-center text-[9px] text-muted-foreground">
            Powered by ImpactMap Intelligence (Demo)
          </p>
        </div>
      </div>
    </div>
  )
}
