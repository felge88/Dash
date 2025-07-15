"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, TrendingUp, Clock, Zap } from "lucide-react"

interface Stats {
  totalModules: number
  activeModules: number
  totalExecutions: number
  successRate: number
  recentActivity: Array<{
    id: number
    module_name: string
    status: string
    message: string
    created_at: string
  }>
}

export default function StatsPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading stats
    setTimeout(() => {
      setStats({
        totalModules: 6,
        activeModules: 3,
        totalExecutions: 1247,
        successRate: 94.2,
        recentActivity: [
          {
            id: 1,
            module_name: "Instagram Automation",
            status: "success",
            message: "50 Posts erfolgreich geliked",
            created_at: new Date().toISOString(),
          },
          {
            id: 2,
            module_name: "YouTube Downloader",
            status: "success",
            message: "Video erfolgreich heruntergeladen",
            created_at: new Date(Date.now() - 300000).toISOString(),
          },
          {
            id: 3,
            module_name: "Web Scraper",
            status: "error",
            message: "Verbindung zur Website fehlgeschlagen",
            created_at: new Date(Date.now() - 600000).toISOString(),
          },
        ],
      })
      setIsLoading(false)
    }, 1000)
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            className="w-12 h-12 border-4 border-horror-accent border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-gray-400 text-lg">Statistiken werden geladen...</p>
        </div>
      </div>
    )
  }

  if (!stats) return null

  const statCards = [
    {
      title: "Gesamte Module",
      value: stats.totalModules,
      icon: Activity,
      color: "text-blue-400",
      bgColor: "bg-blue-400/10",
    },
    {
      title: "Aktive Module",
      value: stats.activeModules,
      icon: Zap,
      color: "text-horror-accent",
      bgColor: "bg-horror-accent/10",
    },
    {
      title: "Ausführungen",
      value: stats.totalExecutions.toLocaleString(),
      icon: TrendingUp,
      color: "text-purple-400",
      bgColor: "bg-purple-400/10",
    },
    {
      title: "Erfolgsrate",
      value: `${stats.successRate}%`,
      icon: Clock,
      color: "text-green-400",
      bgColor: "bg-green-400/10",
    },
  ]

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl font-bold text-white mb-2 glitch-text" data-text="STATISTIKEN">
          STATISTIKEN
        </h1>
        <p className="text-gray-400 text-lg">Übersicht über deine Modul-Performance</p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="bg-horror-surface border-horror-border hover:horror-glow transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">{stat.title}</p>
                    <p className="text-3xl font-bold text-white">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Recent Activity */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <Card className="bg-horror-surface border-horror-border">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-horror-accent" />
              Letzte Aktivitäten
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentActivity.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="flex items-center justify-between p-4 bg-horror-bg rounded-lg border border-horror-border/50"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        activity.status === "success"
                          ? "bg-horror-accent animate-pulse"
                          : activity.status === "error"
                            ? "bg-horror-danger animate-pulse"
                            : "bg-gray-500"
                      }`}
                    />
                    <div>
                      <p className="text-white font-medium">{activity.module_name}</p>
                      <p className="text-sm text-gray-400">{activity.message}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-xs px-3 py-1 rounded-full font-medium ${
                        activity.status === "success"
                          ? "bg-horror-accent/20 text-horror-accent"
                          : activity.status === "error"
                            ? "bg-horror-danger/20 text-horror-danger"
                            : "bg-gray-500/20 text-gray-400"
                      }`}
                    >
                      {activity.status.toUpperCase()}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(activity.created_at).toLocaleTimeString("de-DE")}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
