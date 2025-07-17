import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import database from "@/lib/database";

export async function POST(request: NextRequest) {
  try {
    // Get current user for logging
    const user = await getCurrentUser();

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

    // Create response with cleared cookies
    const response = NextResponse.json({
      success: true,
      message: "Erfolgreich abgemeldet",
    });

    // Clear the authentication cookie
    response.cookies.set("auth-token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0, // Immediately expire
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Logout API error:", error);
    return NextResponse.json(
      { success: false, error: "Server-Fehler" },
      { status: 500 }
    );
  }
}
