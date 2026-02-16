"use client"

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react"
import {
  useNodesState,
  useEdgesState,
  addEdge,
  type Connection,
  type OnNodesChange,
  type OnEdgesChange,
  type Node,
  type Edge,
} from "@xyflow/react"
import type {
  AppUser,
  CanvasNode,
  StrategicNodeData,
  AppNotification,
  SubscriptionType,
  CanvasRole,
  NodeComment,
  SwimLaneData,
} from "./types"
import {
  MOCK_USERS,
  TUTORIAL_NODES,
  TUTORIAL_EDGES,
  TUTORIAL_SWIM_LANES,
  COORDINATOR_NOTIFICATIONS,
  CONTRIBUTOR_NOTIFICATIONS,
} from "./mock-data"

interface CanvasStoreValue {
  // Users
  currentUser: AppUser
  setCurrentUser: (user: AppUser) => void
  currentRole: CanvasRole
  setCurrentRole: (role: CanvasRole) => void

  // Canvas data
  nodes: Node[]
  edges: Edge[]
  onNodesChange: OnNodesChange
  onEdgesChange: OnEdgesChange
  onConnect: (connection: Connection) => void
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>

  // UI state
  selectedNodeId: string | null
  setSelectedNodeId: (id: string | null) => void
  showIntelligence: boolean
  setShowIntelligence: (show: boolean) => void
  showTrelloFor: string | null
  setShowTrelloFor: (nodeId: string | null) => void

  // Node operations
  addNode: (node: CanvasNode) => void
  updateNodeData: (nodeId: string, data: Partial<StrategicNodeData>) => void
  addComment: (nodeId: string, comment: NodeComment) => void
  changeNodeState: (nodeId: string, newState: StrategicNodeData["state"]) => void
  toggleLaneComments: (laneId: string) => void

  // Notifications
  notifications: AppNotification[]
  subscriptions: Record<SubscriptionType, boolean>
  toggleSubscription: (type: SubscriptionType) => void
  markNotificationRead: (id: string) => void
  hasSeenStartupPrompt: boolean
  setHasSeenStartupPrompt: (v: boolean) => void

  // Tutorial
  isTutorial: boolean
  setIsTutorial: (v: boolean) => void
  tutorialStep: number
  setTutorialStep: (v: number) => void
  showTutorial: boolean
  setShowTutorial: (v: boolean) => void

  // Canvas loading
  loadTutorialCanvas: () => void
  loadBlankCanvas: () => void
}

const CanvasStoreContext = createContext<CanvasStoreValue | null>(null)

