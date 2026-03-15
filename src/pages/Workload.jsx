import React, { useState } from "react"
import { useAppContext } from "../contexts/AppContext"
import { Badge } from "../components/ui/badge"
import { Button } from "../components/ui/button"
import { Briefcase, Layers, Pencil, ArrowRight, Calendar, ChevronDown } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { cn } from "../lib/utils"
import PassTheBatonModal from "../components/PassTheBatonModal"
import NewMatterModal from "../components/NewMatterModal"

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
  // Sort latest updated = front (index 0)
  const sorted = [...matters].sort((a, b) => new Date(b.updated) - new Date(a.updated))
  const [activeIdx, setActiveIdx] = useState(0)

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

                {/* Actions */}
                <div className="flex items-center gap-2 pt-1 border-t border-slate-50">
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
  const { matters, lawyers } = useAppContext()

  const [batonMatter, setBatonMatter] = useState(null)
  const [editMatter, setEditMatter] = useState(null)
  const [isEditOpen, setIsEditOpen] = useState(false)

  const handleEdit = (m) => { setEditMatter(m); setIsEditOpen(true) }
  const handlePassBaton = (m) => setBatonMatter(m)

  // Group matters by lead lawyer
  const columns = [
    {
      id: "unassigned",
      name: "Unassigned",
      initial: "?",
      matters: matters.filter(m => !m.lead || m.lead === "Unassigned"),
    },
    ...lawyers.map(u => ({
      id: u.id,
      name: u.name,
      initial: u.name.charAt(0).toUpperCase(),
      matters: matters.filter(m => m.lead === u.name),
    })),
  ]

  const visibleColumns = columns.filter((col, i) => i === 0 ? col.matters.length > 0 : true)

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Workload</h1>
          <p className="text-muted-foreground mt-1">
            All cases grouped by lead lawyer. Click a file tab to expand or interact.
          </p>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <div className="px-3 py-1.5 rounded-full bg-slate-100 font-medium text-slate-700">
            {matters.length} total case{matters.length !== 1 ? "s" : ""}
          </div>
          <div className="px-3 py-1.5 rounded-full bg-amber-50 font-medium text-amber-700">
            {matters.filter(m => !m.lead || m.lead === "Unassigned").length} unassigned
          </div>
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
    </div>
  )
}
