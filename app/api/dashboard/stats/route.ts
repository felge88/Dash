import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth-new";
import database from "@/lib/database";

export async function GET(request: NextRequest) {
  try {
    const user = await authenticateRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // User stats
    const userModules = await database.all(`
      SELECT m.*, um.is_active as user_active
      FROM modules m
      LEFT JOIN user_modules um ON m.id = um.module_id AND um.user_id = ?
      ORDER BY m.name
    `, [user.id]);

    const activeModules = userModules.filter(m => m.user_active).length;
    const totalModules = userModules.length;

    // Instagram stats
    const instagramAccounts = await database.all(`
      SELECT id, username, status 
      FROM instagram_accounts 
      WHERE user_id = ? AND status = 'connected'
    `, [user.id]);

    // Mock Instagram metrics
    const totalFollowers = Math.floor(Math.random() * 50000) + 10000;
    const totalPosts = Math.floor(Math.random() * 200) + 50;
    const avgEngagement = Math.random() * 6 + 2;

    // Recent activities
    const recentActivities = await database.all(`
      SELECT activity_type, description, timestamp
      FROM user_activities 
      WHERE user_id = ? 
      ORDER BY timestamp DESC 
      LIMIT 10
    `, [user.id]);

    // Format activities with status
    const formattedActivities = recentActivities.map((activity: any, index: number) => ({
      id: index + 1,
      activity_type: activity.activity_type,
      description: activity.description,
      timestamp: activity.timestamp,
      status: activity.activity_type.includes("error") ? "error" : 
               activity.activity_type.includes("success") || activity.activity_type.includes("approved") ? "success" : "info"
    }));

    // System status (mock data)
    const systemStatus = {
      api_health: "healthy" as const,
      automation_queue: Math.floor(Math.random() * 10) + 1,
      last_backup: new Date(Date.now() - Math.random() * 86400000).toISOString(),
      uptime: "99.9%"
    };

    // Log dashboard view
    await database.run(`
      INSERT INTO user_activities (user_id, activity_type, description, timestamp)
      VALUES (?, ?, ?, ?)
    `, [
      user.id,
      "dashboard_view",
      "Viewed dashboard statistics",
      new Date().toISOString()
    ]);

    const stats = {
      user_stats: {
        total_modules: totalModules,
        active_modules: activeModules,
        last_activity: recentActivities[0]?.timestamp || new Date().toISOString(),
        is_admin: user.is_admin
      },
      instagram_stats: {
        connected_accounts: instagramAccounts.length,
        total_followers: totalFollowers,
        total_posts: totalPosts,
        avg_engagement: avgEngagement,
        pending_approvals: Math.floor(Math.random() * 5),
        active_automations: Math.floor(Math.random() * 3) + 1
      },
      recent_activities: formattedActivities,
      system_status: systemStatus
    };

    return NextResponse.json(stats);

  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard statistics" },
      { status: 500 }
    );
  }
}
