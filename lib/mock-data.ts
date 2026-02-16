import type {
  AppUser,
  CanvasProject,
  StrategicNode,
  SwimLaneNode,
  AppNotification,
  IntelligenceSuggestion,
  TrelloCardData,
  NodeComment,
} from "./types"
import type { Edge } from "@xyflow/react"

// ── Users ──────────────────────────────────────────────
export const MOCK_USERS: AppUser[] = [
  {
    id: "sarah",
    name: "Sarah Chen",
    email: "sarah@community.org",
    initials: "SC",
    avatarColor: "bg-teal-600",
  },
  {
    id: "david",
    name: "David Park",
    email: "david@community.org",
    initials: "DP",
    avatarColor: "bg-violet-600",
  },
  {
    id: "maria",
    name: "Maria Lopez",
    email: "maria@community.org",
    initials: "ML",
    avatarColor: "bg-amber-600",
  },
]

// ── Projects ───────────────────────────────────────────
export const MOCK_PROJECTS: CanvasProject[] = [
  {
    id: "mvp-planning",
    name: "Strategic Planning Tool MVP",
    description:
      "Planning the next steps for our community planning tool. Evaluating three approaches: Trello-style, interactive canvas, and WikiHow-style.",
    createdAt: "2026-02-10",
    members: [
      { userId: "sarah", role: "edit" },
      { userId: "david", role: "edit" },
      { userId: "maria", role: "view" },
    ],
    isTutorial: true,
  },
  {
    id: "community-garden",
    name: "Community Garden Initiative",
    description:
      "Organize volunteers and resources to build a community garden in the downtown area.",
    createdAt: "2026-01-20",
    members: [
      { userId: "sarah", role: "edit" },
      { userId: "maria", role: "comment" },
    ],
  },
]

// ── Comments ───────────────────────────────────────────
const SAMPLE_COMMENTS: Record<string, NodeComment[]> = {
  "node-begin": [
    {
      id: "c1",
      userId: "sarah",
      userName: "Sarah Chen",
      text: "Let's start by mapping out all the approaches we've discussed.",
      timestamp: "2026-02-10T09:00:00Z",
    },
  ],
  "node-question-approach": [
    {
      id: "cq1",
      userId: "sarah",
      userName: "Sarah Chen",
      text: "Everyone is welcome to propose their ideas here. Just add a draft node!",
      timestamp: "2026-02-10T10:00:00Z",
    },
  ],
  "node-trello": [
    {
      id: "c2",
      userId: "maria",
      userName: "Maria Lopez",
      text: "Trello is familiar to most volunteers, but it might be too rigid for strategic planning.",
      timestamp: "2026-02-11T14:30:00Z",
    },
    {
      id: "c3",
      userId: "sarah",
      userName: "Sarah Chen",
      text: "Agree. Good for task execution but not for the 'big picture' mapping we need.",
      timestamp: "2026-02-11T15:00:00Z",
    },
  ],
  "node-canvas": [
    {
      id: "c4",
      userId: "david",
      userName: "David Park",
      text: "I'm working on the prototype now. The node-based approach lets people see connections between goals.",
      timestamp: "2026-02-12T10:00:00Z",
    },
    {
      id: "c5",
      userId: "sarah",
      userName: "Sarah Chen",
      text: "Looking great! Can we add swim lanes for organizing by team or week?",
      timestamp: "2026-02-12T11:00:00Z",
    },
  ],
  "node-wiki": [
    {
      id: "c6",
      userId: "maria",
      userName: "Maria Lopez",
      text: "WikiHow approach could work well for onboarding new volunteers with step-by-step guides.",
      timestamp: "2026-02-11T16:00:00Z",
    },
  ],
  "node-sys-hybrid": [
    {
      id: "cs1",
      userId: "sarah",
      userName: "Sarah Chen",
      text: "Interesting suggestion from the system. Worth considering the hybrid angle.",
      timestamp: "2026-02-13T10:00:00Z",
    },
  ],
  "node-decide": [
    {
      id: "c7",
      userId: "sarah",
      userName: "Sarah Chen",
      text: "We should aim to make a decision by end of this sprint.",
      timestamp: "2026-02-13T09:00:00Z",
    },
  ],
  "node-goal": [
    {
      id: "c8",
      userId: "sarah",
      userName: "Sarah Chen",
      text: "This is our north star for the next 2 weeks. Everything should point toward a working prototype.",
      timestamp: "2026-02-10T09:30:00Z",
    },
  ],
}

