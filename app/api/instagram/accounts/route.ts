import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest, requireAuth } from "@/lib/auth-new";
import instagramService from "@/lib/services/instagram";

export async function GET(request: NextRequest) {
  try {
    const user = await authenticateRequest(request);
    requireAuth(user);

    const accounts = await instagramService.getAccountsByUserId(user!.id);

    return NextResponse.json({
      success: true,
      accounts: accounts.map((account) => ({
        id: account.id,
        username: account.username,
        is_connected: account.is_connected,
        followers_count: account.followers_count,
        following_count: account.following_count,
        posts_count: account.posts_count,
        last_sync: account.last_sync,
        created_at: account.created_at,
      })),
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Authentication required") {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    console.error("Instagram accounts API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
