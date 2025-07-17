import { getCurrentUser } from "@/lib/auth";
import db from "@/lib/database";
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  TrendingUp,
  Users,
  Heart,
  MessageSquare,
  Eye,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  Instagram,
  Youtube,
  Mail,
  Settings,
  Shield,
  Calendar,
  Target,
  Zap,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

interface DashboardStats {
  user_stats: {
    total_modules: number;
    active_modules: number;
    last_activity: string;
    is_admin: boolean;
  };
  instagram_stats: {
    connected_accounts: number;
    total_followers: number;
    total_posts: number;
    avg_engagement: number;
    pending_approvals: number;
    active_automations: number;
  };
  recent_activities: Array<{
    id: number;
    activity_type: string;
    description: string;
    timestamp: string;
    status: "success" | "error" | "info";
  }>;
  system_status: {
    api_health: "healthy" | "degraded" | "down";
    automation_queue: number;
    last_backup: string;
    uptime: string;
  };
}

export default function DashboardContent() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch("/api/dashboard/stats", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        // Fallback mit Mock-Daten
        setStats({
          user_stats: {
            total_modules: 3,
            active_modules: 2,
            last_activity: new Date().toISOString(),
            is_admin: false,
          },
          instagram_stats: {
            connected_accounts: 2,
            total_followers: 15420,
            total_posts: 147,
            avg_engagement: 4.2,
            pending_approvals: 3,
            active_automations: 1,
          },
          recent_activities: [
            {
              id: 1,
              activity_type: "content_approval_created",
              description: "Neuer Content wartet auf Genehmigung",
              timestamp: new Date(Date.now() - 300000).toISOString(),
              status: "info",
            },
            {
              id: 2,
              activity_type: "instagram_post",
              description: "Post auf @testaccount veröffentlicht",
              timestamp: new Date(Date.now() - 1800000).toISOString(),
              status: "success",
            },
            {
              id: 3,
              activity_type: "login",
              description: "Erfolgreiche Anmeldung",
              timestamp: new Date(Date.now() - 3600000).toISOString(),
              status: "success",
            },
          ],
          system_status: {
            api_health: "healthy",
            automation_queue: 5,
            last_backup: new Date(Date.now() - 86400000).toISOString(),
            uptime: "99.9%",
          },
        });
      }
    } catch (error) {
      console.error("Error loading dashboard stats:", error);
      toast({
        title: "Fehler",
        description: "Dashboard-Daten konnten nicht geladen werden",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshStats = async () => {
    setRefreshing(true);
    await loadDashboardStats();
    setRefreshing(false);
    toast({
      title: "Aktualisiert",
      description: "Dashboard-Daten wurden aktualisiert",
    });
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "login": return <Shield className="w-4 h-4 text-green-400" />;
      case "instagram_post": return <Instagram className="w-4 h-4 text-purple-400" />;
      case "content_approval_created": return <Clock className="w-4 h-4 text-yellow-400" />;
      case "content_approval_approved": return <CheckCircle className="w-4 h-4 text-green-400" />;
      case "automation_started": return <Zap className="w-4 h-4 text-blue-400" />;
      default: return <Activity className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success": return "text-green-400";
      case "error": return "text-red-400";
      case "info": return "text-blue-400";
      default: return "text-gray-400";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTimeAgo = (dateString: string) => {
    const diff = Date.now() - new Date(dateString).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `vor ${minutes}m`;
    if (hours < 24) return `vor ${hours}h`;
    return `vor ${days}d`;
  };

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-white">Lade Dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-4xl font-bold text-white mb-2 glitch-text" data-text="DASHBOARD">
            DASHBOARD
          </h1>
          <p className="text-gray-400 text-lg">
            Übersicht über deine Automatisierung und Aktivitäten
          </p>
        </div>
        <Button
          onClick={refreshStats}
          disabled={refreshing}
          variant="outline"
          className="border-horror-accent text-horror-accent hover:bg-horror-accent hover:text-black"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
          Aktualisieren
        </Button>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-horror-surface border-horror-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Aktive Module</p>
                  <p className="text-2xl font-bold text-white">
                    {stats.user_stats.active_modules}/{stats.user_stats.total_modules}
                  </p>
                </div>
                <Settings className="w-8 h-8 text-horror-accent" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-horror-surface border-horror-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Instagram Accounts</p>
                  <p className="text-2xl font-bold text-white">
                    {stats.instagram_stats.connected_accounts}
                  </p>
                </div>
                <Instagram className="w-8 h-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-horror-surface border-horror-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Gesamt Follower</p>
                  <p className="text-2xl font-bold text-white">
                    {stats.instagram_stats.total_followers.toLocaleString()}
                  </p>
                </div>
                <Users className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-horror-surface border-horror-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Avg. Engagement</p>
                  <p className="text-2xl font-bold text-green-400">
                    {stats.instagram_stats.avg_engagement.toFixed(1)}%
                  </p>
                </div>
                <Heart className="w-8 h-8 text-red-400" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-horror-surface border-horror-border">
          <TabsTrigger value="overview" className="data-[state=active]:bg-horror-accent data-[state=active]:text-black">
            <BarChart3 className="w-4 h-4 mr-2" />
            Übersicht
          </TabsTrigger>
          <TabsTrigger value="instagram" className="data-[state=active]:bg-horror-accent data-[state=active]:text-black">
            <Instagram className="w-4 h-4 mr-2" />
            Instagram
          </TabsTrigger>
          <TabsTrigger value="activities" className="data-[state=active]:bg-horror-accent data-[state=active]:text-black">
            <Activity className="w-4 h-4 mr-2" />
            Aktivitäten
          </TabsTrigger>
          <TabsTrigger value="system" className="data-[state=active]:bg-horror-accent data-[state=active]:text-black">
            <Shield className="w-4 h-4 mr-2" />
            System
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Module Status */}
            <Card className="bg-horror-surface border-horror-border">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Settings className="w-5 h-5 text-horror-accent" />
                  Module Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Instagram className="w-5 h-5 text-purple-400" />
                      <span className="text-white">Instagram Automation</span>
                    </div>
                    <Badge className="bg-green-400/20 text-green-400 border-green-400/50">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Aktiv
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Youtube className="w-5 h-5 text-red-400" />
                      <span className="text-white">YouTube Downloader</span>
                    </div>
                    <Badge className="bg-green-400/20 text-green-400 border-green-400/50">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Aktiv
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-blue-400" />
                      <span className="text-white">E-Mail Notifications</span>
                    </div>
                    <Badge className="bg-gray-400/20 text-gray-400 border-gray-400/50">
                      <Clock className="w-3 h-3 mr-1" />
                      Inaktiv
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-horror-surface border-horror-border">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Zap className="w-5 h-5 text-horror-accent" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  className="w-full justify-start bg-purple-600 hover:bg-purple-700"
                  onClick={() => window.location.href = "/dashboard/modules/instagram"}
                >
                  <Instagram className="w-4 h-4 mr-2" />
                  Instagram verwalten
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start border-horror-accent text-horror-accent hover:bg-horror-accent hover:text-black"
                  onClick={() => window.location.href = "/dashboard/stats"}
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Statistiken anzeigen
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start border-gray-600 text-gray-300 hover:bg-gray-600 hover:text-white"
                  onClick={() => window.location.href = "/dashboard/settings"}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Einstellungen öffnen
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Instagram Tab */}
        <TabsContent value="instagram" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-horror-surface border-horror-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-white text-lg">Posts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-3xl font-bold text-white">{stats.instagram_stats.total_posts}</p>
                  <p className="text-sm text-gray-400 mt-1">Gesamt veröffentlicht</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-horror-surface border-horror-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-white text-lg">Wartende Genehmigungen</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-3xl font-bold text-yellow-400">{stats.instagram_stats.pending_approvals}</p>
                  <p className="text-sm text-gray-400 mt-1">Benötigen Aktion</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-horror-surface border-horror-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-white text-lg">Automatisierungen</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-400">{stats.instagram_stats.active_automations}</p>
                  <p className="text-sm text-gray-400 mt-1">Aktiv laufend</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-horror-surface border-horror-border">
            <CardHeader>
              <CardTitle className="text-white">Instagram Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">Engagement Rate</span>
                    <span className="text-white">{stats.instagram_stats.avg_engagement.toFixed(1)}%</span>
                  </div>
                  <Progress value={stats.instagram_stats.avg_engagement * 10} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">Follower Wachstum (30d)</span>
                    <span className="text-green-400">+2.3%</span>
                  </div>
                  <Progress value={23} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">Content Genehmigungsrate</span>
                    <span className="text-white">87%</span>
                  </div>
                  <Progress value={87} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activities Tab */}
        <TabsContent value="activities" className="space-y-6">
          <Card className="bg-horror-surface border-horror-border">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-horror-accent" />
                Letzte Aktivitäten
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.recent_activities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 p-3 bg-horror-bg/50 rounded-lg">
                    <div className="mt-0.5">
                      {getActivityIcon(activity.activity_type)}
                    </div>
                    <div className="flex-1">
                      <p className="text-white text-sm">{activity.description}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-gray-400">
                          {formatDate(activity.timestamp)}
                        </span>
                        <span className="text-xs text-gray-500">
                          {getTimeAgo(activity.timestamp)}
                        </span>
                        <Badge 
                          variant="secondary" 
                          className={`text-xs ${getStatusColor(activity.status)} bg-transparent border`}
                        >
                          {activity.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
                
                {stats.recent_activities.length === 0 && (
                  <div className="text-center py-8">
                    <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400">Keine aktuellen Aktivitäten</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Tab */}
        <TabsContent value="system" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-horror-surface border-horror-border">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Shield className="w-5 h-5 text-horror-accent" />
                  System Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">API Health</span>
                  <Badge className="bg-green-400/20 text-green-400 border-green-400/50">
                    {stats.system_status.api_health}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Uptime</span>
                  <span className="text-white">{stats.system_status.uptime}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Queue</span>
                  <span className="text-white">{stats.system_status.automation_queue} Jobs</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Letztes Backup</span>
                  <span className="text-white text-sm">
                    {formatDate(stats.system_status.last_backup)}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-horror-surface border-horror-border">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Target className="w-5 h-5 text-horror-accent" />
                  Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">CPU Usage</span>
                    <span className="text-white">23%</span>
                  </div>
                  <Progress value={23} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">Memory Usage</span>
                    <span className="text-white">67%</span>
                  </div>
                  <Progress value={67} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">Disk Usage</span>
                    <span className="text-white">45%</span>
                  </div>
                  <Progress value={45} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const modules = user.is_admin
    ? await db.getAllModules()
    : await db.getModulesForUser(user.id);
  const activeModules = modules.filter((m) => m.is_active || m.user_active);
  const recentLogs = await db.getRecentActivities(user.id, 10);
  const allUsers = user.is_admin ? await db.getAllUsers() : [];

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
  ];

  return <DashboardContent user={user} stats={stats} recentLogs={recentLogs} />;
}
