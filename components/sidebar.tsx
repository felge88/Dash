"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { Home, Bot, Shield, BarChart3, Settings, LogOut, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface SidebarProps {
  user: {
    username: string
    is_admin: boolean
  }
}

const menuItems = [
  { icon: Home, label: "Dashboard", href: "/dashboard" },
  { icon: Bot, label: "Module", href: "/dashboard/modules" },
  { icon: BarChart3, label: "Statistiken", href: "/dashboard/stats" },
  { icon: Settings, label: "Einstellungen", href: "/dashboard/settings" },
]

const adminItems = [{ icon: Shield, label: "Admin", href: "/dashboard/admin" }]

export default function Sidebar({ user }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const pathname = usePathname()

  const allItems = user.is_admin ? [...menuItems, ...adminItems] : menuItems

  // Update main content margin when sidebar changes
  useEffect(() => {
    const mainContent = document.getElementById("main-content")
    if (mainContent) {
      mainContent.style.marginLeft = isCollapsed ? "64px" : "256px"
    }
  }, [isCollapsed])

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed)
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      window.location.href = "/login"
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  return (
    <motion.div
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      className={cn(
        "fixed left-0 top-0 h-full bg-card border-r border-border z-50 transition-all duration-300",
        isCollapsed ? "w-16" : "w-64",
      )}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <motion.h1
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xl font-bold text-primary glitch-text"
                data-text="AUTOMATION"
              >
                AUTOMATION
              </motion.h1>
            )}
            <Button variant="ghost" size="icon" onClick={toggleSidebar} className="text-primary hover:bg-primary/10">
              {isCollapsed ? <Menu size={20} /> : <X size={20} />}
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {allItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <li key={item.href}>
                  <Link href={item.href}>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg transition-all duration-300",
                        isActive
                          ? "bg-primary/20 text-primary star-border"
                          : "text-muted-foreground hover:text-primary hover:bg-primary/10",
                      )}
                    >
                      <item.icon size={20} />
                      {!isCollapsed && <span className="font-medium">{item.label}</span>}
                    </motion.div>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* User Info & Logout */}
        <div className="p-4 border-t border-border">
          {!isCollapsed && (
            <div className="mb-4">
              <p className="text-sm text-muted-foreground">Angemeldet als</p>
              <p className="font-medium text-destructive">{user.username}</p>
              {user.is_admin && (
                <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">ADMIN</span>
              )}
            </div>
          )}
          <Button
            onClick={handleLogout}
            variant="ghost"
            className={cn(
              "w-full justify-start text-destructive hover:text-destructive/80 hover:bg-destructive/10",
              isCollapsed && "justify-center",
            )}
          >
            <LogOut size={20} />
            {!isCollapsed && <span className="ml-3">Abmelden</span>}
          </Button>
        </div>
      </div>
    </motion.div>
  )
}
