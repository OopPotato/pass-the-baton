import React, { useState } from "react"
import { useAppContext } from "../contexts/AppContext"
import { Badge } from "../components/ui/badge"
import { Button } from "../components/ui/button"
import { Calendar, Briefcase, ChevronLeft, ChevronRight, Layers, Plus, Pencil, ArrowRight } from "lucide-react"
import { cn } from "../lib/utils"
import { formatDistanceToNow } from "date-fns"
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

// ── Stacked card carousel per column ──
function MatterStack({ matters, onEdit, onPassBaton }) {
  const [activeIdx, setActiveIdx] = useState(0)
  const total = matters.length

  if (total === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 border-2 border-dashed border-slate-200 rounded-xl text-center bg-slate-50/50">
        <Briefcase className="h-5 w-5 text-slate-300 mb-2" />
        <p className="text-xs text-slate-400">No cases assigned</p>
      </div>
    )
  }

  const matter = matters[activeIdx]
  const prev = () => setActiveIdx(i => (i - 1 + total) % total)
  const next = () => setActiveIdx(i => (i + 1) % total)

  return (
    <div className="relative">
      {/* Stack shadow layers */}
      {total > 2 && (
        <div className="absolute inset-x-5 bottom-0 h-full bg-slate-200 rounded-xl transform translate-y-3 scale-[0.92] -z-20" />
      )}
      {total > 1 && (
        <div className="absolute inset-x-3 bottom-0 h-full bg-slate-100 border border-slate-200 rounded-xl transform translate-y-1.5 scale-[0.96] -z-10" />
      )}

      {/* Active card */}
      <div key={activeIdx} className="group bg-white border border-slate-200 shadow-md rounded-xl p-4 flex flex-col gap-3 animate-slide-in">

        {/* Case name + status */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-semibold text-sm text-slate-900 leading-snug line-clamp-2">{matter.name}</p>
            {matter.type && <p className="text-xs text-slate-400 mt-0.5 truncate">{matter.type}</p>}
          </div>
          <Badge variant={getStatusVariant(matter.status)} className="shrink-0 text-[10px]">
            {matter.status || "Active"}
          </Badge>
        </div>

        {/* Client */}
        {matter.client && (
          <p className="text-xs text-slate-500 truncate">
            <span className="font-medium text-slate-600">Client:</span> {matter.client}
          </p>
        )}

        {/* Last updated */}
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <Calendar className="h-3 w-3" />
          <span>
            {matter.updated
              ? formatDistanceToNow(new Date(matter.updated), { addSuffix: true })
              : "—"}
          </span>
        </div>

        {/* Actions row — hidden until card is hovered */}
        <div className="flex items-center gap-2 border-t border-slate-50 pt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <Button
            size="sm"
            variant="outline"
            className="flex-1 h-7 text-xs gap-1.5"
            onClick={() => onEdit(matter)}
          >
            <Pencil className="h-3 w-3" />
            Edit
          </Button>
          <Button
            size="sm"
            className="flex-1 h-7 text-xs gap-1.5"
            onClick={() => onPassBaton(matter)}
          >
            <ArrowRight className="h-3 w-3" />
            Pass Baton
          </Button>
        </div>

        {/* Nav controls */}
        {total > 1 && (
          <div className="flex items-center justify-between">
            <div className="flex gap-1">
              {matters.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveIdx(i)}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-200",
                    i === activeIdx ? "w-4 bg-slate-700" : "w-1.5 bg-slate-300 hover:bg-slate-400"
                  )}
                />
              ))}
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={prev}
                className="h-6 w-6 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
              >
                <ChevronLeft className="h-3.5 w-3.5 text-slate-500" />
              </button>
              <span className="text-[10px] font-semibold text-slate-400 tabular-nums">{activeIdx + 1}/{total}</span>
              <button
                onClick={next}
                className="h-6 w-6 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
              >
                <ChevronRight className="h-3.5 w-3.5 text-slate-500" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function Workload() {
  const { matters, users } = useAppContext()

  const [batonMatter, setBatonMatter] = useState(null)
  const [editMatter, setEditMatter] = useState(null)
  const [isEditOpen, setIsEditOpen] = useState(false)

  const handleEdit = (m) => { setEditMatter(m); setIsEditOpen(true) }
  const handlePassBaton = (m) => setBatonMatter(m)

  // Group all matters by lead attorney
  // "Unassigned" catches anything without a lead or with lead === "Unassigned"
  const columns = [
    {
      id: "unassigned",
      name: "Unassigned",
      initial: "?",
      matters: matters.filter(m => !m.lead || m.lead === "Unassigned"),
    },
    ...users.map(u => ({
      id: u.id,
      name: u.name,
      initial: u.name.charAt(0).toUpperCase(),
      matters: matters.filter(m => m.lead === u.name),
    })),
  ]

  // Hide Unassigned column if empty to keep it clean
  const visibleColumns = columns.filter((col, i) => i === 0 ? col.matters.length > 0 : true)

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Workload by Owner</h1>
          <p className="text-muted-foreground mt-1">
            All active cases grouped by lead attorney. Click a card to edit or pass the baton.
          </p>
        </div>
        <div className="flex items-center gap-3 text-sm flex-wrap">
          <div className="px-3 py-1.5 rounded-full bg-slate-100 font-medium text-slate-700">
            {matters.length} total case{matters.length !== 1 ? "s" : ""}
          </div>
          <div className="px-3 py-1.5 rounded-full bg-amber-50 font-medium text-amber-700">
            {matters.filter(m => !m.lead || m.lead === "Unassigned").length} unassigned
          </div>
        </div>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
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

              {/* Stacked cards */}
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
