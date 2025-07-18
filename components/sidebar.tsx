"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { Home, Bot, Shield, BarChart3, Settings, LogOut, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface SidebarProps {
  user: {
    username: string
    name?: string
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

  const updateMainContentMargin = (collapsed: boolean) => {
    const mainContent = document.getElementById("main-content")
    const dashboardLayout = document.getElementById("dashboard-layout")

    if (mainContent) {
      mainContent.style.marginLeft = collapsed ? "64px" : "256px"
    }

    if (dashboardLayout) {
      dashboardLayout.className = collapsed
        ? dashboardLayout.className.replace("sidebar-expanded", "sidebar-collapsed")
        : dashboardLayout.className.replace("sidebar-collapsed", "sidebar-expanded")
    }
  }

  const toggleSidebar = () => {
    const newCollapsedState = !isCollapsed
    setIsCollapsed(newCollapsedState)
    updateMainContentMargin(newCollapsedState)
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
        "backdrop-filter backdrop-blur-lg bg-opacity-90",
        isCollapsed ? "w-16" : "w-64",
      )}
      style={{
        background: "linear-gradient(180deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.98) 100%)",
      }}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <motion.h1
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xl font-bold text-blue-400 hologram-text"
                data-text="GALACTIC HUB"
              >
                GALACTIC HUB
              </motion.h1>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="text-blue-400 hover:bg-blue-400/10 starwars-border"
            >
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
                          ? "bg-blue-400/20 text-blue-400 starwars-border starwars-glow"
                          : "text-gray-400 hover:text-blue-400 hover:bg-blue-400/10",
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
              <p className="text-sm text-gray-400">Angemeldet als</p>
              <p className="font-medium text-red-400 text-shadow">{user.name || user.username}</p>
              {user.is_admin && (
                <span className="text-xs bg-blue-400/20 text-blue-400 px-2 py-1 rounded-full border border-blue-400/30">
                  ADMIRAL
                </span>
              )}
            </div>
          )}
          <Button
            onClick={handleLogout}
            variant="ghost"
            className={cn(
              "w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-400/10 sith-border",
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
