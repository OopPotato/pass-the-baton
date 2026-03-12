import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { formatDistanceToNow } from "date-fns"
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Badge } from "../components/ui/badge"
import { Plus, ArrowRight, Circle, CheckCircle2, AlertCircle, Clock, Briefcase, User2 } from "lucide-react"
import { useAppContext } from "../contexts/AppContext"
import NewMatterModal from "../components/NewMatterModal"

const getStatusIcon = (status) => {
  switch(status?.toLowerCase()) {
    case "pending": return <Circle className="h-4 w-4 text-blue-500" />
    case "completed": return <CheckCircle2 className="h-4 w-4 text-green-500" />
    case "urgent": return <AlertCircle className="h-4 w-4 text-red-500" />
    default: return <Circle className="h-4 w-4 text-gray-400" />
  }
}

export default function Dashboard() {
  const { matters, handoffs, currentUser, users } = useAppContext()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const navigate = useNavigate()

  const pendingCount = handoffs.filter(h => h.status?.toLowerCase() === 'pending').length
  const completedCount = handoffs.filter(h => h.status?.toLowerCase() === 'completed').length
  const urgentCount = handoffs.filter(h => h.status?.toLowerCase() === 'urgent').length

  // Dynamic workload per user
  const workloadData = users.map(u => ({
    name: u.name.split(' ')[0],
    count: handoffs.filter(h => h.to === u.name).length,
  }))
  const maxCount = Math.max(...workloadData.map(w => w.count), 1)
  const COLORS = ['bg-primary', 'bg-blue-500', 'bg-amber-500', 'bg-purple-500']

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            {currentUser ? `Welcome back, ${currentUser.name.split(' ')[0]}.` : 'Welcome.'} Here's an overview of your active matters and task handoffs.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => navigate('/matters')}>View All Matters</Button>
          <Button className="gap-2" onClick={() => setIsModalOpen(true)}>
            <Plus className="h-4 w-4" />
            Create Case
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Matters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{matters.length}</div>
            <p className="text-xs text-muted-foreground">Tracking {matters.length} matters</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Handoffs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{pendingCount}</div>
            <p className="text-xs text-muted-foreground">Require attention</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{completedCount}</div>
            <p className="text-xs text-muted-foreground">Resolved batons</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Urgent Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{urgentCount}</div>
            <p className="text-xs text-muted-foreground">Need immediate action</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 flex flex-col">
          <CardHeader>
            <CardTitle>Recent Handoffs</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto">
            <div className="space-y-6">
              {handoffs.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No recent handoffs.</p>
              ) : (
                handoffs.map((item) => (
                  <div key={item.id} className="flex items-center justify-between border-b border-border/50 pb-4 last:border-0 last:pb-0">
                    <div className="flex items-start gap-4">
                      <div className="mt-1">{getStatusIcon(item.status)}</div>
                      <div>
                        <p className="font-medium text-foreground">{item.task}</p>
                        <p className="text-sm text-muted-foreground">{item.matter}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="hidden sm:flex items-center gap-2 text-muted-foreground">
                        <span className="font-medium text-foreground">{item.from}</span>
                        <ArrowRight className="h-4 w-4" />
                        <span className="font-medium text-foreground">{item.to}</span>
                      </div>
                      <span className="text-muted-foreground whitespace-nowrap">{item.date}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Workload Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {handoffs.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No batons passed yet.</p>
            ) : (
              <div className="space-y-3">
                {workloadData.map((w, i) => (
                  <div key={w.name}>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm text-muted-foreground">{w.name}</p>
                      <p className="text-xs font-semibold text-slate-600">{w.count}</p>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className={`${COLORS[i % COLORS.length]} h-2 rounded-full transition-all duration-500`}
                        style={{ width: `${Math.round((w.count / maxCount) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Live Cases Tracker ── */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-base">Live Cases Tracker</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              All created cases and their current status in real time
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
            </span>
            <span className="text-xs font-medium text-green-600">Live</span>
          </div>
        </CardHeader>
        <CardContent>
          {matters.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center mb-3">
                <Briefcase className="h-6 w-6 text-slate-400" />
              </div>
              <p className="text-sm font-medium text-slate-600">No cases yet</p>
              <p className="text-xs text-slate-400 mt-1">Create your first case to start tracking it here.</p>
              <Button size="sm" className="mt-4 gap-2" onClick={() => setIsModalOpen(true)}>
                <Plus className="h-3.5 w-3.5" /> Create Case
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide pb-2 pr-4">Case</th>
                    <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide pb-2 pr-4">Status</th>
                    <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide pb-2 pr-4">Lead Attorney</th>
                    <th className="text-right text-xs font-semibold text-slate-400 uppercase tracking-wide pb-2">Time Open</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {[...matters].sort((a, b) => new Date(b.updated) - new Date(a.updated)).map(matter => (
                    <tr key={matter.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                            <Briefcase className="h-3.5 w-3.5 text-slate-500" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800 leading-tight">{matter.name}</p>
                            {matter.type && <p className="text-xs text-slate-400">{matter.type}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 pr-4">
                        <Badge
                          variant={
                            matter.status === 'Settled' || matter.status === 'Completed' ? 'success'
                            : matter.status === 'Discovery' || matter.status === 'Pre-Trial' ? 'info'
                            : 'warning'
                          }
                        >
                          {matter.status || 'Active'}
                        </Badge>
                      </td>
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-1.5">
                          <div className="h-5 w-5 rounded-full bg-slate-800 text-white text-[9px] flex items-center justify-center font-bold shrink-0">
                            {(matter.lead || 'U').charAt(0)}
                          </div>
                          <span className="text-slate-600 text-xs font-medium">{matter.lead || 'Unassigned'}</span>
                        </div>
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-1 text-xs text-slate-400">
                          <Clock className="h-3 w-3" />
                          <span>
                            {matter.updated
                              ? formatDistanceToNow(new Date(matter.updated), { addSuffix: false })
                              : '—'}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <NewMatterModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </div>
  )
}
