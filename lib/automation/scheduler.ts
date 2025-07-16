import cron from "node-cron";
import database from "@/lib/database";
import instagramService from "@/lib/services/instagram";

class AutomationScheduler {
  private static instance: AutomationScheduler;
  private jobs: Map<string, cron.ScheduledTask> = new Map();

  static getInstance(): AutomationScheduler {
    if (!AutomationScheduler.instance) {
      AutomationScheduler.instance = new AutomationScheduler();
    }
    return AutomationScheduler.instance;
  }

  start() {
    console.log("🤖 Starting automation scheduler...");

    // Check for scheduled posts every 15 minutes
    this.scheduleJob(
      "check-scheduled-posts",
      "*/15 * * * *",
      this.checkScheduledPosts
    );

    // Sync Instagram stats daily at 6 AM
    this.scheduleJob(
      "sync-instagram-stats",
      "0 6 * * *",
      this.syncInstagramStats
    );

    // Generate content hourly (for active automations)
    this.scheduleJob(
      "generate-content",
      "0 * * * *",
      this.generateScheduledContent
    );

    // Cleanup old logs daily at 2 AM
    this.scheduleJob("cleanup-logs", "0 2 * * *", this.cleanupOldLogs);

    // Cleanup completed YouTube downloads older than 30 days
    this.scheduleJob(
      "cleanup-downloads",
      "0 3 * * *",
      this.cleanupOldDownloads
    );

    console.log("✅ Automation scheduler started");
  }

  stop() {
    console.log("🛑 Stopping automation scheduler...");
    this.jobs.forEach((job, name) => {
      job.stop();
      console.log(`   Stopped job: ${name}`);
    });
    this.jobs.clear();
    console.log("✅ Automation scheduler stopped");
  }

  private scheduleJob(
    name: string,
    schedule: string,
    task: () => Promise<void>
  ) {
    try {
      const job = cron.schedule(
        schedule,
        async () => {
          console.log(`🔄 Running scheduled job: ${name}`);
          try {
            await task();
            console.log(`✅ Completed job: ${name}`);
          } catch (error) {
            console.error(`❌ Job failed: ${name}`, error);
          }
        },
        {
          scheduled: false,
        }
      );

      this.jobs.set(name, job);
      job.start();
      console.log(`   Scheduled job: ${name} (${schedule})`);
    } catch (error) {
      console.error(`Failed to schedule job ${name}:`, error);
    }
  }

  private async checkScheduledPosts(): Promise<void> {
    try {
      const now = new Date().toISOString();

      // Get approved posts that are scheduled for now or earlier
      const postsToPost = await database.all(
        `SELECT ip.*, ia.access_token, ia.username 
         FROM instagram_posts ip
         JOIN instagram_accounts ia ON ip.account_id = ia.id
         WHERE ip.status = 'approved' 
         AND ip.scheduled_at IS NOT NULL 
         AND ip.scheduled_at <= ?`,
        [now]
      );

      for (const post of postsToPost) {
        try {
          // In a real implementation, this would post to Instagram
          console.log(
            `📱 Posting to Instagram: ${post.title} (@${post.username})`
          );

          // Update post status
          await database.run(
            "UPDATE instagram_posts SET status = ?, posted_at = CURRENT_TIMESTAMP WHERE id = ?",
            ["posted", post.id]
          );

          // Log activity
          await database.logActivity(
            post.user_id,
            "instagram",
            "post_published",
            "success",
            `Scheduled post published: ${post.content.substring(0, 50)}...`,
            { post_id: post.id }
          );
        } catch (error) {
          console.error(`Failed to post ${post.id}:`, error);

          // Update post status to failed
          await database.run(
            "UPDATE instagram_posts SET status = ?, error_message = ? WHERE id = ?",
            [
              "failed",
              error instanceof Error ? error.message : "Unknown error",
              post.id,
            ]
          );

          // Log error
          await database.logActivity(
            post.user_id,
            "instagram",
            "post_failed",
            "error",
            `Failed to publish scheduled post: ${
              error instanceof Error ? error.message : "Unknown error"
            }`,
            { post_id: post.id }
          );
        }
      }

      if (postsToPost.length > 0) {
        console.log(`📊 Processed ${postsToPost.length} scheduled posts`);
      }
    } catch (error) {
      console.error("Error checking scheduled posts:", error);
    }
  }

