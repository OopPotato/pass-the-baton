import React, { createContext, useContext, useState } from 'react';

const AppContext = createContext();

export const useAppContext = () => {
  return useContext(AppContext);
};

export const AppProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState({ id: 'u1', name: "Sarah Parker", role: "Partner" });
  
  const [matters, setMatters] = useState([
    { id: '1', name: "Smith v. Jones", status: "Discovery", lead: "Sarah Parker", updated: new Date(Date.now() - 1000 * 60 * 30).toISOString(), type: "Civil Litigation" },
    { id: '2', name: "State Corp Merger", status: "Negotiation", lead: "Michael Chang", updated: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), type: "Corporate" },
    { id: '3', name: "Estate of R. Vance", status: "Pre-Trial", lead: "Emily Chen", updated: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), type: "Estate Planning" },
    { id: '4', name: "Apex Tech Patent", status: "Discovery", lead: "Alex Taylor", updated: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), type: "Intellectual Property" },
    { id: '5', name: "Doe Employment Claim", status: "Settled", lead: "Sarah Parker", updated: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), type: "Labor & Employment" },
    { id: '6', name: "Vanguard Asset Setup", status: "Active", lead: "Michael Chang", updated: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), type: "Corporate" },
    { id: '7', name: "Global Reach Licensing", status: "Negotiation", lead: "Alex Taylor", updated: new Date(Date.now() - 1000 * 60 * 45).toISOString(), type: "Intellectual Property" },
    { id: '8', name: "Omega Build Contract", status: "Review", lead: "Emily Chen", updated: new Date(Date.now() - 1000 * 60 * 15).toISOString(), type: "Real Estate" },
    { id: '9', name: "Riverside Zoning", status: "Pre-Trial", lead: "Sarah Parker", updated: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(), type: "Real Estate" },
    { id: '10', name: "City v. Transit Auth", status: "Discovery", lead: "Michael Chang", updated: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(), type: "Civil Litigation" },
    { id: '11', name: "Pioneer Fund Raise", status: "Active", lead: "Emily Chen", updated: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), type: "Corporate" },
    { id: '12', name: "Beacon Software IP", status: "Discovery", lead: "Alex Taylor", updated: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(), type: "Intellectual Property" },
    { id: '13', name: "Kensington Will", status: "Completed", lead: "Sarah Parker", updated: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(), type: "Estate Planning" },
    { id: '14', name: "Delta HR Audit", status: "Review", lead: "Michael Chang", updated: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), type: "Labor & Employment" },
    { id: '15', name: "Sunrise Lease", status: "Negotiation", lead: "Emily Chen", updated: new Date(Date.now() - 1000 * 60 * 60 * 1).toISOString(), type: "Real Estate" },
  ]);

  const [users, setUsers] = useState([
    { id: 'u1', name: "Sarah Parker" },
    { id: 'u2', name: "Michael Chang" },
    { id: 'u3', name: "Emily Chen" },
    { id: 'u4', name: "Alex Taylor" },
  ]);

  const [handoffs, setHandoffs] = useState([
    { id: 1, matter: "Smith v. Jones", task: "Review Deposition Draft", from: "Sarah Parker", to: "Michael Chang", status: "pending", date: "2h ago" },
    { id: 2, matter: "State Corp Merger", task: "Finalize Due Diligence", from: "James Wilson", to: "Sarah Parker", status: "completed", date: "5h ago" },
    { id: 3, matter: "Estate of R. Vance", task: "Draft Initial Response", from: "Emily Chen", to: "Alex Taylor", status: "urgent", date: "1d ago" },
  ]);

  const addTask = (newTask) => {
    // Generate simple mock data for from/to based on selected user ID
    const assignedUser = users.find(u => u.id === newTask.assignTo)?.name || "Unassigned"
    const matterName = matters.find(m => m.id === newTask.matter)?.name || "Unknown Matter"

    const taskFormat = {
      id: Date.now(),
      matter: matterName,
      task: newTask.title,
      from: "Current User", // Mocked current user
      to: assignedUser,
      status: newTask.status.toLowerCase() || 'pending',
      date: "Just now"
    }

    setHandoffs([taskFormat, ...handoffs]);
  }

  const addMatter = (matterData) => {
    const newMatter = {
      id: Date.now().toString(),
      updated: new Date().toISOString(),
      ...matterData
    }
    setMatters([newMatter, ...matters])
  }

  const updateMatter = (id, updatedData) => {
    setMatters(matters.map(m => m.id === id ? { ...m, ...updatedData, updated: new Date().toISOString() } : m))
  }

  const archiveMatter = (id) => {
    // In a real app we might set an 'archived' boolean. Here we just remove it for visual testing.
    setMatters(matters.filter(m => m.id !== id))
  }

  const loginUser = (userOptions) => {
    setCurrentUser(userOptions)
  }

  return (
    <AppContext.Provider value={{ matters, users, handoffs, currentUser, loginUser, addTask, addMatter, updateMatter, archiveMatter }}>
      {children}
    </AppContext.Provider>
  );
};
