"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  Users,
  Heart,
  MessageSquare,
  Eye,
  Share,
  Bookmark,
  MousePointer,
  Clock,
  MapPin,
  Hash,
  Target,
  BarChart3,
  PieChart,
  Activity,
  Calendar,
  Filter,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface InstagramMetrics {
  followers_growth: { current: number; change: number; percentage: number };
  engagement_rate: { current: number; average: number };
  impressions: { total: number; reach: number };
  saves: number;
  shares: number;
  profile_views: number;
  website_clicks: number;
  story_views: number;
  avg_watch_time: number;
  top_posts: Array<{
    id: string;
    thumbnail: string;
    likes: number;
    comments: number;
    engagement_rate: number;
  }>;
  posting_frequency: { current: number; optimal: number };
  best_posting_times: string[];
  hashtag_performance: Array<{
    hashtag: string;
    usage_count: number;
    avg_engagement: number;
    trend: "up" | "down" | "stable";
  }>;
  audience_demographics: {
    age_groups: Array<{ range: string; percentage: number }>;
    locations: Array<{ country: string; percentage: number }>;
    gender: { male: number; female: number; other: number };
  };
  audience_activity: Array<{ hour: number; activity_level: number }>;
  click_through_rate: number;
}

interface AccountStats {
  account_id: number;
  username: string;
  metrics: InstagramMetrics;
  last_updated: string;
}

