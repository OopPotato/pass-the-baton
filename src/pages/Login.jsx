import React, { useState } from "react"
import { useAppContext } from "../contexts/AppContext"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Mail, CheckCircle2, AlertCircle, Loader2 } from "lucide-react"

export default function Login() {
  const { sendMagicLink, authError } = useAppContext()
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState("idle") // idle | sending | sent | error
  const [errorMsg, setErrorMsg] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email.trim()) return
    setStatus("sending")
    setErrorMsg("")
    try {
      await sendMagicLink(email.trim())
      setStatus("sent")
    } catch (err) {
      setStatus("error")
      setErrorMsg(err.message || "Failed to send magic link. Please try again.")
    }
  }

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center px-4 bg-slate-50 relative overflow-hidden">

      {/* Decorative background blur */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-100/30 blur-3xl" />
        <div className="absolute top-[60%] -right-[10%] w-[40%] h-[60%] rounded-full bg-indigo-100/30 blur-3xl" />
      </div>

      <div className="z-10 w-full max-w-[420px] flex flex-col items-center">

        {/* Logo */}
        <div className="h-14 w-14 rounded-xl bg-slate-900 flex items-center justify-center shadow-lg border border-slate-700 mb-6">
          <span className="text-3xl font-bold tracking-tight text-white">B</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight text-center">Pass the Baton</h1>
        <p className="mt-2 text-sm text-slate-500 text-center">
          Enter your authorised email to receive a sign-in link.
        </p>

        {/* Card */}
        <div className="mt-8 w-full bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/40 p-8">

          {/* Access denied from whitelist check */}
          {authError && (
            <div className="mb-5 flex items-start gap-3 rounded-lg bg-red-50 border border-red-200 px-4 py-3">
              <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{authError}</p>
            </div>
          )}

          {status === "sent" ? (
            /* ── Sent state ── */
            <div className="flex flex-col items-center text-center gap-4 py-4">
              <div className="h-14 w-14 rounded-full bg-green-50 border border-green-200 flex items-center justify-center">
                <CheckCircle2 className="h-7 w-7 text-green-500" />
              </div>
              <div>
                <p className="font-semibold text-slate-800 text-base">Check your inbox</p>
                <p className="text-sm text-slate-500 mt-1">
                  We sent a sign-in link to <span className="font-medium text-slate-700">{email}</span>.<br />
                  Click the link to access the dashboard.
                </p>
              </div>
              <button
                onClick={() => { setStatus("idle"); setEmail("") }}
                className="text-xs text-slate-400 hover:text-slate-600 underline underline-offset-2 mt-1"
              >
                Use a different email
              </button>
            </div>
          ) : (
            /* ── Form state ── */
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-semibold text-slate-800">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                  <Input
                    id="email"
                    type="email"
                    placeholder=""
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="pl-9 h-11"
                    autoComplete="email"
                    required
                    disabled={status === "sending"}
                  />
                </div>
              </div>

              {status === "error" && (
                <div className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2.5">
                  <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-red-700">{errorMsg}</p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-11 text-sm font-semibold shadow-md hover:shadow-lg transition-all"
                disabled={status === "sending" || !email.trim()}
              >
                {status === "sending"
                  ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Sending…</>
                  : "Send Magic Link"}
              </Button>

              <p className="text-[11px] text-slate-400 text-center leading-relaxed">
                Only authorised emails can access this application.<br />
                Contact your administrator to request access.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
