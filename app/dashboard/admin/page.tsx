"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Users, Plus, Trash2, Edit, Shield, Key, Settings, Eye, EyeOff } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"

interface User {
  id: number
  username: string
  email: string
  name: string
  is_admin: boolean
  created_at: string
  last_login?: string
}

interface Module {
  id: number
  name: string
  description: string
  type: string
  is_active: boolean
}

interface UserModule {
  user_id: number
  module_id: number
  is_active: boolean
}

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([])
  const [modules, setModules] = useState<Module[]>([])
  const [userModules, setUserModules] = useState<UserModule[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  // New user form
  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    name: "",
    password: "",
    is_admin: false,
  })

  useEffect(() => {
    checkAdminAccess()
    loadData()
  }, [])

  const checkAdminAccess = async () => {
    try {
      const response = await fetch("/api/profile")
      if (!response.ok) {
        router.push("/dashboard")
        return
      }

      const user = await response.json()
      if (!user.user.is_admin) {
        router.push("/dashboard")
        return
      }
    } catch (error) {
      console.error("Admin access check error:", error)
      router.push("/dashboard")
    }
  }

  const loadData = async () => {
    try {
      const [usersResponse, modulesResponse] = await Promise.all([
        fetch("/api/admin/users"),
        fetch("/api/admin/modules"),
      ])

      if (usersResponse.ok) {
        const usersData = await usersResponse.json()
        setUsers(usersData.users || [])
      }

      if (modulesResponse.ok) {
        const modulesData = await modulesResponse.json()
        setModules(modulesData.modules || [])
      }

      // Load user-module relationships
      await loadUserModules()
    } catch (error) {
      console.error("Error loading admin data:", error)
      toast({
        title: "Fehler",
        description: "Admin-Daten konnten nicht geladen werden",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const loadUserModules = async () => {
    try {
      const response = await fetch("/api/admin/user-modules")
      if (response.ok) {
        const data = await response.json()
        setUserModules(data.userModules || [])
      }
    } catch (error) {
      console.error("Error loading user modules:", error)
    }
  }

  const createUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newUser),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Erfolg",
          description: "Benutzer erfolgreich erstellt",
        })
        setNewUser({
          username: "",
          email: "",
          name: "",
          password: "",
          is_admin: false,
        })
        loadData()
      } else {
        toast({
          title: "Fehler",
          description: data.error || "Benutzer konnte nicht erstellt werden",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error creating user:", error)
      toast({
        title: "Fehler",
        description: "Netzwerkfehler beim Erstellen des Benutzers",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const deleteUser = async (userId: number) => {
    if (!confirm("Sind Sie sicher, dass Sie diesen Benutzer löschen möchten?")) {
      return
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "Erfolg",
          description: "Benutzer erfolgreich gelöscht",
        })
        loadData()
      } else {
        toast({
          title: "Fehler",
          description: "Benutzer konnte nicht gelöscht werden",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting user:", error)
      toast({
        title: "Fehler",
        description: "Netzwerkfehler beim Löschen des Benutzers",
        variant: "destructive",
      })
    }
  }

  const toggleUserModule = async (userId: number, moduleId: number, isActive: boolean) => {
    try {
      const response = await fetch("/api/admin/user-modules", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userId,
          module_id: moduleId,
          is_active: isActive,
        }),
      })

      if (response.ok) {
        // Update local state
        setUserModules((prev) => {
          const existing = prev.find((um) => um.user_id === userId && um.module_id === moduleId)
          if (existing) {
            return prev.map((um) =>
              um.user_id === userId && um.module_id === moduleId ? { ...um, is_active: isActive } : um,
            )
          } else {
            return [...prev, { user_id: userId, module_id: moduleId, is_active: isActive }]
          }
        })

        toast({
          title: "Erfolg",
          description: "Modulberechtigung aktualisiert",
        })
      } else {
        toast({
          title: "Fehler",
          description: "Modulberechtigung konnte nicht aktualisiert werden",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error toggling user module:", error)
      toast({
        title: "Fehler",
        description: "Netzwerkfehler beim Aktualisieren der Modulberechtigung",
        variant: "destructive",
      })
    }
  }

  const isUserModuleActive = (userId: number, moduleId: number): boolean => {
    const userModule = userModules.find((um) => um.user_id === userId && um.module_id === moduleId)
    return userModule?.is_active || false
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-blue-400 hologram-text">Lade Admin-Panel...</div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl font-bold text-blue-400 mb-2 hologram-text" data-text="ADMIRAL KONTROLLE">
          ADMIRAL KONTROLLE
        </h1>
        <p className="text-gray-400 text-lg">Benutzer- und Modulverwaltung der Galaktischen Flotte</p>
      </motion.div>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 bg-card border-border">
          <TabsTrigger value="users" className="data-[state=active]:bg-blue-400/20 data-[state=active]:text-blue-400">
            <Users className="w-4 h-4 mr-2" />
            Benutzer
          </TabsTrigger>
          <TabsTrigger
            value="permissions"
            className="data-[state=active]:bg-blue-400/20 data-[state=active]:text-blue-400"
          >
            <Settings className="w-4 h-4 mr-2" />
            Berechtigungen
          </TabsTrigger>
        </TabsList>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-6">
          {/* Create User */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="bg-card border-border starwars-border">
              <CardHeader>
                <CardTitle className="text-blue-400 flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Neuen Benutzer erstellen
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={createUser} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="username" className="text-blue-400">
                        Benutzername
                      </Label>
                      <Input
                        id="username"
                        type="text"
                        value={newUser.username}
                        onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                        className="bg-background border-border text-white starwars-border"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-blue-400">
                        E-Mail
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={newUser.email}
                        onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                        className="bg-background border-border text-white starwars-border"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-blue-400">
                        Name
                      </Label>
                      <Input
                        id="name"
                        type="text"
                        value={newUser.name}
                        onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                        className="bg-background border-border text-white starwars-border"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-blue-400">
                        Passwort
                      </Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          value={newUser.password}
                          onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                          className="bg-background border-border text-white starwars-border pr-10"
                          required
                          minLength={6}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-blue-400"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-background/50 rounded-lg starwars-border">
                    <div>
                      <Label className="text-white font-medium">Admiral-Berechtigung</Label>
                      <p className="text-sm text-gray-400">Benutzer erhält Admin-Rechte</p>
                    </div>
                    <Switch
                      checked={newUser.is_admin}
                      onCheckedChange={(checked) => setNewUser({ ...newUser, is_admin: checked })}
                      className="data-[state=checked]:bg-blue-400"
                    />
                  </div>

                  <Button type="submit" disabled={saving} className="w-full starwars-button">
                    <Plus className="w-4 h-4 mr-2" />
                    {saving ? "Erstellt..." : "Benutzer erstellen"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Users List */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="bg-card border-border starwars-border">
              <CardHeader>
                <CardTitle className="text-blue-400 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Registrierte Benutzer ({users.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-4 bg-background/50 rounded-lg starwars-border"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="text-white font-medium">{user.name || user.username}</h3>
                          {user.is_admin && (
                            <Badge className="bg-blue-400/20 text-blue-400 border-blue-400/30">
                              <Shield className="w-3 h-3 mr-1" />
                              ADMIRAL
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-400">@{user.username}</p>
                        <p className="text-sm text-gray-400">{user.email}</p>
                        <p className="text-xs text-gray-500">
                          Erstellt: {new Date(user.created_at).toLocaleDateString("de-DE")}
                          {user.last_login && (
                            <span className="ml-2">
                              | Letzter Login: {new Date(user.last_login).toLocaleDateString("de-DE")}
                            </span>
                          )}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-blue-400 hover:text-blue-300 hover:bg-blue-400/10"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteUser(user.id)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  {users.length === 0 && (
                    <div className="text-center py-8">
                      <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-400">Keine Benutzer gefunden</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Permissions Tab */}
        <TabsContent value="permissions" className="space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="bg-card border-border starwars-border">
              <CardHeader>
                <CardTitle className="text-blue-400 flex items-center gap-2">
                  <Key className="w-5 h-5" />
                  Modulberechtigungen verwalten
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {users.map((user) => (
                    <div key={user.id} className="p-4 bg-background/50 rounded-lg starwars-border">
                      <div className="flex items-center gap-3 mb-4">
                        <h3 className="text-white font-medium">{user.name || user.username}</h3>
                        {user.is_admin && (
                          <Badge className="bg-blue-400/20 text-blue-400 border-blue-400/30">ADMIRAL</Badge>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {modules.map((module) => (
                          <div
                            key={module.id}
                            className="flex items-center justify-between p-3 bg-background/30 rounded-lg border border-border"
                          >
                            <div>
                              <p className="text-white text-sm font-medium">{module.name}</p>
                              <p className="text-xs text-gray-400">{module.type}</p>
                            </div>
                            <Switch
                              checked={isUserModuleActive(user.id, module.id)}
                              onCheckedChange={(checked) => toggleUserModule(user.id, module.id, checked)}
                              className="data-[state=checked]:bg-blue-400"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  {users.length === 0 && (
                    <div className="text-center py-8">
                      <Key className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-400">Keine Benutzer für Berechtigungen gefunden</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
