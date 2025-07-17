"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Camera, User, Lock, Shield, Bell, Monitor } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";

interface UserProfile {
  id: number;
  username: string;
  name: string;
  email: string;
  profile_image: string;
  is_admin: boolean;
}

export default function SettingsPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
  });

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const response = await fetch("/api/profile");
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setProfileForm({
          name: data.user.name || "",
          email: data.user.email || "",
        });
      }
    } catch (error) {
      console.error("Error loading profile:", error);
      toast({
        title: "Fehler",
        description: "Profil konnte nicht geladen werden",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profileForm),
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        toast({
          title: "Erfolg",
          description: "Profil erfolgreich aktualisiert",
        });
      } else {
        toast({
          title: "Fehler",
          description: data.error || "Profil konnte nicht aktualisiert werden",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Fehler",
        description: "Netzwerkfehler beim Aktualisieren des Profils",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: "Fehler",
        description: "Neue Passwörter stimmen nicht überein",
        variant: "destructive",
      });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast({
        title: "Fehler",
        description: "Neues Passwort muss mindestens 6 Zeichen lang sein",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);

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
      });

      const data = await response.json();

      if (response.ok) {
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        toast({
          title: "Erfolg",
          description: "Passwort erfolgreich geändert",
        });
      } else {
        toast({
          title: "Fehler",
          description: data.error || "Passwort konnte nicht geändert werden",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error changing password:", error);
      toast({
        title: "Fehler",
        description: "Netzwerkfehler beim Ändern des Passworts",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-white">Lade Einstellungen...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-red-400">Benutzer nicht gefunden</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1
          className="text-4xl font-bold text-white mb-2 glitch-text"
          data-text="EINSTELLUNGEN"
        >
          EINSTELLUNGEN
        </h1>
        <p className="text-gray-400 text-lg">
          Profil verwalten und Anwendungseinstellungen konfigurieren
        </p>
      </motion.div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 bg-horror-surface border-horror-border">
          <TabsTrigger
            value="profile"
            className="data-[state=active]:bg-horror-accent data-[state=active]:text-black"
          >
            <User className="w-4 h-4 mr-2" />
            Profil
          </TabsTrigger>
          <TabsTrigger
            value="system"
            className="data-[state=active]:bg-horror-accent data-[state=active]:text-black"
          >
            <Monitor className="w-4 h-4 mr-2" />
            System
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="bg-horror-surface border-horror-border">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <User className="w-5 h-5 text-horror-accent" />
                  Profil-Informationen
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Profile Image */}
                <div className="flex items-center gap-4">
                  <Avatar className="w-20 h-20">
                    <AvatarImage src={user.profile_image} alt={user.username} />
                    <AvatarFallback className="bg-horror-accent text-black text-xl font-bold">
                      {user.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <p className="text-white font-medium">@{user.username}</p>
                    {user.is_admin && (
                      <span className="text-xs bg-horror-accent/20 text-horror-accent px-2 py-1 rounded-full">
                        ADMIN
                      </span>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-horror-border text-gray-300"
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      Bild ändern
                    </Button>
                  </div>
                </div>

                {/* Profile Form */}
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-white">
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
                        className="bg-horror-bg border-horror-border text-white"
                        placeholder="Ihr vollständiger Name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-white">
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
                        className="bg-horror-bg border-horror-border text-white"
                        placeholder="ihre@email.com"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={saving}
                    className="bg-horror-accent hover:bg-horror-accent/80 text-black"
                  >
                    {saving ? "Speichert..." : "Profil aktualisieren"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Password Change */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-horror-surface border-horror-border">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Lock className="w-5 h-5 text-horror-accent" />
                  Passwort ändern
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword" className="text-white">
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
                      className="bg-horror-bg border-horror-border text-white"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="newPassword" className="text-white">
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
                        className="bg-horror-bg border-horror-border text-white"
                        required
                        minLength={6}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-white">
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
                        className="bg-horror-bg border-horror-border text-white"
                        required
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={saving}
                    className="bg-horror-accent hover:bg-horror-accent/80 text-black"
                  >
                    {saving ? "Ändert..." : "Passwort ändern"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* System Tab */}
        <TabsContent value="system" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="bg-horror-surface border-horror-border">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Shield className="w-5 h-5 text-horror-accent" />
                  System-Informationen
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-sm text-gray-400">Version</p>
                    <p className="text-white font-mono">v2.0.0</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-400">Letztes Update</p>
                    <p className="text-white font-mono">
                      {new Date().toLocaleDateString("de-DE")}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-400">Benutzer-ID</p>
                    <p className="text-white font-mono">#{user.id}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-400">Status</p>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-horror-accent rounded-full animate-pulse" />
                      <p className="text-horror-accent font-medium">Online</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
