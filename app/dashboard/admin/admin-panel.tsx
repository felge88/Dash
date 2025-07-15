"use client"

import { useState } from "react"

import type React from "react"
import { motion } from "framer-motion"
import { Shield, Users, Plus, Trash2, Key } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface User {
  id: number
  username: string
  is_admin: boolean
  created_at: string
  last_login: string | null
}

interface Module {
  id: number
  name: string
  description: string
  is_active: boolean
}

interface AdminPanelProps {
  initialUsers: User[]
  initialModules: Module[]
}

export default function AdminPanel({ initialUsers, initialModules }: AdminPanelProps) {
  const [users, setUsers] = useState<User[]>(initialUsers)
  const [modules, setModules] = useState<Module[]>(initialModules)
  const [newUsername, setNewUsername] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newUsername || !newPassword) return

    setIsLoading(true)
    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: newUsername, password: newPassword }),
      })

      if (response.ok) {
        // Simulate adding user to list
        const newUser = {
          id: Date.now(),
          username: newUsername,
          is_admin: false,
          created_at: new Date().toISOString(),
          last_login: null,
        }
        setUsers((prev) => [...prev, newUser])
        setNewUsername("")
        setNewPassword("")
      }
    } catch (error) {
      console.error("Error creating user:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteUser = async (userId: number) => {
    if (!confirm("Benutzer wirklich löschen?")) return

    try {
      setUsers((prev) => prev.filter((user) => user.id !== userId))
    } catch (error) {
      console.error("Error deleting user:", error)
    }
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* User Management */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <Card className="bg-horror-surface border-horror-border">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-horror-accent" />
                Benutzerverwaltung
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Add User Form */}
              <form onSubmit={handleCreateUser} className="space-y-4 p-4 bg-horror-bg rounded-lg">
                <h3 className="text-white font-medium">Neuen Benutzer hinzufügen</h3>
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-gray-300">
                    Benutzername
                  </Label>
                  <Input
                    id="username"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="bg-horror-surface border-horror-border text-white"
                    placeholder="Benutzername eingeben"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-300">
                    Passwort
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="bg-horror-surface border-horror-border text-white"
                    placeholder="Passwort eingeben"
                    required
                  />
                </div>
                <Button type="submit" variant="horror" disabled={isLoading} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  {isLoading ? "Wird erstellt..." : "Benutzer hinzufügen"}
                </Button>
              </form>

              {/* Users List */}
              <div className="space-y-3">
                <h3 className="text-white font-medium">Bestehende Benutzer</h3>
                {users.map((user) => (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between p-3 bg-horror-bg rounded-lg border border-horror-border/50"
                  >
                    <div>
                      <p className="text-white font-medium">{user.username}</p>
                      <p className="text-sm text-gray-400">
                        {user.is_admin ? "Administrator" : "Benutzer"} •{" "}
                        {user.last_login
                          ? `Zuletzt: ${new Date(user.last_login).toLocaleDateString("de-DE")}`
                          : "Noch nie angemeldet"}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" className="text-gray-400 hover:text-horror-accent">
                        <Key className="w-4 h-4" />
                      </Button>
                      {!user.is_admin && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-gray-400 hover:text-horror-danger"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Module Management */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
          <Card className="bg-horror-surface border-horror-border">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-horror-accent" />
                Modul-Verwaltung
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {modules.map((module) => (
                <motion.div
                  key={module.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between p-4 bg-horror-bg rounded-lg border border-horror-border/50"
                >
                  <div>
                    <p className="text-white font-medium">{module.name}</p>
                    <p className="text-sm text-gray-400">{module.description}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        module.is_active ? "bg-horror-accent animate-pulse" : "bg-gray-500"
                      }`}
                    />
                    <span className="text-sm text-gray-400">{module.is_active ? "Aktiv" : "Inaktiv"}</span>
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
