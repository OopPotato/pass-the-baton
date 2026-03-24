import React, { useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { formatDistanceToNow, parseISO } from "date-fns"
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Badge } from "../components/ui/badge"
import { Briefcase, Users, RefreshCw, AlertCircle, Plus, ChevronRight, ChevronDown, CheckCircle2, ArrowRight } from "lucide-react"
import { useAppContext } from "../contexts/AppContext"
import NewMatterModal from "../components/NewMatterModal"
import TaskDetailsModal from "../components/TaskDetailsModal"
import PassTheBatonModal from "../components/PassTheBatonModal"
import TaskCard from "../components/TaskCard"
import CalendarView from "../components/CalendarView"
import { cn } from "../lib/utils"

export default function Dashboard() {
  const { matters, handoffs, currentUser, users, toggleTaskDone } = useAppContext()
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState("By Matter")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState(null)
  const [batonTask, setBatonTask] = useState(null)
  
  // Accordion state for "By Matter" view
  const [expandedMatters, setExpandedMatters] = useState([])

  const pendingCount = handoffs.filter(h => h.status?.toLowerCase() === 'pending').length
  const completedCount = handoffs.filter(h => h.status?.toLowerCase() === 'completed').length
  const urgentCount = handoffs.filter(h => h.status?.toLowerCase() === 'urgent').length

  const toggleMatter = (id) => {
    setExpandedMatters(prev => prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id])
  }

  // Derived data
  const mattersWithTasks = useMemo(() => {
    return matters.map(matter => {
      const tasks = handoffs.filter(h => h.matter === matter.name || h.matter_name === matter.name)
        .sort((a,b) => (a.dueDate ? new Date(a.dueDate) : Infinity) - (b.dueDate ? new Date(b.dueDate) : Infinity))
      return { ...matter, tasks }
    }).sort((a, b) => new Date(b.updated) - new Date(a.updated))
  }, [matters, handoffs])

  return (
    <div className="p-8 max-w-[1400px] mx-auto space-y-8 bg-slate-50 min-h-screen">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h1>
          <p className="text-slate-500 mt-1">
            {currentUser ? `Welcome back, ${currentUser.name.split('@')[0]}.` : 'Welcome.'} Here's your overview.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="bg-white" onClick={() => navigate('/matters')}>View All Matters</Button>
          <Button className="gap-2 bg-[#1e293b] hover:bg-slate-800 text-white shadow-sm" onClick={() => setIsModalOpen(true)}>
            <Plus className="h-4 w-4" />
            New Legal Matter
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
          {['By Matter', 'By Task', 'By Owner', 'Calendar', 'Handoffs'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors",
                activeTab === tab
                  ? "border-[#1e293b] text-[#1e293b]"
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
              )}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* View Content */}
      <div className="mt-6">

        {/* ── BY MATTER VIEW (DEFAULT) ── */}
        {activeTab === "By Matter" && (
          <div className="space-y-8">
            {/* Top 4 Summary Cards */}
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

            {/* Accordion Matter List */}
            <div className="space-y-4">
              {mattersWithTasks.length === 0 ? (
                 <p className="text-slate-500 text-center py-10 italic">No matters found. Create one to get started.</p>
              ) : mattersWithTasks.map((matter) => {
                const isExpanded = expandedMatters.includes(matter.id)
                const completed = matter.tasks.filter(t => t.status?.toLowerCase() === 'completed').length
                
                return (
                  <div key={matter.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    {/* Header bar */}
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
                    
                    {/* Tasks Content */}
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
                        <Button variant="outline" size="sm" className="mt-4 gap-2 text-slate-600 bg-white shadow-sm" onClick={() => navigate('/tasks')}>
                          <Plus className="h-3.5 w-3.5" /> Go to Matter Tasks
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
                  {/* Column Header */}
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
                  
                  {/* Column Body */}
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

      <NewMatterModal open={isModalOpen} onOpenChange={setIsModalOpen} />
      <TaskDetailsModal open={!!selectedTask} onOpenChange={(open) => !open && setSelectedTask(null)} task={selectedTask} />
      <PassTheBatonModal open={!!batonTask} onOpenChange={(open) => !open && setBatonTask(null)} matter={null} initialTask={batonTask} />
    </div>
  )
}
