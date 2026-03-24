import React, { useState } from "react"
import { formatDistanceToNow, parseISO } from "date-fns"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog"
import { Badge } from "./ui/badge"
import { Button } from "./ui/button"
import { User, Building2, AlertCircle, FileText, Clock, ListTodo, RefreshCw, Plus, CheckCircle2, ArrowRight } from "lucide-react"
import { useAppContext } from "../contexts/AppContext"
import { cn } from "../lib/utils"
import NewTaskModal from "./NewTaskModal"

const getStatusVariant = (status) => {
  switch (status?.toLowerCase()) {
    case "active":
    case "completed":
    case "settled":
      return "success"
    case "pre-trial":
    case "negotiation":
    case "review":
      return "warning"
    default:
      return "info"
  }
}

const getPriorityColor = (priority) => {
  if (priority === "URGENT" || priority === "High") return "text-red-700 bg-red-50 border-red-200"
  return "text-[#1e293b] bg-slate-100 border-slate-200"
}

function DetailBlock({ icon: Icon, label, value, badge, badgeVariant }) {
  if (!value && !badge) return null
  return (
    <div className="flex items-start gap-3">
      <div className="h-8 w-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 mt-0.5">
        <Icon className="h-4 w-4 text-slate-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wider mb-0.5">{label}</p>
        {badge ? (
          <Badge variant={badgeVariant} className="mt-0.5 shadow-sm text-[10px] uppercase font-semibold tracking-wider">
            {badge}
          </Badge>
        ) : (
          <p className="text-sm font-semibold text-slate-800 leading-snug">{value}</p>
        )}
      </div>
    </div>
  )
}

