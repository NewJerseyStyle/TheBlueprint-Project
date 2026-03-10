"use client"

import { useEffect, useRef } from "react"
import { driver, type Driver } from "driver.js"
import { useCanvasStore } from "@/lib/canvas-store"

export default function InteractiveTutorial() {
  const { 
    showTutorial, 
    setShowTutorial, 
    interactiveTutorialStep, 
    setInteractiveTutorialStep,
    nodes,
    selectedNodeId,
    edges
  } = useCanvasStore()
  
  const driverRef = useRef<Driver | null>(null)

  // Initialize and Sync driver
  useEffect(() => {
    if (showTutorial && !driverRef.current) {
      driverRef.current = driver({
        showProgress: true,
        allowClose: true,
        onDestroyed: () => {
          setShowTutorial(false)
        },
        steps: [
          {
            element: "#toolbar-add-begin",
            popover: {
              title: "Step 1: Start your plan",
              description: "Every strategy starts with a point of origin. Click 'Begin' to place your first node on the canvas.",
              side: "bottom",
              align: "start"
            }
          },
          {
            popover: {
              title: "Step 2: Name your starting point",
              description: "Great! Now click on the node you just created to see its details and give it a name like 'Launch Community Garden'.",
              side: "left",
              align: "start"
            }
          },
          {
            element: "#node-title-input",
            popover: {
              title: "Step 3: Define the Goal",
              description: "Type a name for your node here. This helps your team understand what we're starting with.",
              side: "left",
              align: "start"
            }
          },
          {
            popover: {
              title: "Step 4: Explore Next Steps",
              description: "Strategies grow from existing ideas. Click the '+' button on your node to see AI-suggested next steps.",
              side: "right",
              align: "start"
            }
          },
          {
            popover: {
              title: "Step 5: Choose a Path",
              description: "These translucent 'Ghost Nodes' are suggestions. Click one of them to commit it as a real part of your plan.",
              side: "bottom",
              align: "start"
            }
          },
          {
            element: "#state-button-doing",
            popover: {
              title: "Step 6: Start Active Work",
              description: "Ideas are drafts until we act. Change this node's state to 'Doing' to show it's currently being worked on.",
              side: "left",
              align: "start"
            }
          },
          {
            element: "#toolbar-add-goal",
            popover: {
              title: "Step 7: Set a Target",
              description: "Every plan needs a destination. Add a 'Goal' node to mark your ultimate success point.",
              side: "bottom",
              align: "start"
            }
          },
          {
            popover: {
              title: "Step 8: Connect the Dots",
              description: "Finally, connect your active work to the goal. Drag an arrow from the right handle of your node to the left handle of the Goal node.",
              side: "top",
              align: "start"
            }
          },
          {
            popover: {
              title: "Tutorial Complete!",
              description: "You've built your first strategic flow. This non-linear map helps everyone see how small actions lead to big goals.",
              side: "bottom",
              align: "start"
            }
          }
        ]
      })
    }

    if (showTutorial && driverRef.current) {
      driverRef.current.drive(interactiveTutorialStep)
    } else if (!showTutorial && driverRef.current) {
      driverRef.current.destroy()
      driverRef.current = null
    }
    
    return () => {
      if (driverRef.current) {
        // We don't destroy on every re-render, only when component unmounts
      }
    }
  }, [showTutorial, setShowTutorial, interactiveTutorialStep])

  // Observe state to advance tutorial
  useEffect(() => {
    if (!showTutorial) return

    const beginNode = nodes.find(n => n.data.state === "begin")
    const goalNode = nodes.find(n => n.data.state === "goal")
    const ghostNodes = nodes.filter(n => n.data.isGhost)
    const realizedNode = nodes.find(n => n.id.startsWith("node-child-") && !n.data.isGhost)
    
    // Step 0 -> 1: Begin node added
    if (interactiveTutorialStep === 0 && beginNode) {
      setInteractiveTutorialStep(1)
    }

    // Step 1 -> 2: Begin node selected
    if (interactiveTutorialStep === 1 && selectedNodeId === beginNode?.id) {
      setInteractiveTutorialStep(2)
    }

    // Step 2 -> 3: Title changed from default
    if (interactiveTutorialStep === 2 && beginNode && beginNode.data.title !== "New starting point") {
      setInteractiveTutorialStep(3)
    }

    // Step 3 -> 4: Suggestion button clicked (ghost nodes exist)
    if (interactiveTutorialStep === 3 && ghostNodes.length > 0) {
      setInteractiveTutorialStep(4)
    }

    // Step 4 -> 5: Ghost node realized
    if (interactiveTutorialStep === 4 && realizedNode) {
      setInteractiveTutorialStep(5)
    }

    // Step 5 -> 6: State changed to 'doing'
    if (interactiveTutorialStep === 5 && realizedNode?.data.state === "doing") {
      setInteractiveTutorialStep(6)
    }

    // Step 6 -> 7: Goal node added
    if (interactiveTutorialStep === 6 && goalNode) {
      setInteractiveTutorialStep(7)
    }

    // Step 7 -> 8: Edge created to goal
    if (interactiveTutorialStep === 7 && edges.some(e => e.target === goalNode?.id)) {
      setInteractiveTutorialStep(8)
    }

  }, [nodes, edges, selectedNodeId, interactiveTutorialStep, setInteractiveTutorialStep, showTutorial])

  return null
}
