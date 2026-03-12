import React, { useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { format } from "date-fns"
import { Calendar as CalendarIcon, Loader2 } from "lucide-react"

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

export default function NewTaskModal({ open, onOpenChange }) {
  const { matters, users, addTask } = useAppContext()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: "",
      matter: "",
      priority: "Medium",
      status: "Pending",
      dueDate: "",
      assignTo: "",
      description: "",
    },
  })

  const onSubmit = async (data) => {
    setIsSubmitting(true)
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 600))
    
    addTask({
      title: data.title,
      matter: data.matter,
      priority: data.priority,
      status: data.status,
      dueDate: data.dueDate,
      assignTo: data.assignTo,
      description: data.description,
    })
    
    setIsSubmitting(false)
    reset()
    onOpenChange(false)
  }

  // Handle open state change (reset form if closed)
  const handleOpenChange = (isOpen) => {
    if (!isOpen) {
      reset()
    }
    onOpenChange(isOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-card">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col max-h-[90vh]">
          
          <div className="px-6 pt-6 pb-4">
            <DialogHeader>
              <DialogTitle className="text-xl">New Task</DialogTitle>
              <DialogDescription>
                Create a task and assign initial ownership.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="px-6 py-4 overflow-y-auto flex-1 space-y-5 flex flex-col">
            {/* Task Title */}
            <div className="space-y-1.5">
              <label htmlFor="title" className="text-sm font-semibold text-foreground">
                Task Title *
              </label>
              <Input
                id="title"
                placeholder="e.g. Draft Affidavit"
                {...register("title", { required: "Task title is required" })}
                className={errors.title ? "border-destructive focus-visible:ring-destructive" : ""}
              />
              {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
            </div>

            {/* Legal Matter */}
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
                        <SelectItem key={matter.id} value={matter.id}>
                          {matter.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.matter && <p className="text-xs text-destructive">{errors.matter.message}</p>}
            </div>

            {/* Priority & Status */}
            <div className="grid grid-cols-2 gap-4">
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
                        <SelectItem value="Low">Low</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                        <SelectItem value="Urgent">Urgent</SelectItem>
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
                      <SelectTrigger>
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
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

            {/* Due Date */}
            <div className="space-y-1.5">
              <label htmlFor="dueDate" className="text-sm font-semibold text-foreground">
                Due Date
              </label>
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

            {/* Assign To */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-foreground">Assign To</label>
              <Controller
                control={control}
                name="assignTo"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select owner" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name}
                        </SelectItem>
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
                placeholder="Task details..."
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
            <Button type="submit" disabled={isSubmitting} className="min-w-[110px]">
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Task"}
            </Button>
          </div>

        </form>
      </DialogContent>
    </Dialog>
  )
}
