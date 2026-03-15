import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const AppContext = createContext()
export const useAppContext = () => useContext(AppContext)

export const AppProvider = ({ children }) => {
  // ── Auth state ─────────────────────────────────────────────────────────────
  const [authUser, setAuthUser]       = useState(null)   // Supabase auth user
  const [isAuthLoading, setIsAuthLoading] = useState(true)
  const [authError, setAuthError]     = useState(null)   // "access denied" etc.

  // ── App data ───────────────────────────────────────────────────────────────
  const [lawyers, setLawyers]   = useState([])
  const [matters, setMatters]   = useState([])
  const [handoffs, setHandoffs] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  // ── Check whitelist ────────────────────────────────────────────────────────
  const checkWhitelist = useCallback(async (email) => {
    const { data } = await supabase
      .from('allowed_emails')
      .select('email')
      .eq('email', email.toLowerCase().trim())
      .maybeSingle()
    return !!data
  }, [])

  // ── Restore session on mount & listen for auth changes ────────────────────
  useEffect(() => {
    let mounted = true

    const handleSession = async (session) => {
      if (!session?.user) {
        if (mounted) { setAuthUser(null); setIsAuthLoading(false) }
        return
      }

      const allowed = await checkWhitelist(session.user.email)
      if (!allowed) {
        await supabase.auth.signOut()
        if (mounted) {
          setAuthUser(null)
          setAuthError('Your email is not authorised to access this application.')
          setIsAuthLoading(false)
        }
        return
      }

      if (mounted) {
        setAuthUser(session.user)
        setAuthError(null)
        setIsAuthLoading(false)
      }
    }

    // Get current session
    supabase.auth.getSession().then(({ data: { session } }) => handleSession(session))

    // Listen for future changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      handleSession(session)
    })

    return () => { mounted = false; subscription.unsubscribe() }
  }, [checkWhitelist])

  // ── Fetch data when authUser is set ───────────────────────────────────────
  useEffect(() => {
    if (!authUser) {
      setLawyers([]); setMatters([]); setHandoffs([])
      return
    }

    let cancelled = false
    const fetchAll = async () => {
      setIsLoading(true)
      const [{ data: lawyersData }, { data: mattersData }, { data: handoffsData }] =
        await Promise.all([
          supabase.from('lawyers').select('*').order('created_at'),
          supabase.from('matters').select('*').order('updated_at', { ascending: false }),
          supabase.from('handoffs').select('*').order('created_at', { ascending: false }),
        ])
      if (cancelled) return
      setLawyers(lawyersData  ?? [])
      setMatters(mattersData  ?? [])
      setHandoffs(handoffsData ?? [])
      setIsLoading(false)
    }
    fetchAll()
    return () => { cancelled = true }
  }, [authUser])

  // ── Real-time subscriptions (only when signed in) ─────────────────────────
  useEffect(() => {
    if (!authUser) return

    const channel = supabase
      .channel('db-changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'matters' },
        p => setMatters(prev => [p.new, ...prev].sort((a,b) => new Date(b.updated_at) - new Date(a.updated_at))))
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'matters' },
        p => setMatters(prev => prev.map(m => m.id === p.new.id ? p.new : m)))
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'matters' },
        p => setMatters(prev => prev.filter(m => m.id !== p.old.id)))
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'lawyers' },
        p => setLawyers(prev => [...prev, p.new]))
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'lawyers' },
        p => setLawyers(prev => prev.map(l => l.id === p.new.id ? p.new : l)))
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'lawyers' },
        p => setLawyers(prev => prev.filter(l => l.id !== p.old.id)))
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'handoffs' },
        p => setHandoffs(prev => [p.new, ...prev]))
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [authUser])

  // ── Auth actions ──────────────────────────────────────────────────────────
  const sendMagicLink = useCallback(async (email) => {
    setAuthError(null)
    const redirectTo = window.location.origin + '/'
    const { error } = await supabase.auth.signInWithOtp({
      email: email.toLowerCase().trim(),
      options: { emailRedirectTo: redirectTo },
    })
    if (error) throw error
  }, [])

  const logoutUser = useCallback(async () => {
    await supabase.auth.signOut()
    setAuthUser(null)
  }, [])

  // ── Lawyer CRUD ───────────────────────────────────────────────────────────
  const addLawyer = useCallback(async (name) => {
    const trimmed = name.trim()
    if (!trimmed) return
    await supabase.from('lawyers').insert({ name: trimmed })
  }, [])

  const editLawyer = useCallback(async (id, newName) => {
    const trimmed = newName.trim()
    if (!trimmed) return
    const old = lawyers.find(l => l.id === id)
    await supabase.from('lawyers').update({ name: trimmed }).eq('id', id)
    if (old) await supabase.from('matters').update({ lead: trimmed }).eq('lead', old.name)
  }, [lawyers])

  const removeLawyer = useCallback(async (id) => {
    const lawyer = lawyers.find(l => l.id === id)
    await supabase.from('lawyers').delete().eq('id', id)
    if (lawyer) await supabase.from('matters').update({ lead: 'Unassigned' }).eq('lead', lawyer.name)
  }, [lawyers])

  // ── Matter CRUD ───────────────────────────────────────────────────────────
  const addMatter = useCallback(async (d) => {
    await supabase.from('matters').insert({
      name: d.name, status: d.status ?? 'Active', lead: d.lead ?? 'Unassigned',
      priority: d.priority ?? 'Normal', client: d.client ?? null,
      case_number: d.caseNumber ?? null, description: d.description ?? null,
      updated_at: new Date().toISOString(),
    })
  }, [])

  const updateMatter = useCallback(async (id, d) => {
    await supabase.from('matters').update({
      name: d.name, status: d.status, lead: d.lead, priority: d.priority,
      client: d.client ?? null, case_number: d.caseNumber ?? null,
      description: d.description ?? null, updated_at: new Date().toISOString(),
    }).eq('id', id)
  }, [])

  const deleteMatter = useCallback(async (id) => {
    await supabase.from('matters').delete().eq('id', id)
  }, [])

  const assignMatter = useCallback(async (matterId, lawyerName) => {
    await supabase.from('matters').update({ lead: lawyerName, updated_at: new Date().toISOString() }).eq('id', matterId)
  }, [])

  // ── Pass the Baton ────────────────────────────────────────────────────────
  const passTheBaton = useCallback(async (matterId, toUserName, contextNote, priority = 'pending') => {
    const matter = matters.find(m => m.id === matterId)
    const fromName = matter?.lead || authUser?.email || 'Unknown'
    await supabase.from('matters').update({ lead: toUserName, updated_at: new Date().toISOString() }).eq('id', matterId)
    await supabase.from('handoffs').insert({
      matter_name: matter?.name ?? 'Unknown Matter',
      task: contextNote || `Case transferred to ${toUserName}`,
      from_name: fromName, to_name: toUserName, status: priority,
    })
  }, [matters, authUser])

  // ── Tasks / Handoffs ──────────────────────────────────────────────────────
  const addTask = useCallback(async (newTask) => {
    const assignedUser = lawyers.find(l => l.id === newTask.assignTo)?.name || 'Unassigned'
    const matterName   = matters.find(m => m.id === newTask.matter)?.name   || 'Unknown Matter'
    await supabase.from('handoffs').insert({
      matter_name: matterName, task: newTask.title,
      from_name: authUser?.email || 'Unknown', to_name: assignedUser,
      status: newTask.status?.toLowerCase() || 'pending',
    })
  }, [lawyers, matters, authUser])

  // ── Shape DB snake_case → UI camelCase ────────────────────────────────────
  const shapedMatters = matters.map(m => ({
    ...m, updated: m.updated_at, caseNumber: m.case_number,
  }))

  const shapedHandoffs = handoffs.map(h => ({
    ...h, matter: h.matter_name, from: h.from_name, to: h.to_name,
    date: h.created_at
      ? new Date(h.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      : 'Just now',
  }))

  return (
    <AppContext.Provider value={{
      // Auth
      authUser, isAuthLoading, authError, sendMagicLink, logoutUser,
      // Data
      matters: shapedMatters, lawyers, handoffs: shapedHandoffs, isLoading,
      // Aliases kept for Login page compatibility
      users: lawyers, currentUser: authUser ? { name: authUser.email, role: 'User' } : null,
      // Lawyer CRUD
      addLawyer, editLawyer, removeLawyer,
      // Matter CRUD
      addMatter, updateMatter, deleteMatter, archiveMatter: deleteMatter, assignMatter,
      // Handoffs
      addTask, passTheBaton,
      // Legacy no-op (login now handled via Supabase Auth)
      loginUser: () => {},
    }}>
      {children}
    </AppContext.Provider>
  )
}
