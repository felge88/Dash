import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import db from "@/lib/database";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    }

    // Get fresh user data with settings
    const userData = await db.getUserById(user.id);

    return NextResponse.json({
      settings: userData.settings ? JSON.parse(userData.settings) : {},
    });
  } catch (error) {
    console.error("Settings fetch error:", error);
    return NextResponse.json({ error: "Server-Fehler" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    }

    const settings = await request.json();

    // Update user settings
    await db.updateUserSettings(user.id, settings);

    return NextResponse.json({
      success: true,
      message: "Einstellungen erfolgreich gespeichert",
    });
  } catch (error) {
    console.error("Settings update error:", error);
    return NextResponse.json({ error: "Server-Fehler" }, { status: 500 });
  }
}
