import React, { useMemo } from "react"
import { useAppContext } from "../contexts/AppContext"
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { Button } from "../components/ui/button"
import { Lightbulb, Users, AlertTriangle, TrendingUp, ArrowRight, CheckCircle2, Clock, Zap } from "lucide-react"
import { cn } from "../lib/utils"

// Simple rule-based recommendation engine (no AI required)
function generateRecommendations(matters, handoffs, users) {
  const recommendations = []

  // Rule 1: Detect overloaded attorneys
  const taskCounts = {}
  users.forEach(u => { taskCounts[u.name] = handoffs.filter(h => h.to === u.name && h.status !== "completed").length })
  const avgLoad = Object.values(taskCounts).reduce((a, b) => a + b, 0) / users.length || 0

  users.forEach(u => {
    if (taskCounts[u.name] > avgLoad + 1) {
      recommendations.push({
        id: `overload-${u.id}`,
        type: "warning",
        title: `${u.name} is overloaded`,
        body: `${u.name} has ${taskCounts[u.name]} active batons — ${Math.round(taskCounts[u.name] - avgLoad)} more than the team average. Consider reassigning tasks to balance workload.`,
        action: "Reassign a baton",
        priority: "high",
        icon: AlertTriangle,
      })
    }
  })

  // Rule 2: Detect urgently idle attorneys (low workload)
  users.forEach(u => {
    if (taskCounts[u.name] === 0 && handoffs.length > 0) {
      recommendations.push({
        id: `idle-${u.id}`,
        type: "info",
        title: `${u.name} has capacity`,
        body: `${u.name} has no active batons right now and is available to be assigned new tasks. Consider delegating pending matters.`,
        action: "Assign a baton",
        priority: "medium",
        icon: Zap,
      })
    }
  })

  // Rule 3: Detect matters stuck in the same status for a long time
  const stalledMatters = matters.filter(m => {
    const updatedAt = new Date(m.updated)
    const daysSinceUpdate = (Date.now() - updatedAt.getTime()) / (1000 * 60 * 60 * 24)
    return daysSinceUpdate > 5 && m.status !== "Settled" && m.status !== "Completed"
  })

  stalledMatters.forEach(m => {
    recommendations.push({
      id: `stalled-${m.id}`,
      type: "warning",
      title: `"${m.name}" may be stalled`,
      body: `This matter hasn't had an update in over 5 days and is still in "${m.status}" status. Consider scheduling a review or reassigning a task to move it forward.`,
      action: "Review matter",
      priority: "high",
      icon: Clock,
    })
  })

  // Rule 4: Suggest round-robin distribution if no rules apply
  if (recommendations.length === 0) {
    recommendations.push({
      id: "balanced",
      type: "success",
      title: "Workload is well balanced!",
      body: `All ${users.length} team members have a comparable number of active tasks. No immediate redistributions required.`,
      action: null,
      priority: "low",
      icon: CheckCircle2,
    })
  }

  // Rule 5: Always add a consistent best-practice tip
  recommendations.push({
    id: "tip-handoff",
    type: "tip",
    title: "Tip: Use the Baton for context handoffs",
    body: "When handing off a matter to another attorney, make sure to include a brief context summary so the next person can pick up right where you left off without delays.",
    action: null,
    priority: "low",
    icon: Lightbulb,
  })

  return recommendations
}

const typeConfig = {
  warning: {
    border: "border-amber-300",
    bg: "bg-amber-50",
    icon: "text-amber-500",
    badge: "warning",
    label: "Action Needed",
  },
  info: {
    border: "border-blue-300",
    bg: "bg-blue-50",
    icon: "text-blue-500",
    badge: "info",
    label: "Opportunity",
  },
  success: {
    border: "border-green-300",
    bg: "bg-green-50",
    icon: "text-green-600",
    badge: "success",
    label: "All Good",
  },
  tip: {
    border: "border-purple-200",
    bg: "bg-purple-50",
    icon: "text-purple-500",
    badge: "default",
    label: "Best Practice",
  },
}

