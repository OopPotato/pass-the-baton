import React, { useState } from "react"
import { useAppContext } from "../contexts/AppContext"
import { Calendar, User, ChevronLeft, ChevronRight, TrendingUp, Layers } from "lucide-react"
import { cn } from "../lib/utils"

const getDotColor = (taskName) => {
  if (taskName?.toLowerCase().includes("lawsuit") || taskName?.toLowerCase().includes("response")) return "bg-red-500"
  if (taskName?.toLowerCase().includes("timesheet") || taskName?.toLowerCase().includes("audit")) return "bg-green-500"
  if (taskName?.toLowerCase().includes("review") || taskName?.toLowerCase().includes("diligence")) return "bg-blue-500"
  return "bg-slate-500"
}

const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case "urgent": return "bg-red-100 text-red-700 border-red-200"
    case "completed": return "bg-green-100 text-green-700 border-green-200"
    case "pending": return "bg-blue-100 text-blue-700 border-blue-200"
    default: return "bg-slate-100 text-slate-600 border-slate-200"
  }
}

// ── Stacked card carousel for a single column ──
function TaskStack({ tasks, colName }) {
  const [activeIdx, setActiveIdx] = useState(0)
  const total = tasks.length

  if (total === 0) {
    return (
      <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-xl text-sm text-slate-400 bg-slate-50/50">
        No active tasks
      </div>
    )
  }

  const task = tasks[activeIdx]

  const prev = () => setActiveIdx(i => (i - 1 + total) % total)
  const next = () => setActiveIdx(i => (i + 1) % total)

  return (
    <div className="relative">
      {/* Stack shadow layers behind the active card */}
      {total > 2 && (
        <div className="absolute inset-x-5 bottom-0 h-full bg-slate-200 rounded-xl transform translate-y-3 scale-[0.92] -z-10" />
      )}
      {total > 1 && (
        <div className="absolute inset-x-3 bottom-0 h-full bg-slate-100 border border-slate-200 rounded-xl transform translate-y-1.5 scale-[0.96] -z-10" />
      )}

      {/* Active card — with key for slide-in animation */}
      <div
        key={activeIdx}
        className="bg-white border border-slate-200 shadow-md rounded-xl p-4 flex flex-col gap-3 animate-slide-in"
      >
        {/* Status badge + dot */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className={cn("w-2 h-2 rounded-full shrink-0 mt-0.5", getDotColor(task.task))} />
            <h4 className="font-semibold text-sm leading-tight text-slate-900 line-clamp-2">{task.task}</h4>
          </div>
          <span className={cn("inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium shrink-0 capitalize", getStatusColor(task.status))}>
            {task.status}
          </span>
        </div>

        {/* Matter reference */}
        <p className="text-xs text-slate-500 pl-4 truncate">{task.matter}</p>

        {/* Footer row */}
        <div className="flex items-center justify-between border-t border-slate-50 pt-2.5">
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              <span>{task.date}</span>
            </div>
            <div className="flex items-center gap-1.5 pl-2 border-l border-slate-100">
              <User className="h-3.5 w-3.5" />
              <span className="truncate max-w-[70px]">{task.from}</span>
            </div>
          </div>

          {/* Only show nav if multiple tasks */}
          {total > 1 && (
            <div className="flex items-center gap-1">
              <button
                onClick={prev}
                className="h-6 w-6 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
                aria-label="Previous task"
              >
                <ChevronLeft className="h-3.5 w-3.5 text-slate-500" />
              </button>
              <span className="text-[10px] font-semibold text-slate-400 tabular-nums px-0.5">
                {activeIdx + 1}/{total}
              </span>
              <button
                onClick={next}
                className="h-6 w-6 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
                aria-label="Next task"
              >
                <ChevronRight className="h-3.5 w-3.5 text-slate-500" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Dot indicators for stacks > 1 */}
      {total > 1 && (
        <div className="flex justify-center gap-1 mt-3">
          {tasks.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveIdx(i)}
              className={cn(
                "h-1.5 rounded-full transition-all duration-200",
                i === activeIdx ? "w-4 bg-slate-700" : "w-1.5 bg-slate-300 hover:bg-slate-400"
              )}
              aria-label={`Go to task ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default function Workload() {
  const { handoffs, users } = useAppContext()

  const columns = [
    { id: "unassigned", name: "Unassigned", initial: "?", tasks: handoffs.filter(h => h.to === "Unassigned" || !h.to) },
    ...users.map(u => ({
      id: u.id,
      name: u.name,
      initial: u.name.charAt(0).toUpperCase(),
      tasks: handoffs.filter(h => h.to === u.name)
    }))
  ]

  const totalTasks = handoffs.length
  const urgentTasks = handoffs.filter(h => h.status?.toLowerCase() === "urgent").length
  const completedTasks = handoffs.filter(h => h.status?.toLowerCase() === "completed").length

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Workload by Owner</h1>
          <p className="text-muted-foreground mt-1">
            Monitor task distribution and pending handoffs across the team.
          </p>
        </div>
        {totalTasks > 0 && (
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-sm font-medium text-slate-700">
              <TrendingUp className="h-3.5 w-3.5" />
              {totalTasks} Total
            </div>
            {urgentTasks > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-50 text-sm font-medium text-red-600">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                {urgentTasks} Urgent
              </div>
            )}
            {completedTasks > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-50 text-sm font-medium text-green-600">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                {completedTasks} Done
              </div>
            )}
          </div>
        )}
      </div>

      {/* Empty state */}
      {totalTasks === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="h-16 w-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
            <Layers className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-700">No batons in play</h3>
          <p className="text-sm text-slate-400 mt-1 max-w-xs">
            Pass the baton on a case and it will show here by assignee.
          </p>
        </div>
      )}

      {/* 4-column grid — cards stack & animate per user */}
      {totalTasks > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {columns.map(col => (
            <div key={col.id} className="flex flex-col gap-3 min-w-0">

              {/* Column header */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center gap-3 shadow-sm">
                <div className="h-10 w-10 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-sm shrink-0">
                  {col.initial}
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-slate-900 text-sm truncate">{col.name}</h3>
                  <p className="text-xs text-slate-500">
                    {col.tasks.length} baton{col.tasks.length !== 1 ? "s" : ""}
                  </p>
                </div>
                {col.tasks.length > 1 && (
                  <div className="ml-auto">
                    <Layers className="h-4 w-4 text-slate-400" />
                  </div>
                )}
              </div>

              {/* Stacked animated card area */}
              <TaskStack tasks={col.tasks} colName={col.name} />

            </div>
          ))}
        </div>
      )}
    </div>
  )
}
