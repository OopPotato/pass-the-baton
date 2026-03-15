import React from "react"
import { formatDistanceToNow } from "date-fns"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog"
import { Badge } from "./ui/badge"
import { Button } from "./ui/button"
import { User, Building2, AlertCircle, FileText, Clock } from "lucide-react"

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
  if (priority === "URGENT") return "text-red-600 bg-red-50 border-red-200"
  return "text-sky-700 bg-[#E0F2FE] border-sky-200"
}

function DetailRow({ icon: Icon, label, value, badge, badgeVariant }) {
  if (!value && !badge) return null
  return (
    <div className="flex items-start gap-3 py-3 border-b border-slate-100 last:border-0">
      <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
        <Icon className="h-4 w-4 text-slate-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-0.5">{label}</p>
        {badge ? (
          <Badge variant={badgeVariant} className="mt-0.5">{badge}</Badge>
        ) : (
          <p className="text-sm font-semibold text-slate-800 leading-snug">{value}</p>
        )}
      </div>
    </div>
  )
}

export default function ViewCaseModal({ open, onOpenChange, matter, onPassBaton, onEdit }) {
  if (!matter) return null

  const updatedAgo = matter.updated
    ? formatDistanceToNow(new Date(matter.updated), { addSuffix: true })
    : "Unknown"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden bg-card">

        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b bg-gradient-to-br from-slate-50 to-white">
          <DialogHeader>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide mb-1">Legal Matter</p>
                <DialogTitle className="text-xl leading-tight text-slate-900">{matter.name}</DialogTitle>
                {matter.caseNumber && (
                  <p className="text-xs text-slate-500 mt-1 font-mono">#{matter.caseNumber}</p>
                )}
              </div>
              <Badge variant={getStatusVariant(matter.status)} className="shrink-0 mt-1">
                {matter.status}
              </Badge>
            </div>
          </DialogHeader>
        </div>

        {/* Case Details */}
        <div className="px-6 py-2 overflow-y-auto max-h-[400px]">
          <DetailRow icon={User} label="Lead Lawyer" value={matter.lead || "Unassigned"} />
          {matter.client && (
            <DetailRow icon={Building2} label="Client" value={matter.client} />
          )}
          {matter.priority && (
            <div className="flex items-start gap-3 py-3 border-b border-slate-100">
              <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                <AlertCircle className="h-4 w-4 text-slate-500" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-1">Priority</p>
                <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold ${getPriorityColor(matter.priority)}`}>
                  {matter.priority}
                </span>
              </div>
            </div>
          )}
          <DetailRow icon={Clock} label="Last Updated" value={updatedAgo} />
          {matter.description && (
            <DetailRow icon={FileText} label="Description" value={matter.description} />
          )}
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 flex items-center justify-between gap-3 border-t bg-muted/20">
          <Button
            variant="outline"
            onClick={() => { onOpenChange(false); onEdit && onEdit(matter) }}
            className="flex-1"
          >
            Edit Case
          </Button>
          <Button
            onClick={() => { onOpenChange(false); onPassBaton && onPassBaton(matter) }}
            className="flex-1 gap-2"
          >
            🏃 Pass the Baton
          </Button>
        </div>

      </DialogContent>
    </Dialog>
  )
}
