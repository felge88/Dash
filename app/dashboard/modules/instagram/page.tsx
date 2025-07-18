"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  Instagram,
  Plus,
  Settings,
  Play,
  Pause,
  Users,
  Heart,
  MessageSquare,
  TrendingUp,
  Trash2,
  Upload,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  BarChart3,
  Archive,
  Zap,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"

interface InstagramAccount {
  id: number
  username: string
  is_connected: boolean
  followers_count: number
  following_count: number
  posts_count: number
  last_sync?: string
  status: "connected" | "disconnected" | "connecting"
}

interface AutomationConfig {
  auto_generate: boolean
  require_approval: boolean
  topics: string
  post_times: string[]
  posts_per_day: number
  posts_per_week: number
}

interface ContentStatus {
  status: "inactive" | "generating" | "uploading" | "completed" | "error"
  current_task?: string
  progress?: number
}

interface InstagramStats {
  followers: number
  following: number
  posts: number
  engagement_rate: number
  follower_growth_rate: number
  impressions: number
  reach: number
  saves: number
  shares: number
  profile_views: number
  website_clicks: number
  story_views: number
  avg_watch_time: number
  best_post_time: string
  top_hashtags: string[]
  demographics: any
  locations: any[]
  ctr: number
}

interface PostArchive {
  id: number
  content: string
  hashtags: string
  posted_at: string
  likes: number
  comments: number
  shares: number
  performance: "excellent" | "good" | "average" | "poor"
}

