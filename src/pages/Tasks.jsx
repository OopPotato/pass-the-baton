import React, { useState, useMemo } from "react"
import { useAppContext } from "../contexts/AppContext"
import { Button } from "../components/ui/button"
import { Briefcase, ListTodo, Plus, CheckCircle2, Circle, Trash2, Pencil, Calendar } from "lucide-react"
import { cn } from "../lib/utils"
import { formatDistanceToNow, isPast, differenceInDays, parseISO } from "date-fns"
import NewTaskModal from "../components/NewTaskModal"

// ── Single checkable task item ─────────────────────────────────────────────
function TaskItem({ task, onEdit }) {
  const { toggleTaskDone, deleteTask } = useAppContext()
  const [confirmDelete, setConfirmDelete] = useState(false)
  const isDone = task.status?.toLowerCase() === "completed"

  const handleCheck = () => toggleTaskDone(task.id, task.status)

  const handleDelete = (e) => {
    e.stopPropagation()
    if (!confirmDelete) {
      setConfirmDelete(true)
      setTimeout(() => setConfirmDelete(false), 3000)
    } else {
      deleteTask(task.id)
    }
  }

  return (
    <div className={cn(
      "flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-all duration-300 group",
      isDone
        ? "bg-green-50 border-green-200"
        : "bg-white border-slate-100 hover:border-slate-200"
    )}>
      {/* Checkbox circle */}
      <button
        onClick={handleCheck}
        className="shrink-0 transition-transform active:scale-90"
        title={isDone ? "Mark as pending" : "Mark as done"}
      >
        {isDone
          ? <CheckCircle2 className="h-5 w-5 text-green-500" />
          : <Circle className="h-5 w-5 text-slate-300 hover:text-slate-500 transition-colors" />
        }
      </button>

      {/* Task label + assignee + due date */}
      <div className="flex-1 min-w-0">
        <p className={cn(
          "text-sm font-medium leading-snug",
          isDone ? "line-through text-green-700" : "text-slate-800"
        )}>
          {task.task || task.title}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          {task.to && task.to !== "Unassigned" && (
            <p className="text-[11px] text-slate-400">{task.to}</p>
          )}
          {task.dueDate && !isDone && (() => {
            try {
              const due = parseISO(task.dueDate)
              const overdue = isPast(due)
              const soonish = !overdue && differenceInDays(due, new Date()) <= 3
              return (
                <span className={cn(
                  "flex items-center gap-0.5 text-[11px] font-medium",
                  overdue ? "text-red-500" : soonish ? "text-amber-500" : "text-slate-400"
                )}>
                  <Calendar className="h-3 w-3" />
                  {overdue ? "Overdue · " : ""}{formatDistanceToNow(due, { addSuffix: true })}
                </span>
              )
            } catch { return null }
          })()}
          {task.dueDate && isDone && (
            <span className="flex items-center gap-0.5 text-[11px] text-green-600">
              <Calendar className="h-3 w-3" />
              {task.dueDate}
            </span>
          )}
        </div>
      </div>

      {/* Action buttons — visible on hover */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        <button
          onClick={e => { e.stopPropagation(); onEdit(task) }}
          title="Edit"
          className="p-1.5 rounded text-slate-300 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={handleDelete}
          title={confirmDelete ? "Click again to confirm" : "Delete"}
          className={cn(
            "flex items-center gap-0.5 text-xs px-1.5 py-1 rounded transition-all duration-200",
            confirmDelete
              ? "bg-red-500 text-white"
              : "text-slate-300 hover:text-red-400 hover:bg-red-50"
          )}
        >
          <Trash2 className="h-3.5 w-3.5" />
          {confirmDelete && <span className="font-medium">Confirm?</span>}
        </button>
      </div>
    </div>
  )
}

// ── Main Tasks page ─────────────────────────────────────────────────────────
export default function Tasks() {
  const { matters, handoffs } = useAppContext()
  const [activeMatterId, setActiveMatterId] = useState(null)
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState(null)

  const mattersWithTasks = useMemo(() => {
    return matters.map(matter => {
      const tasks = handoffs
        .filter(h => h.matter_name === matter.name || h.matter === matter.name || h.matter_id === matter.id)
        .sort((a, b) => {
          // Closest due date first; undated tasks go to the end
          const aDate = a.dueDate ? new Date(a.dueDate).getTime() : Infinity
          const bDate = b.dueDate ? new Date(b.dueDate).getTime() : Infinity
          return aDate - bDate
        })
      return { ...matter, tasks }
    }).sort((a, b) => new Date(b.updated) - new Date(a.updated))
  }, [matters, handoffs])

  const openNewTask = (e, matterId) => {
    e.stopPropagation()
    setActiveMatterId(matterId)
    setIsTaskModalOpen(true)
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Matter Tasks</h1>
        <p className="text-slate-500 mt-1 font-medium">Track tasks grouped by legal matter.</p>
      </div>

      {mattersWithTasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50 text-center">
          <div className="h-16 w-16 rounded-2xl bg-white border flex items-center justify-center mb-4">
            <ListTodo className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-700">No matters active</h3>
          <p className="text-sm text-slate-500 mt-1">Create cases to add tasks.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {mattersWithTasks.map(matter => {
            const isOpen = activeMatterId === matter.id
            const doneCount = matter.tasks.filter(t => t.status?.toLowerCase() === "completed").length
            const total = matter.tasks.length

            return (
              <div
                key={matter.id}
                className={cn(
                  "rounded-xl border bg-white shadow-sm overflow-hidden transition-all duration-200",
                  isOpen ? "ring-2 ring-primary/20 shadow-md border-slate-200" : "border-slate-200 hover:border-slate-300"
                )}
              >
                {/* Matter header */}
                <button
                  onClick={() => setActiveMatterId(prev => prev === matter.id ? null : matter.id)}
                  className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0">
                      <Briefcase className="h-4 w-4 text-slate-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">{matter.name}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {total === 0
                          ? "No tasks"
                          : <span className={cn(doneCount === total && total > 0 ? "text-green-600 font-medium" : "")}>
                              {doneCount}/{total} done
                            </span>
                        }
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={e => openNewTask(e, matter.id)}
                    className="h-8 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 gap-1.5 shadow-sm"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add Task
                  </Button>
                </button>

                {/* Task checklist */}
                {isOpen && (
                  <div className="p-4 border-t border-slate-100 space-y-1.5">
                    {/* Progress bar */}
                    {total > 0 && (
                      <div className="w-full bg-slate-100 rounded-full h-1 mb-3">
                        <div
                          className="bg-green-500 h-1 rounded-full transition-all duration-500"
                          style={{ width: total > 0 ? `${Math.round((doneCount / total) * 100)}%` : "0%" }}
                        />
                      </div>
                    )}

                    {total === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-sm text-slate-400 italic">No tasks yet. Click "Add Task" to get started.</p>
                        <Button
                          size="sm"
                          variant="outline"
                          className="mt-3 border-dashed gap-1.5"
                          onClick={e => openNewTask(e, matter.id)}
                        >
                          <Plus className="h-3.5 w-3.5" /> Add First Task
                        </Button>
                      </div>
                    ) : (
                      matter.tasks.map(task => (
                        <TaskItem key={task.id} task={task} onEdit={setEditingTask} />
                      ))
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
        onOpenChange={open => { setIsTaskModalOpen(open); if (!open) setActiveMatterId(null) }}
        defaultMatter={activeMatterId}
      />

      {/* Edit Task Modal */}
      <NewTaskModal
        open={!!editingTask}
        onOpenChange={open => { if (!open) setEditingTask(null) }}
        initialTask={editingTask}
      />
    </div>
  )
}
