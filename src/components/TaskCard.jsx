import React from "react"
import { CheckCircle2, Circle, Clock, ArrowRight } from "lucide-react"
import { Badge } from "./ui/badge"
import { Button } from "./ui/button"
import { formatDistanceToNow, isPast, parseISO } from "date-fns"
import { cn, getStatusStyles } from "../lib/utils"

export default function TaskCard({ 
  task, 
  onPassBaton, 
  onToggleDone, 
  onEdit 
}) {
  const isDone = task.status?.toLowerCase() === "completed"

  return (
    <div className={cn(
      "group relative flex flex-col justify-between bg-white border rounded-xl overflow-hidden transition-all duration-200",
      "hover:border-slate-300 hover:shadow-md",
      isDone ? "border-green-100 bg-green-50/30" : "border-slate-200"
    )}>
      {/* Top area */}
      <div className="p-4 flex-1">
        <div className="flex items-start justify-between gap-3 mb-2">
          {/* Checkbox */}
          <button 
            onClick={(e) => { e.stopPropagation(); onToggleDone(task.id, task.status) }}
            className="shrink-0 mt-0.5 hover:scale-110 active:scale-90 transition-transform"
          >
            {isDone 
              ? <CheckCircle2 className="h-5 w-5 text-green-500" />
              : <Circle className="h-5 w-5 text-slate-300 hover:text-slate-400 focus:text-slate-400" />
            }
          </button>
          
          {/* Title & Matter */}
          <div className="flex-1 min-w-0">
            <h4 className={cn(
              "font-semibold text-[15px] leading-snug line-clamp-2",
              isDone ? "text-slate-500 line-through" : "text-slate-900"
            )}>
              {task.task || task.title}
            </h4>
            <p className="text-xs text-slate-500 mt-1 font-medium truncate">
              {task.matter_name || task.matter}
            </p>
          </div>
        </div>

        {/* Status Pill */}
        <div className="pl-8 mb-4 mt-2">
          <Badge variant="outline" className={cn(getStatusStyles(task.status), "text-[10px] px-2 py-0.5 h-auto uppercase tracking-wider font-bold mb-1")}>
            {task.status || 'Pending'}
          </Badge>
        </div>
      </div>

      {/* Footer Area */}
      <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-4">
        {/* Date */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500 min-w-0">
          <Clock className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">
            {task.dueDate 
              ? (isPast(parseISO(task.dueDate)) ? 'Overdue' : formatDistanceToNow(parseISO(task.dueDate), { addSuffix: true }))
              : (task.date || 'No Date')}
          </span>
        </div>

        {/* Owner & Actions */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-slate-200 flex items-center justify-center shrink-0 border-2 border-white shadow-sm">
               <span className="text-[9px] font-bold text-slate-600">
                 {(task.to && task.to !== 'Unassigned') ? task.to.charAt(0).toUpperCase() : 'U'}
               </span>
            </div>
            <span className="text-xs font-medium text-slate-700 max-w-[80px] truncate hidden sm:inline-block">
              {task.to || 'Unassigned'}
            </span>
          </div>

          <Button 
            size="sm" 
            variant="default"
            className="h-7 px-2.5 text-xs gap-1.5 bg-[#1e293b] hover:bg-slate-800 text-white shadow-sm"
            onClick={(e) => { e.stopPropagation(); onPassBaton(task); }}
          >
            Handoff <ArrowRight className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  )
}
