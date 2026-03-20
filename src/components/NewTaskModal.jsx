import React, { useState, useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { Calendar as CalendarIcon, Loader2, Plus, X, Pencil } from "lucide-react"

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
import { cn } from "../lib/utils"

const emptyItem = () => ({ id: Date.now().toString() + Math.random(), text: "", completed: false })

// Accepts optional `initialTask` for edit mode
export default function NewTaskModal({ open, onOpenChange, defaultMatter, initialTask }) {
  const { matters, users, addTask, updateTask } = useAppContext()
  const isEditMode = !!initialTask
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [checklist, setChecklist] = useState([emptyItem()])

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: "",
      matter: defaultMatter || "",
      priority: "Medium",
      status: "Pending",
      dueDate: "",
      assignTo: "",
    },
  })

  const addChecklistItem = () => setChecklist(prev => [...prev, emptyItem()])
  const updateChecklistItem = (id, text) => setChecklist(prev => prev.map(c => c.id === id ? { ...c, text } : c))
  const removeChecklistItem = (id) => setChecklist(prev => prev.filter(c => c.id !== id))

  const applyDefenceTemplate = () => {
    setChecklist([
      { id: "dt1", text: "Framework", completed: false },
      { id: "dt2", text: "Approve framework", completed: false },
      { id: "dt3", text: "Flesh out", completed: false },
      { id: "dt4", text: "Approve fleshed out version", completed: false },
      { id: "dt5", text: "File", completed: false },
      { id: "dt6", text: "Serve", completed: false },
      { id: "dt7", text: "Inform client", completed: false },
    ])
  }

  // Populate form when modal opens
  useEffect(() => {
    if (open) {
      if (isEditMode) {
        // Find the user ID from lawyers for assignTo
        reset({
          title: initialTask.task || initialTask.title || "",
          matter: defaultMatter || "",
          priority: "Medium",
          status: initialTask.status || "Pending",
          dueDate: "",
          assignTo: initialTask.to || "",
        })
        setChecklist(initialTask.checklist?.length > 0 ? initialTask.checklist : [emptyItem()])
      } else {
        reset({
          title: "",
          matter: defaultMatter || "",
          priority: "Medium",
          status: "Pending",
          dueDate: "",
          assignTo: "",
        })
        setChecklist([emptyItem()])
      }
    }
  }, [open, defaultMatter, isEditMode, initialTask, reset])

  const handleOpenChange = (isOpen) => {
    if (!isOpen) {
      reset()
      setChecklist([emptyItem()])
    }
    onOpenChange(isOpen)
  }

  const onSubmit = async (data) => {
    setIsSubmitting(true)
    const filledChecklist = checklist.filter(c => c.text.trim() !== "")

    if (isEditMode) {
      await updateTask(initialTask.id, {
        title: data.title,
        assignTo: data.assignTo,
        status: data.status,
        checklist: filledChecklist,
      })
    } else {
      await new Promise(resolve => setTimeout(resolve, 400))
      addTask({
        title: data.title,
        matter: data.matter,
        priority: data.priority,
        status: data.status,
        dueDate: data.dueDate,
        assignTo: data.assignTo,
        checklist: filledChecklist,
      })
    }

    setIsSubmitting(false)
    handleOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden bg-card">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col max-h-[90vh]">

          <div className="px-6 pt-6 pb-4 border-b">
            <DialogHeader>
              <DialogTitle className="text-xl flex items-center gap-2">
                {isEditMode ? <><Pencil className="h-5 w-5 text-slate-500" /> Edit Task</> : "New Task"}
              </DialogTitle>
              <DialogDescription>
                {isEditMode ? "Update task details and checklist." : "Create a task and assign initial ownership."}
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="px-6 py-4 overflow-y-auto flex-1 space-y-4">

            {/* Task Title */}
            <div className="space-y-1.5">
              <label htmlFor="title" className="text-sm font-semibold text-foreground">
                Task Name *
              </label>
              <Input
                id="title"
                placeholder="e.g. Draft Affidavit"
                {...register("title", { required: "Task name is required" })}
                className={errors.title ? "border-destructive focus-visible:ring-destructive" : ""}
              />
              {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
            </div>

            {/* Legal Matter — only in create mode */}
            {!isEditMode && (
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-foreground">Legal Matter *</label>
                <Controller
                  control={control}
                  name="matter"
                  rules={{ required: "Matter must be selected" }}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                      <SelectTrigger className={errors.matter ? "border-destructive focus:ring-destructive" : ""}>
                        <SelectValue placeholder="Select matter" />
                      </SelectTrigger>
                      <SelectContent>
                        {matters.map((matter) => (
                          <SelectItem key={matter.id} value={matter.id}>{matter.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.matter && <p className="text-xs text-destructive">{errors.matter.message}</p>}
              </div>
            )}

            {/* Assign To + Status */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-foreground">Assign To</label>
                <Controller
                  control={control}
                  name="assignTo"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                      <SelectTrigger><SelectValue placeholder="Select owner" /></SelectTrigger>
                      <SelectContent>
                        {users.map((user) => (
                          <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-foreground">Status</label>
                <Controller
                  control={control}
                  name="status"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                      <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="In Review">In Review</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            {/* Due Date — only in create mode */}
            {!isEditMode && (
              <div className="space-y-1.5">
                <label htmlFor="dueDate" className="text-sm font-semibold text-foreground">Due Date</label>
                <div className="relative">
                  <Input
                    id="dueDate"
                    type="date"
                    className="pr-10 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                    {...register("dueDate")}
                  />
                  <CalendarIcon className="absolute right-3 top-2.5 h-5 w-5 text-muted-foreground pointer-events-none" />
                </div>
              </div>
            )}

            {/* ── Checklist — primary content ── */}
            <div className="pt-3 border-t border-slate-100 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-foreground">Checklist Steps</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs px-3 bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200"
                  onClick={applyDefenceTemplate}
                >
                  Defence Template
                </Button>
              </div>

              <div className="space-y-2">
                {checklist.map((item, index) => (
                  <div key={item.id} className="flex items-center gap-2">
                    <div className="h-5 w-5 rounded border border-slate-300 bg-slate-50 flex items-center justify-center shrink-0 text-[10px] text-slate-400 font-medium">
                      {index + 1}
                    </div>
                    <Input
                      value={item.text}
                      onChange={(e) => updateChecklistItem(item.id, e.target.value)}
                      placeholder={`Step ${index + 1}`}
                      className="h-8 text-sm flex-1"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") { e.preventDefault(); addChecklistItem() }
                      }}
                    />
                    {checklist.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-300 hover:text-red-500 hover:bg-red-50 shrink-0"
                        onClick={() => removeChecklistItem(item.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full h-8 border-dashed border-slate-300 text-slate-500 hover:text-slate-700 bg-transparent hover:bg-slate-50"
                onClick={addChecklistItem}
              >
                <Plus className="h-4 w-4 mr-1.5" />
                Add Step
              </Button>
            </div>

          </div>

          <div className="px-6 py-4 flex items-center justify-end gap-3 border-t bg-muted/20">
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="min-w-[110px]">
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : isEditMode ? "Save Changes" : "Create Task"}
            </Button>
          </div>

        </form>
      </DialogContent>
    </Dialog>
  )
}
