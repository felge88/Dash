"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { Home, Bot, Shield, BarChart3, Cog, LogOut, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useCurrentUser } from "@/hooks/use-current-user"
import { Skeleton } from "@/components/ui/skeleton"

const menuItems = [
  { icon: Home, label: "Dashboard", href: "/dashboard" },
  { icon: Bot, label: "Module", href: "/dashboard/modules" },
  { icon: BarChart3, label: "Statistiken", href: "/dashboard/stats" },
  { icon: Cog, label: "Einstellungen", href: "/dashboard/settings" },
]
const adminItems = [{ icon: Shield, label: "Admin", href: "/dashboard/admin" }]

export default function Sidebar() {
  const { user, isLoading } = useCurrentUser()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const pathname = usePathname()

  const items = user?.is_admin ? [...menuItems, ...adminItems] : menuItems
  const toggle = () => setIsCollapsed((c) => !c)

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    window.location.href = "/login"
  }

  return (
    <motion.aside
      initial={{ x: -280 }}
      animate={{ x: 0 }}
      className={cn(
        "fixed z-50 top-0 left-0 h-screen border-r border-border bg-card/80 backdrop-blur",
        "transition-all duration-300",
        isCollapsed ? "w-16" : "w-64",
      )}
      style={{
        background: "linear-gradient(180deg, rgba(30,41,59,.95) 0%, rgba(15,23,42,.98) 100%)",
      }}
    >
      {/* header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        {!isCollapsed && (
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xl font-bold text-blue-400 hologram-text"
            data-text="GALACTIC HUB"
          >
            GALACTIC&nbsp;HUB
          </motion.h1>
        )}
        <Button size="icon" variant="ghost" onClick={toggle} className="text-blue-400 hover:bg-blue-400/10">
          {isCollapsed ? <Menu size={20} /> : <X size={20} />}
        </Button>
      </div>

      {/* nav */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {items.map((m) => {
            const active = pathname === m.href
            return (
              <li key={m.href}>
                <Link href={m.href}>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={cn(
                      "flex items-center gap-3 rounded-lg p-3 transition-all",
                      active
                        ? "bg-blue-400/20 text-blue-400"
                        : "text-gray-400 hover:text-blue-400 hover:bg-blue-400/10",
                    )}
                  >
                    <m.icon size={20} />
                    {!isCollapsed && <span>{m.label}</span>}
                  </motion.div>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* footer */}
      <div className="p-4 border-t border-border space-y-2">
        {isCollapsed ? null : (
          <div className="text-sm text-gray-400">
            Angemeldet&nbsp;als&nbsp;
            {isLoading ? (
              <Skeleton className="inline-block h-4 w-20 bg-white/20" />
            ) : (
              <span className="font-medium text-red-400">{user?.name ?? user?.username ?? "…"}</span>
            )}
          </div>
        )}

        <Button
          variant="ghost"
          onClick={logout}
          className={cn("w-full justify-start text-red-400 hover:bg-red-400/10", isCollapsed && "justify-center")}
        >
          <LogOut size={20} />
          {!isCollapsed && <span className="ml-2">Abmelden</span>}
        </Button>
      </div>
    </motion.aside>
  )
}