  private async syncInstagramStats(): Promise<void> {
    try {
      console.log("📈 Syncing Instagram statistics...");

      // Get all connected Instagram accounts
      const accounts = await database.all(
        "SELECT * FROM instagram_accounts WHERE is_connected = true"
      );

      for (const account of accounts) {
        try {
          const stats = await instagramService.getAccountStats(account.id);

          if (stats) {
            // Update account stats
            await database.run(
              `UPDATE instagram_accounts 
               SET followers_count = ?, following_count = ?, posts_count = ?, last_sync = CURRENT_TIMESTAMP 
               WHERE id = ?`,
              [stats.followers, stats.following, stats.posts, account.id]
            );

            // Log activity
            await database.logActivity(
              account.user_id,
              "instagram",
              "stats_synced",
              "success",
              `Stats updated for @${account.username}`,
              { account_id: account.id, stats }
            );
          }
        } catch (error) {
          console.error(
            `Failed to sync stats for account ${account.id}:`,
            error
          );
        }
      }

      console.log(`📊 Synced stats for ${accounts.length} Instagram accounts`);
    } catch (error) {
      console.error("Error syncing Instagram stats:", error);
    }
  }

  private async generateScheduledContent(): Promise<void> {
    try {
      // Get active automations with auto-generation enabled
      const automations = await database.all(
        `SELECT ia.*, iac.username 
         FROM instagram_automation ia
         JOIN instagram_accounts iac ON ia.account_id = iac.id
         WHERE ia.is_active = true 
         AND ia.auto_generate_content = true`
      );

      const currentHour =
        new Date().getHours().toString().padStart(2, "0") + ":00";

      for (const automation of automations) {
        try {
          // Check if this is a scheduled time for content generation
          const postTimes = JSON.parse(automation.post_times || "[]");

          if (postTimes.includes(currentHour)) {
            // Generate content
            const result = await instagramService.generateContent(
              automation.user_id,
              automation.account_id,
              automation.topics,
              automation.custom_prompt
            );

            if (result.success) {
              console.log(`✨ Generated content for @${automation.username}`);
            }
          }
        } catch (error) {
          console.error(
            `Failed to generate content for automation ${automation.id}:`,
            error
          );
        }
      }
    } catch (error) {
      console.error("Error generating scheduled content:", error);
    }
  }

  private async cleanupOldLogs(): Promise<void> {
    try {
      console.log("🧹 Cleaning up old activity logs...");

      // Delete logs older than 30 days
      const thirtyDaysAgo = new Date(
        Date.now() - 30 * 24 * 60 * 60 * 1000
      ).toISOString();

      const result = await database.run(
        "DELETE FROM activity_logs WHERE created_at < ?",
        [thirtyDaysAgo]
      );

      console.log(`🗑️ Deleted ${result.changes} old activity logs`);
    } catch (error) {
      console.error("Error cleaning up old logs:", error);
    }
  }

  private async cleanupOldDownloads(): Promise<void> {
    try {
      console.log("🧹 Cleaning up old YouTube downloads...");

      // Delete completed downloads older than 30 days
      const thirtyDaysAgo = new Date(
        Date.now() - 30 * 24 * 60 * 60 * 1000
      ).toISOString();

      const oldDownloads = await database.all(
        "SELECT * FROM youtube_downloads WHERE status = ? AND completed_at < ?",
        ["completed", thirtyDaysAgo]
      );

      for (const download of oldDownloads) {
        try {
          // Delete file if exists
          if (
            download.file_path &&
            require("fs").existsSync(download.file_path)
          ) {
            require("fs").unlinkSync(download.file_path);
          }

          // Delete from database
          await database.run("DELETE FROM youtube_downloads WHERE id = ?", [
            download.id,
          ]);
        } catch (error) {
          console.error(`Failed to cleanup download ${download.id}:`, error);
        }
      }

      console.log(`🗑️ Cleaned up ${oldDownloads.length} old downloads`);
    } catch (error) {
      console.error("Error cleaning up old downloads:", error);
    }
  }
}

export default AutomationScheduler.getInstance();
