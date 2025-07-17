import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import db from "@/lib/database";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    }

    const accountId = parseInt(params.id);

    // Verify account belongs to user
    const account = await db.get(
      "SELECT * FROM instagram_accounts WHERE id = ? AND user_id = ?",
      [accountId, user.id]
    );

    if (!account) {
      return NextResponse.json(
        { error: "Account nicht gefunden" },
        { status: 404 }
      );
    }

    // Delete account and related data
    await db.run("DELETE FROM instagram_accounts WHERE id = ?", [accountId]);

    // Delete related automation config
    await db.run("DELETE FROM instagram_automation WHERE account_id = ?", [
      accountId,
    ]);

    // Log activity
    await db.logActivity(
      user.id,
      "instagram",
      "disconnect",
      "success",
      `Instagram account @${account.username} disconnected`
    );

    return NextResponse.json({
      success: true,
      message: "Account erfolgreich getrennt",
    });
  } catch (error) {
    console.error("Error disconnecting Instagram account:", error);
    return NextResponse.json({ error: "Server-Fehler" }, { status: 500 });
  }
}