// ── Swim Lanes (left-to-right, 4 columns) ─────────────
// Layout: Each lane is a column. Nodes flow top-to-bottom within each lane.
// Lane widths are generous to prevent overlap.
//
//  | Day 1 Kickoff | Day 2 Proposals | Day 3 Evaluation | Sprint Goal |
//  |   Begin       |  Trello (draft) |  Decide (todo)   |  Goal       |
//  |   Question    |  Canvas (doing) |                  |             |
//  |               |  Wiki (draft)   |                  |             |
//  |               |  Hybrid (sys)   |                  |             |
//

const LANE_GAP = 24
const LANE_HEADER = 44
const COL_W = [320, 320, 320, 320]
const COL_X = [
  0,
  COL_W[0] + LANE_GAP,
  COL_W[0] + COL_W[1] + LANE_GAP * 2,
  COL_W[0] + COL_W[1] + COL_W[2] + LANE_GAP * 3,
]
const LANE_H = 820

export const TUTORIAL_SWIM_LANES: SwimLaneNode[] = [
  {
    id: "lane-day1",
    type: "swimlane",
    position: { x: COL_X[0], y: 0 },
    data: {
      label: "Day 1 - Kickoff",
      orientation: "vertical",
      color: "rgba(14, 165, 233, 0.05)",
      showComments: false,
    },
    style: { width: COL_W[0], height: LANE_H },
  },
  {
    id: "lane-day2",
    type: "swimlane",
    position: { x: COL_X[1], y: 0 },
    data: {
      label: "Day 2 - Proposals",
      orientation: "vertical",
      color: "rgba(139, 92, 246, 0.05)",
      showComments: false,
    },
    style: { width: COL_W[1], height: LANE_H },
  },
  {
    id: "lane-day3",
    type: "swimlane",
    position: { x: COL_X[2], y: 0 },
    data: {
      label: "Day 3 - Evaluation",
      orientation: "vertical",
      color: "rgba(245, 158, 11, 0.05)",
      showComments: false,
    },
    style: { width: COL_W[2], height: LANE_H },
  },
  {
    id: "lane-goal",
    type: "swimlane",
    position: { x: COL_X[3], y: 0 },
    data: {
      label: "Sprint Goal",
      orientation: "vertical",
      color: "rgba(244, 63, 94, 0.05)",
      showComments: false,
    },
    style: { width: COL_W[3], height: LANE_H },
  },
]

// ── Node positioning helpers ───────────────────────────
// All positions are RELATIVE to the parent lane.
const PAD_X = 44 // left padding inside lane
const START_Y = LANE_HEADER + 24 // below lane header
const ROW_GAP = 180 // vertical spacing between rows

