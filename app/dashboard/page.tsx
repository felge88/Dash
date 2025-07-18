import { getCurrentUser } from "@/lib/auth";
import db from "@/lib/database-simple";
import DashboardContent from "./dashboard-content";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  // Mock data for now since database methods don't exist yet
  const modules = [];
  const activeModules = [];
  const recentLogs = [];
  const allUsers = [];

  const stats = [
    {
      title: "Aktive Module",
      value: 2,
      total: 3,
      icon: "Bot",
      color: "text-horror-accent",
    },
    {
      title: "Gesamte Module",
      value: 3,
      icon: "Activity",
      color: "text-blue-400",
    },
    ...(user.is_admin
      ? [
          {
            title: "Benutzer",
            value: 1,
            icon: "Users",
            color: "text-purple-400",
          },
        ]
      : []),
    {
      title: "Aktivitäten (24h)",
      value: 0,
      icon: "TrendingUp",
      color: "text-orange-400",
    },
  ];

  return <DashboardContent user={user} stats={stats} recentLogs={recentLogs} />;
}
