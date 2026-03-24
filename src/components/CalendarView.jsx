import React, { useState, useMemo } from "react"
import { 
  format, addMonths, subMonths, startOfMonth, endOfMonth, 
  startOfWeek, endOfWeek, isSameMonth, isSameDay, addDays, parseISO 
} from "date-fns"
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react"
import { Button } from "./ui/button"
import { useAppContext } from "../contexts/AppContext"
import { cn } from "../lib/utils"

// A preset list of vibrant colors for the owner legend
const OWNER_COLORS = [
  "bg-blue-500", "bg-emerald-500", "bg-violet-500", 
  "bg-amber-500", "bg-rose-500", "bg-cyan-500", "bg-fuchsia-500"
]

export default function CalendarView() {
  const { handoffs, users } = useAppContext()
  const [currentDate, setCurrentDate] = useState(new Date())

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1))
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1))
  const goToday = () => setCurrentDate(new Date())

  // Generate calendar grid dates
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(monthStart)
  const startDate = startOfWeek(monthStart, { weekStarts: 0 }) // Sunday start
  const endDate = endOfWeek(monthEnd, { weekStarts: 0 })

  const dateFormat = "MMMM yyyy"
  const days = []
  
  let day = startDate
  while (day <= endDate) {
    days.push(day)
    day = addDays(day, 1)
  }

  // Determine standard color mapping for users
  const userColorMap = useMemo(() => {
    const map = {}
    users.forEach((u, i) => {
      map[u.name] = OWNER_COLORS[i % OWNER_COLORS.length]
    })
    map["Unassigned"] = "bg-slate-400"
    return map
  }, [users])

  // Filter out tasks without a due date, and attach parsed date objects
  const calendarTasks = useMemo(() => {
    return handoffs
      .filter(h => h.dueDate && h.status?.toLowerCase() !== 'completed')
      .map(h => ({
        ...h,
        parsedDate: parseISO(h.dueDate)
      }))
  }, [handoffs])

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col h-[700px] max-h-[80vh]">
      
      {/* Calendar Header */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-md p-1 shadow-sm">
            <Button variant="ghost" size="icon" onClick={prevMonth} className="h-7 w-7">
              <ChevronLeft className="h-4 w-4 text-slate-600" />
            </Button>
            <Button variant="ghost" size="icon" onClick={nextMonth} className="h-7 w-7">
              <ChevronRight className="h-4 w-4 text-slate-600" />
            </Button>
          </div>
          <h2 className="text-lg font-bold text-slate-800 w-48">{format(currentDate, dateFormat)}</h2>
        </div>
        <Button variant="outline" size="sm" onClick={goToday} className="h-8 gap-2 bg-white">
          <CalendarIcon className="h-3.5 w-3.5" /> Today
        </Button>
      </div>

      {/* Weekday Labels */}
      <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
          <div key={d} className="py-2 text-center text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 grid grid-cols-7 grid-rows-5 overflow-y-auto">
        {days.map((d, index) => {
          const isCurrentMonth = isSameMonth(d, monthStart)
          const isToday = isSameDay(d, new Date())
          
          // Find tasks due on this day
          const dayTasks = calendarTasks.filter(t => isSameDay(t.parsedDate, d))

          return (
            <div 
              key={d.toString()} 
              className={cn(
                "min-h-[100px] border-b border-r border-slate-100 p-1.5 flex flex-col transition-colors hover:bg-slate-50",
                !isCurrentMonth && "bg-slate-50/50 opacity-60",
                index % 7 === 6 && "border-r-0" // Remove right border for Saturday
              )}
            >
              <div className="flex justify-between items-start mb-1 px-1">
                <span className={cn(
                  "text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full",
                  isToday ? "bg-[#1e293b] text-white" : "text-slate-700"
                )}>
                  {format(d, "d")}
                </span>
                {dayTasks.length > 0 && (
                  <span className="text-[10px] text-slate-400 font-medium">
                    {dayTasks.length} {dayTasks.length === 1 ? 'task' : 'tasks'}
                  </span>
                )}
              </div>
              
              <div className="flex-1 overflow-y-auto space-y-1 mt-1 px-0.5 custom-scrollbar">
                {dayTasks.map(task => {
                  const owner = task.to || "Unassigned"
                  const bgColor = userColorMap[owner] || "bg-slate-400"
                  
                  return (
                    <div 
                      key={task.id} 
                      title={`${task.task} - ${task.matter}\nOwner: ${owner}`}
                      className={cn(
                        "text-[10px] px-1.5 py-1 rounded-md text-white font-medium truncate shadow-sm flex items-center gap-1.5",
                        bgColor
                      )}
                    >
                      <span className="truncate">{task.task}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Owner Color Legend */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/50 flex flex-wrap items-center gap-4 text-xs">
        <span className="font-semibold text-slate-600">Assignees:</span>
        <div className="flex flex-wrap items-center gap-3">
          {Object.entries(userColorMap).map(([name, color]) => (
            <div key={name} className="flex items-center gap-1.5">
              <div className={cn("w-2.5 h-2.5 rounded-full shadow-sm", color)} />
              <span className="text-slate-600 font-medium">{name.split('@')[0]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