export const TUTORIAL_NODES: StrategicNode[] = [
  // ── Day 1: Kickoff ──────────────────────────────────
  {
    id: "node-begin",
    type: "strategic",
    position: { x: PAD_X, y: START_Y },
    parentId: "lane-day1",
    data: {
      title: "Define the tool concept",
      description:
        "Map out the problem space: community volunteers need a simple way to plan strategy without PM training.",
      state: "begin",
      comments: SAMPLE_COMMENTS["node-begin"],
    },
  },
  {
    id: "node-question-approach",
    type: "strategic",
    position: { x: PAD_X - 4, y: START_Y + ROW_GAP },
    parentId: "lane-day1",
    data: {
      title: "Which approach should we build?",
      description:
        "We need to decide how our tool works. Multiple proposals are welcome -- add your draft below!",
      state: "question",
      questionHint:
        "Click + or right-click to propose an approach. Everyone can add drafts!",
      comments: SAMPLE_COMMENTS["node-question-approach"],
    },
  },

  // ── Day 2: Proposals (4 nodes stacked vertically) ───
  {
    id: "node-trello",
    type: "strategic",
    position: { x: PAD_X, y: START_Y },
    parentId: "lane-day2",
    data: {
      title: "Trello-style task board",
      description:
        "Traditional card-based task management. Familiar but may be too linear for strategic mapping.",
      state: "draft",
      comments: SAMPLE_COMMENTS["node-trello"],
    },
  },
  {
    id: "node-canvas",
    type: "strategic",
    position: { x: PAD_X, y: START_Y + ROW_GAP },
    parentId: "lane-day2",
    data: {
      title: "Interactive Canvas (this tool)",
      description:
        "Node-based strategic canvas inspired by Twine. Non-linear mapping of goals and actions.",
      state: "doing",
      assigneeId: "david",
      comments: SAMPLE_COMMENTS["node-canvas"],
    },
  },
  {
    id: "node-wiki",
    type: "strategic",
    position: { x: PAD_X, y: START_Y + ROW_GAP * 2 },
    parentId: "lane-day2",
    data: {
      title: "WikiHow-style webpages",
      description:
        "Step-by-step guide format. Good for documentation but less interactive.",
      state: "draft",
      comments: SAMPLE_COMMENTS["node-wiki"],
    },
  },
  {
    id: "node-sys-hybrid",
    type: "strategic",
    position: { x: PAD_X, y: START_Y + ROW_GAP * 3 },
    parentId: "lane-day2",
    data: {
      title: "Hybrid: Canvas + Wiki onboarding",
      description:
        "Based on 28 similar community projects, combining canvas with step-by-step guides yielded 3x faster onboarding.",
      state: "draft",
      isSystemGenerated: true,
      comments: SAMPLE_COMMENTS["node-sys-hybrid"],
    },
  },

  // ── Day 3: Evaluation ───────────────────────────────
  {
    id: "node-decide",
    type: "strategic",
    position: { x: PAD_X, y: START_Y + ROW_GAP },
    parentId: "lane-day3",
    data: {
      title: "Choose primary approach",
      description:
        "Team decides which approach to prototype first. Consider feedback and feasibility.",
      state: "decision",
      comments: SAMPLE_COMMENTS["node-decide"],
    },
  },

  // ── Sprint Goal ─────────────────────────────────────
  {
    id: "node-goal",
    type: "strategic",
    position: { x: PAD_X, y: START_Y + ROW_GAP },
    parentId: "lane-goal",
    data: {
      title: "Launch MVP prototype",
      description:
        "Ship a working prototype that volunteers can test. This is the north star for the sprint.",
      state: "goal",
      isNextSmallGoal: true,
      comments: SAMPLE_COMMENTS["node-goal"],
    },
  },
]

// ── Tutorial Edges ─────────────────────────────────────
// Edge routing strategy:
//   - Solid = confirmed connection
//   - Animated teal = active work path
//   - Dashed gray = draft / uncertain
//   - Dashed rose = uncertain path to goal
//
// Source handles: Right (default), Bottom ("bottom")
// Target handles: Left (default), Top ("top")
//
// Cross-lane edges exit right of source node -> enter left of target node.
// Intra-lane edges exit bottom -> enter top to keep vertical flow clean.

