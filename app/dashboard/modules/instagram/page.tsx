"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
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
  AlertCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface InstagramAccount {
  id: number;
  username: string;
  is_connected: boolean;
  followers_count: number;
  following_count: number;
  posts_count: number;
  last_sync?: string;
}

interface AutomationConfig {
  auto_generate: boolean;
  require_approval: boolean;
  topics: string;
  post_times: string[];
  posts_per_day: number;
}

interface ContentStatus {
  status: "inactive" | "generating" | "uploading" | "completed";
  current_task?: string;
}

export default function InstagramModule() {
  const [accounts, setAccounts] = useState<InstagramAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectLoading, setConnectLoading] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [contentStatus, setContentStatus] = useState<ContentStatus>({ status: "inactive" });
  const [stats, setStats] = useState<any>({});
  const { toast } = useToast();

  // Automation config state
  const [automationConfig, setAutomationConfig] = useState<AutomationConfig>({
    auto_generate: false,
    require_approval: true,
    topics: "",
    post_times: [],
    posts_per_day: 1,
  });

  const [newPostTime, setNewPostTime] = useState("");
  const [selectedAccount, setSelectedAccount] = useState<number | null>(null);

  useEffect(() => {
    loadAccounts();
    loadAutomationConfig();
    // Poll for content status updates
    const interval = setInterval(checkContentStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadAccounts = async () => {
    try {
      const response = await fetch("/api/instagram/accounts");
      if (response.ok) {
        const data = await response.json();
        setAccounts(data.accounts || []);
        
        // Load stats for each account
        for (const account of data.accounts || []) {
          if (account.is_connected) {
            loadAccountStats(account.id);
          }
        }
      }
    } catch (error) {
      console.error("Error loading accounts:", error);
      toast({
        title: "Fehler",
        description: "Instagram-Accounts konnten nicht geladen werden",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadAccountStats = async (accountId: number) => {
    try {
      const response = await fetch(`/api/instagram/stats/${accountId}`);
      if (response.ok) {
        const data = await response.json();
        setStats(prev => ({ ...prev, [accountId]: data }));
      }
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  const loadAutomationConfig = async () => {
    try {
      const response = await fetch("/api/instagram/automation");
      if (response.ok) {
        const data = await response.json();
        if (data.config) {
          setAutomationConfig(data.config);
          setSelectedAccount(data.config.account_id);
        }
      }
    } catch (error) {
      console.error("Error loading automation config:", error);
    }
  };

  const checkContentStatus = async () => {
    try {
      const response = await fetch("/api/instagram/content/status");
      if (response.ok) {
        const data = await response.json();
        setContentStatus(data);
      }
    } catch (error) {
      console.error("Error checking content status:", error);
    }
  };

  const connectAccount = async () => {
    if (!newUsername.trim()) {
      toast({
        title: "Fehler",
        description: "Bitte geben Sie einen Instagram-Benutzernamen ein",
        variant: "destructive",
      });
      return;
    }

    setConnectLoading(true);
    try {
      const response = await fetch("/api/instagram/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: newUsername.trim() }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast({
          title: "Erfolg",
          description: "Instagram-Account erfolgreich verbunden",
        });
        setNewUsername("");
        loadAccounts();
      } else {
        toast({
          title: "Fehler",
          description: data.error || "Account konnte nicht verbunden werden",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error connecting account:", error);
      toast({
        title: "Fehler",
        description: "Netzwerkfehler beim Verbinden des Accounts",
        variant: "destructive",
      });
    } finally {
      setConnectLoading(false);
    }
  };

  const disconnectAccount = async (accountId: number) => {
    try {
      const response = await fetch(`/api/instagram/accounts/${accountId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast({
          title: "Erfolg",
          description: "Instagram-Account erfolgreich getrennt",
        });
        loadAccounts();
      } else {
        toast({
          title: "Fehler",
          description: "Account konnte nicht getrennt werden",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error disconnecting account:", error);
      toast({
        title: "Fehler",
        description: "Netzwerkfehler beim Trennen des Accounts",
        variant: "destructive",
      });
    }
  };

  const saveAutomationConfig = async () => {
    if (!selectedAccount) {
      toast({
        title: "Fehler",
        description: "Bitte wählen Sie einen Account aus",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch("/api/instagram/automation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          account_id: selectedAccount,
          ...automationConfig,
        }),
      });

      if (response.ok) {
        toast({
          title: "Erfolg",
          description: "Automatisierung konfiguriert",
        });
      } else {
        toast({
          title: "Fehler",
          description: "Konfiguration konnte nicht gespeichert werden",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error saving automation config:", error);
      toast({
        title: "Fehler",
        description: "Netzwerkfehler beim Speichern der Konfiguration",
        variant: "destructive",
      });
    }
  };

  const toggleAutomation = async () => {
    try {
      const endpoint = automationConfig.auto_generate 
        ? "/api/instagram/automation/stop" 
        : "/api/instagram/automation/start";
        
      const response = await fetch(endpoint, { method: "POST" });
      
      if (response.ok) {
        setAutomationConfig(prev => ({ 
          ...prev, 
          auto_generate: !prev.auto_generate 
        }));
        toast({
          title: "Erfolg",
          description: automationConfig.auto_generate 
            ? "Automatisierung gestoppt" 
            : "Automatisierung gestartet",
        });
      }
    } catch (error) {
      console.error("Error toggling automation:", error);
    }
  };

  const addPostTime = () => {
    if (newPostTime && !automationConfig.post_times.includes(newPostTime)) {
      setAutomationConfig(prev => ({
        ...prev,
        post_times: [...prev.post_times, newPostTime].sort(),
      }));
      setNewPostTime("");
    }
  };

  const removePostTime = (time: string) => {
    setAutomationConfig(prev => ({
      ...prev,
      post_times: prev.post_times.filter(t => t !== time),
    }));
  };

  const getStatusColor = (isConnected: boolean) => {
    return isConnected ? "text-green-400" : "text-red-400";
  };

  const getStatusIcon = (isConnected: boolean) => {
    return isConnected ? (
      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
    ) : (
      <div className="w-2 h-2 bg-red-400 rounded-full" />
    );
  };

  const getContentStatusDisplay = (status: ContentStatus) => {
    switch (status.status) {
      case "generating":
        return { text: "Generiert gerade...", color: "text-yellow-400", icon: <Clock className="w-4 h-4" /> };
      case "uploading":
        return { text: "Upload läuft", color: "text-blue-400", icon: <Upload className="w-4 h-4" /> };
      case "completed":
        return { text: "Fertig", color: "text-green-400", icon: <CheckCircle className="w-4 h-4" /> };
      default:
        return { text: "Inaktiv", color: "text-gray-400", icon: <Pause className="w-4 h-4" /> };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-white">Lade Instagram-Module...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-bold text-white mb-2 glitch-text" data-text="INSTAGRAM">
          INSTAGRAM
        </h1>
        <p className="text-gray-400 text-lg">
          Instagram-Automatisierung und Content-Management
        </p>
      </motion.div>

      <Tabs defaultValue="accounts" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-horror-surface border-horror-border">
          <TabsTrigger value="accounts" className="data-[state=active]:bg-horror-accent data-[state=active]:text-black">
            <Instagram className="w-4 h-4 mr-2" />
            Accounts
          </TabsTrigger>
          <TabsTrigger value="automation" className="data-[state=active]:bg-horror-accent data-[state=active]:text-black">
            <Settings className="w-4 h-4 mr-2" />
            Automatisierung
          </TabsTrigger>
          <TabsTrigger value="content" className="data-[state=active]:bg-horror-accent data-[state=active]:text-black">
            <Upload className="w-4 h-4 mr-2" />
            Content
          </TabsTrigger>
          <TabsTrigger value="stats" className="data-[state=active]:bg-horror-accent data-[state=active]:text-black">
            <TrendingUp className="w-4 h-4 mr-2" />
            Statistiken
          </TabsTrigger>
        </TabsList>

        {/* Accounts Tab */}
        <TabsContent value="accounts" className="space-y-6">
          {/* Connect New Account */}
          <Card className="bg-horror-surface border-horror-border">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-horror-accent" />
                Account verbinden
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="username" className="text-white">
                    Instagram-Benutzername
                  </Label>
                  <Input
                    id="username"
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="@benutzername"
                    className="bg-horror-bg border-horror-border text-white"
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    onClick={connectAccount}
                    disabled={connectLoading}
                    className="bg-horror-accent hover:bg-horror-accent/80 text-black"
                  >
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
                <Card className="bg-horror-surface border-horror-border">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Instagram className="w-6 h-6 text-pink-500" />
                        <div>
                          <h3 className="text-white font-semibold">@{account.username}</h3>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(account.is_connected)}
                            <span className={`text-sm ${getStatusColor(account.is_connected)}`}>
                              {account.is_connected ? "Verbunden" : "Getrennt"}
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
                          <p className="text-white font-semibold">{stats[account.id].followers}</p>
                          <p className="text-xs text-gray-400">Follower</p>
                        </div>
                        <div>
                          <div className="flex items-center justify-center mb-1">
                            <Heart className="w-4 h-4 text-red-400 mr-1" />
                          </div>
                          <p className="text-white font-semibold">{stats[account.id].following}</p>
                          <p className="text-xs text-gray-400">Folge ich</p>
                        </div>
                        <div>
                          <div className="flex items-center justify-center mb-1">
                            <MessageSquare className="w-4 h-4 text-green-400 mr-1" />
                          </div>
                          <p className="text-white font-semibold">{stats[account.id].posts}</p>
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
            <Card className="bg-horror-surface border-horror-border">
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
          <Card className="bg-horror-surface border-horror-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white flex items-center gap-2">
                  <Settings className="w-5 h-5 text-horror-accent" />
                  Content-Generierung
                </CardTitle>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    {getContentStatusDisplay(contentStatus).icon}
                    <span className={`text-sm ${getContentStatusDisplay(contentStatus).color}`}>
                      {getContentStatusDisplay(contentStatus).text}
                    </span>
                  </div>
                  <Button
                    onClick={toggleAutomation}
                    variant={automationConfig.auto_generate ? "destructive" : "default"}
                    className={automationConfig.auto_generate 
                      ? "bg-red-600 hover:bg-red-700" 
                      : "bg-horror-accent hover:bg-horror-accent/80 text-black"
                    }
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
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Account Selection */}
              {accounts.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-white">Account auswählen</Label>
                  <select
                    value={selectedAccount || ""}
                    onChange={(e) => setSelectedAccount(Number(e.target.value))}
                    className="w-full p-2 bg-horror-bg border border-horror-border rounded-md text-white"
                  >
                    <option value="">Account wählen...</option>
                    {accounts.filter(acc => acc.is_connected).map(account => (
                      <option key={account.id} value={account.id}>
                        @{account.username}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Topics */}
              <div className="space-y-2">
                <Label htmlFor="topics" className="text-white">
                  Themenfelder (kommagetrennt)
                </Label>
                <Textarea
                  id="topics"
                  value={automationConfig.topics}
                  onChange={(e) => setAutomationConfig(prev => ({ ...prev, topics: e.target.value }))}
                  placeholder="Fitness, Motivation, Lifestyle, Business..."
                  className="bg-horror-bg border-horror-border text-white"
                  rows={3}
                />
              </div>

              {/* Approval Required */}
              <div className="flex items-center justify-between p-4 bg-horror-bg/50 rounded-lg">
                <div>
                  <Label className="text-white font-medium">
                    Genehmigung erforderlich
                  </Label>
                  <p className="text-sm text-gray-400">
                    Beiträge müssen vor Veröffentlichung bestätigt werden
                  </p>
                </div>
                <Switch
                  checked={automationConfig.require_approval}
                  onCheckedChange={(checked) => 
                    setAutomationConfig(prev => ({ ...prev, require_approval: checked }))
                  }
                  className="data-[state=checked]:bg-horror-accent"
                />
              </div>

              {/* Post Times */}
              <div className="space-y-4">
                <Label className="text-white">Post-Zeiten</Label>
                <div className="flex gap-2">
                  <Input
                    type="time"
                    value={newPostTime}
                    onChange={(e) => setNewPostTime(e.target.value)}
                    className="bg-horror-bg border-horror-border text-white"
                  />
                  <Button onClick={addPostTime} size="sm" className="bg-horror-accent hover:bg-horror-accent/80 text-black">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {automationConfig.post_times.map(time => (
                    <Badge
                      key={time}
                      variant="secondary"
                      className="bg-horror-accent/20 text-horror-accent cursor-pointer"
                      onClick={() => removePostTime(time)}
                    >
                      {time} <XCircle className="w-3 h-3 ml-1" />
                    </Badge>
                  ))}
                </div>
                {automationConfig.post_times.length === 0 && (
                  <p className="text-sm text-gray-400">
                    Keine Zeiten festgelegt - Posts werden zufällig über den Tag verteilt
                  </p>
                )}
              </div>

              {/* Posts per Day */}
              <div className="space-y-2">
                <Label htmlFor="posts_per_day" className="text-white">
                  Beiträge pro Tag
                </Label>
                <Input
                  id="posts_per_day"
                  type="number"
                  min="1"
                  max="10"
                  value={automationConfig.posts_per_day}
                  onChange={(e) => setAutomationConfig(prev => ({ 
                    ...prev, 
                    posts_per_day: parseInt(e.target.value) || 1 
                  }))}
                  className="bg-horror-bg border-horror-border text-white"
                />
              </div>

              <Button
                onClick={saveAutomationConfig}
                className="w-full bg-horror-accent hover:bg-horror-accent/80 text-black"
              >
                Konfiguration speichern
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Content Tab */}
        <TabsContent value="content" className="space-y-6">
          <Card className="bg-horror-surface border-horror-border">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Upload className="w-5 h-5 text-horror-accent" />
                Content-Verwaltung
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400">Content-Verwaltung wird implementiert</p>
                <p className="text-sm text-gray-500 mt-2">
                  Hier können Sie Beiträge verwalten, genehmigen und planen
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Statistics Tab */}
        <TabsContent value="stats" className="space-y-6">
          <Card className="bg-horror-surface border-horror-border">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-horror-accent" />
                Statistiken & Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400">Erweiterte Statistiken werden implementiert</p>
                <p className="text-sm text-gray-500 mt-2">
                  Follower-Wachstum, Engagement-Rate, Reichweite und mehr
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
