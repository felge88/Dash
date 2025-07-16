"use client"

import { motion } from "framer-motion"
import { Activity, Bot, Users, TrendingUp } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import AnimatedBackground from "@/components/animated-background"
import QuoteDisplay from "@/components/quote-display"

interface DashboardContentProps {
  user: {
    username: string
    is_admin: boolean
  }
  stats: Array<{
    title: string
    value: number
    total?: number
    icon: string
    color: string
  }>
  recentLogs: Array<{
    id: number
    module_name: string
    status: string
    message: string
    created_at: string
  }>
}

const iconMap = {
  Bot,
  Activity,
  Users,
  TrendingUp,
}

export default function DashboardContent({ user, stats, recentLogs }: DashboardContentProps) {
  return (
    <div className="space-y-8 relative">
      <AnimatedBackground variant="default" />

      {/* Welcome Section */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-4">
        <motion.h1
          animate={{
            textShadow: ["0 0 20px rgba(0,255,65,0.8)", "0 0 30px rgba(0,255,65,1)", "0 0 20px rgba(0,255,65,0.8)"],
          }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
          className="text-5xl font-bold text-horror-accent glitch-text"
          data-text={`Willkommen, ${user.username}`}
        >
          Willkommen, {user.username}
        </motion.h1>
        <QuoteDisplay />
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const IconComponent = iconMap[stat.icon as keyof typeof iconMap]
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05, rotateY: 5 }}
            >
              <Card className="bg-horror-surface/80 border-horror-border backdrop-blur-sm hover:horror-glow transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400 mb-1">{stat.title}</p>
                      <p className="text-2xl font-bold text-white">
                        {stat.value}
                        {stat.total && <span className="text-sm text-gray-400 ml-1">/ {stat.total}</span>}
                      </p>
                    </div>
                    <IconComponent className={`w-8 h-8 ${stat.color}`} />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Recent Activity */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <Card className="bg-horror-surface/80 border-horror-border backdrop-blur-sm">
          <div className="p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-horror-accent" />
              Letzte Aktivitäten
            </h2>
            {recentLogs.length > 0 ? (
              <div className="space-y-3">
                {recentLogs.slice(0, 5).map((log, index) => (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="flex items-center justify-between p-3 bg-horror-bg/50 rounded-lg border border-horror-border/30"
                  >
                    <div>
                      <p className="text-white font-medium">{log.module_name}</p>
                      <p className="text-sm text-gray-400">{log.message}</p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          log.status === "success"
                            ? "bg-horror-accent/20 text-horror-accent"
                            : log.status === "error"
                              ? "bg-horror-danger/20 text-horror-danger"
                              : "bg-gray-500/20 text-gray-400"
                        }`}
                      >
                        {log.status}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">{new Date(log.created_at).toLocaleString("de-DE")}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-8">Noch keine Aktivitäten vorhanden</p>
            )}
          </div>
        </Card>
      </motion.div>
    </div>
  )
}
