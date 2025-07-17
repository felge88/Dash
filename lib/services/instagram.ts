import database from "@/lib/database";

export interface InstagramAccount {
  id: number;
  user_id: number;
  username: string;
  access_token?: string;
  refresh_token?: string;
  account_id?: string;
  is_connected: boolean;
  followers_count: number;
  following_count: number;
  posts_count: number;
  last_sync?: string;
}

export interface InstagramStats {
  followers: number;
  following: number;
  posts: number;
  engagement_rate: number;
  recent_activity: any[];
}

export interface AutomationConfig {
  account_id: number;
  auto_generate: boolean;
  require_approval: boolean;
  topics: string;
  post_times: string[];
  custom_prompt?: string;
}

export interface InstagramPost {
  id: number;
  content: string;
  image_url?: string;
  hashtags?: string;
  status: "pending" | "approved" | "rejected" | "posted" | "failed";
  scheduled_at?: string;
  posted_at?: string;
  engagement_data?: any;
}

export class InstagramService {
  private static instance: InstagramService;
  private baseURL = "https://graph.instagram.com";

  static getInstance(): InstagramService {
    if (!InstagramService.instance) {
      InstagramService.instance = new InstagramService();
    }
    return InstagramService.instance;
  }

  async connectAccount(
    userId: number,
    username: string
  ): Promise<{ success: boolean; message?: string }> {
    try {
      // In a real implementation, this would handle OAuth flow
      // For now, we'll create a mock connection

      const existingAccount = await database.get(
        "SELECT * FROM instagram_accounts WHERE user_id = ? AND username = ?",
        [userId, username]
      );

      if (existingAccount) {
        return { success: false, message: "Account already connected" };
      }

      await database.run(
        `INSERT INTO instagram_accounts (user_id, username, is_connected, followers_count, following_count, posts_count) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [userId, username, true, 1000, 500, 25] // Mock data
      );

      await database.logActivity(
        userId,
        "instagram",
        "account_connected",
        "success",
        `Instagram account @${username} connected`
      );

      return { success: true };
    } catch (error) {
      console.error("Instagram connect error:", error);
      return { success: false, message: "Failed to connect account" };
    }
  }

  async getAccountsByUserId(userId: number): Promise<InstagramAccount[]> {
    try {
      const accounts = await database.all(
        "SELECT * FROM instagram_accounts WHERE user_id = ? ORDER BY created_at DESC",
        [userId]
      );
      return accounts;
    } catch (error) {
      console.error("Get Instagram accounts error:", error);
      return [];
    }
  }

  async getAccountStats(accountId: number): Promise<InstagramStats | null> {
    try {
      const account = await database.get(
        "SELECT * FROM instagram_accounts WHERE id = ?",
        [accountId]
      );

      if (!account) return null;

      // In a real implementation, this would call Instagram API
      // For now, return mock data with some randomization
      const baseFollowers = account.followers_count || 1000;
      const variance = Math.floor(Math.random() * 20) - 10; // ±10 variance

      return {
        followers: baseFollowers + variance,
        following: account.following_count || 500,
        posts: account.posts_count || 25,
        engagement_rate: 3.5 + Math.random() * 2, // 3.5-5.5%
        recent_activity: [
          {
            type: "new_follower",
            count: 5,
            timestamp: new Date().toISOString(),
          },
          { type: "likes", count: 23, timestamp: new Date().toISOString() },
          { type: "comments", count: 7, timestamp: new Date().toISOString() },
        ],
      };
    } catch (error) {
      console.error("Get Instagram stats error:", error);
      return null;
    }
  }

  async configureAutomation(
    userId: number,
    config: AutomationConfig
  ): Promise<{ success: boolean; message?: string }> {
    try {
      // Check if automation already exists
      const existing = await database.get(
        "SELECT * FROM instagram_automation WHERE user_id = ? AND account_id = ?",
        [userId, config.account_id]
      );

      if (existing) {
        // Update existing configuration
        await database.run(
          `UPDATE instagram_automation 
           SET auto_generate_content = ?, require_approval = ?, topics = ?, post_times = ?, custom_prompt = ?, is_active = ?
           WHERE user_id = ? AND account_id = ?`,
          [
            config.auto_generate,
            config.require_approval,
            config.topics,
            JSON.stringify(config.post_times),
            config.custom_prompt || null,
            true,
            userId,
            config.account_id,
          ]
        );
      } else {
        // Create new configuration
        await database.run(
          `INSERT INTO instagram_automation (user_id, account_id, auto_generate_content, require_approval, topics, post_times, custom_prompt, is_active) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            userId,
            config.account_id,
            config.auto_generate,
            config.require_approval,
            config.topics,
            JSON.stringify(config.post_times),
            config.custom_prompt || null,
            true,
          ]
        );
      }

      await database.logActivity(
        userId,
        "instagram",
        "automation_configured",
        "success",
        "Instagram automation configured",
        { account_id: config.account_id, config }
      );

