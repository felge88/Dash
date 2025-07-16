import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth-new";
import database from "@/lib/database";

export async function POST(request: NextRequest) {
  try {
    // Get current user for logging
    const user = await authenticateRequest(request);

    if (user) {
      // Log logout activity
      await database.logActivity(
        user.id,
        "auth",
        "logout",
        "success",
        "User logged out successfully"
      );
    }

    return NextResponse.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
