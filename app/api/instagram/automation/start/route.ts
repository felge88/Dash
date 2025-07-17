import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import db from "@/lib/database";

export async function POST() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    }

    // Start automation for user's accounts
    await db.run(
      "UPDATE instagram_automation SET is_active = true WHERE user_id = ?",
      [user.id]
    );

    // Log activity
    await db.logActivity(
      user.id,
      "instagram",
      "automation_start",
      "success",
      "Instagram automation started"
    );

    return NextResponse.json({
      success: true,
      message: "Automatisierung gestartet",
    });
  } catch (error) {
    console.error("Error starting automation:", error);
    return NextResponse.json({ error: "Server-Fehler" }, { status: 500 });
  }
}
