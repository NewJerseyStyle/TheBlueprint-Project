"use client"

import { ReactFlowProvider } from "@xyflow/react"
import { CanvasStoreProvider } from "@/lib/canvas-store"

export default function CanvasLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <CanvasStoreProvider>
      <ReactFlowProvider>
        <div className="flex h-dvh flex-col overflow-hidden">{children}</div>
      </ReactFlowProvider>
    </CanvasStoreProvider>
  )
}
