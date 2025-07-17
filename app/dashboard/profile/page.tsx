"use client";

import type React from "react";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { User, Lock, Mail, Calendar, Camera, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AnimatedBackground from "@/components/animated-background";

export default function ProfilePage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load user data on component mount
  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const response = await fetch("/api/profile");
      if (response.ok) {
        const data = await response.json();
        const user = data.user;
        setName(user.name || "");
        setEmail(user.email || "");
        setProfileImage(user.profile_image || "");
        setUsername(user.username || "");
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/profile/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setProfileImage(data.profileImageUrl);
        alert("Profilbild erfolgreich hochgeladen!");
      } else {
        const error = await response.json();
        alert(error.error || "Fehler beim Hochladen");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Fehler beim Hochladen des Bildes");
    } finally {
      setUploadingImage(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert("Passwörter stimmen nicht überein");
      return;
    }

    if (!currentPassword || !newPassword) {
      alert("Alle Felder sind erforderlich");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/profile/password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      if (response.ok) {
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        alert("Passwort erfolgreich geändert");
      } else {
        const error = await response.json();
        alert(error.error || "Fehler beim Ändern des Passworts");
      }
    } catch (error) {
      console.error("Password change error:", error);
      alert("Fehler beim Ändern des Passworts");
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email }),
      });

      if (response.ok) {
        alert("Profil erfolgreich aktualisiert");
      } else {
        const error = await response.json();
        alert(error.error || "Fehler beim Aktualisieren");
      }
    } catch (error) {
      console.error("Profile update error:", error);
      alert("Fehler beim Aktualisieren des Profils");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div className="space-y-8 relative">
      <AnimatedBackground variant="default" />

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <motion.h1
          animate={{
            textShadow: [
              "0 0 20px rgba(0,255,65,0.8)",
              "0 0 30px rgba(0,255,65,1)",
              "0 0 20px rgba(0,255,65,0.8)",
            ],
          }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
          className="text-4xl font-bold text-horror-accent mb-2 glitch-text"
          data-text="PROFIL"
        >
          PROFIL
        </motion.h1>
        <p className="text-gray-400 text-lg">
          Verwalte deine Account-Einstellungen
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Profile Info */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-horror-surface/80 border-horror-border backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <User className="w-5 h-5 text-horror-accent" />
                Benutzerinformationen
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileUpdate} className="space-y-6">
                {/* Profile Picture */}
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <div className="w-20 h-20 bg-horror-accent/20 rounded-full flex items-center justify-center border-2 border-horror-accent/50 overflow-hidden">
                      {profileImage ? (
                        <img
                          src={profileImage}
                          alt="Profilbild"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-10 h-10 text-horror-accent" />
                      )}
                    </div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <Button
                      type="button"
                      size="icon"
                      className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-horror-accent hover:bg-horror-accent/80"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingImage}
                    >
                      {uploadingImage ? (
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Camera className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  <div>
                    <p className="text-white font-medium text-lg">{username}</p>
                    <p className="text-gray-400">{name || "Benutzer"}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name" className="text-gray-300">
                      Name
                    </Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="bg-horror-bg border-horror-border text-white focus:border-horror-accent"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-gray-300">
                      E-Mail
                    </Label>
                    <div className="relative">
                      <Mail
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                        size={18}
                      />
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 bg-horror-bg border-horror-border text-white focus:border-horror-accent"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-gray-400 pt-2">
                    <Calendar className="w-4 h-4" />
                    <span>
                      Erstellt: {new Date().toLocaleDateString("de-DE")}
                    </span>
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="horror"
                  disabled={isLoading}
                  className="w-full"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isLoading ? "Wird gespeichert..." : "Profil aktualisieren"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Password Change & Actions */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="space-y-6">
            {/* Password Change */}
            <Card className="bg-horror-surface/80 border-horror-border backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Lock className="w-5 h-5 text-horror-accent" />
                  Passwort ändern
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password" className="text-gray-300">
                      Aktuelles Passwort
                    </Label>
                    <Input
                      id="current-password"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="bg-horror-bg border-horror-border text-white focus:border-horror-accent"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="new-password" className="text-gray-300">
                      Neues Passwort
                    </Label>
                    <Input
                      id="new-password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="bg-horror-bg border-horror-border text-white focus:border-horror-accent"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-password" className="text-gray-300">
                      Passwort bestätigen
                    </Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="bg-horror-bg border-horror-border text-white focus:border-horror-accent"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="horror"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        Wird gespeichert...
                      </div>
                    ) : (
                      "Passwort ändern"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Logout */}
            <Card className="bg-horror-surface/80 border-red-500/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-red-400">Sitzung beenden</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400 mb-4">
                  Melde dich von deinem Account ab und kehre zur Login-Seite
                  zurück.
                </p>
                <Button
                  onClick={handleLogout}
                  variant="destructive"
                  className="w-full bg-red-500 hover:bg-red-600"
                >
                  Abmelden
                </Button>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