export default function Recommendations() {
  const { matters, handoffs, users } = useAppContext()

  const recommendations = useMemo(
    () => generateRecommendations(matters, handoffs, users),
    [matters, handoffs, users]
  )

  const highPriority = recommendations.filter(r => r.priority === "high")
  const otherRecs = recommendations.filter(r => r.priority !== "high")

  // Workload summary per user
  const taskCounts = users.map(u => ({
    name: u.name,
    count: handoffs.filter(h => h.to === u.name && h.status !== "completed").length,
    initial: u.name.charAt(0).toUpperCase(),
  }))

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Recommendations</h1>
          <p className="text-muted-foreground mt-1">
            Smart, rule-based suggestions to keep your firm running smoothly.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-purple-50 border border-purple-200">
          <Lightbulb className="h-4 w-4 text-purple-500" />
          <span className="text-sm font-medium text-purple-700">{recommendations.length} insights today</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Recommendations Column */}
        <div className="lg:col-span-2 space-y-4">

          {highPriority.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                Needs Attention
              </h2>
              {highPriority.map(rec => {
                const config = typeConfig[rec.type]
                const Icon = rec.icon
                return (
                  <div key={rec.id} className={cn("rounded-xl border-l-4 p-5 flex gap-4 shadow-sm", config.border, config.bg)}>
                    <div className={cn("mt-0.5 shrink-0", config.icon)}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <h3 className="font-semibold text-slate-900 text-sm">{rec.title}</h3>
                        <Badge variant={config.badge} className="text-xs">{config.label}</Badge>
                      </div>
                      <p className="text-sm text-slate-600 leading-relaxed">{rec.body}</p>
                      {rec.action && (
                        <button className={cn("text-xs font-semibold flex items-center gap-1 hover:underline mt-1", config.icon)}>
                          {rec.action}
                          <ArrowRight className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {otherRecs.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-500" />
                Other Insights
              </h2>
              {otherRecs.map(rec => {
                const config = typeConfig[rec.type]
                const Icon = rec.icon
                return (
                  <div key={rec.id} className={cn("rounded-xl border-l-4 p-5 flex gap-4 shadow-sm", config.border, config.bg)}>
                    <div className={cn("mt-0.5 shrink-0", config.icon)}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <h3 className="font-semibold text-slate-900 text-sm">{rec.title}</h3>
                        <Badge variant={config.badge} className="text-xs">{config.label}</Badge>
                      </div>
                      <p className="text-sm text-slate-600 leading-relaxed">{rec.body}</p>
                      {rec.action && (
                        <button className={cn("text-xs font-semibold flex items-center gap-1 hover:underline mt-1", config.icon)}>
                          {rec.action}
                          <ArrowRight className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

        </div>

        {/* Right: Workload Snapshot Sidebar */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
            <Users className="h-4 w-4 text-slate-400" />
            Workload Snapshot
          </h2>
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="pt-5 space-y-4">
              {taskCounts.map(({ name, count, initial }) => {
                const maxCount = Math.max(...taskCounts.map(t => t.count), 1)
                const pct = Math.round((count / maxCount) * 100)
                return (
                  <div key={name} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs font-bold shrink-0">
                          {initial}
                        </div>
                        <span className="font-medium text-slate-700">{name}</span>
                      </div>
                      <span className="text-slate-500 font-medium tabular-nums">{count}</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5">
                      <div
                        className={cn("h-1.5 rounded-full transition-all duration-500", count > 1 ? "bg-amber-400" : "bg-blue-400")}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm bg-slate-50">
            <CardContent className="pt-5">
              <p className="text-xs text-slate-500 leading-relaxed">
                <strong className="text-slate-700">How does this work?</strong> These recommendations are generated using <strong className="text-slate-700">rule-based analysis</strong> of your case data — checking for overloaded attorneys, stalled matters, idle capacity, and best practices. Once connected to the database, recommendations will update in real-time.
              </p>
            </CardContent>
          </Card>

        </div>
      </div>

    </div>
  )
}
