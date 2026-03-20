import React, { useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { Calendar as CalendarIcon, Loader2, Pencil } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { useAppContext } from "../contexts/AppContext"

// Accepts optional `initialTask` for edit mode
export default function NewTaskModal({ open, onOpenChange, defaultMatter, initialTask }) {
  const { matters, users, addTask, updateTask } = useAppContext()
  const isEditMode = !!initialTask

  const { register, handleSubmit, control, reset, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { title: "", matter: defaultMatter || "", assignTo: "", status: "pending", dueDate: "" },
  })

  useEffect(() => {
    if (open) {
      if (isEditMode) {
        reset({
          title: initialTask.task || initialTask.title || "",
          matter: defaultMatter || "",
          assignTo: initialTask.to || "",
          status: initialTask.status || "pending",
          dueDate: "",
        })
      } else {
        reset({ title: "", matter: defaultMatter || "", assignTo: "", status: "pending", dueDate: "" })
      }
    }
  }, [open, defaultMatter, isEditMode, initialTask, reset])

  const handleClose = () => { reset(); onOpenChange(false) }

  const onSubmit = async (data) => {
    if (isEditMode) {
      await updateTask(initialTask.id, { title: data.title, assignTo: data.assignTo, status: data.status, checklist: initialTask.checklist || [] })
    } else {
      await new Promise(r => setTimeout(r, 400))
      addTask({ title: data.title, matter: data.matter, status: data.status, dueDate: data.dueDate, assignTo: data.assignTo, checklist: [] })
    }
    handleClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[420px] p-0 overflow-hidden bg-card">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">

          <div className="px-6 pt-6 pb-4 border-b">
            <DialogHeader>
              <DialogTitle className="text-xl flex items-center gap-2">
                {isEditMode && <Pencil className="h-4 w-4 text-slate-500" />}
                {isEditMode ? "Edit Task" : "New Task"}
              </DialogTitle>
              <DialogDescription>
                {isEditMode ? "Update this task." : "Add a task to the matter checklist."}
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="px-6 py-5 space-y-4">

            {/* Task Name */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-foreground">Task Name *</label>
              <Input
                placeholder="e.g. Draft Affidavit"
                {...register("title", { required: "Task name is required" })}
                className={errors.title ? "border-destructive" : ""}
                autoFocus
              />
              {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
            </div>

            {/* Legal Matter — create only */}
            {!isEditMode && (
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-foreground">Legal Matter *</label>
                <Controller control={control} name="matter"
                  rules={{ required: "Matter must be selected" }}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className={errors.matter ? "border-destructive" : ""}>
                        <SelectValue placeholder="Select matter" />
                      </SelectTrigger>
                      <SelectContent>
                        {matters.map(m => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
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
                <Controller control={control} name="assignTo"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger><SelectValue placeholder="Select owner" /></SelectTrigger>
                      <SelectContent>
                        {users.map(u => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-foreground">Status</label>
                <Controller control={control} name="status"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in progress">In Progress</SelectItem>
                        <SelectItem value="in review">In Review</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            {/* Due Date — create only */}
            {!isEditMode && (
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-foreground">Due Date</label>
                <div className="relative">
                  <Input type="date"
                    className="pr-10 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                    {...register("dueDate")}
                  />
                  <CalendarIcon className="absolute right-3 top-2.5 h-5 w-5 text-muted-foreground pointer-events-none" />
                </div>
              </div>
            )}

          </div>

          <div className="px-6 py-4 flex justify-end gap-3 border-t bg-muted/20">
            <Button type="button" variant="outline" onClick={handleClose}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting} className="min-w-[110px]">
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : isEditMode ? "Save Changes" : "Add Task"}
            </Button>
          </div>

        </form>
      </DialogContent>
    </Dialog>
  )
}
