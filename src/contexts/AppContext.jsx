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
    if (!email) return false
    const { data, error } = await supabase
      .from('allowed_emails')
      .select('email')
      .ilike('email', email.trim()) // Changed to case-insensitive ilike
      .maybeSingle()
    
    if (error) {
      console.error('Whitelist check error:', error)
      return false
    }
    return !!data
  }, [])

  // ── Restore session on mount & listen for auth changes ────────────────────
  useEffect(() => {
    let mounted = true

    const handleSession = async (event, session) => {
      console.log(`[Auth Event: ${event}] Session email:`, session?.user?.email || 'No user')
      
      // If we are still initializing and have no session yet, sit tight for a bit
      if (event === 'INITIAL_SESSION' && !session) {
        console.log('No initial session found, waiting...')
        // Don't set isAuthLoading(false) yet, give onAuthStateChange a chance to fire
        // if there's a code exchange happening.
      }

      if (!session?.user) {
        if (mounted && event !== 'INITIAL_SESSION') {
          console.log('Clearing auth state')
          setAuthUser(null)
          setIsAuthLoading(false)
        } else if (mounted && event === 'INITIAL_SESSION' && !session) {
          // If after a small timeout we still have no session, then we're truly logged out
          setTimeout(() => {
            if (mounted && !authUser) {
              console.log('Confirming unauthenticated after timeout')
              setIsAuthLoading(false)
            }
          }, 1500)
        }
        return
      }

      console.log('Checking whitelist for:', session.user.email)
      const allowed = await checkWhitelist(session.user.email)
      console.log('Whitelist result for', session.user.email, ':', allowed)
      
      if (!allowed) {
        console.warn('Access denied: User not on whitelist')
        await supabase.auth.signOut()
        if (mounted) {
          setAuthUser(null)
          setAuthError('Your email address is not authorised to access this application.')
          setIsAuthLoading(false)
        }
        return
      }

      if (mounted) {
        console.log('Access granted!')
        setAuthUser(session.user)
        setAuthError(null)
        setIsAuthLoading(false)
      }
    }

    // Rely on onAuthStateChange for both initial check and updates
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      handleSession(event, session)
    })

    return () => { mounted = false; subscription.unsubscribe() }
  }, [checkWhitelist, authUser])

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
    
    // Check whitelist first to avoid wasting email rate limits
    const allowed = await checkWhitelist(email)
    if (!allowed) {
      throw new Error('Your email is not authorised to access this application.')
    }

    const redirectTo = window.location.origin + '/'
    const { error } = await supabase.auth.signInWithOtp({
      email: email.toLowerCase().trim(),
      options: { emailRedirectTo: redirectTo },
    })
    if (error) throw error
  }, [checkWhitelist])

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
    await supabase.from('matters').update({ lead: toUserName, updated_at: new Date().toISOString() }).eq('id', matterId)
  }, [])

  // ── Tasks / Handoffs ──────────────────────────────────────────────────────
  const addTask = useCallback(async (newTask) => {
    const assignedUser = lawyers.find(l => l.id === newTask.assignTo)?.name || 'Unassigned'
    const matterName   = matters.find(m => m.id === newTask.matter)?.name   || 'Unknown Matter'
    
    const { data, error } = await supabase.from('handoffs').insert({
      matter_name: matterName, task: newTask.title,
      from_name: authUser?.email || 'Unknown', to_name: assignedUser,
      status: newTask.status?.toLowerCase() || 'pending',
      checklist: newTask.checklist || [],
    }).select().single()

    if (error) {
      console.error("Error creating task:", error)
      alert("Failed to create task: " + error.message) // Alert user directly
      return
    }

    if (data) {
       // Optimistic/Manual update in case realtime Websocket is slow/disabled
       setHandoffs(prev => {
         // Avoid duplicates if Realtime catches it
         if (prev.some(h => h.id === data.id)) return prev
         return [data, ...prev]
       })
    }
  }, [lawyers, matters, authUser])

  const updateTaskChecklist = useCallback(async (taskId, newChecklist) => {
    await supabase.from('handoffs').update({ checklist: newChecklist }).eq('id', taskId)
  }, [])

  const toggleTaskDone = useCallback(async (taskId, currentStatus) => {
    const newStatus = currentStatus?.toLowerCase() === 'completed' ? 'pending' : 'completed'
    const { data } = await supabase.from('handoffs').update({ status: newStatus }).eq('id', taskId).select().single()
    if (data) setHandoffs(prev => prev.map(h => h.id === taskId ? data : h))
  }, [])

  const deleteTask = useCallback(async (taskId) => {
    const { error } = await supabase.from('handoffs').delete().eq('id', taskId)
    if (!error) {
      setHandoffs(prev => prev.filter(h => h.id !== taskId))
    }
  }, [])

  const updateTask = useCallback(async (taskId, updates) => {
    const assignedUser = lawyers.find(l => l.id === updates.assignTo)?.name || updates.assignTo || 'Unassigned'
    const { data, error } = await supabase.from('handoffs').update({
      task: updates.title,
      to_name: assignedUser,
      status: updates.status?.toLowerCase() || 'pending',
      checklist: updates.checklist || [],
    }).eq('id', taskId).select().single()
    if (!error && data) {
      setHandoffs(prev => prev.map(h => h.id === taskId ? data : h))
    }
  }, [lawyers])

  // ── Shape DB snake_case → UI camelCase ────────────────────────────────────
  const shapedMatters = matters.map(m => ({
    ...m, updated: m.updated_at, caseNumber: m.case_number,
  }))

  const shapedHandoffs = handoffs.map(h => ({
    ...h, matter: h.matter_name, from: h.from_name, to: h.to_name,
    date: h.created_at
      ? new Date(h.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      : 'Just now',
    checklist: h.checklist || [],
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
      addTask, passTheBaton, updateTaskChecklist, deleteTask, updateTask, toggleTaskDone,
      // Legacy no-op (login now handled via Supabase Auth)
      loginUser: () => {},
    }}>
      {children}
    </AppContext.Provider>
  )
}
