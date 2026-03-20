import React, { useState, useEffect } from "react"
import { useAppContext } from "../contexts/AppContext"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog"
import { Button } from "./ui/button"
import { CheckCircle2, Circle, ListTodo, Clock, User } from "lucide-react"
import { Badge } from "./ui/badge"

export default function TaskDetailsModal({ open, onOpenChange, task }) {
  const { updateTaskChecklist } = useAppContext()
  const [checklist, setChecklist] = useState([])

  useEffect(() => {
    if (task) {
      setChecklist(task.checklist || [])
    }
  }, [task])

  const toggleItem = async (colId) => {
    const newChecklist = checklist.map(c => 
      c.id === colId ? { ...c, completed: !c.completed } : c
    )
    setChecklist(newChecklist)
    if (task) {
      await updateTaskChecklist(task.id, newChecklist)
    }
  }

  if (!task) return null

  const completedCount = checklist.filter(c => c.completed).length
  const totalCount = checklist.length
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-card">
        <div className="flex flex-col max-h-[90vh]">
          
          <div className="px-6 pt-6 pb-4 border-b">
            <DialogHeader>
              <div className="flex items-start justify-between">
                <div>
                  <DialogTitle className="text-xl">{task.task}</DialogTitle>
                  <DialogDescription className="mt-1">
                    Matter: <span className="font-semibold text-foreground">{task.matter}</span>
                  </DialogDescription>
                </div>
                <Badge variant={task.status === 'urgent' ? 'destructive' : 'secondary'}>
                  {task.status || 'Pending'}
                </Badge>
              </div>
            </DialogHeader>

            <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <User className="h-4 w-4" />
                <span>From: {task.from}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <User className="h-4 w-4 text-primary" />
                <span className="font-medium text-foreground">To: {task.to}</span>
              </div>
              <div className="flex items-center gap-1.5 ml-auto">
                <Clock className="h-4 w-4" />
                <span>{task.date}</span>
              </div>
            </div>
          </div>

          <div className="px-6 py-4 overflow-y-auto flex-1 bg-slate-50/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <ListTodo className="h-4 w-4 text-slate-500" />
                Task Checklist
              </h3>
              {totalCount > 0 && (
                <span className="text-xs font-medium text-slate-500">
                  {completedCount} of {totalCount} completed ({progress}%)
                </span>
              )}
            </div>

            {totalCount === 0 ? (
              <div className="text-center py-8 text-sm text-slate-400 bg-white rounded-lg border border-dashed border-slate-200">
                No checklist associated with this task.
              </div>
            ) : (
              <div className="space-y-2">
                {/* Progress bar */}
                <div className="w-full bg-slate-200 rounded-full h-1.5 mb-4">
                  <div 
                    className="bg-primary h-1.5 rounded-full transition-all duration-500" 
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm divide-y divide-slate-100">
                  {checklist.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => toggleItem(item.id)}
                      className="w-full flex items-center gap-3 p-3 text-left hover:bg-slate-50 transition-colors focus:outline-none"
                    >
                      {item.completed ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                      ) : (
                        <Circle className="h-5 w-5 text-slate-300 shrink-0" />
                      )}
                      <span className={`text-sm tracking-tight ${item.completed ? 'text-slate-400 line-through' : 'text-slate-700 font-medium'}`}>
                        {item.text}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="px-6 py-4 border-t bg-muted/20 flex justify-end">
            <Button onClick={() => onOpenChange(false)}>Close</Button>
          </div>
          
        </div>
      </DialogContent>
    </Dialog>
  )
}
