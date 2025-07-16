import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest, requireAuth } from "@/lib/auth-new";
import instagramService from "@/lib/services/instagram";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await authenticateRequest(request);
    requireAuth(user);

    const accountId = parseInt(params.id);
    if (isNaN(accountId)) {
      return NextResponse.json(
        { success: false, error: "Invalid account ID" },
        { status: 400 }
      );
    }

    const stats = await instagramService.getAccountStats(accountId);

    if (!stats) {
      return NextResponse.json(
        { success: false, error: "Account not found or stats unavailable" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      stats,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Authentication required") {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    console.error("Instagram stats API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
