"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import AdminPanel from "./admin-panel"
import { motion } from "framer-motion"
import { useToast } from "@/hooks/use-toast"

interface User {
  id: number
  username: string
  email: string
  name: string
  is_admin: boolean
  created_at: string
  last_login: string
}

interface Module {
  id: number
  name: string
  description: string
  type: string
  is_active: boolean
  config: any
}

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([])
  const [modules, setModules] = useState<Module[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  const loadData = async () => {
    try {
      setLoading(true)
      // Check if user is admin
      const profileResponse = await fetch("/api/profile")
      if (!profileResponse.ok) {
        router.push("/dashboard") // Redirect if not logged in
        return
      }

      const user = await profileResponse.json()
      if (!user.is_admin) {
        router.push("/dashboard") // Redirect if not admin
        toast({
          title: "Zugriff verweigert",
          description: "Sie haben keine Berechtigung für diesen Bereich.",
          variant: "destructive",
        })
        return
      }

      // Load users and modules
      const [usersResponse, modulesResponse] = await Promise.all([
        fetch("/api/admin/users"),
        fetch("/api/modules"), // Fetch all modules
      ])

      if (usersResponse.ok) {
        const usersData = await usersResponse.json()
        setUsers(usersData)
      } else {
        setError("Fehler beim Laden der Benutzerdaten.")
      }

      if (modulesResponse.ok) {
        const modulesData = await modulesResponse.json()
        setModules(modulesData.modules || [])
      } else {
        setError("Fehler beim Laden der Moduldaten.")
      }

      setLoading(false)
    } catch (err) {
      console.error("Admin page error:", err)
      setError("Fehler beim Laden der Admin-Daten")
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-primary">Lade Admin-Daten...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-destructive">{error}</div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl font-bold text-primary mb-2 glitch-text" data-text="ADMIN-PANEL">
          ADMIN-PANEL
        </h1>
        <p className="text-muted-foreground text-lg">Benutzer- und Modulverwaltung</p>
      </motion.div>

      <AdminPanel initialUsers={users} initialModules={modules} refreshData={loadData} />
    </div>
  )
}
