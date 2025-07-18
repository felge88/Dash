"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  Activity,
  LogIn,
  LogOut,
  AlertTriangle,
  Check,
  Laptop,
  Smartphone,
  Tablet,
  Globe,
  RefreshCw,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"

interface ActivityLog {
  id: number
  action: string
  module_type: string
  status: string
  message: string
  metadata: {
    ip?: string
    user_agent?: string
    device_type?: string
    browser?: string
    os?: string
    is_suspicious?: boolean
    is_trusted?: boolean
  }
  created_at: string
  display_time: string
  display_action: string
}

interface ActivitySummary {
  total_activities: number
  last_login: string | null
  last_logout: string | null
}

interface LoginActivitiesProps {
  userId: number
}

export default function LoginActivities({ userId }: LoginActivitiesProps) {
  const [activities, setActivities] = useState<ActivityLog[]>([])
  const [summary, setSummary] = useState<ActivitySummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    loadActivities()
  }, [userId])

  const loadActivities = async () => {
    try {
      const response = await fetch("/api/activities")
      if (response.ok) {
        const data = await response.json()
        setActivities(data.activities)
        setSummary(data.summary)
      } else {
        setError("Aktivitäten konnten nicht geladen werden")
      }
    } catch (err) {
      console.error("Error loading activities:", err)
      setError("Netzwerkfehler beim Laden der Aktivitäten")
    } finally {
      setLoading(false)
    }
  }

  const getActivityIcon = (action: string, metadata?: any) => {
    if (action === "login" || action === "logout") {
      switch (metadata?.device_type) {
        case "desktop":
          return <Laptop className="w-4 h-4" />
        case "mobile":
          return <Smartphone className="w-4 h-4" />
        case "tablet":
          return <Tablet className="w-4 h-4" />
        default:
          return <Globe className="w-4 h-4" />
      }
    }
    switch (action) {
      case "login":
        return <LogIn className="w-4 h-4" />
      case "logout":
        return <LogOut className="w-4 h-4" />
      case "toggle":
      case "profile_update":
      case "password_change":
        return <Activity className="w-4 h-4" />
      default:
        return <Activity className="w-4 h-4" />
    }
  }

  const getActivityColor = (status: string, action: string) => {
    if (status === "error") return "text-destructive"
    if (action === "login") return "text-module-analytics" // Jedi Green
    if (action === "logout") return "text-module-file" // Skywalker Blue
    return "text-primary"
  }

  const handleConfirmTrustedDevice = async (activityId: number) => {
    try {
      const response = await fetch(`/api/activities/${activityId}/trust`, {
        method: "POST",
      })
      if (response.ok) {
        toast({ title: "Erfolg", description: "Gerät als vertrauenswürdig markiert." })
        loadActivities() // Refresh activities to update status
      } else {
        toast({
          title: "Fehler",
          description: "Gerät konnte nicht als vertrauenswürdig markiert werden.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error confirming trusted device:", error)
      toast({
        title: "Fehler",
        description: "Netzwerkfehler beim Markieren des Geräts.",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="text-muted-foreground">Lade Aktivitäten...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="text-destructive">{error}</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-primary flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Letzte Aktivitäten
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-background rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground">Letzter Login</p>
              <p className="text-foreground font-mono text-sm">{summary.last_login || "Nicht verfügbar"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Letzter Logout</p>
              <p className="text-foreground font-mono text-sm">{summary.last_logout || "Noch angemeldet"}</p>
            </div>
          </div>
        )}

        {/* Activities List */}
        <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
          {activities.length > 0 ? (
            activities.map((activity, index) => {
              const isSuspicious = activity.metadata?.is_suspicious && !activity.metadata?.is_trusted
              return (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex items-start justify-between p-3 rounded-lg border transition-colors hover:bg-background/30 ${
                    isSuspicious ? "bg-destructive/10 border-destructive/30" : "bg-background/20 border-border/30"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={getActivityColor(activity.status, activity.action)}>
                      {getActivityIcon(activity.action, activity.metadata)}
                    </div>
                    <div>
                      <p className="text-foreground text-sm font-medium">{activity.display_action}</p>
                      {activity.message && <p className="text-muted-foreground text-xs">{activity.message}</p>}
                      {activity.metadata?.ip && (
                        <p className="text-muted-foreground text-xs">IP: {activity.metadata.ip}</p>
                      )}
                      {(activity.metadata?.device_type || activity.metadata?.browser || activity.metadata?.os) && (
                        <p className="text-muted-foreground text-xs">
                          Gerät: {activity.metadata.device_type || "Unbekannt"} (
                          {activity.metadata.browser || "Unbekannt"} on {activity.metadata.os || "Unbekannt"})
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {isSuspicious && (
                      <div className="flex items-center gap-1">
                        <AlertTriangle className="w-4 h-4 text-destructive" />
                        <span className="text-xs text-destructive">Auffällig!</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleConfirmTrustedDevice(activity.id)}
                          className="text-xs border-module-analytics text-module-analytics hover:bg-module-analytics/10"
                        >
                          <Check className="w-3 h-3 mr-1" />
                          Vertrauen
                        </Button>
                      </div>
                    )}
                    <Badge
                      variant="secondary"
                      className={`text-xs ${
                        activity.status === "success"
                          ? "bg-module-analytics/20 text-module-analytics"
                          : activity.status === "error"
                            ? "bg-destructive/20 text-destructive"
                            : "bg-primary/20 text-primary"
                      }`}
                    >
                      {activity.status}
                    </Badge>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">{activity.display_time}</p>
                    </div>
                  </div>
                </motion.div>
              )
            })
          ) : (
            <p className="text-muted-foreground text-center py-8">Noch keine Aktivitäten vorhanden</p>
          )}
        </div>

        {/* Refresh Button */}
        <div className="pt-4 border-t border-border/30">
          <Button
            onClick={loadActivities}
            variant="outline"
            size="sm"
            className="w-full border-border text-muted-foreground hover:bg-background/50 bg-transparent"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Aktualisieren
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
