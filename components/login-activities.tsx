"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Activity, LogIn, LogOut, Shield, AlertTriangle, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ActivityLog {
  id: number;
  action: string;
  module_type: string;
  status: string;
  message: string;
  metadata: any;
  created_at: string;
  display_time: string;
  display_action: string;
}

interface ActivitySummary {
  total_activities: number;
  last_login: string | null;
  last_logout: string | null;
}

interface LoginActivitiesProps {
  userId: number;
}

export default function LoginActivities({ userId }: LoginActivitiesProps) {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [summary, setSummary] = useState<ActivitySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadActivities();
  }, [userId]);

  const loadActivities = async () => {
    try {
      const response = await fetch("/api/activities");
      if (response.ok) {
        const data = await response.json();
        setActivities(data.activities);
        setSummary(data.summary);
      } else {
        setError("Aktivitäten konnten nicht geladen werden");
      }
    } catch (err) {
      console.error("Error loading activities:", err);
      setError("Netzwerkfehler beim Laden der Aktivitäten");
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (action: string) => {
    switch (action) {
      case "login":
        return <LogIn className="w-4 h-4" />;
      case "logout":
        return <LogOut className="w-4 h-4" />;
      case "toggle":
      case "profile_update":
      case "password_change":
        return <Activity className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const getActivityColor = (status: string, action: string) => {
    if (status === "error") return "text-red-400";
    if (action === "login") return "text-green-400";
    if (action === "logout") return "text-blue-400";
    return "text-horror-accent";
  };

  const checkSuspiciousActivity = (activity: ActivityLog): boolean => {
    // Beispiel: Login von neuer IP oder ungewöhnliche Uhrzeit
    const metadata = activity.metadata || {};
    return metadata.suspicious || false;
  };

  if (loading) {
    return (
      <Card className="bg-horror-surface border-horror-border">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="text-gray-400">Lade Aktivitäten...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-horror-surface border-horror-border">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="text-red-400">{error}</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-horror-surface border-horror-border">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Activity className="w-5 h-5 text-horror-accent" />
          Letzte Aktivitäten
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-horror-bg/50 rounded-lg">
            <div>
              <p className="text-sm text-gray-400">Letzter Login</p>
              <p className="text-white font-mono text-sm">
                {summary.last_login || "Nicht verfügbar"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Letzter Logout</p>
              <p className="text-white font-mono text-sm">
                {summary.last_logout || "Noch angemeldet"}
              </p>
            </div>
          </div>
        )}

        {/* Activities List */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {activities.length > 0 ? (
            activities.map((activity, index) => {
              const suspicious = checkSuspiciousActivity(activity);
              return (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex items-center justify-between p-3 rounded-lg border transition-colors hover:bg-horror-bg/30 ${
                    suspicious
                      ? "bg-red-900/20 border-red-400/30"
                      : "bg-horror-bg/20 border-horror-border/30"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={getActivityColor(activity.status, activity.action)}>
                      {getActivityIcon(activity.action)}
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">
                        {activity.display_action}
                      </p>
                      {activity.message && (
                        <p className="text-gray-400 text-xs">{activity.message}</p>
                      )}
                      {activity.metadata?.ip && (
                        <p className="text-gray-500 text-xs">
                          IP: {activity.metadata.ip}
                        </p>
                      )}
                      {activity.metadata?.user_agent && (
                        <p className="text-gray-500 text-xs">
                          {activity.metadata.user_agent}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {suspicious && (
                      <div className="flex items-center gap-1">
                        <AlertTriangle className="w-4 h-4 text-red-400" />
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-xs border-green-400 text-green-400 hover:bg-green-400/10"
                        >
                          <Check className="w-3 h-3 mr-1" />
                          Vertrauen
                        </Button>
                      </div>
                    )}
                    <Badge
                      variant={activity.status === "success" ? "default" : "destructive"}
                      className={
                        activity.status === "success"
                          ? "bg-horror-accent/20 text-horror-accent"
                          : "bg-red-400/20 text-red-400"
                      }
                    >
                      {activity.status}
                    </Badge>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">{activity.display_time}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <p className="text-gray-400 text-center py-8">
              Noch keine Aktivitäten vorhanden
            </p>
          )}
        </div>

        {/* Refresh Button */}
        <div className="pt-4 border-t border-horror-border/30">
          <Button 
            onClick={loadActivities} 
            variant="outline" 
            size="sm"
            className="w-full border-horror-border text-gray-300 hover:bg-horror-bg/50"
          >
            <Activity className="w-4 h-4 mr-2" />
            Aktualisieren
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
