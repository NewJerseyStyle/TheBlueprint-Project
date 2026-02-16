import {
  Map,
  ArrowRight,
  BookOpen,
  Plus,
  Target,
  Users,
  Zap,
  Sparkles,
} from "lucide-react"
import Link from "next/link"

const FEATURES = [
  {
    icon: Target,
    title: "Visual Strategy Canvas",
    description:
      "Map your goals, ideas, and actions on an interactive canvas. See the big picture at a glance.",
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description:
      "Assign roles, leave comments, and keep everyone aligned with swim lanes and shared views.",
  },
  {
    icon: Zap,
    title: "Execution Bridge",
    description:
      "Turn strategic nodes into actionable tasks with Trello integration for real progress tracking.",
  },
  {
    icon: Sparkles,
    title: "Actionable Intelligence",
    description:
      "Get data-driven suggestions based on similar community projects to guide your next steps.",
  },
]

export default function Page() {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-border px-6 py-4">
        <div className="flex items-center gap-2">
          <Map className="h-5 w-5 text-primary" />
          <span className="text-lg font-bold text-foreground">ImpactMap</span>
        </div>
        <p className="hidden text-xs text-muted-foreground sm:block">
          GPS for Social Impact
        </p>
      </header>

      {/* Hero */}
      <main className="flex flex-1 flex-col">
        <section className="flex flex-1 flex-col items-center justify-center px-6 py-16">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <Sparkles className="h-3 w-3" />
              Strategic Planning for Everyone
            </div>
            <h1 className="text-balance text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl">
              Turn passion into a concrete, executable roadmap
            </h1>
            <p className="mx-auto mt-4 max-w-lg text-pretty text-sm leading-relaxed text-muted-foreground">
              ImpactMap helps community volunteers visualize goals and determine
              strategic next steps -- no formal project management training
              required.
            </p>

            {/* Action Cards */}
            <div className="mx-auto mt-10 grid max-w-lg gap-4 sm:grid-cols-2">
              <Link
                href="/canvas?mode=tutorial"
                className="group flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-6 shadow-sm transition-all hover:border-primary hover:shadow-md"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    Start Tutorial
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    See a pre-built example with guided walkthrough
                  </p>
                </div>
                <span className="flex items-center gap-1 text-xs font-medium text-primary">
                  Launch tutorial <ArrowRight className="h-3 w-3" />
                </span>
              </Link>

              <Link
                href="/canvas?mode=blank"
                className="group flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-6 shadow-sm transition-all hover:border-primary hover:shadow-md"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-muted-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <Plus className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    Blank Canvas
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Start fresh with an empty strategic canvas
                  </p>
                </div>
                <span className="flex items-center gap-1 text-xs font-medium text-primary">
                  Create new <ArrowRight className="h-3 w-3" />
                </span>
              </Link>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="border-t border-border bg-card px-6 py-12">
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-8 text-center text-lg font-semibold text-foreground">
              How ImpactMap works
            </h2>
            <div className="grid gap-6 sm:grid-cols-2">
              {FEATURES.map((feature) => (
                <div key={feature.title} className="flex gap-3">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <feature.icon className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">
                      {feature.title}
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-4">
        <p className="text-center text-[10px] text-muted-foreground">
          ImpactMap MVP -- Democratizing Strategic Planning for Community Impact
        </p>
      </footer>
    </div>
  )
}
