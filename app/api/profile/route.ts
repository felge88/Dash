import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import db from "@/lib/database";

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    }

    const body = await request.json();
    const { name, email } = body;

    // Update user profile
    await db.updateUserProfile(user.id, { name, email });

    return NextResponse.json({
      success: true,
      message: "Profil erfolgreich aktualisiert",
    });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json({ error: "Server-Fehler" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    }

    // Get fresh user data
    const userData = await db.getUserById(user.id);

    return NextResponse.json({
      user: {
        id: userData.id,
        username: userData.username,
        name: userData.name,
        email: userData.email,
        profile_image: userData.profile_image,
        is_admin: userData.is_admin,
      },
    });
  } catch (error) {
    console.error("Profile fetch error:", error);
    return NextResponse.json({ error: "Server-Fehler" }, { status: 500 });
  }
}
