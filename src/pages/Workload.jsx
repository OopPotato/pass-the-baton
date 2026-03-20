import React, { useState } from "react"
import { useAppContext } from "../contexts/AppContext"
import { Badge } from "../components/ui/badge"
import { Button } from "../components/ui/button"
import { Briefcase, Layers, Pencil, ArrowRight, Calendar, ChevronDown, Plus, Users, CheckCircle2, Circle } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { cn } from "../lib/utils"
import PassTheBatonModal from "../components/PassTheBatonModal"
import NewMatterModal from "../components/NewMatterModal"
import LawyerManagementModal from "../components/LawyerManagementModal"

const getStatusVariant = (status) => {
  switch (status?.toLowerCase()) {
    case "settled":
    case "completed": return "success"
    case "active":
    case "pre-trial": return "info"
    case "negotiation":
    case "review": return "warning"
    default: return "secondary"
  }
}

// Priority-based tab colors: URGENT = bright red, Normal = light blue (#E0F2FE tone)
const getPriorityTabColor = (priority) => {
  if (priority === "URGENT") {
    return "bg-red-600 hover:bg-red-500 text-white"
  }
  // Normal (default)
  return "bg-[#E0F2FE] hover:bg-[#BAE6FD] text-slate-700"
}

// ── File-drawer accordion: tabs stack up, active one expands content ──
function MatterStack({ matters, onEdit, onPassBaton }) {
  const { updateTaskChecklist } = useAppContext()
  // Sort latest updated = front (index 0)
  const sorted = [...matters].sort((a, b) => new Date(b.updated) - new Date(a.updated))
  const [activeIdx, setActiveIdx] = useState(0)
  // local checklist state keyed by task id
  const [checklistState, setChecklistState] = useState({})

  const toggleTaskItem = async (task, itemId) => {
    const current = checklistState[task.id] ?? task.checklist ?? []
    const updated = current.map(c => c.id === itemId ? { ...c, completed: !c.completed } : c)
    setChecklistState(prev => ({ ...prev, [task.id]: updated }))
    await updateTaskChecklist(task.id, updated)
  }

  if (sorted.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 border-2 border-dashed border-slate-200 rounded-xl text-center bg-slate-50/50">
        <Briefcase className="h-5 w-5 text-slate-300 mb-2" />
        <p className="text-xs text-slate-400">No cases assigned</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col rounded-xl overflow-hidden border border-slate-200 shadow-md">
      {sorted.map((m, i) => {
        const isActive = i === activeIdx
        const tabColor = getPriorityTabColor(m.priority)

        return (
          <div key={m.id} className="flex flex-col">

            {/* ── Tab / File header ── */}
            <button
              onClick={() => setActiveIdx(i)}
              className={cn(
                "w-full flex items-center justify-between px-4 py-3 gap-3 text-left",
                "transition-all duration-200",
                "hover:-translate-y-0.5 hover:shadow-md",
                "focus:outline-none",
                tabColor,
                isActive && "border-b-2 border-white/20"
              )}
            >
              <div className="flex items-center gap-2 min-w-0">
                {/* Small file icon */}
                <svg className="h-3.5 w-3.5 shrink-0 opacity-70" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V8a2 2 0 00-2-2h-5L9 4H4z" />
                </svg>
                <span className="font-semibold text-sm truncate">{m.name}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {/* Priority badge */}
                {m.priority === "URGENT" && (
                  <span className="text-[9px] font-bold px-1.5 py-0 h-4 rounded bg-white/20 text-white inline-flex items-center">
                    URGENT
                  </span>
                )}
                <Badge
                  variant={getStatusVariant(m.status)}
                  className="text-[9px] px-1.5 py-0 h-4"
                >
                  {m.status || "Active"}
                </Badge>
                <ChevronDown
                  className={cn(
                    "h-3.5 w-3.5 opacity-60 transition-transform duration-200",
                    isActive ? "rotate-180" : "rotate-0"
                  )}
                />
              </div>
            </button>

            {/* ── Expanded content — only for active file ── */}
            {isActive && (
              <div className="bg-white px-4 py-4 flex flex-col gap-3 border-t border-slate-100 animate-slide-in">

                {/* Client */}
                {m.client && (
                  <p className="text-xs text-slate-600">
                    <span className="font-semibold">Client:</span> {m.client}
                  </p>
                )}

                {/* Last updated */}
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Calendar className="h-3 w-3" />
                  <span>
                    {m.updated
                      ? formatDistanceToNow(new Date(m.updated), { addSuffix: true })
                      : "—"}
                  </span>
                </div>

                {/* All Tasks for the Matter — interactive */}
                {m.allTasks && m.allTasks.length > 0 && (
                  <div className="pt-2 border-t border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Tasks</p>
                    <div className="space-y-1.5">
                      {m.allTasks.map(task => {
                        const items = checklistState[task.id] ?? task.checklist ?? []
                        const doneCount = items.filter(c => c.completed).length
                        const totalCount = items.length
                        const isTaskDone = totalCount > 0 && doneCount === totalCount
                        return (
                          <div key={task.id} className={cn(
                            "rounded-md border p-2 transition-all duration-300",
                            isTaskDone ? "bg-green-50 border-green-200" : "bg-slate-50 border-slate-100"
                          )}>
                            {/* Task header row */}
                            <div className="flex items-center gap-2">
                              {isTaskDone
                                ? <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                                : <Circle className="h-4 w-4 text-slate-300 shrink-0" />
                              }
                              <div className="flex-1 min-w-0">
                                <p className={cn("text-xs leading-snug", isTaskDone ? "text-green-700 line-through font-medium" : "text-slate-700")}>
                                  {task.task || task.title}
                                </p>
                                <p className="text-[10px] text-slate-500 mt-0.5">
                                  Owner: <span className="font-medium">{task.to}</span>
                                  {totalCount > 0 && (
                                    <span className={cn("ml-1 px-1 rounded", isTaskDone ? "bg-green-100 text-green-700" : "bg-slate-200 text-slate-500")}>
                                      {doneCount}/{totalCount} done
                                    </span>
                                  )}
                                </p>
                              </div>
                            </div>
                            {/* Inline checklist items */}
                            {items.length > 0 && (
                              <div className="mt-1.5 ml-6 space-y-1">
                                {items.map(item => (
                                  <button
                                    key={item.id}
                                    onClick={e => { e.stopPropagation(); toggleTaskItem(task, item.id) }}
                                    className="flex items-center gap-1.5 w-full text-left group"
                                  >
                                    {item.completed
                                      ? <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />
                                      : <Circle className="h-3.5 w-3.5 text-slate-300 group-hover:text-slate-500 shrink-0 transition-colors" />
                                    }
                                    <span className={cn(
                                      "text-[11px] leading-snug",
                                      item.completed ? "line-through text-slate-400" : "text-slate-600 group-hover:text-slate-800"
                                    )}>{item.text}</span>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-50">
                  <Button
                    size="sm" variant="outline"
                    className="flex-1 h-7 text-xs gap-1.5"
                    onClick={(e) => { e.stopPropagation(); onEdit(m) }}
                  >
                    <Pencil className="h-3 w-3" /> Edit
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1 h-7 text-xs gap-1.5"
                    onClick={(e) => { e.stopPropagation(); onPassBaton(m) }}
                  >
                    <ArrowRight className="h-3 w-3" /> Pass Baton
                  </Button>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default function Workload() {
  const { matters, lawyers, handoffs } = useAppContext()

  const [batonMatter, setBatonMatter] = useState(null)
  const [editMatter, setEditMatter] = useState(null)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLawyerModalOpen, setIsLawyerModalOpen] = useState(false)

  const handleEdit = (m) => { setEditMatter(m); setIsEditOpen(true) }
  const handlePassBaton = (m) => setBatonMatter(m)

  // Group matters by lead lawyer only (no duplication across task assignees)
  // Each matter appears exactly in its lead lawyer's column
  const columns = [
    {
      id: "unassigned",
      name: "Unassigned",
      initial: "?",
      matters: matters
        .filter(m => !m.lead || m.lead === "Unassigned")
        .map(m => ({
          ...m,
          allTasks: handoffs.filter(h => h.matter === m.name || h.matter_name === m.name)
        })),
    },
    ...lawyers.map(u => ({
      id: u.id,
      name: u.name,
      initial: u.name.charAt(0).toUpperCase(),
      matters: matters
        .filter(m => m.lead === u.name)
        .map(m => ({
          ...m,
          allTasks: handoffs.filter(h => h.matter === m.name || h.matter_name === m.name)
        })),
    })),
  ]

  const visibleColumns = columns.filter((col, i) => i === 0 ? col.matters.length > 0 : true)

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 drop-shadow-sm">Workload</h1>
            <p className="text-slate-500 mt-1 font-medium">Track case distribution across lawyers.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline"
              onClick={() => setIsLawyerModalOpen(true)}
              className="h-11 shadow-sm border-slate-200 text-slate-700 hover:bg-slate-50 gap-2 transition-all px-5"
            >
              <Users className="h-4 w-4 text-slate-500" />
              <span className="font-semibold text-sm">Manage Lawyers</span>
            </Button>
            <Button 
              onClick={() => setIsModalOpen(true)}
              className="h-11 shadow-md hover:shadow-lg transition-all bg-slate-900 hover:bg-slate-800 gap-2 px-6"
            >
              <Plus className="h-5 w-5" />
              <span className="font-semibold text-sm">New Matter</span>
            </Button>
          </div>
        </div>

      {/* Priority legend */}
      <div className="flex items-center gap-4 text-xs text-slate-500">
        <span className="font-medium">Priority:</span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-sm bg-red-600"></span> URGENT
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-sm bg-[#E0F2FE]"></span> Normal
        </span>
      </div>

      {/* Empty state */}
      {matters.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="h-16 w-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
            <Layers className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-700">No cases yet</h3>
          <p className="text-sm text-slate-400 mt-1 max-w-xs">
            Create a case from the Dashboard and assign it to a team member to see it here.
          </p>
        </div>
      )}

      {/* 4-column grid */}
      {matters.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 items-start">
          {visibleColumns.map(col => (
            <div key={col.id} className="flex flex-col gap-3 min-w-0">

              {/* Column header */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center gap-3 shadow-sm">
                <div className="h-10 w-10 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-sm shrink-0">
                  {col.initial}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-slate-900 text-sm truncate">{col.name}</h3>
                  <p className="text-xs text-slate-500">
                    {col.matters.length} case{col.matters.length !== 1 ? "s" : ""}
                  </p>
                </div>
                {col.matters.length > 1 && (
                  <Layers className="h-4 w-4 text-slate-400 shrink-0" />
                )}
              </div>

              {/* File stack */}
              <MatterStack
                matters={col.matters}
                onEdit={handleEdit}
                onPassBaton={handlePassBaton}
              />

            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      <PassTheBatonModal
        open={!!batonMatter}
        onOpenChange={(open) => { if (!open) setBatonMatter(null) }}
        matter={batonMatter}
      />
      <NewMatterModal
        open={isEditOpen}
        onOpenChange={(open) => { if (!open) { setIsEditOpen(false); setEditMatter(null) } }}
        initialData={editMatter}
      />
      <NewMatterModal 
        open={isModalOpen} 
        onOpenChange={setIsModalOpen}
      />

      <LawyerManagementModal
        open={isLawyerModalOpen}
        onOpenChange={setIsLawyerModalOpen}
      />
    </div>
  )
}
