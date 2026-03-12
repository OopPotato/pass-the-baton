import React from "react"
import { Outlet, NavLink, useLocation, useNavigate } from "react-router-dom"
import { LayoutDashboard, Briefcase, Users, FileText, Settings, LogOut, Bell, User } from "lucide-react"
import { cn } from "../../lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import { Button } from "../ui/button"
import { useAppContext } from "../../contexts/AppContext"

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: Briefcase, label: "Matters", href: "/matters" },
  { icon: Users, label: "Workload", href: "/handoffs" },
  { icon: FileText, label: "Reports", href: "/reports" },
  { icon: Settings, label: "Settings", href: "/settings" },
]

export default function Layout() {
  const { currentUser } = useAppContext()
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = () => {
    navigate("/login")
  }

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 flex flex-col border-r bg-card h-full z-10 transition-transform hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded bg-primary flex items-center justify-center text-primary-foreground font-bold">
              B
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground">Baton</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href
            return (
              <NavLink
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className={cn("h-5 w-5", isActive ? "text-primary" : "text-muted-foreground")} />
                {item.label}
              </NavLink>
            )
          })}
        </div>
        
        <div className="p-4 border-t mt-auto">
          <button onClick={handleLogout} className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground w-full transition-colors">
            <LogOut className="h-5 w-5" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar overlay (hidden in basic version, can be expanded) */}

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        
        {/* Top Global Header */}
        <header className="h-16 flex items-center justify-between px-6 border-b bg-background z-10 w-full">
          
          {/* Mobile view top-left brand */}
          <div className="flex items-center gap-2 md:hidden">
            <div className="h-8 w-8 rounded bg-primary flex items-center justify-center text-primary-foreground font-bold">
              B
            </div>
            <span className="text-xl font-bold tracking-tight">Baton</span>
          </div>

          <div className="hidden md:flex flex-1">
             {/* Spacing for Desktop layout (sidebar takes left side) */}
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="text-muted-foreground relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive"></span>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full bg-muted overflow-hidden flex items-center justify-center p-0">
                   <User className="h-5 w-5 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal opacity-90 text-xs text-muted-foreground">
                  Logged in as {currentUser?.role || "User"}
                </DropdownMenuLabel>
                <DropdownMenuLabel className="font-medium pt-0">
                  {currentUser?.name || "Guest"}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  Profile Settings
                </DropdownMenuItem>
                <DropdownMenuItem>
                  Preferences
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive" onClick={handleLogout}>
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        
        <div className="flex-1 overflow-auto bg-muted/20">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
