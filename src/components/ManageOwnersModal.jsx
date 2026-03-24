import React from "react"
import { Users, Trash2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog"
import { useAppContext } from "../contexts/AppContext"

export default function ManageOwnersModal({ open, onOpenChange }) {
  const { users } = useAppContext()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden bg-white">
        <div className="px-6 pt-6 pb-4 border-b">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <Users className="h-5 w-5 text-slate-500" />
              Manage Owners
            </DialogTitle>
            <DialogDescription>
              View and manage members in this workspace.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="px-6 py-2 max-h-[60vh] overflow-y-auto">
          <ul className="divide-y divide-slate-100">
            {users.map(u => (
              <li key={u.id} className="py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 bg-slate-100 text-[#1e293b] rounded-full flex items-center justify-center font-bold text-sm">
                    {u.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-slate-800">{u.name}</p>
                    <p className="text-xs text-slate-500">{u.role || "Member"}</p>
                  </div>
                </div>
                <button 
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                  title="Remove Owner"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  )
}