      return { success: true };
    } catch (error) {
      console.error("Configure automation error:", error);
      return { success: false, message: "Failed to configure automation" };
    }
  }

  async generateContent(
    userId: number,
    accountId: number,
    topic?: string,
    customPrompt?: string
  ): Promise<{ success: boolean; content?: any; message?: string }> {
    try {
      // Get account info
      const account = await database.get(
        "SELECT * FROM instagram_accounts WHERE id = ? AND user_id = ?",
        [accountId, userId]
      );

      if (!account) {
        return { success: false, message: "Account not found" };
      }

      // Get automation config
      const automation = await database.get(
        "SELECT * FROM instagram_automation WHERE account_id = ? AND user_id = ?",
        [accountId, userId]
      );

      if (!automation) {
        return { success: false, message: "Automation not configured" };
      }

      // Generate content using OpenAI (mock for now)
      const generatedContent = this.mockContentGeneration(
        topic || automation.topics,
        customPrompt || automation.custom_prompt
      );

      // Save generated post
      const result = await database.run(
        `INSERT INTO instagram_posts (user_id, account_id, automation_id, content, hashtags, status) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          userId,
          accountId,
          automation.id,
          generatedContent.content,
          generatedContent.hashtags,
          automation.require_approval ? "pending" : "approved",
        ]
      );

      await database.logActivity(
        userId,
        "instagram",
        "content_generated",
        "success",
        "Instagram content generated",
        { account_id: accountId, post_id: result.lastID }
      );

      return {
        success: true,
        content: {
          id: result.lastID,
          content: generatedContent.content,
          hashtags: generatedContent.hashtags,
          status: automation.require_approval ? "pending" : "approved",
        },
      };
    } catch (error) {
      console.error("Generate content error:", error);
      return { success: false, message: "Failed to generate content" };
    }
  }

  async getPendingPosts(userId: number): Promise<InstagramPost[]> {
    try {
      const posts = await database.all(
        `SELECT ip.*, ia.username as account_username 
         FROM instagram_posts ip
         JOIN instagram_accounts ia ON ip.account_id = ia.id
         WHERE ip.user_id = ? AND ip.status = 'pending'
         ORDER BY ip.created_at DESC`,
        [userId]
      );
      return posts;
    } catch (error) {
      console.error("Get pending posts error:", error);
      return [];
    }
  }

  async approvePost(
    userId: number,
    postId: number
  ): Promise<{ success: boolean; message?: string }> {
    try {
      const result = await database.run(
        "UPDATE instagram_posts SET status = ? WHERE id = ? AND user_id = ?",
        ["approved", postId, userId]
      );

      if (result.changes === 0) {
        return { success: false, message: "Post not found" };
      }

      await database.logActivity(
        userId,
        "instagram",
        "post_approved",
        "success",
        `Instagram post ${postId} approved`,
        { post_id: postId }
      );

      return { success: true };
    } catch (error) {
      console.error("Approve post error:", error);
      return { success: false, message: "Failed to approve post" };
    }
  }

  async rejectPost(
    userId: number,
    postId: number
  ): Promise<{ success: boolean; message?: string }> {
    try {
      const result = await database.run(
        "UPDATE instagram_posts SET status = ? WHERE id = ? AND user_id = ?",
        ["rejected", postId, userId]
      );

      if (result.changes === 0) {
        return { success: false, message: "Post not found" };
      }

      await database.logActivity(
        userId,
        "instagram",
        "post_rejected",
        "success",
        `Instagram post ${postId} rejected`,
        { post_id: postId }
      );

      return { success: true };
    } catch (error) {
      console.error("Reject post error:", error);
      return { success: false, message: "Failed to reject post" };
    }
  }

  private mockContentGeneration(
    topic: string,
    customPrompt?: string
  ): { content: string; hashtags: string } {
    const topics = topic.split(",").map((t) => t.trim());
    const selectedTopic = topics[Math.floor(Math.random() * topics.length)];

    const contentTemplates = [
      `🌟 Exciting update about ${selectedTopic}! Here's what's new and why it matters to our community.`,
      `💡 Insight on ${selectedTopic}: This trend is reshaping how we think about innovation.`,
      `🔥 Breaking: ${selectedTopic} just got more interesting! Here's our take on what this means.`,
      `✨ Today's focus: ${selectedTopic}. Let's dive into why this is a game-changer.`,
    ];

    const hashtagPool = [
      "#innovation",
      "#technology",
      "#growth",
      "#community",
      "#inspiration",
      "#trending",
      "#insightful",
      "#motivation",
      "#success",
      "#future",
      "#digital",
      "#creative",
      "#authentic",
      "#engaging",
      "#viral",
    ];

    const content =
      contentTemplates[Math.floor(Math.random() * contentTemplates.length)];
    const selectedHashtags = hashtagPool
      .sort(() => 0.5 - Math.random())
      .slice(0, 5)
      .join(" ");

    return {
      content: customPrompt ? `${customPrompt}\n\n${content}` : content,
      hashtags: selectedHashtags,
    };
  }

  async getAutomationConfig(userId: number): Promise<AutomationConfig | null> {
    try {
      const config = await database.get(
        "SELECT * FROM instagram_automation WHERE user_id = ? ORDER BY created_at DESC LIMIT 1",
        [userId]
      );

      if (!config) return null;

      return {
        account_id: config.account_id,
        auto_generate: config.auto_generate_content,
        require_approval: config.require_approval,
        topics: config.topics,
        post_times: JSON.parse(config.post_times || "[]"),
        custom_prompt: config.custom_prompt,
      };
    } catch (error) {
      console.error("Get automation config error:", error);
      return null;
    }
  }
}

export default InstagramService.getInstance();
