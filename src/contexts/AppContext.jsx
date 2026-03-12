import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export const useAppContext = () => useContext(AppContext);

// ── helper: load a key from localStorage (with JSON parse) ──
function loadFromStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

export const AppProvider = ({ children }) => {

  // ── State — seeded from localStorage (or empty arrays on first visit) ──
  const [currentUser, setCurrentUser] = useState(() =>
    loadFromStorage('baton_currentUser', null)
  )

  const [matters, setMatters] = useState(() =>
    loadFromStorage('baton_matters', [])
  )

  const [users] = useState([
    { id: 'u1', name: 'Sarah Parker' },
    { id: 'u2', name: 'Michael Chang' },
    { id: 'u3', name: 'Emily Chen' },
    { id: 'u4', name: 'Alex Taylor' },
  ])

  const [handoffs, setHandoffs] = useState(() =>
    loadFromStorage('baton_handoffs', [])
  )

  // ── Persist to localStorage on every state change ──
  useEffect(() => {
    if (currentUser) localStorage.setItem('baton_currentUser', JSON.stringify(currentUser))
    else               localStorage.removeItem('baton_currentUser')
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
    const matter = matters.find(m => m.id === matterId)
    if (!matter) return

    const fromName = matter.lead || currentUser?.name || 'Unknown'

    setMatters(prev => prev.map(m =>
      m.id === matterId ? { ...m, lead: toUserName, updated: new Date().toISOString() } : m
    ))

    const newHandoff = {
      id: Date.now(),
      matter: matter.name,
      task: contextNote || `Case transferred to ${toUserName}`,
      from: fromName,
      to: toUserName,
      status: priority,
      date: 'Just now',
    }
    setHandoffs(prev => [newHandoff, ...prev])
  }

  // ── Tasks (handoff items) ──
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
