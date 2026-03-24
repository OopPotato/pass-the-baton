import React from "react"
import { Outlet } from "react-router-dom"

export default function Layout() {
  return (
    <div className="flex flex-col h-screen w-full bg-[#f8fafc] overflow-hidden font-sans">
      <main className="flex-1 overflow-auto h-full">
        <Outlet />
      </main>
    </div>
  )
}
