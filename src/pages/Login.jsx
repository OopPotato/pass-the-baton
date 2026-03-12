import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "../components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { useAppContext } from "../contexts/AppContext"

export default function Login() {
  const navigate = useNavigate()
  const { users, loginUser } = useAppContext()
  const [selectedUser, setSelectedUser] = useState(users[0]?.id || "u1")
  const [role, setRole] = useState("Partner")
  
  const handleLogin = (e) => {
    e.preventDefault()
    
    const userObj = users.find(u => u.id === selectedUser)
    if (userObj) {
      loginUser({ ...userObj, role })
      navigate("/")
    }
  }

  return (
    <div className="flex h-screen w-full flex-col justify-center px-4 py-12 sm:px-6 lg:px-8 bg-slate-50 relative overflow-hidden font-inter">
      
      {/* Decorative background blur */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-100/30 blur-3xl" />
        <div className="absolute top-[60%] -right-[10%] w-[40%] h-[60%] rounded-full bg-indigo-100/30 blur-3xl" />
      </div>

      <div className="z-10 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center flex-col items-center">
          <div className="h-14 w-14 rounded-xl bg-slate-900 flex items-center justify-center shadow-lg border border-slate-700">
            <span className="text-3xl font-bold tracking-tight text-white">B</span>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900 tracking-tight">
            Pass the Baton
          </h2>
          <p className="mt-2 text-center text-sm text-slate-500">
            Select a mock user and role to preview the application views.
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-[440px]">
          <Card className="border-slate-200 shadow-xl shadow-slate-200/40 bg-white/80 backdrop-blur-sm">
            <form onSubmit={handleLogin}>
              <CardContent className="pt-6 space-y-6">
                
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-900 ml-0.5">
                    Select User
                  </label>
                  <Select value={selectedUser} onValueChange={setSelectedUser}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Choose user..." />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map(u => (
                        <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-900 ml-0.5">
                    Select Role
                  </label>
                  <Select value={role} onValueChange={setRole}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Choose role..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Partner">Partner (Global Visibility)</SelectItem>
                      <SelectItem value="Associate">Associate (Assigned Matters)</SelectItem>
                      <SelectItem value="Paralegal">Paralegal (Task Focus)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-[11px] text-slate-500 mt-2 px-1 leading-relaxed">
                    Note: For this mock preview, Partners see all firm data. Associates and Paralegals are filtered to their respective workloads in the upcoming database phase.
                  </p>
                </div>
                
              </CardContent>
              <CardFooter className="pb-8 pt-2">
                <Button type="submit" className="w-full text-base h-12 shadow-md hover:shadow-lg transition-all">
                  Sign in to Dashboard
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </div>
  )
}
