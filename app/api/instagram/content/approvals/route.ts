import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth-new";
import database from "@/lib/database";

interface ContentApproval {
  id: number;
  account_id: number;
  content_type: "post" | "story" | "reel";
  content_text: string;
  hashtags: string[];
  image_url?: string;
  video_url?: string;
  scheduled_time?: string;
  status: "pending" | "approved" | "rejected" | "posted";
  created_at: string;
  approved_at?: string;
  approved_by?: number;
  rejection_reason?: string;
}

export async function GET(request: NextRequest) {
  try {
    const user = await authenticateRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "pending";
    const accountId = searchParams.get("account_id");

    let query = `
      SELECT ca.*, ia.username as account_username
      FROM content_approvals ca
      JOIN instagram_accounts ia ON ca.account_id = ia.id
      WHERE ia.user_id = ?
    `;
    const params: any[] = [user.id];

    if (status !== "all") {
      query += " AND ca.status = ?";
      params.push(status);
    }

    if (accountId) {
      query += " AND ca.account_id = ?";
      params.push(accountId);
    }

    query += " ORDER BY ca.created_at DESC";

    const approvals = await database.all(query, params);

    // Parse JSON fields
    const formattedApprovals = approvals.map((approval: any) => ({
      ...approval,
      hashtags: JSON.parse(approval.hashtags || "[]"),
    }));

    return NextResponse.json({
      approvals: formattedApprovals,
      count: formattedApprovals.length
    });

  } catch (error) {
    console.error("Error fetching content approvals:", error);
    return NextResponse.json(
      { error: "Failed to fetch content approvals" },
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
    const {
      account_id,
      content_type,
      content_text,
      hashtags = [],
      image_url,
      video_url,
      scheduled_time
    } = body;

    // Verify account ownership
    const account = await database.all(`
      SELECT id, username 
      FROM instagram_accounts 
      WHERE id = ? AND user_id = ? AND status = 'connected'
    `, [account_id, user.id]);

    if (account.length === 0) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    // Create content approval
    const result = await database.run(`
      INSERT INTO content_approvals (
        account_id, content_type, content_text, hashtags, 
        image_url, video_url, scheduled_time, status, created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?)
    `, [
      account_id,
      content_type,
      content_text,
      JSON.stringify(hashtags),
      image_url || null,
      video_url || null,
      scheduled_time || null,
      new Date().toISOString()
    ]);

    // Log activity
    await database.run(`
      INSERT INTO user_activities (user_id, activity_type, description, timestamp)
      VALUES (?, ?, ?, ?)
    `, [
      user.id,
      "content_approval_created",
      `Created content approval for account: ${account[0].username}`,
      new Date().toISOString()
    ]);

    return NextResponse.json({
      id: result.lastID,
      message: "Content approval created successfully",
      status: "pending"
    });

  } catch (error) {
    console.error("Error creating content approval:", error);
    return NextResponse.json(
      { error: "Failed to create content approval" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await authenticateRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { approval_id, action, rejection_reason } = body;

    if (!["approve", "reject"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    // Verify approval exists and user has access
    const approval = await database.all(`
      SELECT ca.*, ia.username as account_username
      FROM content_approvals ca
      JOIN instagram_accounts ia ON ca.account_id = ia.id
      WHERE ca.id = ? AND ia.user_id = ?
    `, [approval_id, user.id]);

    if (approval.length === 0) {
      return NextResponse.json({ error: "Approval not found" }, { status: 404 });
    }

    const currentApproval = approval[0];
    if (currentApproval.status !== "pending") {
      return NextResponse.json({ 
        error: "Approval has already been processed" 
      }, { status: 400 });
    }

    // Update approval status
    const newStatus = action === "approve" ? "approved" : "rejected";
    await database.run(`
      UPDATE content_approvals 
      SET status = ?, approved_at = ?, approved_by = ?, rejection_reason = ?
      WHERE id = ?
    `, [
      newStatus,
      new Date().toISOString(),
      user.id,
      action === "reject" ? rejection_reason : null,
      approval_id
    ]);

    // Log activity
    await database.run(`
      INSERT INTO user_activities (user_id, activity_type, description, timestamp)
      VALUES (?, ?, ?, ?)
    `, [
      user.id,
      `content_approval_${action}d`,
      `${action === "approve" ? "Approved" : "Rejected"} content for account: ${currentApproval.account_username}`,
      new Date().toISOString()
    ]);

    // If approved, schedule for posting (in a real implementation)
    if (action === "approve") {
      // Here you would integrate with your posting queue/scheduler
      console.log(`Content approved for posting:`, {
        approval_id,
        account: currentApproval.account_username,
        content: currentApproval.content_text
      });
    }

    return NextResponse.json({
      message: `Content ${action}d successfully`,
      status: newStatus,
      approval_id
    });

  } catch (error) {
    console.error("Error processing content approval:", error);
    return NextResponse.json(
      { error: "Failed to process approval" },
      { status: 500 }
    );
  }
}
