import { getCurrentUser } from "@/lib/auth"
import { db } from "@/lib/database"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, Bot, Users, TrendingUp } from "lucide-react"

export default async function DashboardPage() {
  const user = await getCurrentUser()
  if (!user) return null

  const modules = user.is_admin ? await db.getAllModules() : await db.getUserModules(user.id)

  const activeModules = modules.filter((m) => m.is_active)
  const recentLogs = await db.getModuleLogs(undefined, 10)
  const allUsers = user.is_admin ? await db.getAllUsers() : []

  const stats = [
    {
      title: "Aktive Module",
      value: activeModules.length,
      total: modules.length,
      icon: Bot,
      color: "text-horror-accent",
    },
    {
      title: "Gesamte Module",
      value: modules.length,
      icon: Activity,
      color: "text-blue-400",
    },
    ...(user.is_admin
      ? [
          {
            title: "Benutzer",
            value: allUsers.length,
            icon: Users,
            color: "text-purple-400",
          },
        ]
      : []),
    {
      title: "Aktivitäten (24h)",
      value: recentLogs.length,
      icon: TrendingUp,
      color: "text-orange-400",
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Willkommen, {user.username}</h1>
        <p className="text-gray-400">Übersicht über deine Automatisierungs-Module</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="bg-horror-surface border-horror-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold text-white">
                    {stat.value}
                    {stat.total && <span className="text-sm text-gray-400 ml-1">/ {stat.total}</span>}
                  </p>
                </div>
                <stat.icon className={`w-8 h-8 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <Card className="bg-horror-surface border-horror-border">
        <CardHeader>
          <CardTitle className="text-white">Letzte Aktivitäten</CardTitle>
        </CardHeader>
        <CardContent>
          {recentLogs.length > 0 ? (
            <div className="space-y-3">
              {recentLogs.slice(0, 5).map((log) => (
                <div key={log.id} className="flex items-center justify-between p-3 bg-horror-bg rounded-lg">
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
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-8">Noch keine Aktivitäten vorhanden</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
