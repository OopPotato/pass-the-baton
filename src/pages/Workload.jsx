import React from "react"
import { useAppContext } from "../contexts/AppContext"
import { Calendar, User, TrendingUp } from "lucide-react"
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

export default function Workload() {
  const { handoffs, users } = useAppContext()

  // Generate workload columns dynamically. Max 4 per row via CSS grid.
  const columns = [
    { id: "unassigned", name: "Unassigned", initial: "?", tasks: handoffs.filter(h => h.to === "Unassigned") },
    ...users.map(u => ({
      id: u.id,
      name: u.name,
      initial: u.name.charAt(0).toUpperCase(),
      tasks: handoffs.filter(h => h.to === u.name)
    }))
  ]

  // Summary totals
  const totalTasks = handoffs.length
  const urgentTasks = handoffs.filter(h => h.status?.toLowerCase() === "urgent").length
  const completedTasks = handoffs.filter(h => h.status?.toLowerCase() === "completed").length

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Workload by Owner</h1>
          <p className="text-muted-foreground mt-1">
            Monitor task distribution and pending handoffs across the team.
          </p>
        </div>

        {/* Summary chips */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-sm font-medium text-slate-700">
            <TrendingUp className="h-3.5 w-3.5" />
            {totalTasks} Total
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-50 text-sm font-medium text-red-600">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            {urgentTasks} Urgent
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-50 text-sm font-medium text-green-600">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            {completedTasks} Done
          </div>
        </div>
      </div>

      {/* ── Grid: max 4 columns per row, wraps automatically ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {columns.map(col => (
          <div key={col.id} className="flex flex-col gap-3 min-w-0">
            
            {/* Column Header */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center gap-3 shadow-sm">
              <div className="h-10 w-10 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-sm shrink-0">
                {col.initial}
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-slate-900 text-sm truncate">{col.name}</h3>
                <p className="text-xs text-slate-500">{col.tasks.length} baton{col.tasks.length !== 1 ? "s" : ""}</p>
              </div>
            </div>

            {/* Task Cards */}
            <div className="flex flex-col gap-2.5">
              {col.tasks.length === 0 ? (
                <div className="text-center py-6 border-2 border-dashed border-slate-200 rounded-xl text-sm text-slate-400 bg-slate-50/50">
                  No active tasks
                </div>
              ) : (
                col.tasks.map(task => (
                  <div key={task.id} className="bg-white border border-slate-100 shadow-sm rounded-xl p-4 flex flex-col gap-3 hover:shadow-md hover:border-slate-200 transition-all duration-150">
                    
                    {/* Top: Dot + Title + Status Pill */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className={cn("w-2 h-2 rounded-full shrink-0 mt-0.5", getDotColor(task.task))} />
                        <h4 className="font-semibold text-sm leading-tight text-slate-900 truncate">{task.task}</h4>
                      </div>
                      <span className={cn("inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium shrink-0 capitalize", getStatusColor(task.status))}>
                        {task.status}
                      </span>
                    </div>

                    {/* Matter Reference */}
                    <p className="text-xs text-slate-500 pl-4 truncate">{task.matter}</p>

                    {/* Footer: Date & Assignee */}
                    <div className="flex items-center gap-3 border-t border-slate-50 pt-2.5 text-xs text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{task.date}</span>
                      </div>
                      <div className="flex items-center gap-1.5 pl-2 border-l border-slate-100">
                        <User className="h-3.5 w-3.5" />
                        <span className="truncate">{task.from}</span>
                      </div>
                    </div>

                  </div>
                ))
              )}
            </div>

          </div>
        ))}
      </div>

    </div>
  )
}
