import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export const useAppContext = () => useContext(AppContext);

// ── Version key: bump this whenever you want to wipe stale localStorage ──
const STORAGE_VERSION = 'v2'
const VERSION_KEY = 'baton_version'

// ── Wipe old data if version mismatch, then stamp new version ──
if (localStorage.getItem(VERSION_KEY) !== STORAGE_VERSION) {
  localStorage.removeItem('baton_matters')
  localStorage.removeItem('baton_handoffs')
  localStorage.removeItem('baton_currentUser')
  localStorage.setItem(VERSION_KEY, STORAGE_VERSION)
}

function loadFromStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

export const AppProvider = ({ children }) => {

  const [currentUser, setCurrentUser] = useState(() =>
    loadFromStorage('baton_currentUser', null)
  )

  const [matters, setMatters] = useState(() =>
    loadFromStorage('baton_matters', [])
  )

  // Users are fixed (not persisted — they're the firm's staff)
  const users = [
    { id: 'u1', name: 'Sarah Parker' },
    { id: 'u2', name: 'Michael Chang' },
    { id: 'u3', name: 'Emily Chen' },
    { id: 'u4', name: 'Alex Taylor' },
  ]

  const [handoffs, setHandoffs] = useState(() =>
    loadFromStorage('baton_handoffs', [])
  )

  // ── Persist whenever state changes ──
  useEffect(() => {
    if (currentUser) localStorage.setItem('baton_currentUser', JSON.stringify(currentUser))
    else localStorage.removeItem('baton_currentUser')
  }, [currentUser])

  useEffect(() => {
    localStorage.setItem('baton_matters', JSON.stringify(matters))
  }, [matters])

  useEffect(() => {
    localStorage.setItem('baton_handoffs', JSON.stringify(handoffs))
  }, [handoffs])

  // ── Auth ──
  const loginUser = (userOptions) => setCurrentUser(userOptions)
  const logoutUser = () => {
    setCurrentUser(null)
    localStorage.removeItem('baton_currentUser')
  }

  // ── Matters CRUD ──
  const addMatter = (matterData) => {
    const newMatter = {
      id: Date.now().toString(),
      updated: new Date().toISOString(),
      ...matterData,
    }
    setMatters(prev => [newMatter, ...prev])
  }

  const updateMatter = (id, updatedData) => {
    setMatters(prev => prev.map(m =>
      m.id === id ? { ...m, ...updatedData, updated: new Date().toISOString() } : m
    ))
  }

  const archiveMatter = (id) => {
    setMatters(prev => prev.filter(m => m.id !== id))
  }

  const assignMatter = (matterId, attorneyName) => {
    setMatters(prev => prev.map(m =>
      m.id === matterId ? { ...m, lead: attorneyName, updated: new Date().toISOString() } : m
    ))
  }

  // ── Pass the Baton: transfer lead + log a handoff ──
  const passTheBaton = (matterId, toUserName, contextNote, priority = 'pending') => {
    // Use functional updater to get latest matters state
    setMatters(prev => {
      const matter = prev.find(m => m.id === matterId)
      if (!matter) return prev
      return prev.map(m =>
        m.id === matterId ? { ...m, lead: toUserName, updated: new Date().toISOString() } : m
      )
    })

    // Build the handoff using latest matters snapshot
    setMatters(prev => {
      const matter = prev.find(m => m.id === matterId)
      const fromName = matter?.lead || currentUser?.name || 'Unknown'
      const matterName = matter?.name || 'Unknown Matter'

      const newHandoff = {
        id: Date.now(),
        matter: matterName,
        task: contextNote || `Case transferred to ${toUserName}`,
        from: fromName,
        to: toUserName,
        status: priority,
        date: 'Just now',
      }

      // Add the handoff separately (setHandoffs is independent)
      // We return prev unchanged here; actual handoff is set below
      return prev
    })

    // Add handoff record
    const matter = matters.find(m => m.id === matterId)
    const fromName = matter?.lead || currentUser?.name || 'Unknown'
    const newHandoff = {
      id: Date.now(),
      matter: matter?.name || 'Unknown Matter',
      task: contextNote || `Case transferred to ${toUserName}`,
      from: fromName,
      to: toUserName,
      status: priority,
      date: 'Just now',
    }
    setHandoffs(prev => [newHandoff, ...prev])
  }

  // ── Tasks / Handoffs ──
  const addTask = (newTask) => {
    const assignedUser = users.find(u => u.id === newTask.assignTo)?.name || 'Unassigned'
    const matterName = matters.find(m => m.id === newTask.matter)?.name || 'Unknown Matter'
    const taskFormat = {
      id: Date.now(),
      matter: matterName,
      task: newTask.title,
      from: currentUser?.name || 'Unknown',
      to: assignedUser,
      status: newTask.status?.toLowerCase() || 'pending',
      date: 'Just now',
    }
    setHandoffs(prev => [taskFormat, ...prev])
  }

  return (
    <AppContext.Provider value={{
      matters, users, handoffs, currentUser,
      loginUser, logoutUser,
      addTask, addMatter, updateMatter, archiveMatter,
      assignMatter, passTheBaton,
    }}>
      {children}
    </AppContext.Provider>
  )
}
