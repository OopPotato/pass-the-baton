import React, { useState, useMemo } from "react"
import { formatDistanceToNow, parseISO } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Badge } from "../components/ui/badge"
import { 
  Briefcase, Users, RefreshCw, AlertTriangle, Plus, 
  ChevronRight, ChevronDown, CheckCircle2, ArrowRight,
  Folder, ListTodo, Calendar as CalendarIcon, ArrowRightLeft,
  Search
} from "lucide-react"
import { useAppContext } from "../contexts/AppContext"
import NewMatterModal from "../components/NewMatterModal"
import NewTaskModal from "../components/NewTaskModal"
import TaskDetailsModal from "../components/TaskDetailsModal"
import PassTheBatonModal from "../components/PassTheBatonModal"
import ManageOwnersModal from "../components/ManageOwnersModal"
import TaskCard from "../components/TaskCard"
import CalendarView from "../components/CalendarView"
import { cn, getStatusStyles } from "../lib/utils"

export default function Dashboard() {
  const { matters, handoffs, currentUser, users, toggleTaskDone } = useAppContext()
  
  const [activeTab, setActiveTab] = useState("By Matter")
  const [selectedTask, setSelectedTask] = useState(null)
  const [batonTask, setBatonTask] = useState(null)
  
  // QoL Feature: Search filter for matters
  const [searchQuery, setSearchQuery] = useState("")
  
  // Modal states
  const [isMatterOpen, setIsMatterOpen] = useState(false)
  const [isTaskOpen, setIsTaskOpen] = useState(false)
  const [isOwnersOpen, setIsOwnersOpen] = useState(false)

  // Accordion state
  const [expandedMatters, setExpandedMatters] = useState([])

  const pendingCount = handoffs.filter(h => h.status?.toLowerCase() === 'pending').length
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

  const filteredMatters = mattersWithTasks.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const tabs = [
    { id: "By Matter", label: "By Matter", icon: Folder },
    { id: "By Task", label: "By Task", icon: ListTodo },
    { id: "By Owner", label: "By Owner", icon: Users },
    { id: "Calendar", label: "Calendar", icon: CalendarIcon },
    { id: "Handoffs", label: "Handoffs", icon: ArrowRightLeft },
  ]

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 w-full font-sans">
      {/* ── Base44 Single-Row Global Navbar ── */}
      <header className="h-16 flex-shrink-0 flex items-center justify-between px-6 border-b border-slate-200 bg-white z-20 shadow-sm w-full sticky top-0">
        
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
        <div className="flex items-center bg-slate-100/80 p-1 rounded-lg border border-slate-200/50 shadow-inner overflow-x-auto mx-4 hide-scrollbar tracking-wide">
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
                <tab.icon className={cn("h-4 w-4 shrink-0 transition-colors", isActive ? "text-slate-800" : "text-slate-400")} />
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
        
        {/* ── CONSTANT TOP KPI CARDS ── */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card 
            onClick={() => setActiveTab("By Matter")}
            className={cn(
              "shadow-sm border-slate-200 cursor-pointer transition-colors hover:border-slate-300",
              activeTab === "By Matter" ? "ring-2 ring-[#1e293b]" : ""
            )}
          >
            <CardContent className="p-4 flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                <Briefcase className="h-5 w-5 text-[#1e293b]" />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-[#1e293b] leading-none mb-1">{matters.length}</span>
                <span className="text-[10px] font-semibold text-slate-500 tracking-wider uppercase leading-none">Active Matters</span>
              </div>
            </CardContent>
          </Card>

          <Card 
            onClick={() => setActiveTab("By Task")}
            className={cn(
              "shadow-sm border-slate-200 cursor-pointer transition-colors hover:border-slate-300",
              activeTab === "By Task" ? "ring-2 ring-[#1e293b]" : ""
            )}
          >
            <CardContent className="p-4 flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                <Users className="h-5 w-5 text-[#1e293b]" />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-[#1e293b] leading-none mb-1">{pendingCount}</span>
                <span className="text-[10px] font-semibold text-slate-500 tracking-wider uppercase leading-none">Active Tasks</span>
              </div>
            </CardContent>
          </Card>

          <Card 
            onClick={() => setActiveTab("Handoffs")}
            className={cn(
              "shadow-sm border-slate-200 cursor-pointer transition-colors hover:border-slate-300",
              activeTab === "Handoffs" ? "ring-2 ring-[#1e293b]" : ""
            )}
          >
            <CardContent className="p-4 flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                <ArrowRightLeft className="h-5 w-5 text-[#1e293b]" />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-[#1e293b] leading-none mb-1">{handoffs.length}</span>
                <span className="text-[10px] font-semibold text-slate-500 tracking-wider uppercase leading-none">Total Handoffs</span>
              </div>
            </CardContent>
          </Card>

          <Card 
            onClick={() => setActiveTab("By Task")}
            className="shadow-sm border-slate-200 cursor-pointer transition-colors hover:border-slate-300"
          >
            <CardContent className="p-4 flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="h-5 w-5 text-[#1e293b]" />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-[#1e293b] leading-none mb-1">{urgentCount}</span>
                <span className="text-[10px] font-semibold text-slate-500 tracking-wider uppercase leading-none">Urgent</span>
              </div>
            </CardContent>
          </Card>
        </div>


        {/* ── ANIMATED VIEW CONTAINER ── */}
        <div key={activeTab} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          
          {/* ── BY MATTER VIEW (DEFAULT) ── */}
          {activeTab === "By Matter" && (
            <div className="space-y-4 pt-4">
              
              {/* QoL Feature: Search */}
              <div className="flex items-center gap-3 bg-white px-4 py-3 rounded-xl border border-slate-200 shadow-sm transition-colors focus-within:border-slate-400 focus-within:ring-1 focus-within:ring-slate-400 mx-auto">
                <Search className="h-5 w-5 text-slate-400 shrink-0" />
                <input 
                  type="text" 
                  placeholder="Search legal matters..." 
                  className="bg-transparent border-none outline-none w-full text-sm text-slate-900 placeholder:text-slate-400 font-medium"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="space-y-4">
                {filteredMatters.length === 0 ? (
                   <div className="bg-white rounded-xl border border-slate-200 border-dashed p-10 flex flex-col items-center justify-center text-center">
                     <Folder className="h-10 w-10 text-slate-300 mb-3" />
                     <p className="text-slate-500 font-medium">No matters found.</p>
                     <p className="text-sm text-slate-400 mt-1">Try adjusting your search or create a new matter.</p>
                   </div>
                ) : filteredMatters.map((matter) => {
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
                          <Badge variant="outline" className="text-xs ml-2 text-slate-500 tracking-wide font-normal bg-slate-50">
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
                                         ? <CheckCircle2 className="h-5 w-5 text-emerald-500" /> 
                                         : <div className="h-5 w-5 rounded-full border-2 border-slate-300 hover:border-slate-400 transition-colors" />
                                       }
                                     </div>
                                     <div>
                                       <p className={cn("font-medium text-sm", task.status?.toLowerCase() === 'completed' && "line-through text-slate-400")}>{task.task}</p>
                                     </div>
                                   </div>
                                   <div className="flex items-center gap-4 text-xs font-medium pl-8 sm:pl-0">
                                      {/* Dynamically Styled Badge */}
                                      <Badge variant="outline" className={cn("text-[10px] uppercase font-bold px-2 py-0.5", getStatusStyles(task.status))}>
                                        {task.status}
                                      </Badge>
                                      
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pt-4">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4 pb-6">
              {users.map(u => {
                const userTasks = handoffs.filter(h => h.to === u.name && h.status?.toLowerCase() !== 'completed')
                return (
                  <div key={u.id} className="w-full bg-slate-100/50 rounded-xl flex flex-col max-h-[65vh]">
                    <div className="p-4 border-b border-slate-200">
                       <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                             <div className="h-6 w-6 rounded-full bg-[#1e293b] text-white flex items-center justify-center font-bold text-[10px] shadow-sm">
                               {u.name.charAt(0).toUpperCase()}
                             </div>
                             <h3 className="font-semibold text-slate-800">{u.name}</h3>
                          </div>
                       </div>
                       <p className="text-xs text-slate-500 font-medium ml-8">{userTasks.length} pending batons</p>
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
            <div className="pt-4">
              <CalendarView />
            </div>
          )}

          {/* ── HANDOFFS TIMELINE VIEW ── */}
          {activeTab === "Handoffs" && (
             <Card className="max-w-3xl shadow-sm border-slate-200 mt-4">
               <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
                 <CardTitle className="text-lg">Recent Organization Activity</CardTitle>
               </CardHeader>
               <CardContent className="pt-6">
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
                              <p className="text-slate-900 font-bold">{item.task}</p>
                              <p className="text-slate-500 mb-2 truncate max-w-sm">{item.matter}</p>
                              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 bg-slate-100/80 w-fit px-2.5 py-1.5 rounded-md border border-slate-200/60 shadow-sm mt-1">
                                <span>{item.from?.split('@')[0]}</span>
                                <ArrowRight className="h-3 w-3 text-slate-400" />
                                <span>{item.to}</span>
                              </div>
                              <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-wider">{item.date}</p>
                           </div>
                        </div>
                      ))
                    )}
                  </div>
               </CardContent>
             </Card>
          )}

        </div> {/* END ANIMATED CONTAINER */}
      </div>

      {/* Modals */}
      <NewMatterModal open={isMatterOpen} onOpenChange={setIsMatterOpen} />
      <NewTaskModal open={isTaskOpen} onOpenChange={setIsTaskOpen} />
      <ManageOwnersModal open={isOwnersOpen} onOpenChange={setIsOwnersOpen} />
      <TaskDetailsModal open={!!selectedTask} onOpenChange={(open) => !open && setSelectedTask(null)} task={selectedTask} />
      <PassTheBatonModal open={!!batonTask} onOpenChange={(open) => !open && setBatonTask(null)} matter={null} initialTask={batonTask} />
    </div>
  )
}
