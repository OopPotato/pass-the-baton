import React from "react"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import Layout from "./components/layout/Layout"
import Dashboard from "./pages/Dashboard"
import Login from "./pages/Login"
import Matters from "./pages/Matters"
import Workload from "./pages/Workload"

// Placeholder for missing pages to prevent routing errors
const PlaceholderPage = ({ title }) => (
  <div className="flex h-full items-center justify-center p-8">
    <div className="text-center">
      <h2 className="text-2xl font-bold tracking-tight text-foreground">{title}</h2>
      <p className="mt-2 text-muted-foreground">This page is under construction.</p>
    </div>
  </div>
)

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/matters" element={<Matters />} />
          <Route path="/handoffs" element={<Workload />} />
          <Route path="/reports" element={<PlaceholderPage title="Reports" />} />
          <Route path="/settings" element={<PlaceholderPage title="Settings" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
