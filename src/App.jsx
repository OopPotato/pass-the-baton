import React from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import Layout from "./components/layout/Layout"
import Dashboard from "./pages/Dashboard"
import Login from "./pages/Login"
import Matters from "./pages/Matters"
import { useAppContext } from "./contexts/AppContext"

const PlaceholderPage = ({ title }) => (
  <div className="flex h-full items-center justify-center p-8">
    <div className="text-center">
      <h2 className="text-2xl font-bold tracking-tight text-foreground">{title}</h2>
      <p className="mt-2 text-muted-foreground">This page is under construction.</p>
    </div>
  </div>
)

// Shows a loading screen while session is being restored
function LoadingScreen() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 rounded-xl bg-slate-900 flex items-center justify-center shadow-lg">
          <span className="text-2xl font-bold text-white">B</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-slate-400 animate-bounce [animation-delay:0ms]" />
          <div className="h-2 w-2 rounded-full bg-slate-400 animate-bounce [animation-delay:150ms]" />
          <div className="h-2 w-2 rounded-full bg-slate-400 animate-bounce [animation-delay:300ms]" />
        </div>
        <p className="text-sm text-slate-500 font-medium">Loading…</p>
      </div>
    </div>
  )
}

function AppRoutes() {
  const { authUser, isAuthLoading } = useAppContext()

  // While Supabase is checking the session, show a loading screen
  if (isAuthLoading) return <LoadingScreen />

  return (
    <Routes>
      {/* Public route */}
      <Route
        path="/login"
        element={authUser ? <Navigate to="/" replace /> : <Login />}
      />

      {/* Protected routes — redirect to /login if not authenticated */}
      <Route
        element={authUser ? <Layout /> : <Navigate to="/login" replace />}
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/matters" element={<Matters />} />
        <Route path="/settings" element={<PlaceholderPage title="Settings" />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to={authUser ? "/" : "/login"} replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}