export function CanvasStoreProvider({ children }: { children: ReactNode }) {
  // Users
  const [currentUser, setCurrentUser] = useState<AppUser>(MOCK_USERS[0])
  const [currentRole, setCurrentRole] = useState<CanvasRole>("edit")

  // Canvas data
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])

  // When a new connection is drawn, check if the target is a goal node
  // and make the edge dotted, or if the source is a question node
  const onConnect = useCallback(
    (connection: Connection) => {
      const targetNode = nodes.find((n) => n.id === connection.target)
      const sourceNode = nodes.find((n) => n.id === connection.source)
      const targetData = targetNode?.data as unknown as StrategicNodeData | undefined
      const sourceData = sourceNode?.data as unknown as StrategicNodeData | undefined

      const isToGoal = targetData?.state === "goal"
      const isFromDraft = sourceData?.state === "draft"

      setEdges((eds) =>
        addEdge(
          {
            ...connection,
            type: "smoothstep",
            animated: false,
            data: { isPathTBD: isToGoal },
            ...(isToGoal ? {
              label: "path TBD",
              labelStyle: { fontSize: 10, fill: "#f43f5e", fontWeight: "bold" },
              labelBgStyle: { fill: "white", fillOpacity: 0.9 },
              labelBgPadding: [4, 8],
              labelBgBorderRadius: 4,
            } : {}),
            style: {
              stroke: isToGoal ? "#f43f5e" : isFromDraft ? "#94a3b8" : "#94a3b8",
              strokeWidth: isToGoal ? 2 : 1.5,
              // Dotted if connecting to goal or from a draft
              strokeDasharray: isToGoal || isFromDraft ? "8 6" : undefined,
            },
          },
          eds
        )
      )
    },
    [setEdges, nodes]
  )

  // UI state
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [showIntelligence, setShowIntelligence] = useState(false)
  const [showTrelloFor, setShowTrelloFor] = useState<string | null>(null)

  // Notifications
  const [notifications, setNotifications] = useState<AppNotification[]>([
    ...COORDINATOR_NOTIFICATIONS,
    ...CONTRIBUTOR_NOTIFICATIONS,
  ])
  const [subscriptions, setSubscriptions] = useState<
    Record<SubscriptionType, boolean>
  >({
    coordinator: true,
    contributor: true,
  })
  const [hasSeenStartupPrompt, setHasSeenStartupPrompt] = useState(false)

  // Tutorial
  const [isTutorial, setIsTutorial] = useState(false)
  const [tutorialStep, setTutorialStep] = useState(0)
  const [showTutorial, setShowTutorial] = useState(false)

  const toggleSubscription = useCallback((type: SubscriptionType) => {
    setSubscriptions((prev) => ({ ...prev, [type]: !prev[type] }))
  }, [])

  const markNotificationRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
  }, [])

  const addNode = useCallback(
    (node: CanvasNode) => {
      setNodes((prev) => [...prev, node as Node])
    },
    [setNodes]
  )

  const updateNodeData = useCallback(
    (nodeId: string, data: Partial<StrategicNodeData>) => {
      setNodes((prev) =>
        prev.map((n) =>
          n.id === nodeId ? { ...n, data: { ...n.data, ...data } } : n
        )
      )
    },
    [setNodes]
  )

  const addComment = useCallback(
    (nodeId: string, comment: NodeComment) => {
      setNodes((prev) =>
        prev.map((n) =>
          n.id === nodeId
            ? {
                ...n,
                data: {
                  ...n.data,
                  comments: [...((n.data as unknown as StrategicNodeData).comments || []), comment],
                },
              }
            : n
        )
      )

      // Handle Mentions and Notifications
      const mentions = comment.text.match(/@(\w+)/g)
      if (mentions) {
        mentions.forEach((m) => {
          const username = m.substring(1).toLowerCase()
          const mentionedUser = MOCK_USERS.find(
            (u) => u.name.split(" ")[0].toLowerCase() === username || u.id === username
          )

          if (mentionedUser) {
            const newNotification: AppNotification = {
              id: `n-mention-${Date.now()}-${mentionedUser.id}`,
              type: "contributor",
              title: "You were mentioned",
              message: `${comment.userName} mentioned you in a comment: "${comment.text}"`,
              timestamp: new Date().toISOString(),
              read: false,
            }
            setNotifications((prev) => [newNotification, ...prev])
          }
        })
      }

      // Notify others in the thread (Mock)
      setNodes((prev) => {
        const node = prev.find(n => n.id === nodeId)
        if (node) {
          const data = node.data as StrategicNodeData
          const otherUsers = new Set(
            (data.comments || [])
              .map(c => c.userId)
              .filter(id => id !== currentUser.id && id !== comment.userId)
          )

          otherUsers.forEach(userId => {
            const newNotification: AppNotification = {
              id: `n-thread-${Date.now()}-${userId}`,
              type: "contributor",
              title: "New comment in thread",
              message: `${comment.userName} commented on a discussion you're part of: "${nodeId}"`,
              timestamp: new Date().toISOString(),
              read: false,
            }
            setNotifications((prev) => [newNotification, ...prev])
          })
        }
        return prev
      })
    },
    [setNodes, currentUser.id]
  )

  /**
   * Change a node's state and handle edge transitions:
   * - Draft -> Doing: dotted edges from parent become solid animated; dotted line to goal transfers
   * - Any -> History: treat as archived, remove dotted lines to downstream goals
   */
  const changeNodeState = useCallback(
    (nodeId: string, newState: StrategicNodeData["state"]) => {
      setNodes((prev) =>
        prev.map((n) =>
          n.id === nodeId
            ? { ...n, data: { ...n.data, state: newState } }
            : n
        )
      )

      setEdges((prev) => {
        let updated = [...prev]

        if (newState === "doing") {
          // Make incoming edges to this node solid and animated
          updated = updated.map((e) => {
            if (e.target === nodeId) {
              return {
                ...e,
                animated: true,
                style: {
                  ...e.style,
                  stroke: "#14b8a6",
                  strokeWidth: 2,
                  strokeDasharray: undefined,
                },
              }
            }
            return e
          })
          // Make outgoing edges from this node solid
          updated = updated.map((e) => {
            if (e.source === nodeId) {
              return {
                ...e,
                animated: true,
                style: {
                  ...e.style,
                  stroke: "#14b8a6",
                  strokeWidth: 2,
                  strokeDasharray:
                    // Keep dotted if going to goal
                    (prev.find((pe) => pe.id === e.id)?.style as Record<string, unknown>)?.strokeDasharray === "8 6"
                      ? "8 6"
                      : undefined,
                },
              }
            }
            return e
          })
        }

        if (newState === "history") {
          // Archive: remove dotted outgoing edges (the branch is terminated)
          updated = updated.filter((e) => {
            if (e.source === nodeId) {
              const style = e.style as Record<string, unknown> | undefined
              if (style?.strokeDasharray) return false
            }
            return true
          })
          // Make remaining edges to this node grey
          updated = updated.map((e) => {
            if (e.target === nodeId || e.source === nodeId) {
              return {
                ...e,
                animated: false,
                style: { ...e.style, stroke: "#d1d5db", strokeWidth: 1.5 },
              }
            }
            return e
          })
        }

        return updated
      })
    },
    [setNodes, setEdges]
  )

  const toggleLaneComments = useCallback(
    (laneId: string) => {
      setNodes((prev) =>
        prev.map((n) => {
          if (n.id === laneId && n.type === "swimlane") {
            const d = n.data as unknown as SwimLaneData
            return { ...n, data: { ...n.data, showComments: !d.showComments } }
          }
          return n
        })
      )
    },
    [setNodes]
  )

  // Listen for custom event from swim lane toggle button
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail
      if (detail?.laneId) toggleLaneComments(detail.laneId)
    }
    window.addEventListener("toggle-lane-comments", handler)
    return () => window.removeEventListener("toggle-lane-comments", handler)
  }, [toggleLaneComments])

  const loadTutorialCanvas = useCallback(() => {
    const swimLanes = TUTORIAL_SWIM_LANES.map((lane) => ({ ...lane }))
    const strategicNodes = TUTORIAL_NODES.map((node) => ({ ...node }))
    setNodes([...swimLanes, ...strategicNodes] as Node[])
    setEdges(TUTORIAL_EDGES.map((e) => ({ ...e })))
    setIsTutorial(true)
    setShowTutorial(true)
    setTutorialStep(0)
    setHasSeenStartupPrompt(false)
  }, [setNodes, setEdges])

  const loadBlankCanvas = useCallback(() => {
    setNodes([])
    setEdges([])
    setIsTutorial(false)
    setShowTutorial(false)
    setHasSeenStartupPrompt(false)
  }, [setNodes, setEdges])

  return (
    <CanvasStoreContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        currentRole,
        setCurrentRole,
        nodes,
        edges,
        onNodesChange,
        onEdgesChange,
        onConnect,
        setNodes,
        setEdges,
        selectedNodeId,
        setSelectedNodeId,
        showIntelligence,
        setShowIntelligence,
        showTrelloFor,
        setShowTrelloFor,
        addNode,
        updateNodeData,
        addComment,
        changeNodeState,
        toggleLaneComments,
        notifications,
        subscriptions,
        toggleSubscription,
        markNotificationRead,
        hasSeenStartupPrompt,
        setHasSeenStartupPrompt,
        isTutorial,
        setIsTutorial,
        tutorialStep,
        setTutorialStep,
        showTutorial,
        setShowTutorial,
        loadTutorialCanvas,
        loadBlankCanvas,
      }}
    >
      {children}
    </CanvasStoreContext.Provider>
  )
}

export function useCanvasStore(): CanvasStoreValue {
  const ctx = useContext(CanvasStoreContext)
  if (!ctx)
    throw new Error("useCanvasStore must be used within CanvasStoreProvider")
  return ctx
}
