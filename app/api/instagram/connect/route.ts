import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest, requireAuth } from "@/lib/auth-new";
import instagramService from "@/lib/services/instagram";

interface ConnectRequest {
  username: string;
  password?: string;
}

export async function POST(request: NextRequest) {
  try {
    const user = await authenticateRequest(request);
    requireAuth(user);

    const body: ConnectRequest = await request.json();
    const { username } = body;

    if (!username) {
      return NextResponse.json(
        { success: false, error: "Username is required" },
        { status: 400 }
      );
    }

    const result = await instagramService.connectAccount(user!.id, username);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.message || "Failed to connect account",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Instagram account connected successfully",
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Authentication required") {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    console.error("Instagram connect API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
