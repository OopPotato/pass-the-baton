import React, { useState, useMemo } from "react"
import { useAppContext } from "../contexts/AppContext"
import { Badge } from "../components/ui/badge"
import { Button } from "../components/ui/button"
import { Briefcase, ListTodo, Plus, ChevronDown, CheckCircle2, Circle, Calendar } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { cn } from "../lib/utils"
import NewTaskModal from "../components/NewTaskModal"

// ── Individual task row with inline expandable checklist ──────────────────────
function TaskRow({ task }) {
  const { updateTaskChecklist } = useAppContext()
  const [checklist, setChecklist] = useState(task.checklist || [])
  const [isExpanded, setIsExpanded] = useState(false)

  const totalItems = checklist.length
  const doneItems = checklist.filter(c => c.completed).length
  const isTaskDone = task.status?.toLowerCase() === "completed" || (totalItems > 0 && doneItems === totalItems)

  const toggleItem = async (itemId) => {
    const updated = checklist.map(c => c.id === itemId ? { ...c, completed: !c.completed } : c)
    setChecklist(updated)
    await updateTaskChecklist(task.id, updated)
  }

  return (
    <div
      className={cn(
        "rounded-lg border overflow-hidden transition-all duration-300",
        isTaskDone ? "bg-green-50 border-green-200" : "bg-white border-slate-200 hover:border-slate-300"
      )}
    >
      {/* ── Row header ── */}
      <button
        onClick={() => setIsExpanded(v => !v)}
        className={cn(
          "w-full flex items-center justify-between p-3 text-left transition-colors",
          isTaskDone ? "hover:bg-green-100" : "hover:bg-slate-50"
        )}
      >
        <div className="flex items-center gap-3">
          {isTaskDone
            ? <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
            : <Circle className="h-5 w-5 text-slate-300 shrink-0" />
          }
          <div className="text-left">
            <p className={cn(
              "text-sm font-medium leading-snug",
              isTaskDone ? "text-green-700 line-through" : "text-slate-800"
            )}>
              {task.task || task.title}
            </p>
            <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
              <span className="font-medium">{task.to}</span>
              {totalItems > 0 && (
                <span className={cn(
                  "px-1.5 rounded text-[10px]",
                  isTaskDone ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"
                )}>
                  {doneItems}/{totalItems} done
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400">
            <Calendar className="h-3 w-3" />
            {task.date || formatDistanceToNow(new Date(task.created_at || new Date()), { addSuffix: true })}
          </div>
          {totalItems > 0 && (
            <ChevronDown className={cn(
              "h-4 w-4 text-slate-400 transition-transform duration-200",
              isExpanded ? "rotate-180" : ""
            )} />
          )}
        </div>
      </button>

      {/* ── Inline checklist ── */}
      {isExpanded && totalItems > 0 && (
        <div className={cn(
          "px-4 pb-3 pt-1 border-t space-y-2",
          isTaskDone ? "border-green-200 bg-green-50" : "border-slate-100 bg-slate-50/50"
        )}>
          {/* Progress bar */}
          <div className="w-full bg-slate-200 rounded-full h-1 mb-3">
            <div
              className="bg-green-500 h-1 rounded-full transition-all duration-500"
              style={{ width: totalItems > 0 ? `${Math.round((doneItems / totalItems) * 100)}%` : "0%" }}
            />
          </div>
          {checklist.map((item) => (
            <button
              key={item.id}
              onClick={() => toggleItem(item.id)}
              className="flex items-center gap-2.5 w-full text-left group py-0.5"
            >
              {item.completed
                ? <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                : <Circle className="h-4 w-4 text-slate-300 group-hover:text-slate-500 shrink-0 transition-colors" />
              }
              <span className={cn(
                "text-sm",
                item.completed ? "line-through text-slate-400" : "text-slate-700 group-hover:text-slate-900"
              )}>
                {item.text}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Main Tasks page ───────────────────────────────────────────────────────────
export default function Tasks() {
  const { matters, handoffs } = useAppContext()

  const [activeMatterId, setActiveMatterId] = useState(null)
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)

  // Group handoffs by matter
  const mattersWithTasks = useMemo(() => {
    return matters.map(matter => {
      const matterTasks = handoffs.filter(h =>
        h.matter_name === matter.name ||
        h.matter === matter.name ||
        h.matter_id === matter.id
      )
      return {
        ...matter,
        tasks: matterTasks.sort((a, b) => new Date(b.created_at || b.date) - new Date(a.created_at || a.date))
      }
    }).sort((a, b) => new Date(b.updated) - new Date(a.updated))
  }, [matters, handoffs])

  const toggleMatter = (matterId) => {
    setActiveMatterId(prev => prev === matterId ? null : matterId)
  }

  const openNewTaskForMatter = (e, matterId) => {
    e.stopPropagation()
    setActiveMatterId(matterId)
    setIsTaskModalOpen(true)
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 drop-shadow-sm">Matter Tasks</h1>
          <p className="text-slate-500 mt-1 font-medium">Add and track tasks grouped by legal matter.</p>
        </div>
      </div>

      {mattersWithTasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
          <div className="h-16 w-16 rounded-2xl bg-white border flex items-center justify-center mb-4">
            <ListTodo className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-700">No matters active</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-xs">Create cases to add tasks.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {mattersWithTasks.map((matter) => {
            const isExpanded = activeMatterId === matter.id
            return (
              <div
                key={matter.id}
                className={cn(
                  "bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden transition-all duration-200",
                  isExpanded ? "ring-2 ring-primary/20 shadow-md" : "hover:border-slate-300"
                )}
              >
                {/* Matter accordion header */}
                <button
                  onClick={() => toggleMatter(matter.id)}
                  className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0">
                      <Briefcase className="h-4 w-4 text-slate-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 leading-tight">{matter.name}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {matter.tasks.length} task{matter.tasks.length !== 1 && "s"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => openNewTaskForMatter(e, matter.id)}
                      className="h-8 shadow-sm bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 gap-1.5"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add Task
                    </Button>
                    <ChevronDown
                      className={cn(
                        "h-5 w-5 text-slate-400 transition-transform duration-200",
                        isExpanded && "rotate-180"
                      )}
                    />
                  </div>
                </button>

                {/* Task list */}
                {isExpanded && (
                  <div className="p-4 bg-white border-t border-slate-100 animate-in slide-in-from-top-2 duration-200">
                    {matter.tasks.length === 0 ? (
                      <p className="text-sm text-slate-500 text-center py-6 italic">No tasks created for this matter yet.</p>
                    ) : (
                      <div className="space-y-2">
                        {matter.tasks.map(task => (
                          <TaskRow key={task.id} task={task} />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Create Task Modal */}
      <NewTaskModal
        open={isTaskModalOpen}
        onOpenChange={(open) => {
          setIsTaskModalOpen(open)
          if (!open) setActiveMatterId(null)
        }}
        defaultMatter={activeMatterId}
      />
    </div>
  )
}
