import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth-new";
import database from "@/lib/database";

// Mock-Daten für Demo-Zwecke
const generateMockAnalytics = (accountId: number, timeframe: string) => {
  const baseMetrics = {
    followers_growth: { 
      current: 12500 + Math.floor(Math.random() * 5000),
      change: Math.floor(Math.random() * 200) + 50,
      percentage: Math.floor(Math.random() * 10) + 2
    },
    engagement_rate: { 
      current: Math.random() * 6 + 1,
      average: Math.random() * 4 + 2
    },
    impressions: { 
      total: Math.floor(Math.random() * 50000) + 10000,
      reach: Math.floor(Math.random() * 30000) + 8000
    },
    saves: Math.floor(Math.random() * 500) + 100,
    shares: Math.floor(Math.random() * 300) + 50,
    profile_views: Math.floor(Math.random() * 2000) + 500,
    website_clicks: Math.floor(Math.random() * 150) + 20,
    story_views: Math.floor(Math.random() * 3000) + 800,
    avg_watch_time: Math.floor(Math.random() * 30) + 10,
    click_through_rate: Math.random() * 5 + 1,
    top_posts: [
      {
        id: "post1",
        thumbnail: "/placeholder.jpg",
        likes: Math.floor(Math.random() * 1000) + 200,
        comments: Math.floor(Math.random() * 50) + 10,
        engagement_rate: Math.random() * 8 + 2
      },
      {
        id: "post2", 
        thumbnail: "/placeholder.jpg",
        likes: Math.floor(Math.random() * 800) + 150,
        comments: Math.floor(Math.random() * 40) + 8,
        engagement_rate: Math.random() * 7 + 1.5
      },
      {
        id: "post3",
        thumbnail: "/placeholder.jpg", 
        likes: Math.floor(Math.random() * 600) + 100,
        comments: Math.floor(Math.random() * 30) + 5,
        engagement_rate: Math.random() * 6 + 1
      }
    ],
    posting_frequency: {
      current: Math.floor(Math.random() * 7) + 3,
      optimal: Math.floor(Math.random() * 5) + 7
    },
    best_posting_times: [
      "9:00 - 10:00",
      "12:00 - 13:00", 
      "18:00 - 20:00",
      "21:00 - 22:00"
    ],
    hashtag_performance: [
      {
        hashtag: "motivation",
        usage_count: 15,
        avg_engagement: Math.random() * 6 + 2,
        trend: "up" as const
      },
      {
        hashtag: "lifestyle",
        usage_count: 12,
        avg_engagement: Math.random() * 5 + 1.5,
        trend: "stable" as const
      },
      {
        hashtag: "inspiration",
        usage_count: 8,
        avg_engagement: Math.random() * 4 + 1,
        trend: "down" as const
      },
      {
        hashtag: "success",
        usage_count: 10,
        avg_engagement: Math.random() * 7 + 2.5,
        trend: "up" as const
      },
      {
        hashtag: "entrepreneur",
        usage_count: 6,
        avg_engagement: Math.random() * 3 + 1,
        trend: "stable" as const
      }
    ],
    audience_demographics: {
      age_groups: [
        { range: "18-24", percentage: Math.floor(Math.random() * 20) + 15 },
        { range: "25-34", percentage: Math.floor(Math.random() * 25) + 25 },
        { range: "35-44", percentage: Math.floor(Math.random() * 20) + 20 },
        { range: "45-54", percentage: Math.floor(Math.random() * 15) + 10 },
        { range: "55+", percentage: Math.floor(Math.random() * 10) + 5 }
      ],
      locations: [
        { country: "Deutschland", percentage: Math.floor(Math.random() * 30) + 40 },
        { country: "Österreich", percentage: Math.floor(Math.random() * 15) + 20 },
        { country: "Schweiz", percentage: Math.floor(Math.random() * 10) + 15 },
        { country: "USA", percentage: Math.floor(Math.random() * 8) + 7 },
        { country: "Andere", percentage: Math.floor(Math.random() * 10) + 5 }
      ],
      gender: {
        male: Math.floor(Math.random() * 20) + 40,
        female: Math.floor(Math.random() * 20) + 45,
        other: Math.floor(Math.random() * 5) + 2
      }
    },
    audience_activity: Array.from({ length: 24 }, (_, hour) => ({
      hour,
      activity_level: Math.floor(Math.random() * 50) + 10
    }))
  };

  return baseMetrics;
};

export async function GET(request: NextRequest) {
  try {
    const user = await authenticateRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get("timeframe") || "30d";
    const accountId = searchParams.get("account_id");

    // Hole alle Instagram-Accounts des Benutzers
    const accounts = await database.all(`
      SELECT id, username, status 
      FROM instagram_accounts 
      WHERE user_id = ? AND status = 'connected'
    `, [user.id]);

    // Wenn spezifischer Account angefragt
    if (accountId) {
      const account = accounts.find((acc: any) => acc.id.toString() === accountId);
      if (!account) {
        return NextResponse.json({ error: "Account not found" }, { status: 404 });
      }

      const metrics = generateMockAnalytics(account.id, timeframe);
      
      return NextResponse.json({
        account_id: account.id,
        username: account.username,
        metrics,
        last_updated: new Date().toISOString(),
        timeframe
      });
    }

    // Alle Accounts mit Analytics
    const accountsWithMetrics = accounts.map((account: any) => ({
      account_id: account.id,
      username: account.username,
      metrics: generateMockAnalytics(account.id, timeframe),
      last_updated: new Date().toISOString()
    }));

    // Aktivität loggen
    await database.run(`
      INSERT INTO user_activities (user_id, activity_type, description, timestamp)
      VALUES (?, ?, ?, ?)
    `, [
      user.id,
      "analytics_view",
      `Viewed Instagram analytics for timeframe: ${timeframe}`,
      new Date().toISOString()
    ]);

    return NextResponse.json({
      accounts: accountsWithMetrics,
      timeframe,
      generated_at: new Date().toISOString()
    });

  } catch (error) {
    console.error("Error fetching Instagram analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await authenticateRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { account_id, refresh_data } = body;

    // Verify account ownership
    const account = await database.all(`
      SELECT id, username 
      FROM instagram_accounts 
      WHERE id = ? AND user_id = ? AND status = 'connected'
    `, [account_id, user.id]);

    if (account.length === 0) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    // In einer echten Implementierung würde hier die Instagram API aufgerufen werden
    // Für Demo-Zwecke generieren wir neue Mock-Daten
    if (refresh_data) {
      const metrics = generateMockAnalytics(account_id, "30d");
      
      // Aktivität loggen
      await database.run(`
        INSERT INTO user_activities (user_id, activity_type, description, timestamp)
        VALUES (?, ?, ?, ?)
      `, [
        user.id,
        "analytics_refresh",
        `Refreshed analytics for Instagram account: ${account[0].username}`,
        new Date().toISOString()
      ]);

      return NextResponse.json({
        account_id,
        username: account[0].username,
        metrics,
        last_updated: new Date().toISOString(),
        refreshed: true
      });
    }

    return NextResponse.json({ error: "No action specified" }, { status: 400 });

  } catch (error) {
    console.error("Error updating Instagram analytics:", error);
    return NextResponse.json(
      { error: "Failed to update analytics" },
      { status: 500 }
    );
  }
}
