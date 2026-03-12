import React, { useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { Loader2 } from "lucide-react"

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

export default function NewMatterModal({ open, onOpenChange, initialData = null }) {
  const { addMatter } = useAppContext()
  const [isSubmitting, setIsSubmitting] = useState(false)

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
      practiceArea: initialData?.type || "Litigation",
      priority: "Medium",
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
        practiceArea: initialData?.type || "Litigation",
        priority: "Medium",
        description: "",
      })
    }
  }, [open, initialData, reset])

  const onSubmit = async (data) => {
    setIsSubmitting(true)
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 600))
    
    addMatter({
      name: data.title,
      type: data.practiceArea,
      status: "Active", // Default status for new cases
      lead: "Unassigned", // Can be assigned later
      priority: data.priority,
      client: data.client,
      caseNumber: data.caseNumber,
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

            <div className="grid grid-cols-2 gap-4">
              {/* Practice Area */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-foreground">Practice Area</label>
                <Controller
                  control={control}
                  name="practiceArea"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select area" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Litigation">Litigation</SelectItem>
                        <SelectItem value="Corporate">Corporate</SelectItem>
                        <SelectItem value="Real Estate">Real Estate</SelectItem>
                        <SelectItem value="Estate Planning">Estate Planning</SelectItem>
                        <SelectItem value="Intellectual Property">Intellectual Property</SelectItem>
                        <SelectItem value="Labor & Employment">Labor & Employment</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
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
                        <SelectItem value="Low">Low</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                        <SelectItem value="Urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
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