export default function InstagramModule() {
  const [accounts, setAccounts] = useState<InstagramAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [connectLoading, setConnectLoading] = useState(false)
  const [newUsername, setNewUsername] = useState("")
  const [contentStatus, setContentStatus] = useState<ContentStatus>({
    status: "inactive",
  })
  const [stats, setStats] = useState<{ [key: number]: InstagramStats }>({})
  const [postArchive, setPostArchive] = useState<PostArchive[]>([])
  const { toast } = useToast()

  // Automation config state
  const [automationConfig, setAutomationConfig] = useState<AutomationConfig>({
    auto_generate: false,
    require_approval: true,
    topics: "",
    post_times: [],
    posts_per_day: 1,
    posts_per_week: 7,
  })

  const [newPostTime, setNewPostTime] = useState("")
  const [selectedAccount, setSelectedAccount] = useState<number | null>(null)

  useEffect(() => {
    loadAccounts()
    loadAutomationConfig()
    loadPostArchive()

    // Poll for content status updates every 5 seconds
    const interval = setInterval(checkContentStatus, 5000)
    return () => clearInterval(interval)
  }, [])

  const loadAccounts = async () => {
    try {
      const response = await fetch("/api/instagram/accounts")
      if (response.ok) {
        const data = await response.json()
        setAccounts(data.accounts || [])

        // Load stats for each connected account
        for (const account of data.accounts || []) {
          if (account.is_connected) {
            loadAccountStats(account.id)
          }
        }
      }
    } catch (error) {
      console.error("Error loading accounts:", error)
      toast({
        title: "Fehler",
        description: "Instagram-Accounts konnten nicht geladen werden",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const loadAccountStats = async (accountId: number) => {
    try {
      const response = await fetch(`/api/instagram/stats/${accountId}`)
      if (response.ok) {
        const data = await response.json()
        setStats((prev) => ({ ...prev, [accountId]: data }))
      }
    } catch (error) {
      console.error("Error loading stats:", error)
    }
  }

  const loadAutomationConfig = async () => {
    try {
      const response = await fetch("/api/instagram/automation")
      if (response.ok) {
        const data = await response.json()
        if (data.config) {
          setAutomationConfig(data.config)
          setSelectedAccount(data.config.account_id)
        }
      }
    } catch (error) {
      console.error("Error loading automation config:", error)
    }
  }

  const loadPostArchive = async () => {
    try {
      const response = await fetch("/api/instagram/archive")
      if (response.ok) {
        const data = await response.json()
        setPostArchive(data.posts || [])
      }
    } catch (error) {
      console.error("Error loading post archive:", error)
    }
  }

  const checkContentStatus = async () => {
    try {
      const response = await fetch("/api/instagram/content/status")
      if (response.ok) {
        const data = await response.json()
        setContentStatus(data)
      }
    } catch (error) {
      console.error("Error checking content status:", error)
    }
  }

  const connectAccount = async () => {
    if (!newUsername.trim()) {
      toast({
        title: "Fehler",
        description: "Bitte geben Sie einen Instagram-Benutzernamen ein",
        variant: "destructive",
      })
      return
    }

    setConnectLoading(true)
    try {
      const response = await fetch("/api/instagram/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: newUsername.trim() }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        toast({
          title: "Erfolg",
          description: "Instagram-Account erfolgreich verbunden",
        })
        setNewUsername("")
        loadAccounts()
      } else {
        toast({
          title: "Fehler",
          description: data.error || "Account konnte nicht verbunden werden",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error connecting account:", error)
      toast({
        title: "Fehler",
        description: "Netzwerkfehler beim Verbinden des Accounts",
        variant: "destructive",
      })
    } finally {
      setConnectLoading(false)
    }
  }

  const disconnectAccount = async (accountId: number) => {
    try {
      const response = await fetch(`/api/instagram/accounts/${accountId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "Erfolg",
          description: "Instagram-Account erfolgreich getrennt",
        })
        loadAccounts()
      } else {
        toast({
          title: "Fehler",
          description: "Account konnte nicht getrennt werden",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error disconnecting account:", error)
      toast({
        title: "Fehler",
        description: "Netzwerkfehler beim Trennen des Accounts",
        variant: "destructive",
      })
    }
  }

  const saveAutomationConfig = async () => {
    if (!selectedAccount) {
      toast({
        title: "Fehler",
        description: "Bitte wählen Sie einen Account aus",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch("/api/instagram/automation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          account_id: selectedAccount,
          ...automationConfig,
        }),
      })

      if (response.ok) {
        toast({
          title: "Erfolg",
          description: "Automatisierung konfiguriert",
        })
      } else {
        toast({
          title: "Fehler",
          description: "Konfiguration konnte nicht gespeichert werden",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error saving automation config:", error)
      toast({
        title: "Fehler",
        description: "Netzwerkfehler beim Speichern der Konfiguration",
        variant: "destructive",
      })
    }
  }

  const toggleAutomation = async () => {
    try {
      const endpoint = automationConfig.auto_generate
        ? "/api/instagram/automation/stop"
        : "/api/instagram/automation/start"

      const response = await fetch(endpoint, { method: "POST" })

      if (response.ok) {
        setAutomationConfig((prev) => ({
          ...prev,
          auto_generate: !prev.auto_generate,
        }))
        toast({
          title: "Erfolg",
          description: automationConfig.auto_generate ? "Automatisierung gestoppt" : "Automatisierung gestartet",
        })
      }
    } catch (error) {
      console.error("Error toggling automation:", error)
    }
  }

  const addPostTime = () => {
    if (newPostTime && !automationConfig.post_times.includes(newPostTime)) {
      setAutomationConfig((prev) => ({
        ...prev,
        post_times: [...prev.post_times, newPostTime].sort(),
      }))
      setNewPostTime("")
    }
  }

  const removePostTime = (time: string) => {
    setAutomationConfig((prev) => ({
      ...prev,
      post_times: prev.post_times.filter((t) => t !== time),
    }))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "connected":
        return "text-green-400"
      case "connecting":
        return "text-yellow-400"
      default:
        return "text-red-400"
    }
  }

  const getTrafficLight = (status: string) => {
    const baseClass = "traffic-light"
    switch (status) {
      case "connected":
        return `${baseClass} connected`
      case "connecting":
        return `${baseClass} connecting`
      default:
        return `${baseClass} disconnected`
    }
  }

  const getContentStatusDisplay = (status: ContentStatus) => {
    switch (status.status) {
      case "generating":
        return {
          text: "Generiert Content...",
          color: "text-yellow-400",
          icon: <Zap className="w-4 h-4 animate-pulse" />,
        }
      case "uploading":
        return {
          text: "Upload läuft...",
          color: "text-blue-400",
          icon: <Upload className="w-4 h-4 animate-bounce" />,
        }
      case "completed":
        return {
          text: "Abgeschlossen",
          color: "text-green-400",
          icon: <CheckCircle className="w-4 h-4" />,
        }
      case "error":
        return {
          text: "Fehler aufgetreten",
          color: "text-red-400",
          icon: <XCircle className="w-4 h-4" />,
        }
      default:
        return {
          text: "Bereit",
          color: "text-gray-400",
          icon: <Clock className="w-4 h-4" />,
        }
    }
  }

  const getPerformanceBadge = (performance: string) => {
    switch (performance) {
      case "excellent":
        return <Badge className="bg-green-400/20 text-green-400 border-green-400/30">Exzellent</Badge>
      case "good":
        return <Badge className="bg-blue-400/20 text-blue-400 border-blue-400/30">Gut</Badge>
      case "average":
        return <Badge className="bg-yellow-400/20 text-yellow-400 border-yellow-400/30">Durchschnitt</Badge>
      case "poor":
        return <Badge className="bg-red-400/20 text-red-400 border-red-400/30">Schwach</Badge>
      default:
        return <Badge className="bg-gray-400/20 text-gray-400 border-gray-400/30">Unbekannt</Badge>
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-blue-400 hologram-text">Lade Instagram-Modul...</div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl font-bold text-blue-400 mb-2 hologram-text" data-text="INSTAGRAM KONTROLLE">
          INSTAGRAM KONTROLLE
        </h1>
        <p className="text-gray-400 text-lg">Galaktische Instagram-Automatisierung und Content-Management</p>
      </motion.div>

      {/* Status Display */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between p-4 bg-card/50 rounded-lg starwars-border"
      >
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {getContentStatusDisplay(contentStatus).icon}
            <span className={`font-medium ${getContentStatusDisplay(contentStatus).color}`}>
              {getContentStatusDisplay(contentStatus).text}
            </span>
          </div>
          {contentStatus.progress && (
            <div className="flex items-center gap-2">
              <Progress value={contentStatus.progress} className="w-32" />
              <span className="text-sm text-gray-400">{contentStatus.progress}%</span>
            </div>
          )}
        </div>
        <div className="text-sm text-gray-400">
          {contentStatus.current_task && `Aktuelle Aufgabe: ${contentStatus.current_task}`}
        </div>
      </motion.div>

      <Tabs defaultValue="accounts" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 bg-card border-border">
          <TabsTrigger
            value="accounts"
            className="data-[state=active]:bg-blue-400/20 data-[state=active]:text-blue-400"
          >
            <Instagram className="w-4 h-4 mr-2" />
            Accounts
          </TabsTrigger>
          <TabsTrigger
            value="automation"
            className="data-[state=active]:bg-blue-400/20 data-[state=active]:text-blue-400"
          >
            <Settings className="w-4 h-4 mr-2" />
            Automatisierung
          </TabsTrigger>
          <TabsTrigger value="stats" className="data-[state=active]:bg-blue-400/20 data-[state=active]:text-blue-400">
            <BarChart3 className="w-4 h-4 mr-2" />
            Statistiken
          </TabsTrigger>
          <TabsTrigger value="archive" className="data-[state=active]:bg-blue-400/20 data-[state=active]:text-blue-400">
            <Archive className="w-4 h-4 mr-2" />
            Archiv
          </TabsTrigger>
          <TabsTrigger
            value="approvals"
            className="data-[state=active]:bg-blue-400/20 data-[state=active]:text-blue-400"
          >
            <Eye className="w-4 h-4 mr-2" />
            Genehmigungen
          </TabsTrigger>
        </TabsList>

        {/* Accounts Tab */}
        <TabsContent value="accounts" className="space-y-6">
          {/* Connect New Account */}
          <Card className="bg-card border-border starwars-border">
            <CardHeader>
              <CardTitle className="text-blue-400 flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Account verbinden
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="username" className="text-blue-400">
                    Instagram-Benutzername
                  </Label>
                  <Input
                    id="username"
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="@benutzername"
                    className="bg-background border-border text-white starwars-border"
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={connectAccount} disabled={connectLoading} className="starwars-button">
                    <Plus className="w-4 h-4 mr-2" />
                    {connectLoading ? "Verbinde..." : "Verbinden"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Connected Accounts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {accounts.map((account, index) => (
              <motion.div
                key={account.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-card border-border starwars-border">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Instagram className="w-6 h-6 text-purple-400" />
                        <div>
                          <h3 className="text-white font-semibold">@{account.username}</h3>
                          <div className="flex items-center gap-2">
                            <div className={getTrafficLight(account.status)} />
                            <span className={`text-sm ${getStatusColor(account.status)}`}>
                              {account.status === "connected"
                                ? "Verbunden"
                                : account.status === "connecting"
                                  ? "Verbindet..."
                                  : "Getrennt"}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button
                        onClick={() => disconnectAccount(account.id)}
                        variant="ghost"
                        size="sm"
                        className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {account.is_connected && stats[account.id] && (
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="flex items-center justify-center mb-1">
                            <Users className="w-4 h-4 text-blue-400 mr-1" />
                          </div>
                          <p className="text-white font-semibold">
                            {stats[account.id].followers?.toLocaleString() || "0"}
                          </p>
                          <p className="text-xs text-gray-400">Follower</p>
                          <p className="text-xs text-green-400">
                            +{((stats[account.id].follower_growth_rate || 0) * 100).toFixed(1)}%
                          </p>
                        </div>
                        <div>
                          <div className="flex items-center justify-center mb-1">
                            <Heart className="w-4 h-4 text-red-400 mr-1" />
                          </div>
                          <p className="text-white font-semibold">
                            {stats[account.id].following?.toLocaleString() || "0"}
                          </p>
                          <p className="text-xs text-gray-400">Folge ich</p>
                        </div>
                        <div>
                          <div className="flex items-center justify-center mb-1">
                            <MessageSquare className="w-4 h-4 text-green-400 mr-1" />
                          </div>
                          <p className="text-white font-semibold">{stats[account.id].posts || "0"}</p>
                          <p className="text-xs text-gray-400">Beiträge</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {accounts.length === 0 && (
            <Card className="bg-card border-border starwars-border">
              <CardContent className="text-center py-12">
                <Instagram className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400">Noch keine Instagram-Accounts verbunden</p>
                <p className="text-sm text-gray-500 mt-2">
                  Verbinden Sie Ihren ersten Instagram-Account, um zu beginnen
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Automation Tab */}
        <TabsContent value="automation" className="space-y-6">
          <Card className="bg-card border-border starwars-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-blue-400 flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Content-Generierung
                </CardTitle>
                <Button
                  onClick={toggleAutomation}
                  variant={automationConfig.auto_generate ? "destructive" : "default"}
                  className={automationConfig.auto_generate ? "sith-button" : "starwars-button"}
                >
                  {automationConfig.auto_generate ? (
                    <>
                      <Pause className="w-4 h-4 mr-2" />
                      Stoppen
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Starten
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Account Selection */}
              {accounts.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-blue-400">Account auswählen</Label>
                  <select
                    value={selectedAccount || ""}
                    onChange={(e) => setSelectedAccount(Number(e.target.value))}
                    className="w-full p-2 bg-background border border-border rounded-md text-white starwars-border"
                  >
                    <option value="">Account wählen...</option>
                    {accounts
                      .filter((acc) => acc.is_connected)
                      .map((account) => (
                        <option key={account.id} value={account.id}>
                          @{account.username}
                        </option>
                      ))}
                  </select>
                </div>
              )}

              {/* Topics */}
              <div className="space-y-2">
                <Label htmlFor="topics" className="text-blue-400">
                  Themenfelder (kommagetrennt)
                </Label>
                <Textarea
                  id="topics"
                  value={automationConfig.topics}
                  onChange={(e) =>
                    setAutomationConfig((prev) => ({
                      ...prev,
                      topics: e.target.value,
                    }))
                  }
                  placeholder="Fitness, Motivation, Lifestyle, Business, Wusstest du Ingwer ist gut gegen Parasiten..."
                  className="bg-background border-border text-white starwars-border"
                  rows={3}
                />
                <p className="text-xs text-gray-400">
                  Verwenden Sie auch längere Phrasen wie "Wusstest du Ingwer ist gut gegen Parasiten" - die KI erstellt
                  daraus professionelle Influencer-Posts
                </p>
              </div>

              {/* Approval Required */}
              <div className="flex items-center justify-between p-4 bg-background/50 rounded-lg starwars-border">
                <div>
                  <Label className="text-white font-medium">Genehmigung erforderlich</Label>
                  <p className="text-sm text-gray-400">Beiträge müssen vor Veröffentlichung bestätigt werden</p>
                </div>
                <Switch
                  checked={automationConfig.require_approval}
                  onCheckedChange={(checked) =>
                    setAutomationConfig((prev) => ({
                      ...prev,
                      require_approval: checked,
                    }))
                  }
                  className="data-[state=checked]:bg-blue-400"
                />
              </div>

              {/* Post Times */}
              <div className="space-y-4">
                <Label className="text-blue-400">Post-Zeiten</Label>
                <div className="flex gap-2">
                  <Input
                    type="time"
                    value={newPostTime}
                    onChange={(e) => setNewPostTime(e.target.value)}
                    className="bg-background border-border text-white starwars-border"
                  />
                  <Button onClick={addPostTime} size="sm" className="starwars-button">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {automationConfig.post_times.map((time) => (
                    <Badge
                      key={time}
                      variant="secondary"
                      className="bg-blue-400/20 text-blue-400 cursor-pointer border border-blue-400/30"
                      onClick={() => removePostTime(time)}
                    >
                      {time} <XCircle className="w-3 h-3 ml-1" />
                    </Badge>
                  ))}
                </div>
                {automationConfig.post_times.length === 0 && (
                  <p className="text-sm text-gray-400">
                    Keine Zeiten festgelegt - Posts werden zu zufälligen Zeiten veröffentlicht
                  </p>
                )}
              </div>

              {/* Posts per Day/Week */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="posts_per_day" className="text-blue-400">
                    Beiträge pro Tag
                  </Label>
                  <Input
                    id="posts_per_day"
                    type="number"
                    min="0"
                    max="10"
                    value={automationConfig.posts_per_day}
                    onChange={(e) =>
                      setAutomationConfig((prev) => ({
                        ...prev,
                        posts_per_day: Number.parseInt(e.target.value) || 0,
                      }))
                    }
                    className="bg-background border-border text-white starwars-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="posts_per_week" className="text-blue-400">
                    Beiträge pro Woche
                  </Label>
                  <Input
                    id="posts_per_week"
                    type="number"
                    min="0"
                    max="50"
                    value={automationConfig.posts_per_week}
                    onChange={(e) =>
                      setAutomationConfig((prev) => ({
                        ...prev,
                        posts_per_week: Number.parseInt(e.target.value) || 0,
                      }))
                    }
                    className="bg-background border-border text-white starwars-border"
                  />
                </div>
              </div>

              <Button onClick={saveAutomationConfig} className="w-full starwars-button">
                Konfiguration speichern
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Statistics Tab */}
        <TabsContent value="stats" className="space-y-6">
          {selectedAccount && stats[selectedAccount] ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Follower Growth */}
              <Card className="bg-card border-border starwars-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-blue-400 text-lg flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Follower-Wachstum
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-white">
                      {((stats[selectedAccount].follower_growth_rate || 0) * 100).toFixed(1)}%
                    </p>
                    <p className="text-sm text-gray-400 mt-1">30 Tage</p>
                  </div>
                </CardContent>
              </Card>

              {/* Engagement Rate */}
              <Card className="bg-card border-border starwars-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-blue-400 text-lg flex items-center gap-2">
                    <Heart className="w-5 h-5" />
                    Engagement-Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-white">
                      {(stats[selectedAccount].engagement_rate || 0).toFixed(1)}%
                    </p>
                    <p className="text-sm text-gray-400 mt-1">Durchschnitt</p>
                  </div>
                </CardContent>
              </Card>

              {/* Impressions */}
              <Card className="bg-card border-border starwars-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-blue-400 text-lg flex items-center gap-2">
                    <Eye className="w-5 h-5" />
                    Impressionen
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-white">
                      {(stats[selectedAccount].impressions || 0).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-400 mt-1">30 Tage</p>
                  </div>
                </CardContent>
              </Card>

              {/* Reach */}
              <Card className="bg-card border-border starwars-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-blue-400 text-lg">Reichweite</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-white">
                      {(stats[selectedAccount].reach || 0).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-400 mt-1">Eindeutige Nutzer</p>
                  </div>
                </CardContent>
              </Card>

              {/* Saves */}
              <Card className="bg-card border-border starwars-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-blue-400 text-lg">Gespeicherte Beiträge</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-white">
                      {(stats[selectedAccount].saves || 0).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-400 mt-1">30 Tage</p>
                  </div>
                </CardContent>
              </Card>

              {/* Profile Views */}
              <Card className="bg-card border-border starwars-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-blue-400 text-lg">Profilaufrufe</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-white">
                      {(stats[selectedAccount].profile_views || 0).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-400 mt-1">30 Tage</p>
                  </div>
                </CardContent>
              </Card>

              {/* Best Post Time */}
              <Card className="bg-card border-border starwars-border col-span-full">
                <CardHeader>
                  <CardTitle className="text-blue-400">Beste Post-Zeit</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-white">
                      {stats[selectedAccount].best_post_time || "Nicht verfügbar"}
                    </p>
                    <p className="text-sm text-gray-400 mt-1">Basierend auf historischen Engagement-Daten</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card className="bg-card border-border starwars-border">
              <CardContent className="text-center py-12">
                <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400">Wählen Sie einen Account aus, um Statistiken anzuzeigen</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Archive Tab */}
        <TabsContent value="archive" className="space-y-6">
          <Card className="bg-card border-border starwars-border">
            <CardHeader>
              <CardTitle className="text-blue-400 flex items-center gap-2">
                <Archive className="w-5 h-5" />
                Post-Archiv ({postArchive.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {postArchive.map((post) => (
                  <div key={post.id} className="p-4 bg-background/50 rounded-lg starwars-border">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <p className="text-white text-sm line-clamp-3">{post.content}</p>
                        <p className="text-blue-400 text-xs mt-1">{post.hashtags}</p>
                      </div>
                      <div className="ml-4">{getPerformanceBadge(post.performance)}</div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-4 text-gray-400">
                        <span className="flex items-center gap-1">
                          <Heart className="w-4 h-4" />
                          {post.likes.toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-4 h-4" />
                          {post.comments.toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Upload className="w-4 h-4" />
                          {post.shares.toLocaleString()}
                        </span>
                      </div>
                      <span className="text-gray-400">{new Date(post.posted_at).toLocaleDateString("de-DE")}</span>
                    </div>
                  </div>
                ))}

                {postArchive.length === 0 && (
                  <div className="text-center py-8">
                    <Archive className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400">Noch keine Posts im Archiv</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Approvals Tab */}
        <TabsContent value="approvals" className="space-y-6">
          <Card className="bg-card border-border starwars-border">
            <CardHeader>
              <CardTitle className="text-blue-400 flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Wartende Genehmigungen
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Eye className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400">Genehmigungssystem wird implementiert</p>
                <p className="text-sm text-gray-500 mt-2">
                  Hier können Sie generierte Beiträge vor der Veröffentlichung prüfen
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