export default function InstagramStatsPage() {
  const [accounts, setAccounts] = useState<AccountStats[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string>("");
  const [selectedTimeframe, setSelectedTimeframe] = useState("30d");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAccountStats();
  }, [selectedTimeframe]);

  const loadAccountStats = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/instagram/analytics?timeframe=${selectedTimeframe}`);
      if (response.ok) {
        const data = await response.json();
        setAccounts(data.accounts || []);
        if (data.accounts?.length > 0 && !selectedAccount) {
          setSelectedAccount(data.accounts[0].account_id.toString());
        }
      }
    } catch (error) {
      console.error("Error loading stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const currentAccountStats = accounts.find(
    acc => acc.account_id.toString() === selectedAccount
  );

  const getEngagementColor = (rate: number) => {
    if (rate >= 4) return "text-green-400";
    if (rate >= 2) return "text-yellow-400";
    return "text-red-400";
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up": return <TrendingUp className="w-4 h-4 text-green-400" />;
      case "down": return <TrendingUp className="w-4 h-4 text-red-400 rotate-180" />;
      default: return <Activity className="w-4 h-4 text-gray-400" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-white">Lade Statistiken...</div>
      </div>
    );
  }

  if (accounts.length === 0) {
    return (
      <Card className="bg-horror-surface border-horror-border">
        <CardContent className="text-center py-12">
          <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-400">Keine Instagram-Accounts für Statistiken verfügbar</p>
          <p className="text-sm text-gray-500 mt-2">
            Verbinden Sie zuerst einen Instagram-Account
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-bold text-white mb-2 glitch-text" data-text="STATISTIKEN">
          STATISTIKEN
        </h1>
        <p className="text-gray-400 text-lg">
          Instagram Analytics & Performance-Metriken
        </p>
      </motion.div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <Select value={selectedAccount} onValueChange={setSelectedAccount}>
            <SelectTrigger className="bg-horror-surface border-horror-border text-white">
              <SelectValue placeholder="Account auswählen" />
            </SelectTrigger>
            <SelectContent>
              {accounts.map(account => (
                <SelectItem key={account.account_id} value={account.account_id.toString()}>
                  @{account.username}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1">
          <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
            <SelectTrigger className="bg-horror-surface border-horror-border text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Letzte 7 Tage</SelectItem>
              <SelectItem value="30d">Letzte 30 Tage</SelectItem>
              <SelectItem value="90d">Letzte 90 Tage</SelectItem>
              <SelectItem value="1y">Letztes Jahr</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {currentAccountStats && (
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-horror-surface border-horror-border">
            <TabsTrigger value="overview" className="data-[state=active]:bg-horror-accent data-[state=active]:text-black">
              <BarChart3 className="w-4 h-4 mr-2" />
              Übersicht
            </TabsTrigger>
            <TabsTrigger value="engagement" className="data-[state=active]:bg-horror-accent data-[state=active]:text-black">
              <Heart className="w-4 h-4 mr-2" />
              Engagement
            </TabsTrigger>
            <TabsTrigger value="audience" className="data-[state=active]:bg-horror-accent data-[state=active]:text-black">
              <Users className="w-4 h-4 mr-2" />
              Zielgruppe
            </TabsTrigger>
            <TabsTrigger value="content" className="data-[state=active]:bg-horror-accent data-[state=active]:text-black">
              <Hash className="w-4 h-4 mr-2" />
              Content
            </TabsTrigger>
            <TabsTrigger value="timing" className="data-[state=active]:bg-horror-accent data-[state=active]:text-black">
              <Clock className="w-4 h-4 mr-2" />
              Timing
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-horror-surface border-horror-border">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Follower</p>
                      <p className="text-2xl font-bold text-white">
                        {currentAccountStats.metrics.followers_growth.current.toLocaleString()}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        <TrendingUp className="w-3 h-3 text-green-400" />
                        <span className="text-xs text-green-400">
                          +{currentAccountStats.metrics.followers_growth.percentage}%
                        </span>
                      </div>
                    </div>
                    <Users className="w-8 h-8 text-blue-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-horror-surface border-horror-border">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Engagement Rate</p>
                      <p className={`text-2xl font-bold ${getEngagementColor(currentAccountStats.metrics.engagement_rate.current)}`}>
                        {currentAccountStats.metrics.engagement_rate.current.toFixed(1)}%
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Ø {currentAccountStats.metrics.engagement_rate.average.toFixed(1)}%
                      </p>
                    </div>
                    <Heart className="w-8 h-8 text-red-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-horror-surface border-horror-border">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Impressionen</p>
                      <p className="text-2xl font-bold text-white">
                        {currentAccountStats.metrics.impressions.total.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Reichweite: {currentAccountStats.metrics.impressions.reach.toLocaleString()}
                      </p>
                    </div>
                    <Eye className="w-8 h-8 text-purple-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-horror-surface border-horror-border">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Profilaufrufe</p>
                      <p className="text-2xl font-bold text-white">
                        {currentAccountStats.metrics.profile_views.toLocaleString()}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        <MousePointer className="w-3 h-3 text-horror-accent" />
                        <span className="text-xs text-horror-accent">
                          CTR: {currentAccountStats.metrics.click_through_rate.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    <Target className="w-8 h-8 text-horror-accent" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Additional Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-horror-surface border-horror-border">
                <CardContent className="p-4 text-center">
                  <Bookmark className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">Gespeicherte Beiträge</p>
                  <p className="text-xl font-bold text-white">{currentAccountStats.metrics.saves}</p>
                </CardContent>
              </Card>

              <Card className="bg-horror-surface border-horror-border">
                <CardContent className="p-4 text-center">
                  <Share className="w-6 h-6 text-green-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">Geteilte Beiträge</p>
                  <p className="text-xl font-bold text-white">{currentAccountStats.metrics.shares}</p>
                </CardContent>
              </Card>

              <Card className="bg-horror-surface border-horror-border">
                <CardContent className="p-4 text-center">
                  <Eye className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">Story-Aufrufe</p>
                  <p className="text-xl font-bold text-white">{currentAccountStats.metrics.story_views}</p>
                </CardContent>
              </Card>

              <Card className="bg-horror-surface border-horror-border">
                <CardContent className="p-4 text-center">
                  <MousePointer className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">Website-Klicks</p>
                  <p className="text-xl font-bold text-white">{currentAccountStats.metrics.website_clicks}</p>
                </CardContent>
              </Card>
            </div>

            {/* Top Posts */}
            <Card className="bg-horror-surface border-horror-border">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-horror-accent" />
                  Top-Beiträge
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {currentAccountStats.metrics.top_posts.map((post, index) => (
                    <div key={post.id} className="bg-horror-bg/50 rounded-lg p-4">
                      <div className="aspect-square bg-gray-700 rounded-lg mb-3 flex items-center justify-center">
                        <span className="text-gray-400">#{index + 1}</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Likes:</span>
                          <span className="text-white">{post.likes.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Kommentare:</span>
                          <span className="text-white">{post.comments}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Engagement:</span>
                          <span className={getEngagementColor(post.engagement_rate)}>
                            {post.engagement_rate.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Engagement Tab */}
          <TabsContent value="engagement" className="space-y-6">
            <Card className="bg-horror-surface border-horror-border">
              <CardHeader>
                <CardTitle className="text-white">Engagement-Analyse</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400">Detaillierte Engagement-Analyse wird implementiert</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Likes, Kommentare, Shares, Saves Analyse
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Audience Tab */}
          <TabsContent value="audience" className="space-y-6">
            {/* Demographics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-horror-surface border-horror-border">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-horror-accent" />
                    Altersgruppen
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {currentAccountStats.metrics.audience_demographics.age_groups.map(group => (
                    <div key={group.range} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">{group.range}</span>
                        <span className="text-white">{group.percentage}%</span>
                      </div>
                      <Progress value={group.percentage} className="h-2" />
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="bg-horror-surface border-horror-border">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-horror-accent" />
                    Standorte
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {currentAccountStats.metrics.audience_demographics.locations.map(location => (
                    <div key={location.country} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">{location.country}</span>
                        <span className="text-white">{location.percentage}%</span>
                      </div>
                      <Progress value={location.percentage} className="h-2" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Activity Times */}
            <Card className="bg-horror-surface border-horror-border">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-horror-accent" />
                  Aktivitätszeiten der Zielgruppe
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-12 gap-1">
                  {currentAccountStats.metrics.audience_activity.map(item => (
                    <div key={item.hour} className="text-center">
                      <div 
                        className="bg-horror-accent/20 rounded mb-1"
                        style={{ height: `${item.activity_level}px` }}
                      />
                      <span className="text-xs text-gray-400">{item.hour}h</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Content Tab */}
          <TabsContent value="content" className="space-y-6">
            <Card className="bg-horror-surface border-horror-border">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Hash className="w-5 h-5 text-horror-accent" />
                  Hashtag-Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {currentAccountStats.metrics.hashtag_performance.map(hashtag => (
                    <div key={hashtag.hashtag} className="flex items-center justify-between p-3 bg-horror-bg/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        {getTrendIcon(hashtag.trend)}
                        <span className="text-white">#{hashtag.hashtag}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-gray-400">
                          {hashtag.usage_count}x verwendet
                        </span>
                        <span className={getEngagementColor(hashtag.avg_engagement)}>
                          {hashtag.avg_engagement.toFixed(1)}% Engagement
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Timing Tab */}
          <TabsContent value="timing" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-horror-surface border-horror-border">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-horror-accent" />
                    Posting-Frequenz
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Aktuell:</span>
                      <span className="text-white">{currentAccountStats.metrics.posting_frequency.current} Posts/Woche</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Optimal:</span>
                      <span className="text-horror-accent">{currentAccountStats.metrics.posting_frequency.optimal} Posts/Woche</span>
                    </div>
                    <Progress 
                      value={(currentAccountStats.metrics.posting_frequency.current / currentAccountStats.metrics.posting_frequency.optimal) * 100} 
                      className="h-2" 
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-horror-surface border-horror-border">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Clock className="w-5 h-5 text-horror-accent" />
                    Beste Post-Zeiten
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {currentAccountStats.metrics.best_posting_times.map((time, index) => (
                      <Badge key={index} variant="secondary" className="bg-horror-accent/20 text-horror-accent mr-2 mb-2">
                        {time}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-sm text-gray-400 mt-4">
                    Basierend auf höchstem Engagement der letzten {selectedTimeframe}
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