export const TUTORIAL_EDGES: Edge[] = [
  // ── Day 1: Begin -(down)-> Question ──────────────────
  {
    id: "e-begin-question",
    source: "node-begin",
    sourceHandle: "bottom",
    target: "node-question-approach",
    targetHandle: "top",
    type: "smoothstep",
    style: { stroke: "#0ea5e9", strokeWidth: 2 },
  },

  // ── Day 1 Question -(right)-> Day 2 Proposals ───────
  {
    id: "e-question-trello",
    source: "node-question-approach",
    target: "node-trello",
    type: "smoothstep",
    style: { stroke: "#94a3b8", strokeWidth: 1.5, strokeDasharray: "5 4" },
  },
  {
    id: "e-question-canvas",
    source: "node-question-approach",
    target: "node-canvas",
    type: "smoothstep",
    animated: true,
    style: { stroke: "#14b8a6", strokeWidth: 2 },
  },
  {
    id: "e-question-wiki",
    source: "node-question-approach",
    target: "node-wiki",
    type: "smoothstep",
    style: { stroke: "#94a3b8", strokeWidth: 1.5, strokeDasharray: "5 4" },
  },
  {
    id: "e-question-syshybrid",
    source: "node-question-approach",
    target: "node-sys-hybrid",
    type: "smoothstep",
    style: { stroke: "#94a3b8", strokeWidth: 1.5, strokeDasharray: "5 4" },
  },

  // ── Day 2 Proposals -(right)-> Day 3 Decision ──────
  {
    id: "e-trello-decide",
    source: "node-trello",
    target: "node-decide",
    type: "smoothstep",
    style: { stroke: "#94a3b8", strokeWidth: 1.5, strokeDasharray: "6 4" },
  },
  {
    id: "e-canvas-decide",
    source: "node-canvas",
    target: "node-decide",
    type: "smoothstep",
    animated: true,
    style: { stroke: "#14b8a6", strokeWidth: 2 },
  },
  {
    id: "e-wiki-decide",
    source: "node-wiki",
    target: "node-decide",
    type: "smoothstep",
    style: { stroke: "#94a3b8", strokeWidth: 1.5, strokeDasharray: "6 4" },
  },
  {
    id: "e-syshybrid-decide",
    source: "node-sys-hybrid",
    target: "node-decide",
    type: "smoothstep",
    style: { stroke: "#94a3b8", strokeWidth: 1.5, strokeDasharray: "6 4" },
  },

  // ── Day 3 Decision -(right)-> Sprint Goal ───────────
  {
    id: "e-decide-goal",
    source: "node-decide",
    target: "node-goal",
    type: "smoothstep",
    style: { stroke: "#f43f5e", strokeWidth: 2, strokeDasharray: "8 6" },
    label: "path TBD",
    labelStyle: { fontSize: 10, fill: "#f43f5e" },
    labelBgStyle: { fill: "white", fillOpacity: 0.8 },
    labelBgPadding: [4, 8] as [number, number],
    labelBgBorderRadius: 4,
  },
]

// ── Intelligence Suggestions ───────────────────────────
export const INTELLIGENCE_SUGGESTIONS: IntelligenceSuggestion[] = [
  {
    id: "intel-1",
    text: "Community projects with similar scope achieved 73% completion when using weekly check-ins with all contributors.",
    confidence: "Based on 47 similar projects",
    category: "Process",
  },
  {
    id: "intel-2",
    text: "Projects at your stage typically benefit from identifying a 'Quick Win' within 2 weeks to build momentum.",
    confidence: "Based on 62 similar projects",
    category: "Strategy",
  },
  {
    id: "intel-3",
    text: "The interactive canvas approach shows 2.4x higher volunteer engagement compared to traditional task boards in similar community orgs.",
    confidence: "Based on 31 similar projects",
    category: "Approach",
  },
  {
    id: "intel-4",
    text: "Consider combining WikiHow-style documentation with the canvas for onboarding -- similar projects reported 3x faster volunteer ramp-up.",
    confidence: "Based on 28 similar projects",
    category: "Onboarding",
  },
]

// ── Trello Card Mockup ─────────────────────────────────
export const TRELLO_CARD_DATA: Record<string, TrelloCardData> = {
  "node-canvas": {
    title: "Interactive Canvas (this tool)",
    list: "In Progress",
    description:
      "Build the node-based strategic planning canvas. Inspired by Twine's non-linear story editor. Should allow dragging, connecting, and annotating strategic nodes.",
    checklist: [
      { text: "Set up React Flow canvas", done: true },
      { text: "Create custom node components", done: true },
      { text: "Add swim lane support", done: false },
      { text: "Implement node detail panel", done: false },
    ],
    labels: [
      { text: "MVP", color: "bg-teal-500" },
      { text: "High Priority", color: "bg-rose-500" },
    ],
    members: ["david", "sarah"],
    dueDate: "Feb 28, 2026",
    activity: [
      {
        user: "David Park",
        text: "moved this card from To Do to In Progress",
        time: "2 days ago",
      },
      {
        user: "Sarah Chen",
        text: "added checklist 'Implementation Steps'",
        time: "3 days ago",
      },
      {
        user: "David Park",
        text: "joined this card",
        time: "5 days ago",
      },
    ],
  },
  default: {
    title: "Strategic Task",
    list: "To Do",
    description: "This task was converted from a strategic planning node.",
    checklist: [
      { text: "Define requirements", done: false },
      { text: "Assign team members", done: false },
      { text: "Set deadline", done: false },
    ],
    labels: [{ text: "Planning", color: "bg-sky-500" }],
    members: ["sarah"],
    dueDate: "Mar 15, 2026",
    activity: [
      {
        user: "Sarah Chen",
        text: "created this card",
        time: "Just now",
      },
    ],
  },
}

