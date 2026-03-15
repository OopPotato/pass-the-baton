import React, { useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { Loader2, Plus, Pencil, Trash2, Check, X } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select"
import { useAppContext } from "../contexts/AppContext"

// ── Inline lawyer management row ──
function LawyerManagerRow({ lawyer, onEdit, onRemove }) {
  const [editing, setEditing] = useState(false)
  const [val, setVal] = useState(lawyer.name)

  const commit = () => {
    if (val.trim()) onEdit(lawyer.id, val.trim())
    setEditing(false)
  }

  return (
    <div className="flex items-center gap-2 py-1">
      {editing ? (
        <>
          <Input
            value={val}
            onChange={e => setVal(e.target.value)}
            className="h-7 text-xs flex-1"
            onKeyDown={e => { if (e.key === "Enter") commit(); if (e.key === "Escape") setEditing(false) }}
            autoFocus
          />
          <button onClick={commit} className="text-green-600 hover:text-green-700 p-0.5"><Check className="h-3.5 w-3.5" /></button>
          <button onClick={() => setEditing(false)} className="text-slate-400 hover:text-slate-600 p-0.5"><X className="h-3.5 w-3.5" /></button>
        </>
      ) : (
        <>
          <span className="text-xs text-slate-700 flex-1 truncate">{lawyer.name}</span>
          <button onClick={() => { setVal(lawyer.name); setEditing(true) }} className="text-slate-400 hover:text-slate-600 p-0.5"><Pencil className="h-3 w-3" /></button>
          <button onClick={() => onRemove(lawyer.id)} className="text-red-400 hover:text-red-600 p-0.5"><Trash2 className="h-3 w-3" /></button>
        </>
      )}
    </div>
  )
}

export default function NewMatterModal({ open, onOpenChange, initialData = null }) {
  const { addMatter, updateMatter, lawyers, addLawyer, editLawyer, removeLawyer } = useAppContext()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showLawyerManager, setShowLawyerManager] = useState(false)
  const [newLawyerName, setNewLawyerName] = useState("")

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: initialData?.name || "",
      caseNumber: "",
      client: "",
      priority: "Normal",
      leadLawyer: initialData?.lead || "",
      description: "",
    },
  })

  // Whenever the modal opens with initialData, update form values
  React.useEffect(() => {
    if (open) {
      reset({
        title: initialData?.name || "",
        caseNumber: "",
        client: "",
        priority: "Normal",
        leadLawyer: initialData?.lead || "",
        description: "",
      })
      setShowLawyerManager(false)
      setNewLawyerName("")
    }
  }, [open, initialData, reset])

  const onSubmit = async (data) => {
    setIsSubmitting(true)
    await new Promise(resolve => setTimeout(resolve, 600))
    
    const matterPayload = {
      name: data.title,
      status: "Active",
      lead: data.leadLawyer || "Unassigned",
      priority: data.priority,
      client: data.client,
      caseNumber: data.caseNumber,
      description: data.description,
    }

    if (initialData) {
      updateMatter(initialData.id, matterPayload)
    } else {
      addMatter(matterPayload)
    }
    
    setIsSubmitting(false)
    reset()
    onOpenChange(false)
  }

  const handleOpenChange = (isOpen) => {
    if (!isOpen) {
      reset()
    }
    onOpenChange(isOpen)
  }

  const handleAddLawyer = () => {
    if (newLawyerName.trim()) {
      addLawyer(newLawyerName.trim())
      setNewLawyerName("")
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-card">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col max-h-[90vh]">
          
          <div className="px-6 pt-6 pb-4">
            <DialogHeader>
              <DialogTitle className="text-xl">
                {initialData ? "Edit Legal Matter" : "New Legal Matter"}
              </DialogTitle>
              <DialogDescription>
                Create a new case or matter to track.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="px-6 py-4 overflow-y-auto flex-1 space-y-5 flex flex-col">
            {/* Matter Title */}
            <div className="space-y-1.5">
              <label htmlFor="title" className="text-sm font-semibold text-foreground">
                Matter Title *
              </label>
              <Input
                id="title"
                placeholder="e.g. Smith v. Jones"
                {...register("title", { required: "Matter title is required" })}
                className={errors.title ? "border-destructive focus-visible:ring-destructive" : ""}
              />
              {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Case Number */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-foreground">Case Number</label>
                <Input
                  placeholder="e.g. 2024-CV-001"
                  {...register("caseNumber")}
                />
              </div>
              {/* Client */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-foreground">Client</label>
                <Input
                  placeholder="Client name"
                  {...register("client")}
                />
              </div>
            </div>

            {/* Priority */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-foreground">Priority</label>
              <Controller
                control={control}
                name="priority"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Normal">Normal</SelectItem>
                      <SelectItem value="URGENT">URGENT</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {/* Lead Lawyer */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-foreground">Assign Lead Lawyer</label>
                <button
                  type="button"
                  onClick={() => setShowLawyerManager(v => !v)}
                  className="text-xs text-primary hover:underline"
                >
                  {showLawyerManager ? "Hide" : "Manage Lawyers"}
                </button>
              </div>

              {/* Lawyer Manager Panel */}
              {showLawyerManager && (
                <div className="border border-slate-200 rounded-lg p-3 bg-slate-50 space-y-1">
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-2">Lawyer List</p>
                  {lawyers.length === 0 && (
                    <p className="text-xs text-slate-400 italic">No lawyers added yet.</p>
                  )}
                  {lawyers.map(lawyer => (
                    <LawyerManagerRow
                      key={lawyer.id}
                      lawyer={lawyer}
                      onEdit={editLawyer}
                      onRemove={removeLawyer}
                    />
                  ))}
                  {/* Add new lawyer */}
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-200 mt-2">
                    <Input
                      value={newLawyerName}
                      onChange={e => setNewLawyerName(e.target.value)}
                      placeholder="New lawyer name..."
                      className="h-7 text-xs flex-1"
                      onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); handleAddLawyer() } }}
                    />
                    <Button type="button" size="sm" variant="outline" className="h-7 px-2 gap-1 text-xs" onClick={handleAddLawyer}>
                      <Plus className="h-3 w-3" /> Add
                    </Button>
                  </div>
                </div>
              )}

              <Controller
                control={control}
                name="leadLawyer"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Unassigned" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Unassigned">Unassigned</SelectItem>
                      {lawyers.map(l => (
                        <SelectItem key={l.id} value={l.name}>{l.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5 pb-2">
              <label htmlFor="description" className="text-sm font-semibold text-foreground">
                Description
              </label>
              <textarea
                id="description"
                rows={3}
                placeholder="Brief description..."
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                {...register("description")}
              />
            </div>

          </div>

          <div className="px-6 py-4 flex items-center justify-end gap-3 border-t bg-muted/20">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="min-w-[124px]">
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : (initialData ? "Save Changes" : "Create Matter")}
            </Button>
          </div>

        </form>
      </DialogContent>
    </Dialog>
  )
}
