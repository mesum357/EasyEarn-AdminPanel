"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  CreditCard,
  Bell,
  CheckSquare,
  Gift,
  Wallet,
  Users,
  Menu,
  X,
  LogOut,
  Settings,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"


const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Deposit Requests", href: "/deposits", icon: CreditCard },
  { name: "User Notifications", href: "/notifications", icon: Bell },
  { name: "Task Management", href: "/tasks", icon: CheckSquare },
  { name: "Lucky Draw Control", href: "/lucky-draw", icon: Gift },
  { name: "Withdraw Requests", href: "/withdraws", icon: Wallet },
  { name: "User List", href: "/users", icon: Users },
  { name: "Test CORS", href: "/test-cors", icon: Settings },
]

function Sidebar({ isOpen, setIsOpen }: { isOpen: boolean; setIsOpen: (open: boolean) => void }) {
  const pathname = usePathname()

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 z-20 lg:hidden" onClick={() => setIsOpen(false)} />
      )}

      {/* Sidebar */}
      <div
        className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-gray-900 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
      `}
      >
        <div className="flex items-center justify-between h-16 px-4 bg-gray-800">
          <h1 className="text-white text-xl font-bold">Admin Panel</h1>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-white hover:bg-gray-700"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-6 w-6" />
          </Button>
        </div>

        <nav className="mt-8">
          {navigation.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  flex items-center px-4 py-3 text-sm font-medium transition-colors
                  ${
                    isActive
                      ? "bg-gray-800 text-white border-r-2 border-blue-500"
                      : "text-gray-300 hover:bg-gray-800 hover:text-white"
                  }
                `}
                onClick={() => setIsOpen(false)}
              >
                <Icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </div>
    </>
  )
}

function Topbar({ setSidebarOpen }: { setSidebarOpen: (open: boolean) => void }) {
  return (
    <div className="bg-white shadow-sm border-b border-gray-200 px-4 py-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-6 w-6" />
          </Button>
          <h2 className="ml-2 text-2xl font-semibold text-gray-900 lg:ml-0">Admin Dashboard</h2>
        </div>

        <div className="flex items-center space-x-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder.svg?height=32&width=32" alt="Admin" />
                  <AvatarFallback>AD</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">Admin User</p>
                  <p className="text-xs leading-none text-muted-foreground">admin@example.com</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        <Topbar setSidebarOpen={setSidebarOpen} />

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
} 