// ── Notifications ──────────────────────────────────────
export const COORDINATOR_NOTIFICATIONS: AppNotification[] = [
  {
    id: "n1",
    type: "coordinator",
    title: "Recognize a contributor",
    message:
      "David has been working on the Interactive Canvas for 3 consecutive days. Consider acknowledging his progress in the next standup!",
    timestamp: "2026-02-15T08:00:00Z",
    read: false,
  },
  {
    id: "n2",
    type: "coordinator",
    title: "Meeting facilitation tip",
    message:
      "Try the 'Round Robin' technique in your next meeting to ensure all volunteers have a voice. Each person shares one update in sequence.",
    timestamp: "2026-02-14T08:00:00Z",
    read: false,
  },
  {
    id: "n3",
    type: "coordinator",
    title: "Stale nodes detected",
    message:
      "2 nodes in 'Ideation' lane haven't been updated in 5+ days. Consider checking in on 'Trello-style task board' and 'WikiHow-style webpages'.",
    timestamp: "2026-02-14T08:00:00Z",
    read: true,
  },
]

export const CONTRIBUTOR_NOTIFICATIONS: AppNotification[] = [
  {
    id: "n4",
    type: "contributor",
    title: "Your task update",
    message:
      "You have 1 action item in 'Doing' state: 'Interactive Canvas (this tool)'. Keep up the great work!",
    timestamp: "2026-02-15T08:00:00Z",
    read: false,
  },
  {
    id: "n5",
    type: "contributor",
    title: "Reward unlocked!",
    message:
      "You've contributed for 3 consecutive weeks! You earned the 'Consistent Contributor' badge.",
    timestamp: "2026-02-14T08:00:00Z",
    read: false,
  },
  {
    id: "n6",
    type: "contributor",
    title: "Team priority reminder",
    message:
      "The 'Launch MVP prototype' goal is the current team focus. Your work on the Canvas tool feeds directly into this.",
    timestamp: "2026-02-13T08:00:00Z",
    read: true,
  },
]

// ── Tutorial Steps ─────────────────────────────────────
export const TUTORIAL_STEPS = [
  {
    title: "Welcome to ImpactMap",
    description:
      "This is your strategic canvas. Each card represents a goal, idea, or action in your project plan.",
  },
  {
    title: "Node States",
    description:
      "Nodes have different states and colors: dashed translucent cards are Drafts (proposals), teal cards are Doing (active work), amber cards are Decisions (todos), and the pulsing card is your Next Small Goal.",
  },
  {
    title: "Question Nodes",
    description:
      "Purple question nodes are branching points where multiple draft proposals are expected. Anyone can propose a new path by adding a Draft node below.",
  },
  {
    title: "System Suggestions",
    description:
      "Nodes marked with a sparkle icon are drafted by the system based on historical project data. They're suggestions from similar community projects.",
  },
  {
    title: "Swim Lanes",
    description:
      "Nodes are organized in swim lanes like 'Ideation' and 'Execution'. Toggle the comment view on a lane to see all threads in a forum-style layout.",
  },
  {
    title: "Dotted Lines to Goals",
    description:
      "Dotted lines show uncertain paths. When a draft becomes an action, the dotted line becomes solid. If a branch is archived, the dotted path to the goal is removed.",
  },
  {
    title: "Creating Nodes & Suggestions",
    description:
      "Nodes are always connected. Click the pulsing + button to see AI suggestions for your next step. These are based on historical successes from similar community projects (Monte Carlo Tree Search vision).",
  },
  {
    title: "Coordination Tips",
    description:
      "For non-technical users, we provide coordination tips. Look for the 'Sparkle' icon on active nodes to see how you can best support your team (e.g., acknowledging progress).",
  },
  {
    title: "Interact & Explore",
    description:
      "Click any node to see details and comments. Use the toolbar to add Begin/Goal points and Swim Lanes. Everything else grows from your existing plan.",
  },
]
