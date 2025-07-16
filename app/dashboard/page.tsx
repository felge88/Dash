import { getCurrentUser } from "@/lib/auth"
import { db } from "@/lib/database"
import DashboardContent from "./dashboard-content"

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
      icon: "Bot",
      color: "text-horror-accent",
    },
    {
      title: "Gesamte Module",
      value: modules.length,
      icon: "Activity",
      color: "text-blue-400",
    },
    ...(user.is_admin
      ? [
          {
            title: "Benutzer",
            value: allUsers.length,
            icon: "Users",
            color: "text-purple-400",
          },
        ]
      : []),
    {
      title: "Aktivitäten (24h)",
      value: recentLogs.length,
      icon: "TrendingUp",
      color: "text-orange-400",
    },
  ]

  return <DashboardContent user={user} stats={stats} recentLogs={recentLogs} />
}
