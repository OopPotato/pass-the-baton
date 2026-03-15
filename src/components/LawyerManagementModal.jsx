import React, { useState } from "react"
import { Check, X, Plus, Pencil, Trash2, Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { useAppContext } from "../contexts/AppContext"

function LawyerRow({ lawyer, onEdit, onRemove }) {
  const [editing, setEditing] = useState(false)
  const [val, setVal] = useState(lawyer.name)

  const commit = async () => {
    if (val.trim() && val.trim() !== lawyer.name) {
      await onEdit(lawyer.id, val.trim())
    }
    setEditing(false)
  }

  return (
    <div className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all group">
      {editing ? (
        <>
          <Input
            value={val}
            onChange={e => setVal(e.target.value)}
            className="h-8 text-sm flex-1 bg-white"
            onKeyDown={e => { if (e.key === "Enter") commit(); if (e.key === "Escape") setEditing(false) }}
            autoFocus
          />
          <div className="flex items-center gap-1">
            <button onClick={commit} className="text-green-600 hover:text-green-700 p-1 bg-green-50 rounded-md transition-colors">
              <Check className="h-4 w-4" />
            </button>
            <button onClick={() => setEditing(false)} className="text-slate-400 hover:text-slate-600 p-1 bg-slate-50 rounded-md transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>
        </>
      ) : (
        <>
          <span className="text-sm font-medium text-slate-700 flex-1 truncate">{lawyer.name}</span>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              onClick={() => { setVal(lawyer.name); setEditing(true) }} 
              className="text-slate-400 hover:text-indigo-600 p-1 hover:bg-indigo-50 rounded-md transition-colors"
              title="Edit name"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button 
              onClick={() => onRemove(lawyer.id)} 
              className="text-slate-400 hover:text-red-600 p-1 hover:bg-red-50 rounded-md transition-colors"
              title="Remove lawyer"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default function LawyerManagementModal({ open, onOpenChange }) {
  const { lawyers, addLawyer, editLawyer, removeLawyer } = useAppContext()
  const [newName, setNewName] = useState("")
  const [isAdding, setIsAdding] = useState(false)

  const handleAdd = async () => {
    if (newName.trim()) {
      setIsAdding(true)
      try {
        await addLawyer(newName.trim())
        setNewName("")
      } finally {
        setIsAdding(false)
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px] p-0 overflow-hidden shadow-2xl">
        <div className="bg-slate-900 px-6 py-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full -mr-16 -mt-16 blur-2xl" />
          <DialogHeader className="relative z-10">
            <DialogTitle className="text-2xl font-bold tracking-tight text-white mb-1">Manage Lawyers</DialogTitle>
            <DialogDescription className="text-slate-400 text-sm">
              Add, update or remove lawyers from your firm's register.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-6 space-y-6 bg-white">
          {/* Add Section */}
          <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-100 shadow-sm">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Register New Lawyer</label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Input
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="Enter full name..."
                  className="h-10 text-sm pl-4 bg-white border-slate-200 focus:ring-indigo-500"
                  onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); handleAdd() } }}
                />
              </div>
              <Button 
                onClick={handleAdd} 
                className="h-10 px-4 bg-slate-900 hover:bg-slate-800 transition-colors gap-2 shadow-md hover:shadow-lg"
                disabled={!newName.trim() || isAdding}
              >
                {isAdding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                <span className="font-semibold text-xs uppercase tracking-wider">Add</span>
              </Button>
            </div>
          </div>

          {/* List Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Active Register</label>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter">
                {lawyers.length} Total
              </span>
            </div>
            
            <div className="max-h-[300px] overflow-y-auto pr-1 space-y-1 scrollbar-thin scrollbar-thumb-slate-200">
              {lawyers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                  <div className="h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center mb-3">
                    <Trash2 className="h-5 w-5 text-slate-400" />
                  </div>
                  <p className="text-sm text-slate-500 font-medium italic">The register is empty.</p>
                  <p className="text-[11px] text-slate-400 mt-1">Add your first lawyer using the form above.</p>
                </div>
              ) : (
                lawyers.map(lawyer => (
                  <LawyerRow
                    key={lawyer.id}
                    lawyer={lawyer}
                    onEdit={editLawyer}
                    onRemove={removeLawyer}
                  />
                ))
              )}
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-slate-50/80 border-t flex justify-end">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="text-xs font-bold uppercase tracking-wider h-9 px-6 hover:bg-white"
          >
            Finished
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
