import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest, requireAuth } from "@/lib/auth-new";
import database from "@/lib/database";
import instagramService from "@/lib/services/instagram";
import youtubeService from "@/lib/services/youtube";

export async function GET(request: NextRequest) {
  try {
    const user = await authenticateRequest(request);
    requireAuth(user);

    // Get module stats
    const modules = await database.getModulesForUser(user!.id);
    const totalModules = modules.length;
    const activeModules = modules.filter((m) => m.user_active).length;

    // Get activity stats
    const today = new Date().toISOString().split("T")[0];
    const weekAgo = new Date(
      Date.now() - 7 * 24 * 60 * 60 * 1000
    ).toISOString();

    const todayActivities = await database.all(
      `SELECT COUNT(*) as count FROM activity_logs 
       WHERE user_id = ? AND DATE(created_at) = ?`,
      [user!.id, today]
    );

    const weekActivities = await database.all(
      `SELECT COUNT(*) as count, status FROM activity_logs 
       WHERE user_id = ? AND created_at >= ? 
       GROUP BY status`,
      [user!.id, weekAgo]
    );

    const totalWeekActivities = weekActivities.reduce(
      (sum, activity) => sum + activity.count,
      0
    );
    const successfulActivities =
      weekActivities.find((a) => a.status === "success")?.count || 0;
    const successRate =
      totalWeekActivities > 0
        ? (successfulActivities / totalWeekActivities) * 100
        : 0;

    // Get Instagram stats
    const instagramAccounts = await instagramService.getAccountsByUserId(
      user!.id
    );
    const todayInstagramPosts = await database.all(
      `SELECT COUNT(*) as count FROM instagram_posts 
       WHERE user_id = ? AND DATE(created_at) = ?`,
      [user!.id, today]
    );

    const avgEngagement =
      instagramAccounts.length > 0
        ? await Promise.all(
            instagramAccounts.map((acc) =>
              instagramService.getAccountStats(acc.id)
            )
          ).then((stats) => {
            const validStats = stats.filter((s) => s !== null);
            return validStats.length > 0
              ? validStats.reduce((sum, s) => sum + s!.engagement_rate, 0) /
                  validStats.length
              : 0;
          })
        : 0;

    // Get YouTube stats
    const todayYouTubeDownloads = await database.all(
      `SELECT COUNT(*) as count FROM youtube_downloads 
       WHERE user_id = ? AND DATE(created_at) = ?`,
      [user!.id, today]
    );

    const youtubeStorageStats = await youtubeService.getStorageStats(user!.id);

    return NextResponse.json({
      success: true,
      stats: {
        modules: {
          total: totalModules,
          active: activeModules,
        },
        activities: {
          today: todayActivities[0]?.count || 0,
          week: totalWeekActivities,
          success_rate: Math.round(successRate),
        },
        instagram: {
          accounts: instagramAccounts.length,
          posts_today: todayInstagramPosts[0]?.count || 0,
          engagement: Math.round(avgEngagement * 10) / 10,
        },
        youtube: {
          downloads_today: todayYouTubeDownloads[0]?.count || 0,
          total_files: youtubeStorageStats.totalFiles,
          storage_used: youtubeStorageStats.storageUsed,
        },
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Authentication required") {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    console.error("Dashboard stats API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
