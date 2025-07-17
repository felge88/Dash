import { type NextRequest, NextResponse } from "next/server";
import { getCurrentUser, hashPassword } from "@/lib/auth";
import db from "@/lib/database";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !user.is_admin) {
      return NextResponse.json(
        { error: "Keine Berechtigung" },
        { status: 403 }
      );
    }

    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username und Passwort erforderlich" },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(password);
    const result = await db.createUser({
      username,
      password_hash: passwordHash,
      is_admin: false,
    });

    return NextResponse.json({ success: true, id: result });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Benutzer konnte nicht erstellt werden" },
      { status: 500 }
    );
  }
}
