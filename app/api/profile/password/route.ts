import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, verifyPassword, hashPassword } from "@/lib/auth";
import db from "@/lib/database";

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    }

    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Alle Felder sind erforderlich" },
        { status: 400 }
      );
    }

    // Get current user data with password hash
    const userData = await db.getUserById(user.id);

    if (!userData) {
      return NextResponse.json(
        { error: "Benutzer nicht gefunden" },
        { status: 404 }
      );
    }

    // Verify current password
    const isCurrentPasswordValid = await verifyPassword(
      currentPassword,
      userData.password_hash
    );

    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { error: "Aktuelles Passwort ist falsch" },
        { status: 400 }
      );
    }

    // Hash new password
    const newPasswordHash = await hashPassword(newPassword);

    // Update password in database
    const result = await db.run("UPDATE users SET password_hash = ? WHERE id = ?", [
      newPasswordHash,
      user.id,
    ]);

    if (result.changes === 0) {
      return NextResponse.json(
        { error: "Passwort konnte nicht aktualisiert werden" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Passwort erfolgreich geändert",
    });
  } catch (error) {
    console.error("Password update error:", error);
    return NextResponse.json({ error: "Server-Fehler" }, { status: 500 });
  }
}
