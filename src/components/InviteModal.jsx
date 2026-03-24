import React, { useState } from "react"
import { useForm } from "react-hook-form"
import { Loader2, Mail, Info } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"

export default function InviteModal({ open, onOpenChange }) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  const onSubmit = async (data) => {
    setIsSubmitting(true)
    // Simulate API call
    await new Promise(r => setTimeout(r, 600))
    setIsSubmitting(false)
    reset()
    onOpenChange(false)
  }

  const handleClose = () => {
    reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[420px] p-0 overflow-hidden bg-card">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
          <div className="px-6 pt-6 pb-4 border-b">
            <DialogHeader>
              <DialogTitle className="text-xl flex items-center gap-2">
                <Mail className="h-5 w-5 text-slate-500" />
                Invite Team Member
              </DialogTitle>
              <DialogDescription>
                Send an email invitation to join your workspace.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="px-6 py-5 space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-foreground">Email Address *</label>
              <Input
                placeholder="name@example.com"
                type="email"
                {...register("email", { required: "Email is required" })}
                className={errors.email ? "border-destructive" : ""}
                autoFocus
              />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-foreground">Role</label>
              <Select defaultValue="member">
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="bg-blue-50 text-blue-800 p-3 rounded-md text-xs flex gap-2 items-start mt-2 border border-blue-100">
              <Info className="h-4 w-4 shrink-0 mt-0.5" />
              <p>Invited users will receive a magic link to sign in securely.</p>
            </div>
          </div>

          <div className="px-6 py-4 flex justify-end gap-3 border-t bg-muted/20">
            <Button type="button" variant="outline" onClick={handleClose}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting} className="min-w-[110px] bg-[#1e293b] hover:bg-slate-800 text-white">
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send Invite"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
