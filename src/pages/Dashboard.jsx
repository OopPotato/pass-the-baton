import React, { useState, useMemo } from "react"
import { formatDistanceToNow, parseISO } from "date-fns"
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Badge } from "../components/ui/badge"
import { 
  Briefcase, Users, RefreshCw, AlertCircle, Plus, 
  ChevronRight, ChevronDown, CheckCircle2, ArrowRight,
  Folder, ListTodo, Calendar as CalendarIcon, ArrowRightLeft 
} from "lucide-react"
import { useAppContext } from "../contexts/AppContext"
import NewMatterModal from "../components/NewMatterModal"
import NewTaskModal from "../components/NewTaskModal"
import TaskDetailsModal from "../components/TaskDetailsModal"
import PassTheBatonModal from "../components/PassTheBatonModal"
import ManageOwnersModal from "../components/ManageOwnersModal"
import TaskCard from "../components/TaskCard"
import CalendarView from "../components/CalendarView"
import { cn } from "../lib/utils"

export default function Dashboard() {
  const { matters, handoffs, currentUser, users, toggleTaskDone } = useAppContext()
  
  const [activeTab, setActiveTab] = useState("By Matter")
  const [selectedTask, setSelectedTask] = useState(null)
  const [batonTask, setBatonTask] = useState(null)
  
  // Modal states
  const [isMatterOpen, setIsMatterOpen] = useState(false)
  const [isTaskOpen, setIsTaskOpen] = useState(false)
  const [isOwnersOpen, setIsOwnersOpen] = useState(false)

  // Accordion state
  const [expandedMatters, setExpandedMatters] = useState([])

  const pendingCount = handoffs.filter(h => h.status?.toLowerCase() === 'pending').length
  const completedCount = handoffs.filter(h => h.status?.toLowerCase() === 'completed').length
  const urgentCount = handoffs.filter(h => h.status?.toLowerCase() === 'urgent').length

  const toggleMatter = (id) => {
    setExpandedMatters(prev => prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id])
  }

  const mattersWithTasks = useMemo(() => {
    return matters.map(matter => {
      const tasks = handoffs.filter(h => h.matter === matter.name || h.matter_name === matter.name)
        .sort((a,b) => (a.dueDate ? new Date(a.dueDate) : Infinity) - (b.dueDate ? new Date(b.dueDate) : Infinity))
      return { ...matter, tasks }
    }).sort((a, b) => new Date(b.updated) - new Date(a.updated))
  }, [matters, handoffs])

  const tabs = [
    { id: "By Matter", label: "By Matter", icon: Folder },
    { id: "By Task", label: "By Task", icon: ListTodo },
    { id: "By Owner", label: "By Owner", icon: Users },
    { id: "Calendar", label: "Calendar", icon: CalendarIcon },
    { id: "Handoffs", label: "Handoffs", icon: ArrowRightLeft },
  ]

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 w-full">
      {/* ── Base44 Single-Row Global Navbar ── */}
      <header className="h-16 flex-shrink-0 flex items-center justify-between px-6 border-b border-slate-200 bg-white z-20 shadow-sm w-full top-0">
        
        {/* Left: Brand / Logo */}
        <div className="flex items-center gap-3 min-w-[200px]">
          <div className="h-10 w-10 rounded-lg bg-[#1e293b] flex items-center justify-center text-white font-bold text-lg shadow-sm shrink-0">
            B
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-slate-900 leading-tight">Baton</span>
            <span className="text-[11px] font-medium text-slate-500 leading-tight">
              Hello, {currentUser?.name?.split('@')[0] || "User"}
            </span>
          </div>
        </div>

        {/* Center: Interactive Tabs Pill */}
        <div className="flex items-center bg-slate-100/80 p-1 rounded-lg border border-slate-200/50 shadow-inner overflow-x-auto mx-4 hide-scrollbar">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-semibold transition-all duration-200 whitespace-nowrap",
                  isActive 
                    ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-900/5" 
                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                )}
              >
                <tab.icon className={cn("h-4 w-4 shrink-0", isActive ? "text-slate-800" : "text-slate-400")} />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3 min-w-[200px] justify-end">
          <Button variant="outline" size="sm" onClick={() => setIsMatterOpen(true)} className="gap-2 h-9 border-slate-200 text-slate-700 shadow-sm bg-white hover:bg-slate-50 hidden md:flex shrink-0">
            <Plus className="h-4 w-4 text-slate-500 shrink-0" /> Matter
          </Button>
          <Button size="sm" onClick={() => setIsTaskOpen(true)} className="gap-2 h-9 bg-[#1e293b] hover:bg-slate-800 text-white shadow-sm shrink-0">
            <Plus className="h-4 w-4 shrink-0" /> Task
          </Button>
          
          <div className="w-px h-6 bg-slate-200 mx-1 hidden lg:block"></div>
          
          <Button variant="outline" size="sm" onClick={() => setIsOwnersOpen(true)} className="h-9 border-slate-200 text-slate-700 shadow-sm bg-white hover:bg-slate-50 hidden lg:flex shrink-0">
            Manage Owners
          </Button>
        </div>
      </header>

      {/* ── Main Dashboard Content ── */}
      <div className="p-8 max-w-[1400px] mx-auto space-y-8 w-full flex-1">
        
        {/* ── BY MATTER VIEW (DEFAULT) ── */}
        {activeTab === "By Matter" && (
          <div className="space-y-8">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card className="shadow-sm border-slate-200">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm border-0 font-semibold text-slate-600">Active Matters</CardTitle>
                  <Briefcase className="h-4 w-4 text-slate-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900">{matters.length}</div>
                </CardContent>
              </Card>
              <Card className="shadow-sm border-slate-200">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-semibold text-slate-600">Active Tasks</CardTitle>
                  <Users className="h-4 w-4 text-slate-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{pendingCount}</div>
                </CardContent>
              </Card>
              <Card className="shadow-sm border-slate-200">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-semibold text-slate-600">Total Handoffs</CardTitle>
                  <RefreshCw className="h-4 w-4 text-slate-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-700">{handoffs.length}</div>
                </CardContent>
              </Card>
              <Card className="shadow-sm border-slate-200 bg-amber-50/30">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-semibold text-amber-700">Urgent</CardTitle>
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-amber-600">{urgentCount}</div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              {mattersWithTasks.length === 0 ? (
                 <p className="text-slate-500 text-center py-10 italic">No matters found. Create one to get started.</p>
              ) : mattersWithTasks.map((matter) => {
                const isExpanded = expandedMatters.includes(matter.id)
                const completed = matter.tasks.filter(t => t.status?.toLowerCase() === 'completed').length
                
                return (
                  <div key={matter.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <button 
                      onClick={() => toggleMatter(matter.id)}
                      className="w-full flex items-center justify-between p-4 bg-white hover:bg-slate-50 transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        {isExpanded ? <ChevronDown className="h-5 w-5 text-slate-400" /> : <ChevronRight className="h-5 w-5 text-slate-400" />}
                        <h3 className="font-semibold text-slate-900 text-lg">{matter.name}</h3>
                        <Badge variant="outline" className="text-xs ml-2 text-slate-500 tracking-wide font-normal">
                          {completed}/{matter.tasks.length} tasks completed
                        </Badge>
                      </div>
                    </button>
                    
                    {isExpanded && (
                      <div className="px-10 pb-6 pt-2 border-t border-slate-100 bg-slate-50/50">
                        {matter.tasks.length === 0 ? (
                          <div className="text-sm text-slate-400 italic py-4">No tasks linked to this matter.</div>
                        ) : (
                          <div className="space-y-2 mt-2">
                            {matter.tasks.map(task => (
                               <div key={task.id} className="bg-white border rounded-lg p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm hover:border-slate-300 transition-colors">
                                 <div className="flex items-center gap-3">
                                   <div onClick={() => toggleTaskDone(task.id, task.status)} className="cursor-pointer">
                                     {task.status?.toLowerCase() === 'completed' 
                                       ? <CheckCircle2 className="h-5 w-5 text-green-500" /> 
                                       : <div className="h-5 w-5 rounded-full border-2 border-slate-300" />
                                     }
                                   </div>
                                   <div>
                                     <p className={cn("font-medium text-sm", task.status?.toLowerCase() === 'completed' && "line-through text-slate-400")}>{task.task}</p>
                                   </div>
                                 </div>
                                 <div className="flex items-center gap-4 text-xs font-medium pl-8 sm:pl-0">
                                    <Badge variant="outline" className="text-[10px] bg-slate-50 text-slate-500 uppercase">{task.status}</Badge>
                                    <span className="text-slate-400 truncate max-w-[100px]">{task.to}</span>
                                    <span className="text-slate-400 w-20 text-right">{task.dueDate || "No Date"}</span>
                                    <Button size="sm" variant="ghost" className="h-7 text-xs bg-[#1e293b] text-white hover:bg-slate-800" onClick={() => setBatonTask(task)}>
                                       Handoff
                                    </Button>
                                 </div>
                               </div>
                            ))}
                          </div>
                        )}
                        <Button variant="outline" size="sm" className="mt-4 gap-2 text-slate-600 bg-white shadow-sm" onClick={() => setIsTaskOpen(true)}>
                          <Plus className="h-3.5 w-3.5" /> Quick Add Task
                        </Button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── BY TASK VIEW ── */}
        {activeTab === "By Task" && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {handoffs.length === 0 ? (
              <p className="col-span-full text-slate-500 text-center py-10 italic">No tasks active.</p>
            ) : (
              handoffs.sort((a,b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)).map(task => (
                <TaskCard 
                  key={task.id} 
                  task={task} 
                  onToggleDone={toggleTaskDone}
                  onPassBaton={setBatonTask}
                  onEdit={setSelectedTask} 
                />
              ))
            )}
          </div>
        )}

        {/* ── BY OWNER VIEW (WORKLOAD) ── */}
        {activeTab === "By Owner" && (
          <div className="flex items-start gap-6 overflow-x-auto pb-6">
            {users.map(u => {
              const userTasks = handoffs.filter(h => h.to === u.name && h.status?.toLowerCase() !== 'completed')
              return (
                <div key={u.id} className="w-[320px] shrink-0 bg-slate-100/50 rounded-xl flex flex-col max-h-[75vh]">
                  <div className="p-4 border-b border-slate-200">
                     <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                           <div className="h-6 w-6 rounded-full bg-slate-300 flex items-center justify-center font-bold text-[10px] text-slate-700">
                             {u.name.charAt(0).toUpperCase()}
                           </div>
                           <h3 className="font-semibold text-slate-800">{u.name}</h3>
                        </div>
                     </div>
                     <p className="text-xs text-slate-500 font-medium ml-8">{userTasks.length} batons</p>
                  </div>
                  <div className="p-3 space-y-3 overflow-y-auto flex-1">
                    {userTasks.length === 0 ? (
                      <p className="text-center text-xs text-slate-400 py-4 italic">No pending tasks</p>
                    ) : (
                      userTasks.map(task => (
                        <TaskCard 
                          key={task.id} 
                          task={task} 
                          onToggleDone={toggleTaskDone}
                          onPassBaton={setBatonTask}
                          onEdit={setSelectedTask} 
                        />
                      ))
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* ── CALENDAR VIEW ── */}
        {activeTab === "Calendar" && (
          <CalendarView />
        )}

        {/* ── HANDOFFS TIMELINE VIEW ── */}
        {activeTab === "Handoffs" && (
           <Card className="max-w-3xl shadow-sm border-slate-200">
             <CardHeader>
               <CardTitle>Recent Activity</CardTitle>
             </CardHeader>
             <CardContent>
                <div className="space-y-6">
                  {handoffs.length === 0 ? (
                    <p className="text-sm text-slate-500">No recent handoffs.</p>
                  ) : (
                    handoffs.slice(0,20).map(item => (
                      <div key={item.id} className="flex gap-4 group">
                         <div className="relative flex flex-col items-center">
                           <div className="h-8 w-8 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0 z-10">
                              <RefreshCw className="h-3 w-3 text-blue-600" />
                           </div>
                           <div className="w-px h-full bg-slate-100 absolute top-8 group-last:hidden" />
                         </div>
                         <div className="pt-1.5 pb-6 text-sm">
                            <p className="text-slate-900 font-medium">{item.task}</p>
                            <p className="text-slate-500 mb-2 truncate max-w-sm">{item.matter}</p>
                            <div className="flex items-center gap-2 text-xs font-medium text-slate-600 bg-slate-100/50 w-fit px-2 py-1 rounded">
                              <span>{item.from?.split('@')[0]}</span>
                              <ArrowRight className="h-3 w-3 text-slate-400" />
                              <span>{item.to}</span>
                            </div>
                            <p className="text-[10px] text-slate-400 mt-2 font-medium uppercase tracking-wider">{item.date}</p>
                         </div>
                      </div>
                    ))
                  )}
                </div>
             </CardContent>
           </Card>
        )}
      </div>

      <NewMatterModal open={isMatterOpen} onOpenChange={setIsMatterOpen} />
      <NewTaskModal open={isTaskOpen} onOpenChange={setIsTaskOpen} />
      <ManageOwnersModal open={isOwnersOpen} onOpenChange={setIsOwnersOpen} />
      <TaskDetailsModal open={!!selectedTask} onOpenChange={(open) => !open && setSelectedTask(null)} task={selectedTask} />
      <PassTheBatonModal open={!!batonTask} onOpenChange={(open) => !open && setBatonTask(null)} matter={null} initialTask={batonTask} />
    </div>
  )
}
