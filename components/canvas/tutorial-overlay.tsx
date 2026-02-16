"use client"

import { useCanvasStore } from "@/lib/canvas-store"
import { TUTORIAL_STEPS } from "@/lib/mock-data"
import { X } from "lucide-react"

export default function TutorialOverlay() {
  const { showTutorial, setShowTutorial, tutorialStep, setTutorialStep } =
    useCanvasStore()

  if (!showTutorial) return null

  const step = TUTORIAL_STEPS[tutorialStep]
  const isLast = tutorialStep === TUTORIAL_STEPS.length - 1

  return (
    <div className="pointer-events-none absolute inset-0 z-50">
      <div className="pointer-events-auto absolute bottom-8 left-1/2 w-full max-w-md -translate-x-1/2 rounded-xl border border-border bg-card p-5 shadow-xl">
        <button
          onClick={() => setShowTutorial(false)}
          className="absolute right-3 top-3 text-muted-foreground transition-colors hover:text-foreground"
          aria-label="Close tutorial"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="mb-1 flex items-center gap-2">
          <div className="flex items-center gap-1">
            {TUTORIAL_STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 w-6 rounded-full transition-colors ${
                  i <= tutorialStep ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>
          <span className="text-[10px] text-muted-foreground">
            {tutorialStep + 1} of {TUTORIAL_STEPS.length}
          </span>
        </div>

        <h3 className="mt-2 text-sm font-semibold text-foreground">
          {step.title}
        </h3>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          {step.description}
        </p>

        <div className="mt-4 flex items-center justify-between">
          <button
            onClick={() => setShowTutorial(false)}
            className="text-xs text-muted-foreground underline-offset-2 hover:underline"
          >
            Skip Tutorial
          </button>
          <button
            onClick={() => {
              if (isLast) {
                setShowTutorial(false)
              } else {
                setTutorialStep(tutorialStep + 1)
              }
            }}
            className="rounded-lg bg-primary px-4 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {isLast ? "Get Started" : "Next"}
          </button>
        </div>
      </div>
    </div>
  )
}
