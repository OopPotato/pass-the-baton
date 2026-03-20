import React, { useState, useMemo } from "react"
import { useAppContext } from "../contexts/AppContext"
import { Badge } from "../components/ui/badge"
import { Button } from "../components/ui/button"
import { Briefcase, ListTodo, Plus, ChevronDown, CheckCircle2, Circle, AlertCircle, Calendar } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { cn } from "../lib/utils"
import NewTaskModal from "../components/NewTaskModal"
import TaskDetailsModal from "../components/TaskDetailsModal"

const getStatusIcon = (status) => {
  switch(status?.toLowerCase()) {
    case "pending": return <Circle className="h-4 w-4 text-blue-500" />
    case "completed": return <CheckCircle2 className="h-4 w-4 text-green-500" />
    case "urgent": return <AlertCircle className="h-4 w-4 text-red-500" />
    default: return <Circle className="h-4 w-4 text-gray-400" />
  }
}

export default function Tasks() {
  const { matters, handoffs } = useAppContext()
  
  const [activeMatterId, setActiveMatterId] = useState(null)
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState(null)
  
  // Group handoffs by matter
  const mattersWithTasks = useMemo(() => {
    return matters.map(matter => {
      // Use case-insensitive comparison or exact match based on name if id doesn't match
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
    if (activeMatterId === matterId) setActiveMatterId(null)
    else setActiveMatterId(matterId)
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
          <p className="text-sm text-slate-500 mt-1 max-w-xs">
            Create cases to add tasks.
          </p>
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
                {/* Accordion Header */}
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
                        {matter.tasks.length} task{matter.tasks.length !== 1 && 's'}
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
                
                {/* Accordion Content */}
                {isExpanded && (
                  <div className="p-4 bg-white border-t border-slate-100 animate-in slide-in-from-top-2 duration-200">
                    {matter.tasks.length === 0 ? (
                       <p className="text-sm text-slate-500 text-center py-6 italic">No tasks created for this matter yet.</p>
                    ) : (
                      <div className="space-y-2">
                        {matter.tasks.map(task => {
                           const totalItems = task.checklist?.length ?? 0
                           const doneItems = task.checklist?.filter(c => c.completed).length ?? 0
                           const isTaskDone = task.status?.toLowerCase() === 'completed' || (totalItems > 0 && doneItems === totalItems)
                           return (
                            <div 
                              key={task.id}
                              onClick={() => setSelectedTask(task)}
                              className={cn(
                                "flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all duration-300",
                                isTaskDone
                                  ? "bg-green-50 border-green-200 hover:bg-green-100"
                                  : "border-transparent hover:bg-slate-50 hover:border-slate-100"
                              )}
                            >
                              <div className="flex items-center gap-3">
                                {isTaskDone
                                  ? <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                                  : getStatusIcon(task.status)
                                }
                                <div>
                                  <p className={cn("text-sm font-medium", isTaskDone ? "text-green-700 line-through" : "text-slate-800")}>{task.task || task.title}</p>
                                  <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                                     <span className="font-medium">{task.to}</span>
                                     {totalItems > 0 && (
                                       <span className={cn("px-1.5 rounded text-[10px]", isTaskDone ? "bg-green-100 text-green-700" : "bg-slate-100")}>
                                         {doneItems}/{totalItems} done
                                       </span>
                                     )}
                                  </p>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                                <Calendar className="h-3 w-3" />
                                {task.date || formatDistanceToNow(new Date(task.created_at || new Date()), { addSuffix: true })}
                              </div>
                            </div>
                           )
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Modals */}
      <NewTaskModal 
        open={isTaskModalOpen} 
        onOpenChange={(open) => {
          setIsTaskModalOpen(open);
          if (!open) setActiveMatterId(null);
        }}
        defaultMatter={activeMatterId}
      />
      <TaskDetailsModal 
        open={!!selectedTask} 
        onOpenChange={(open) => !open && setSelectedTask(null)} 
        task={selectedTask} 
      />
    </div>
  )
}