export default function ViewCaseModal({ open, onOpenChange, matter, onPassBaton, onEdit }) {
  const { handoffs, toggleTaskDone } = useAppContext()
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)

  if (!matter) return null

  const updatedAgo = matter.updated
    ? formatDistanceToNow(new Date(matter.updated), { addSuffix: true })
    : "Unknown"

  // Get all tasks related to this matter
  const matterTasks = handoffs.filter(h => h.matter === matter.name || h.matter_name === matter.name)
    .sort((a,b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-4xl p-0 overflow-hidden bg-white shadow-xl">
          
          {/* Header */}
          <div className="px-6 pt-6 pb-4 border-b bg-slate-50 flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">Legal Matter</p>
                <div className="h-1 w-1 rounded-full bg-slate-300" />
                <p className="text-[11px] text-slate-500 font-mono">#{matter.caseNumber || matter.id?.split('-')[0] || 'N/A'}</p>
              </div>
              <DialogTitle className="text-2xl font-bold tracking-tight text-slate-900">{matter.name}</DialogTitle>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge variant={getStatusVariant(matter.status)} className="shadow-sm uppercase text-[10px] tracking-wider font-semibold">
                {matter.status || 'Active'}
              </Badge>
              <div className="flex items-center gap-2 mt-1">
                <Button variant="outline" size="sm" className="h-8 text-xs bg-white" onClick={() => { onOpenChange(false); onEdit && onEdit(matter); }}>
                  Edit Details
                </Button>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row h-full max-h-[70vh]">
            
            {/* LEFT COLUMN: Details & Tasks */}
            <div className="flex-1 overflow-y-auto border-r border-slate-100 p-6 bg-white space-y-8">
              
              {/* Metadata Grid */}
              <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                <DetailBlock icon={User} label="Lead Lawyer" value={matter.lead || "Unassigned"} />
                {matter.client && <DetailBlock icon={Building2} label="Client" value={matter.client} />}
                {matter.priority && (
                  <DetailBlock icon={AlertCircle} label="Priority" badge={matter.priority} badgeVariant="outline" />
                )}
                <DetailBlock icon={Clock} label="Last Updated" value={updatedAgo} />
              </div>
              
              {matter.description && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <DetailBlock icon={FileText} label="Description" value={matter.description} />
                </div>
              )}

              {/* Linked Tasks */}
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                  <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                    <ListTodo className="h-4 w-4 text-slate-500" />
                    Linked Tasks ({matterTasks.length})
                  </h3>
                  <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5 shadow-sm" onClick={() => setIsTaskModalOpen(true)}>
                    <Plus className="h-3.5 w-3.5" /> New Task
                  </Button>
                </div>
                
                <div className="space-y-2">
                  {matterTasks.length === 0 ? (
                    <div className="text-center py-6 border border-dashed rounded-lg bg-slate-50/50">
                      <p className="text-sm text-slate-500 italic">No tasks created yet.</p>
                    </div>
                  ) : (
                    matterTasks.map(task => {
                       const isDone = task.status?.toLowerCase() === 'completed'
                       return (
                         <div key={task.id} className={cn(
                           "bg-white border rounded-lg p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm hover:border-slate-300 transition-colors",
                           isDone && "bg-slate-50/50 border-slate-100"
                         )}>
                           <div className="flex items-start gap-3">
                             <div onClick={() => toggleTaskDone(task.id, task.status)} className="cursor-pointer mt-0.5">
                               {isDone 
                                 ? <CheckCircle2 className="h-4 w-4 text-green-500" /> 
                                 : <div className="h-4 w-4 rounded-full border-2 border-slate-300 hover:border-slate-400" />
                               }
                             </div>
                             <div>
                               <p className={cn("text-sm font-medium leading-tight", isDone && "line-through text-slate-400")}>{task.task}</p>
                               <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="outline" className="text-[9px] h-4 px-1.5 uppercase font-semibold text-slate-500 bg-slate-50">{task.status}</Badge>
                                  <span className="text-[11px] font-medium text-slate-500">{task.to}</span>
                               </div>
                             </div>
                           </div>
                         </div>
                       )
                    })
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Handoff Timeline */}
            <div className="w-full md:w-[320px] bg-slate-50 p-6 overflow-y-auto">
              <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2 mb-6">
                <RefreshCw className="h-4 w-4 text-slate-500" />
                Handoff History
              </h3>
              
              <div className="space-y-6">
                {matterTasks.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">No history available.</p>
                ) : (
                  matterTasks.map((item, idx) => (
                    <div key={item.id} className="relative flex gap-4">
                      {/* Timeline Line */}
                      {idx !== matterTasks.length - 1 && (
                        <div className="absolute left-3.5 top-8 bottom-[-24px] w-px bg-slate-200" />
                      )}
                      
                      <div className="relative z-10 flex flex-col items-center">
                        <div className="h-7 w-7 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center shrink-0 shadow-sm">
                          <span className="text-[10px] font-bold text-slate-500">{item.to?.charAt(0).toUpperCase()}</span>
                        </div>
                      </div>
                      
                      <div className="pt-1 text-sm flex-1 min-w-0 pb-1">
                        <p className="text-slate-900 font-medium text-xs leading-snug">{item.task}</p>
                        <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-medium text-slate-600 mt-1.5">
                          <span className="text-slate-400">From</span>
                          <span className="bg-slate-200/50 px-1.5 py-0.5 rounded truncate max-w-[80px]">{item.from?.split('@')[0] || 'Unknown'}</span>
                          <span className="text-slate-400">to</span>
                          <span className="bg-[#1e293b] text-white px-1.5 py-0.5 rounded truncate max-w-[80px]">{item.to}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1.5 uppercase tracking-wider font-medium">{item.date}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

          {/* Footer actions */}
          <div className="px-6 py-4 flex items-center justify-end gap-3 border-t bg-white">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>Close</Button>
            {onPassBaton && (
               <Button onClick={() => { onOpenChange(false); onPassBaton(matter); }} className="gap-2 bg-[#1e293b] text-white hover:bg-slate-800 shadow-sm">
                 Handoff Matter <ArrowRight className="h-4 w-4" />
               </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <NewTaskModal 
        open={isTaskModalOpen} 
        onOpenChange={setIsTaskModalOpen} 
        defaultMatter={matter.id} 
      />
    </>
  )
}
