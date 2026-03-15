import React, { useState, useEffect } from "react"
import { useAppContext } from "../contexts/AppContext"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog"
import { Button } from "./ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select"
import { ArrowRight, Loader2, UserCheck } from "lucide-react"

export default function PassTheBatonModal({ open, onOpenChange, matter }) {
  const { lawyers, passTheBaton, currentUser } = useAppContext()
  const [toUser, setToUser] = useState("")
  const [contextNote, setContextNote] = useState("")
  const [priority, setPriority] = useState("pending")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Reset fields whenever the modal opens with a new matter
  useEffect(() => {
    if (open) {
      setToUser("")
      setContextNote("")
      setPriority("pending")
    }
  }, [open, matter?.id])

  const fromName = matter?.lead || currentUser?.name || "Unknown"
  // exclude the current lead from the "to" list
  const eligibleUsers = lawyers.filter(u => u.name !== fromName)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!toUser || !matter) return

    setIsSubmitting(true)
    await new Promise(resolve => setTimeout(resolve, 500)) // Brief UX delay

    passTheBaton(matter.id, toUser, contextNote.trim() || undefined, priority)

    setIsSubmitting(false)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden bg-card">
        <form onSubmit={handleSubmit} className="flex flex-col">

          {/* Header with gradient accent */}
          <div className="px-6 pt-6 pb-4 border-b bg-gradient-to-br from-slate-50 to-white">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-xl bg-slate-900 flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-lg">B</span>
              </div>
              <div>
                <DialogTitle className="text-lg leading-tight">Pass the Baton</DialogTitle>
                <DialogDescription className="text-xs mt-0.5 text-slate-500">
                  Transfer this case to another lawyer
                </DialogDescription>
              </div>
            </div>

            {/* Matter name highlight */}
            {matter && (
              <div className="mt-3 px-3 py-2 rounded-lg bg-slate-100 border border-slate-200">
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wide mb-0.5">Case</p>
                <p className="text-sm font-semibold text-slate-900 leading-snug">{matter.name}</p>
              </div>
            )}
          </div>

          <div className="px-6 py-5 space-y-5">

            {/* FROM → TO visual transfer row */}
            <div className="flex items-center gap-3">
              <div className="flex-1 space-y-1">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">From</p>
                <div className="flex items-center gap-2 px-3 py-2 bg-muted/40 rounded-lg border border-slate-200">
                  <div className="h-6 w-6 rounded-full bg-slate-700 text-white text-xs flex items-center justify-center font-bold">
                    {fromName.charAt(0)}
                  </div>
                  <span className="text-sm font-medium text-slate-700 truncate">{fromName}</span>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-slate-400 mt-5 shrink-0" />
              <div className="flex-1 space-y-1">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">To *</p>
                <Select value={toUser} onValueChange={setToUser}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Select lawyer..." />
                  </SelectTrigger>
                  <SelectContent>
                    {eligibleUsers.map(u => (
                      <SelectItem key={u.id} value={u.name}>
                        <div className="flex items-center gap-2">
                          <div className="h-5 w-5 rounded-full bg-slate-700 text-white text-[10px] flex items-center justify-center font-bold">
                            {u.name.charAt(0)}
                          </div>
                          {u.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Priority */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-foreground">Handoff Priority</label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Normal</SelectItem>
                  <SelectItem value="urgent">🔴 Urgent</SelectItem>
                  <SelectItem value="completed">✅ Completed / Final Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Context Note */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-foreground">
                Context Note
                <span className="ml-1.5 text-xs font-normal text-slate-400">(Optional but recommended)</span>
              </label>
              <textarea
                rows={3}
                value={contextNote}
                onChange={e => setContextNote(e.target.value)}
                placeholder={`e.g. "Completing pre-trial motions — please schedule deposition for next week. Key contact: ${fromName}"`}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
              />
              <p className="text-xs text-slate-400">
                This note will appear in the Dashboard's "Recent Handoffs" for the receiving lawyer.
              </p>
            </div>

          </div>

          {/* Footer */}
          <div className="px-6 py-4 flex items-center justify-end gap-3 border-t bg-muted/20">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!toUser || isSubmitting}
              className="min-w-[140px] gap-2"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <UserCheck className="h-4 w-4" />
                  Pass the Baton
                </>
              )}
            </Button>
          </div>

        </form>
      </DialogContent>
    </Dialog>
  )
}
