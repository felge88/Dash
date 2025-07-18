"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Camera, User, Lock, Shield, Bell, Monitor, Save } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"

interface UserProfile {
  id: number
  username: string
  name: string
  email: string
  profile_image: string
  is_admin: boolean
}

interface UserSettings {
  notifications: boolean
  autoStart: boolean
  darkMode: boolean
  soundEffects: boolean
}

export default function SettingsPage() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
  })

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  // Settings state
  const [settings, setSettings] = useState<UserSettings>({
    notifications: true,
    autoStart: false,
    darkMode: true,
    soundEffects: true,
  })

  useEffect(() => {
    loadUserProfile()
    loadUserSettings()
  }, [])

  const loadUserProfile = async () => {
    try {
      const response = await fetch("/api/profile")
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        setProfileForm({
          name: data.user.name || "",
          email: data.user.email || "",
        })
      }
    } catch (error) {
      console.error("Error loading profile:", error)
      toast({
        title: "Fehler",
        description: "Profil konnte nicht geladen werden",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const loadUserSettings = async () => {
    try {
      const response = await fetch("/api/settings")
      if (response.ok) {
        const data = await response.json()
        setSettings(data.settings || settings)
      }
    } catch (error) {
      console.error("Error loading settings:", error)
    }
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profileForm),
      })

      const data = await response.json()

      if (response.ok) {
        setUser(data.user)
        toast({
          title: "Erfolg",
          description: "Profil erfolgreich aktualisiert",
        })
      } else {
        toast({
          title: "Fehler",
          description: data.error || "Profil konnte nicht aktualisiert werden",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Fehler",
        description: "Netzwerkfehler beim Aktualisieren des Profils",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: "Fehler",
        description: "Neue Passwörter stimmen nicht überein",
        variant: "destructive",
      })
      return
    }

    if (passwordForm.newPassword.length < 6) {
      toast({
        title: "Fehler",
        description: "Neues Passwort muss mindestens 6 Zeichen lang sein",
        variant: "destructive",
      })
      return
    }

    setSaving(true)

    try {
      const response = await fetch("/api/profile/password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        })
        toast({
          title: "Erfolg",
          description: "Passwort erfolgreich geändert",
        })
      } else {
        toast({
          title: "Fehler",
          description: data.error || "Passwort konnte nicht geändert werden",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error changing password:", error)
      toast({
        title: "Fehler",
        description: "Netzwerkfehler beim Ändern des Passworts",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleSettingsUpdate = async () => {
    setSaving(true)

    try {
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      })

      if (response.ok) {
        toast({
          title: "Erfolg",
          description: "Einstellungen erfolgreich gespeichert",
        })
      } else {
        toast({
          title: "Fehler",
          description: "Einstellungen konnten nicht gespeichert werden",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating settings:", error)
      toast({
        title: "Fehler",
        description: "Netzwerkfehler beim Speichern der Einstellungen",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-blue-400 hologram-text">Lade Einstellungen...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-red-400">Benutzer nicht gefunden</div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl font-bold text-blue-400 mb-2 hologram-text" data-text="EINSTELLUNGEN">
          EINSTELLUNGEN
        </h1>
        <p className="text-gray-400 text-lg">Profil verwalten und Systemkonfiguration</p>
      </motion.div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-card border-border">
          <TabsTrigger value="profile" className="data-[state=active]:bg-blue-400/20 data-[state=active]:text-blue-400">
            <User className="w-4 h-4 mr-2" />
            Profil
          </TabsTrigger>
          <TabsTrigger
            value="preferences"
            className="data-[state=active]:bg-blue-400/20 data-[state=active]:text-blue-400"
          >
            <Monitor className="w-4 h-4 mr-2" />
            Präferenzen
          </TabsTrigger>
          <TabsTrigger value="system" className="data-[state=active]:bg-blue-400/20 data-[state=active]:text-blue-400">
            <Shield className="w-4 h-4 mr-2" />
            System
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="bg-card border-border starwars-border">
              <CardHeader>
                <CardTitle className="text-blue-400 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Profil-Informationen
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Profile Image */}
                <div className="flex items-center gap-4">
                  <Avatar className="w-20 h-20 starwars-border">
                    <AvatarImage src={user.profile_image || "/placeholder.svg"} alt={user.username} />
                    <AvatarFallback className="bg-blue-400/20 text-blue-400 text-xl font-bold">
                      {user.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <p className="text-white font-medium">@{user.username}</p>
                    {user.is_admin && (
                      <span className="text-xs bg-blue-400/20 text-blue-400 px-2 py-1 rounded-full border border-blue-400/30">
                        ADMIRAL
                      </span>
                    )}
                    <Button variant="outline" size="sm" className="starwars-button bg-transparent">
                      <Camera className="w-4 h-4 mr-2" />
                      Bild ändern
                    </Button>
                  </div>
                </div>

                {/* Profile Form */}
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-blue-400">
                        Name
                      </Label>
                      <Input
                        id="name"
                        type="text"
                        value={profileForm.name}
                        onChange={(e) =>
                          setProfileForm({
                            ...profileForm,
                            name: e.target.value,
                          })
                        }
                        className="bg-background border-border text-white starwars-border"
                        placeholder="Ihr vollständiger Name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-blue-400">
                        E-Mail-Adresse
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileForm.email}
                        onChange={(e) =>
                          setProfileForm({
                            ...profileForm,
                            email: e.target.value,
                          })
                        }
                        className="bg-background border-border text-white starwars-border"
                        placeholder="ihre@email.com"
                      />
                    </div>
                  </div>

                  <Button type="submit" disabled={saving} className="starwars-button">
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? "Speichert..." : "Profil aktualisieren"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Password Change */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="bg-card border-border starwars-border">
              <CardHeader>
                <CardTitle className="text-blue-400 flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  Passwort ändern
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword" className="text-blue-400">
                      Aktuelles Passwort
                    </Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          currentPassword: e.target.value,
                        })
                      }
                      className="bg-background border-border text-white starwars-border"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="newPassword" className="text-blue-400">
                        Neues Passwort
                      </Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={passwordForm.newPassword}
                        onChange={(e) =>
                          setPasswordForm({
                            ...passwordForm,
                            newPassword: e.target.value,
                          })
                        }
                        className="bg-background border-border text-white starwars-border"
                        required
                        minLength={6}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-blue-400">
                        Passwort bestätigen
                      </Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={passwordForm.confirmPassword}
                        onChange={(e) =>
                          setPasswordForm({
                            ...passwordForm,
                            confirmPassword: e.target.value,
                          })
                        }
                        className="bg-background border-border text-white starwars-border"
                        required
                      />
                    </div>
                  </div>

                  <Button type="submit" disabled={saving} className="starwars-button">
                    <Lock className="w-4 h-4 mr-2" />
                    {saving ? "Ändert..." : "Passwort ändern"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences" className="space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="bg-card border-border starwars-border">
              <CardHeader>
                <CardTitle className="text-blue-400 flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Benutzereinstellungen
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-background/50 rounded-lg starwars-border">
                  <div>
                    <Label className="text-white font-medium">Push-Benachrichtigungen</Label>
                    <p className="text-sm text-gray-400">Erhalte Benachrichtigungen über Modul-Aktivitäten</p>
                  </div>
                  <Switch
                    checked={settings.notifications}
                    onCheckedChange={(checked) => setSettings({ ...settings, notifications: checked })}
                    className="data-[state=checked]:bg-blue-400"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-background/50 rounded-lg starwars-border">
                  <div>
                    <Label className="text-white font-medium">Auto-Start Module</Label>
                    <p className="text-sm text-gray-400">Starte Module automatisch beim Login</p>
                  </div>
                  <Switch
                    checked={settings.autoStart}
                    onCheckedChange={(checked) => setSettings({ ...settings, autoStart: checked })}
                    className="data-[state=checked]:bg-blue-400"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-background/50 rounded-lg starwars-border">
                  <div>
                    <Label className="text-white font-medium">Sound-Effekte</Label>
                    <p className="text-sm text-gray-400">Spiele Sounds bei wichtigen Ereignissen ab</p>
                  </div>
                  <Switch
                    checked={settings.soundEffects}
                    onCheckedChange={(checked) => setSettings({ ...settings, soundEffects: checked })}
                    className="data-[state=checked]:bg-blue-400"
                  />
                </div>

                <Button onClick={handleSettingsUpdate} disabled={saving} className="w-full starwars-button">
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? "Speichert..." : "Einstellungen speichern"}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* System Tab */}
        <TabsContent value="system" className="space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="bg-card border-border starwars-border">
              <CardHeader>
                <CardTitle className="text-blue-400 flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  System-Informationen
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-sm text-gray-400">Version</p>
                    <p className="text-blue-400 font-mono">v2.0.0-GALACTIC</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-400">Letztes Update</p>
                    <p className="text-white font-mono">{new Date().toLocaleDateString("de-DE")}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-400">Benutzer-ID</p>
                    <p className="text-white font-mono">#{user.id}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-400">Status</p>
                    <div className="flex items-center gap-2">
                      <div className="traffic-light connected" />
                      <p className="text-green-400 font-medium">Online</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
