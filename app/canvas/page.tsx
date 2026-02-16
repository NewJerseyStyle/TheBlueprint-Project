"use client"

import { Suspense, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { useCanvasStore } from "@/lib/canvas-store"
import StrategicCanvas from "@/components/canvas/strategic-canvas"
import CanvasHeader from "@/components/canvas/canvas-header"
import NodeDetailPanel from "@/components/canvas/node-detail-panel"
import IntelligencePanel from "@/components/panels/intelligence-panel"
import TrelloPanel from "@/components/panels/trello-panel"
import StartupPrompt from "@/components/notifications/startup-prompt"
import TutorialOverlay from "@/components/canvas/tutorial-overlay"

function CanvasContent() {
  const searchParams = useSearchParams()
  const {
    loadTutorialCanvas,
    loadBlankCanvas,
    selectedNodeId,
    showIntelligence,
    showTrelloFor,
  } = useCanvasStore()

  useEffect(() => {
    const mode = searchParams.get("mode")
    if (mode === "tutorial") {
      loadTutorialCanvas()
    } else {
      loadBlankCanvas()
    }
    // Only load on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      <CanvasHeader />
      <div className="relative flex flex-1 overflow-hidden">
        {/* Intelligence Panel (left side) */}
        {showIntelligence && <IntelligencePanel />}

        {/* Main Canvas */}
        <div className="flex-1">
          <StrategicCanvas />
        </div>

        {/* Node Detail Panel (right side) */}
        {selectedNodeId && <NodeDetailPanel />}
      </div>

      {/* Trello Mockup Dialog */}
      {showTrelloFor && <TrelloPanel />}

      {/* Startup Prompt */}
      <StartupPrompt />

      {/* Tutorial Overlay */}
      <TutorialOverlay />
    </>
  )
}

export default function CanvasPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-dvh items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      }
    >
      <CanvasContent />
    </Suspense>
  )
}
