import React, { useState } from "react"
import { Outlet, useSearchParams } from "react-router-dom"
import { Folder, ListTodo, Users, Calendar as CalendarIcon, ArrowRightLeft, Plus, UserPlus } from "lucide-react"
import { cn } from "../../lib/utils"
import { Button } from "../ui/button"
import { useAppContext } from "../../contexts/AppContext"

import NewMatterModal from "../NewMatterModal"
import NewTaskModal from "../NewTaskModal"
import ManageOwnersModal from "../ManageOwnersModal"
import InviteModal from "../InviteModal"

export default function Layout() {
  const { authUser } = useAppContext()
  const [searchParams, setSearchParams] = useSearchParams()
  // Default view is 'By Matter'
  const activeView = searchParams.get("view") || "By Matter"

  const [isMatterOpen, setIsMatterOpen] = useState(false)
  const [isTaskOpen, setIsTaskOpen] = useState(false)
  const [isOwnersOpen, setIsOwnersOpen] = useState(false)
  const [isInviteOpen, setIsInviteOpen] = useState(false)

  const tabs = [
    { id: "By Matter", label: "By Matter", icon: Folder },
    { id: "By Task", label: "By Task", icon: ListTodo },
    { id: "By Owner", label: "By Owner", icon: Users },
    { id: "Calendar", label: "Calendar", icon: CalendarIcon },
    { id: "Handoffs", label: "Handoffs", icon: ArrowRightLeft },
  ]

  return (
    <div className="flex flex-col h-screen w-full bg-[#f8fafc] overflow-hidden font-sans">
      
      {/* ── Base44 Single-Row Global Navbar ── */}
      <header className="h-16 flex-shrink-0 flex items-center justify-between px-6 border-b border-slate-200 bg-white z-20 shadow-sm w-full">
        
        {/* Left: Brand / Logo */}
        <div className="flex items-center gap-3 w-64">
          <div className="h-10 w-10 rounded-lg bg-[#1e293b] flex items-center justify-center text-white font-bold text-lg shadow-sm">
            B
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-slate-900 leading-tight">Baton</span>
            <span className="text-[11px] font-medium text-slate-500 leading-tight">
              Hello, {authUser?.name?.split(' ')[0] || "User"}
            </span>
          </div>
        </div>

        {/* Center: Interactive Tabs Pill */}
        <div className="flex items-center bg-slate-100/80 p-1 rounded-lg border border-slate-200/50 shadow-inner">
          {tabs.map((tab) => {
            const isActive = activeView === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setSearchParams({ view: tab.id })}
                className={cn(
                  "flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-semibold transition-all duration-200",
                  isActive 
                    ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-900/5" 
                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                )}
              >
                <tab.icon className={cn("h-4 w-4", isActive ? "text-slate-800" : "text-slate-400")} />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3 w-auto justify-end">
          <Button variant="outline" size="sm" onClick={() => setIsMatterOpen(true)} className="gap-2 h-9 border-slate-200 text-slate-700 shadow-sm bg-white hover:bg-slate-50">
            <Plus className="h-4 w-4 text-slate-500" /> Matter
          </Button>
          <Button size="sm" onClick={() => setIsTaskOpen(true)} className="gap-2 h-9 bg-[#1e293b] hover:bg-slate-800 text-white shadow-sm">
            <Plus className="h-4 w-4" /> Task
          </Button>
          
          <div className="w-px h-6 bg-slate-200 mx-1"></div>
          
          <Button variant="outline" size="sm" onClick={() => setIsOwnersOpen(true)} className="h-9 border-slate-200 text-slate-700 shadow-sm bg-white hover:bg-slate-50">
            Manage Owners
          </Button>
          <Button variant="outline" size="sm" onClick={() => setIsInviteOpen(true)} className="gap-2 h-9 border-slate-200 text-slate-700 shadow-sm bg-white hover:bg-slate-50">
            <UserPlus className="h-4 w-4 text-slate-500" /> Invite
          </Button>
        </div>
      </header>

      {/* ── Main Dashboard Content ── */}
      <main className="flex-1 overflow-auto bg-slate-50/50">
        <Outlet />
      </main>

      {/* ── Global Modals ── */}
      <NewMatterModal open={isMatterOpen} onOpenChange={setIsMatterOpen} />
      <NewTaskModal open={isTaskOpen} onOpenChange={setIsTaskOpen} />
      <ManageOwnersModal open={isOwnersOpen} onOpenChange={setIsOwnersOpen} />
      <InviteModal open={isInviteOpen} onOpenChange={setIsInviteOpen} />
      
    </div>
  )
}
