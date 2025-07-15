"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Bell, Shield, Palette, Monitor } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

export default function SettingsPage() {
  const [notifications, setNotifications] = useState(true)
  const [autoStart, setAutoStart] = useState(false)
  const [darkMode, setDarkMode] = useState(true)
  const [soundEffects, setSoundEffects] = useState(true)

  const settingsGroups = [
    {
      title: "Benachrichtigungen",
      icon: Bell,
      settings: [
        {
          label: "Push-Benachrichtigungen",
          description: "Erhalte Benachrichtigungen über Modul-Aktivitäten",
          checked: notifications,
          onChange: setNotifications,
        },
        {
          label: "Sound-Effekte",
          description: "Spiele Sounds bei wichtigen Ereignissen ab",
          checked: soundEffects,
          onChange: setSoundEffects,
        },
      ],
    },
    {
      title: "Automatisierung",
      icon: Monitor,
      settings: [
        {
          label: "Auto-Start Module",
          description: "Starte Module automatisch beim Login",
          checked: autoStart,
          onChange: setAutoStart,
        },
      ],
    },
    {
      title: "Erscheinungsbild",
      icon: Palette,
      settings: [
        {
          label: "Dark Mode",
          description: "Verwende das dunkle Design-Theme",
          checked: darkMode,
          onChange: setDarkMode,
        },
      ],
    },
  ]

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl font-bold text-white mb-2 glitch-text" data-text="EINSTELLUNGEN">
          EINSTELLUNGEN
        </h1>
        <p className="text-gray-400 text-lg">Konfiguriere deine Anwendungseinstellungen</p>
      </motion.div>

      <div className="space-y-6">
        {settingsGroups.map((group, groupIndex) => (
          <motion.div
            key={group.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: groupIndex * 0.1 }}
          >
            <Card className="bg-horror-surface border-horror-border">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <group.icon className="w-5 h-5 text-horror-accent" />
                  {group.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {group.settings.map((setting, settingIndex) => (
                  <motion.div
                    key={setting.label}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: groupIndex * 0.1 + settingIndex * 0.05 }}
                    className="flex items-center justify-between p-4 bg-horror-bg rounded-lg border border-horror-border/50"
                  >
                    <div className="space-y-1">
                      <Label className="text-white font-medium">{setting.label}</Label>
                      <p className="text-sm text-gray-400">{setting.description}</p>
                    </div>
                    <Switch
                      checked={setting.checked}
                      onCheckedChange={setting.onChange}
                      className="data-[state=checked]:bg-horror-accent"
                    />
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* System Info */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
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
                <p className="text-white font-mono">v1.0.0</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-400">Letztes Update</p>
                <p className="text-white font-mono">{new Date().toLocaleDateString("de-DE")}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-400">Uptime</p>
                <p className="text-white font-mono">24h 15m</p>
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
    </div>
  )
}
