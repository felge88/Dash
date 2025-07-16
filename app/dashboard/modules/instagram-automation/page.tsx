"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Instagram, Plus, Play, Pause, Settings, BarChart3, ImageIcon, MessageSquare } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import AnimatedBackground from "@/components/animated-background"

export default function InstagramAutomationPage() {
  const [isRunning, setIsRunning] = useState(false)
  const [accounts, setAccounts] = useState([
    {
      id: 1,
      username: "@example_account",
      followers: 1247,
      following: 892,
      posts: 156,
      isConnected: true,
    },
  ])

  const [newAccount, setNewAccount] = useState({ username: "", password: "" })
  const [contentSettings, setContentSettings] = useState({
    autoGenerate: true,
    requireApproval: true,
    topics: "Lifestyle, Technology, Motivation",
    postTimes: "09:00, 15:00, 20:00",
  })

  return (
    <div className="space-y-8 relative">
      <AnimatedBackground variant="instagram" />

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-4 mb-4">
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            className="p-3 bg-gradient-to-r from-pink-500 to-red-500 rounded-full"
          >
            <Instagram className="w-8 h-8 text-white" />
          </motion.div>
          <div>
            <motion.h1
              animate={{
                textShadow: [
                  "0 0 20px rgba(255,64,129,0.8)",
                  "0 0 30px rgba(255,64,129,1)",
                  "0 0 20px rgba(255,64,129,0.8)",
                ],
              }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
              className="text-4xl font-bold text-pink-400 glitch-text"
              data-text="INSTAGRAM AUTOMATION"
            >
              INSTAGRAM AUTOMATION
            </motion.h1>
            <p className="text-gray-400 text-lg">Verwalte deine Instagram-Accounts und Automatisierungen</p>
          </div>
        </div>

        {/* Control Panel */}
        <div className="flex items-center gap-4">
          <Button
            onClick={() => setIsRunning(!isRunning)}
            variant={isRunning ? "destructive" : "default"}
            className={`${
              isRunning
                ? "bg-red-500 hover:bg-red-600"
                : "bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600"
            } text-white`}
          >
            {isRunning ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
            {isRunning ? "Stoppen" : "Starten"}
          </Button>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isRunning ? "bg-pink-400 animate-pulse" : "bg-gray-500"}`} />
            <span className="text-sm text-gray-400">Status: {isRunning ? "Läuft" : "Gestoppt"}</span>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Account Management */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
          <Card className="bg-horror-surface/80 border-pink-500/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-pink-400 flex items-center gap-2">
                <Instagram className="w-5 h-5" />
                Account-Verwaltung
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Add Account */}
              <div className="p-4 bg-horror-bg/50 rounded-lg border border-pink-500/20">
                <h3 className="text-white font-medium mb-4">Neuen Account hinzufügen</h3>
                <div className="space-y-3">
                  <div>
                    <Label className="text-gray-300">Benutzername</Label>
                    <Input
                      value={newAccount.username}
                      onChange={(e) => setNewAccount({ ...newAccount, username: e.target.value })}
                      className="bg-horror-surface border-pink-500/30 text-white"
                      placeholder="@username"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-300">Passwort</Label>
                    <Input
                      type="password"
                      value={newAccount.password}
                      onChange={(e) => setNewAccount({ ...newAccount, password: e.target.value })}
                      className="bg-horror-surface border-pink-500/30 text-white"
                      placeholder="••••••••"
                    />
                  </div>
                  <Button className="w-full bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600">
                    <Plus className="w-4 h-4 mr-2" />
                    Account hinzufügen
                  </Button>
                </div>
              </div>

              {/* Connected Accounts */}
              <div className="space-y-3">
                <h3 className="text-white font-medium">Verbundene Accounts</h3>
                {accounts.map((account) => (
                  <motion.div
                    key={account.id}
                    whileHover={{ scale: 1.02 }}
                    className="p-4 bg-horror-bg/50 rounded-lg border border-pink-500/20"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-red-500 rounded-full flex items-center justify-center">
                          <Instagram className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-white font-medium">{account.username}</p>
                          <p className="text-sm text-gray-400">{account.isConnected ? "Verbunden" : "Getrennt"}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="text-gray-400 hover:text-pink-400">
                        <Settings className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-lg font-bold text-pink-400">{account.followers.toLocaleString()}</p>
                        <p className="text-xs text-gray-400">Follower</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-pink-400">{account.following.toLocaleString()}</p>
                        <p className="text-xs text-gray-400">Folge ich</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-pink-400">{account.posts}</p>
                        <p className="text-xs text-gray-400">Beiträge</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Content Generation */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
          <Card className="bg-horror-surface/80 border-pink-500/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-pink-400 flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Content-Generierung
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-gray-300">KI-Content-Generierung</Label>
                  <Switch
                    checked={contentSettings.autoGenerate}
                    onCheckedChange={(checked) => setContentSettings({ ...contentSettings, autoGenerate: checked })}
                    className="data-[state=checked]:bg-pink-500"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label className="text-gray-300">Genehmigung erforderlich</Label>
                  <Switch
                    checked={contentSettings.requireApproval}
                    onCheckedChange={(checked) => setContentSettings({ ...contentSettings, requireApproval: checked })}
                    className="data-[state=checked]:bg-pink-500"
                  />
                </div>

                <div>
                  <Label className="text-gray-300">Themen</Label>
                  <Input
                    value={contentSettings.topics}
                    onChange={(e) => setContentSettings({ ...contentSettings, topics: e.target.value })}
                    className="bg-horror-surface border-pink-500/30 text-white"
                    placeholder="Themen durch Komma getrennt"
                  />
                </div>

                <div>
                  <Label className="text-gray-300">Post-Zeiten</Label>
                  <Input
                    value={contentSettings.postTimes}
                    onChange={(e) => setContentSettings({ ...contentSettings, postTimes: e.target.value })}
                    className="bg-horror-surface border-pink-500/30 text-white"
                    placeholder="HH:MM, HH:MM, HH:MM"
                  />
                </div>

                <div>
                  <Label className="text-gray-300">Custom Prompt</Label>
                  <Textarea
                    className="bg-horror-surface border-pink-500/30 text-white"
                    placeholder="Gib hier deinen benutzerdefinierten Prompt für die KI ein..."
                    rows={3}
                  />
                </div>

                <Button className="w-full bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600">
                  <ImageIcon className="w-4 h-4 mr-2" />
                  Content generieren
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Statistics */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card className="bg-horror-surface/80 border-pink-500/30 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-pink-400 flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Statistiken & Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-pink-400">127</p>
                <p className="text-sm text-gray-400">Posts heute</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-pink-400">2.4K</p>
                <p className="text-sm text-gray-400">Neue Follower</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-pink-400">89%</p>
                <p className="text-sm text-gray-400">Engagement Rate</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-pink-400">15.2K</p>
                <p className="text-sm text-gray-400">Likes heute</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
