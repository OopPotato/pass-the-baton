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

// ── File-cabinet stack: all cards overlap in the same grid cell ──
function MatterStack({ matters, onEdit, onPassBaton }) {
  const [frontIdx, setFrontIdx] = useState(0)

  // Latest updated = front (index 0 after sort)
  const sorted = [...matters].sort((a, b) => new Date(b.updated) - new Date(a.updated))
  const total = sorted.length

  if (total === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 border-2 border-dashed border-slate-200 rounded-xl text-center bg-slate-50/50">
        <Briefcase className="h-5 w-5 text-slate-300 mb-2" />
        <p className="text-xs text-slate-400">No cases assigned</p>
      </div>
    )
  }

  // Reorder so the chosen front is first in the display list
  const reordered = [
    sorted[frontIdx],
    ...sorted.filter((_, i) => i !== frontIdx),
  ]

  // Clicking the front card sends it to the back (cycles)
  const cycleToBack = () => {
    const nextFront = sorted[(frontIdx + 1) % total]
    setFrontIdx(sorted.indexOf(nextFront))
  }

  // Max 3 cards visible in the stack
  const STACK_DEPTH = Math.min(total, 3)
  const PEEK_PX = 10 // px each background card peeks out

  return (
    <div>
      {/* CSS grid overlay: all cards share the same grid cell */}
      <div
        className="relative"
        style={{ paddingBottom: (STACK_DEPTH - 1) * PEEK_PX }}
      >
        {/* Back cards — rendered first (bottom of stack) */}
        {reordered.slice(1, STACK_DEPTH).reverse().map((m, revIdx) => {
          const depth = STACK_DEPTH - 1 - revIdx // 1 = closest behind front
          return (
            <div
              key={m.id}
              className="absolute inset-x-0 top-0 bg-white border border-slate-200 rounded-xl"
              style={{
                transform: `translateY(${depth * PEEK_PX}px) scaleX(${1 - depth * 0.025})`,
                zIndex: 10 - depth,
                // Show just the top strip
                height: '100%',
                opacity: 1 - depth * 0.15,
              }}
            >
              {/* Peek strip: just the header of the behind-card */}
              <div className="px-4 pt-3 pb-2 flex items-center justify-between gap-2">
                <p className="text-xs font-semibold text-slate-500 truncate">{m.name}</p>
                <Badge variant={getStatusVariant(m.status)} className="text-[9px] shrink-0">{m.status}</Badge>
              </div>
            </div>
          )
        })}

        {/* Front card — on top, always fully visible */}
        <div
          className="relative bg-white border border-slate-200 shadow-lg rounded-xl p-4 flex flex-col gap-3 group animate-slide-in"
          style={{ zIndex: 20 }}
        >
          {/* Cycle hint (only when multiple cards) */}
          {total > 1 && (
            <button
              onClick={cycleToBack}
              className="absolute top-2.5 right-2.5 h-5 px-2 rounded-full bg-slate-100 hover:bg-slate-200 text-[10px] font-semibold text-slate-400 hover:text-slate-600 transition-colors flex items-center gap-1"
              title="Cycle to next case"
            >
              {frontIdx + 1}/{total} ↓
            </button>
          )}

          {/* Case name + status */}
          <div className="flex items-start justify-between gap-2 pr-10">
            <div className="min-w-0">
              <p className="font-semibold text-sm text-slate-900 leading-snug line-clamp-2">{reordered[0].name}</p>
              {reordered[0].type && <p className="text-xs text-slate-400 mt-0.5 truncate">{reordered[0].type}</p>}
            </div>
            <Badge variant={getStatusVariant(reordered[0].status)} className="shrink-0 text-[10px]">
              {reordered[0].status || 'Active'}
            </Badge>
          </div>

          {/* Client */}
          {reordered[0].client && (
            <p className="text-xs text-slate-500 truncate">
              <span className="font-medium text-slate-600">Client:</span> {reordered[0].client}
            </p>
          )}

          {/* Last updated */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Calendar className="h-3 w-3" />
            <span>
              {reordered[0].updated
                ? formatDistanceToNow(new Date(reordered[0].updated), { addSuffix: true })
                : '—'}
            </span>
          </div>

          {/* Actions — hidden until hover */}
          <div className="flex items-center gap-2 border-t border-slate-50 pt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <Button
              size="sm" variant="outline"
              className="flex-1 h-7 text-xs gap-1.5"
              onClick={(e) => { e.stopPropagation(); onEdit(reordered[0]) }}
            >
              <Pencil className="h-3 w-3" /> Edit
            </Button>
            <Button
              size="sm"
              className="flex-1 h-7 text-xs gap-1.5"
              onClick={(e) => { e.stopPropagation(); onPassBaton(reordered[0]) }}
            >
              <ArrowRight className="h-3 w-3" /> Pass Baton
            </Button>
          </div>
        </div>
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
