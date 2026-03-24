import React, { useState } from "react"
import { Users, Trash2, Plus, Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { useAppContext } from "../contexts/AppContext"

export default function ManageOwnersModal({ open, onOpenChange }) {
  const { users, addLawyer, removeLawyer } = useAppContext()
  const [newOwner, setNewOwner] = useState("")
  const [isAdding, setIsAdding] = useState(false)
  const [removingId, setRemovingId] = useState(null)

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!newOwner.trim()) return
    setIsAdding(true)
    await addLawyer(newOwner)
    setNewOwner("")
    setIsAdding(false)
  }

  const handleRemove = async (id) => {
    setRemovingId(id)
    await removeLawyer(id)
    setRemovingId(null)
  }

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
              View, add, and manage members in this workspace.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-6 bg-slate-50 border-b">
          <form onSubmit={handleAdd} className="flex gap-2">
            <Input 
              placeholder="Enter new owner's name..." 
              value={newOwner}
              onChange={(e) => setNewOwner(e.target.value)}
              className="bg-white"
            />
            <Button type="submit" disabled={isAdding || !newOwner.trim()} className="bg-[#1e293b] hover:bg-slate-800 text-white shrink-0">
              {isAdding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4 mr-1" />}
              Add Owner
            </Button>
          </form>
        </div>

        <div className="px-6 py-2 max-h-[50vh] overflow-y-auto w-full">
          <ul className="divide-y divide-slate-100">
            {users.map(u => (
              <li key={u.id} className="py-4 flex items-center justify-between group">
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
                  onClick={() => handleRemove(u.id)}
                  disabled={removingId === u.id}
                  className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50 opacity-0 group-hover:opacity-100"
                  title="Remove Owner"
                >
                  {removingId === u.id ? <Loader2 className="h-4 w-4 animate-spin text-red-500" /> : <Trash2 className="h-4 w-4" />}
                </button>
              </li>
            ))}
            {users.length === 0 && (
              <p className="text-center text-sm text-slate-500 py-6 italic">No owners found.</p>
            )}
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  )
}
