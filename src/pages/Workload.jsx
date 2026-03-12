import React from "react"
import { useAppContext } from "../contexts/AppContext"
import { Calendar, User } from "lucide-react"
import { cn } from "../lib/utils"

// Helper to determine dot color based on task type or string matches
const getDotColor = (taskName) => {
  if (taskName?.toLowerCase().includes("lawsuit") || taskName?.toLowerCase().includes("response")) return "bg-red-500"
  if (taskName?.toLowerCase().includes("timesheet") || taskName?.toLowerCase().includes("audit")) return "bg-green-500"
  if (taskName?.toLowerCase().includes("review") || taskName?.toLowerCase().includes("diligence")) return "bg-blue-500"
  return "bg-slate-500"
}

export default function Workload() {
  const { handoffs, users } = useAppContext()

  // Generate workload columns dynamically. 
  // We'll append "Unassigned" to the users array map for the first column.
  const columns = [
    { id: "unassigned", name: "Unassigned", initial: "U", tasks: handoffs.filter(h => h.to === "Unassigned") },
    ...users.map(u => ({
      id: u.id,
      name: u.name,
      initial: u.name.charAt(0).toUpperCase(),
      tasks: handoffs.filter(h => h.to === u.name)
    }))
  ]

  // Filter out columns that have 0 tasks just to keep the view clean for the mockup,
  // or show all of them if desired. For now, we'll show all users.

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-8 h-full flex flex-col overflow-hidden">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Workload by Owner</h1>
        <p className="text-muted-foreground mt-1">
          Monitor task distribution and pending handoffs across the team.
        </p>
      </div>

      <div className="flex-1 overflow-x-auto pb-4">
        <div className="flex items-start gap-6 h-full min-w-max">
          {columns.map(col => (
            <div key={col.id} className="w-[320px] shrink-0 flex flex-col gap-4">
              
              {/* Column Header Card */}
              <div className="bg-slate-100 rounded-lg p-3 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-slate-800 text-white flex items-center justify-center font-semibold text-sm">
                  {col.initial}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 text-sm">{col.name}</h3>
                  <p className="text-xs text-slate-500 font-medium">{col.tasks.length} baton{col.tasks.length !== 1 ? 's' : ''}</p>
                </div>
              </div>

              {/* Task Cards Container */}
              <div className="flex flex-col gap-3 overflow-y-auto">
                {col.tasks.length === 0 ? (
                  <div className="text-center p-4 border-2 border-dashed border-slate-200 rounded-lg text-sm text-slate-400">
                    No active tasks
                  </div>
                ) : (
                  col.tasks.map(task => (
                    <div key={task.id} className="bg-white border text-card-foreground shadow-sm rounded-lg p-4 flex flex-col gap-3">
                      
                      {/* Top Row: Dot, Title, Status Pill */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className={cn("w-2 h-2 rounded-full shrink-0", getDotColor(task.task))} />
                          <h4 className="font-semibold text-sm leading-tight">{task.task}</h4>
                        </div>
                        <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 shrink-0">
                          {task.status}
                        </span>
                      </div>

                      {/* Subtitle / Matter Reference */}
                      <div className="text-sm text-slate-500 pl-4">
                        {task.matter}
                      </div>

                      {/* Footer: Date & Assignee */}
                      <div className="flex items-center gap-4 mt-2 text-xs text-slate-400 pl-4">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>{task.date}</span>
                        </div>
                        {col.name !== "Unassigned" && (
                          <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200">
                            <User className="h-3.5 w-3.5" />
                            <span>{col.name}</span>
                          </div>
                        )}
                      </div>

                    </div>
                  ))
                )}
              </div>

            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
