"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { UserPlus, Users, Settings, Key, Trash2, Check, X, Bot } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"

interface User {
  id: number
  username: string
  email: string
  name: string
  is_admin: boolean
  created_at: string
  last_login: string
  modules?: { id: number; is_active: boolean }[] // Added for module access
}

interface Module {
  id: number
  name: string
  description: string
  type: string
  is_active: boolean
}

interface AdminPanelProps {
  initialUsers: User[]
  initialModules: Module[]
  refreshData: () => void
}

export default function AdminPanel({ initialUsers, initialModules, refreshData }: AdminPanelProps) {
  const [users, setUsers] = useState<User[]>(initialUsers)
  const [modules, setModules] = useState<Module[]>(initialModules)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [newUserForm, setNewUserForm] = useState({
    username: "",
    password: "",
    isAdmin: false,
  })
  const [passwordResetForm, setPasswordResetForm] = useState({
    newPassword: "",
    confirmPassword: "",
  })
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    setUsers(initialUsers)
    setModules(initialModules)
  }, [initialUsers, initialModules])

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUserForm),
      })
      const data = await response.json()
      if (response.ok) {
        toast({ title: "Erfolg", description: "Benutzer erstellt." })
        setNewUserForm({ username: "", password: "", isAdmin: false })
        refreshData() // Refresh user list
      } else {
        toast({
          title: "Fehler",
          description: data.error || "Benutzer konnte nicht erstellt werden.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Create user error:", error)
      toast({
        title: "Fehler",
        description: "Netzwerkfehler beim Erstellen des Benutzers.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteUser = async (userId: number) => {
    if (!confirm("Sind Sie sicher, dass Sie diesen Benutzer löschen möchten?")) return
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      })
      if (response.ok) {
        toast({ title: "Erfolg", description: "Benutzer gelöscht." })
        refreshData()
      } else {
        toast({
          title: "Fehler",
          description: "Benutzer konnte nicht gelöscht werden.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Delete user error:", error)
      toast({
        title: "Fehler",
        description: "Netzwerkfehler beim Löschen des Benutzers.",
        variant: "destructive",
      })
    }
  }

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUser) return

    if (passwordResetForm.newPassword !== passwordResetForm.confirmPassword) {
      toast({
        title: "Fehler",
        description: "Passwörter stimmen nicht überein.",
        variant: "destructive",
      })
      return
    }
    if (passwordResetForm.newPassword.length < 6) {
      toast({
        title: "Fehler",
        description: "Passwort muss mindestens 6 Zeichen lang sein.",
        variant: "destructive",
      })
      return
    }

    setSaving(true)
    try {
      const response = await fetch(`/api/admin/users/${selectedUser.id}/password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword: passwordResetForm.newPassword }),
      })
      const data = await response.json()
      if (response.ok) {
        toast({ title: "Erfolg", description: "Passwort zurückgesetzt." })
        setPasswordResetForm({ newPassword: "", confirmPassword: "" })
      } else {
        toast({
          title: "Fehler",
          description: data.error || "Passwort konnte nicht zurückgesetzt werden.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Password reset error:", error)
      toast({
        title: "Fehler",
        description: "Netzwerkfehler beim Zurücksetzen des Passworts.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleModuleAccessToggle = async (moduleId: number, isActive: boolean) => {
    if (!selectedUser) return
    try {
      const response = await fetch(`/api/admin/users/${selectedUser.id}/modules`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ moduleId, isActive }),
      })
      const data = await response.json()
      if (response.ok) {
        toast({ title: "Erfolg", description: "Modulzugriff aktualisiert." })
        // Update local state for selected user's modules
        setSelectedUser((prevUser) => {
          if (!prevUser) return null
          const updatedModules = prevUser.modules
            ? prevUser.modules.map((m) => (m.id === moduleId ? { ...m, is_active: isActive } : m))
            : [{ id: moduleId, is_active: isActive }] // If modules array is null/undefined
          return { ...prevUser, modules: updatedModules }
        })
      } else {
        toast({
          title: "Fehler",
          description: data.error || "Modulzugriff konnte nicht aktualisiert werden.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Module access toggle error:", error)
      toast({
        title: "Fehler",
        description: "Netzwerkfehler beim Aktualisieren des Modulzugriffs.",
        variant: "destructive",
      })
    }
  }

  const fetchUserModules = async (userId: number) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/modules`)
      if (response.ok) {
        const data = await response.json()
        return data.modules
      }
      return []
    } catch (error) {
      console.error("Error fetching user modules:", error)
      return []
    }
  }

  const handleUserSelect = async (user: User) => {
    const userModules = await fetchUserModules(user.id)
    setSelectedUser({ ...user, modules: userModules })
  }

  return (
    <div className="space-y-8">
      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-card border-border">
          <TabsTrigger value="users" className="data-[state=active]:bg-primary data-[state=active]:text-background">
            <Users className="w-4 h-4 mr-2" />
            Benutzerverwaltung
          </TabsTrigger>
          <TabsTrigger
            value="create-user"
            className="data-[state=active]:bg-primary data-[state=active]:text-background"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Benutzer erstellen
          </TabsTrigger>
          <TabsTrigger
            value="module-access"
            className="data-[state=active]:bg-primary data-[state=active]:text-background"
          >
            <Bot className="w-4 h-4 mr-2" />
            Modulzugriff
          </TabsTrigger>
        </TabsList>

        {/* Benutzerverwaltung Tab */}
        <TabsContent value="users" className="space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-primary flex items-center gap-2">
                <Users className="w-5 h-5" />
                Alle Benutzer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm text-muted-foreground">
                  <thead className="border-b border-border">
                    <tr>
                      <th className="py-2 px-4 font-medium text-foreground">ID</th>
                      <th className="py-2 px-4 font-medium text-foreground">Benutzername</th>
                      <th className="py-2 px-4 font-medium text-foreground">Admin</th>
                      <th className="py-2 px-4 font-medium text-foreground">Erstellt am</th>
                      <th className="py-2 px-4 font-medium text-foreground">Aktionen</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b border-border last:border-b-0">
                        <td className="py-2 px-4">{user.id}</td>
                        <td className="py-2 px-4 text-primary">{user.username}</td>
                        <td className="py-2 px-4">
                          {user.is_admin ? (
                            <Check className="w-4 h-4 text-module-analytics" />
                          ) : (
                            <X className="w-4 h-4 text-destructive" />
                          )}
                        </td>
                        <td className="py-2 px-4">{new Date(user.created_at).toLocaleDateString()}</td>
                        <td className="py-2 px-4 flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUserSelect(user)}
                            className="border-primary text-primary hover:bg-primary/10"
                          >
                            <Settings className="w-4 h-4 mr-1" />
                            Verwalten
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => handleDeleteUser(user.id)}>
                            <Trash2 className="w-4 h-4 mr-1" />
                            Löschen
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Benutzer erstellen Tab */}
        <TabsContent value="create-user" className="space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-primary flex items-center gap-2">
                <UserPlus className="w-5 h-5" />
                Neuen Benutzer erstellen
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateUser} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-username" className="text-foreground">
                    Benutzername
                  </Label>
                  <Input
                    id="new-username"
                    type="text"
                    value={newUserForm.username}
                    onChange={(e) => setNewUserForm({ ...newUserForm, username: e.target.value })}
                    className="bg-input border-border text-foreground"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password" className="text-foreground">
                    Passwort
                  </Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={newUserForm.password}
                    onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                    className="bg-input border-border text-foreground"
                    required
                    minLength={6}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is-admin"
                    checked={newUserForm.isAdmin}
                    onCheckedChange={(checked) => setNewUserForm({ ...newUserForm, isAdmin: checked })}
                    className="data-[state=checked]:bg-primary"
                  />
                  <Label htmlFor="is-admin" className="text-foreground">
                    Als Admin erstellen
                  </Label>
                </div>
                <Button type="submit" disabled={saving} className="bg-primary hover:bg-primary/80 text-background">
                  {saving ? "Erstelle..." : "Benutzer erstellen"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Modulzugriff Tab */}
        <TabsContent value="module-access" className="space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-primary flex items-center gap-2">
                <Bot className="w-5 h-5" />
                Modulzugriff verwalten
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="select-user" className="text-foreground">
                  Benutzer auswählen
                </Label>
                <select
                  id="select-user"
                  value={selectedUser?.id || ""}
                  onChange={(e) =>
                    handleUserSelect(users.find((u) => u.id === Number.parseInt(e.target.value)) || null)
                  }
                  className="w-full p-2 bg-input border border-border rounded-md text-foreground"
                >
                  <option value="">Benutzer wählen...</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.username} {user.is_admin ? "(Admin)" : ""}
                    </option>
                  ))}
                </select>
              </div>

              {selectedUser && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">Module für {selectedUser.username}</h3>
                  <div className="space-y-3">
                    {modules.map((module) => {
                      const userHasAccess = selectedUser.modules?.some((um) => um.id === module.id && um.is_active)
                      return (
                        <div
                          key={module.id}
                          className="flex items-center justify-between p-3 bg-background rounded-lg border border-border"
                        >
                          <div>
                            <p className="text-foreground font-medium">{module.name}</p>
                            <p className="text-sm text-muted-foreground">{module.description}</p>
                          </div>
                          <Switch
                            checked={userHasAccess}
                            onCheckedChange={(checked) => handleModuleAccessToggle(module.id, checked)}
                            className="data-[state=checked]:bg-primary"
                          />
                        </div>
                      )
                    })}
                  </div>

                  <Card className="bg-background border-border">
                    <CardHeader>
                      <CardTitle className="text-primary flex items-center gap-2">
                        <Key className="w-5 h-5" />
                        Passwort zurücksetzen für {selectedUser.username}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handlePasswordReset} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="reset-password" className="text-foreground">
                            Neues Passwort
                          </Label>
                          <Input
                            id="reset-password"
                            type="password"
                            value={passwordResetForm.newPassword}
                            onChange={(e) =>
                              setPasswordResetForm({
                                ...passwordResetForm,
                                newPassword: e.target.value,
                              })
                            }
                            className="bg-input border-border text-foreground"
                            required
                            minLength={6}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="confirm-reset-password" className="text-foreground">
                            Passwort bestätigen
                          </Label>
                          <Input
                            id="confirm-reset-password"
                            type="password"
                            value={passwordResetForm.confirmPassword}
                            onChange={(e) =>
                              setPasswordResetForm({
                                ...passwordResetForm,
                                confirmPassword: e.target.value,
                              })
                            }
                            className="bg-input border-border text-foreground"
                            required
                          />
                        </div>
                        <Button
                          type="submit"
                          disabled={saving}
                          className="bg-destructive hover:bg-destructive/80 text-background"
                        >
                          {saving ? "Setze zurück..." : "Passwort zurücksetzen"}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
