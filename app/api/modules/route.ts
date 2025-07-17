import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import database from "@/lib/database";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    }

    const modules = await database.getModulesForUser(user.id);

    return NextResponse.json({
      success: true,
      modules: modules.map((module) => ({
        id: module.id,
        name: module.name,
        description: module.description,
        type: module.type,
        is_active: module.is_active,
        user_active: module.user_active || false,
        config: module.config ? JSON.parse(module.config) : {},
        user_config: module.user_config ? JSON.parse(module.user_config) : {},
        created_at: module.created_at,
      })),
    });
  } catch (error) {
    console.error("Modules API error:", error);
    return NextResponse.json(
      { success: false, error: "Server-Fehler" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user || !user.is_admin) {
      return NextResponse.json(
        { error: "Keine Berechtigung" },
        { status: 403 }
      );
    }

    const { name, description, type } = await request.json();

    if (!name || !type) {
      return NextResponse.json(
        { error: "Name und Typ sind erforderlich" },
        { status: 400 }
      );
    }

    // Create new module
    const result = await database.run(
      `INSERT INTO modules (name, description, type, is_active) 
       VALUES (?, ?, ?, ?)`,
      [name, description || null, type, false]
    );

    return NextResponse.json({
      success: true,
      moduleId: result.lastID,
      message: "Modul erfolgreich erstellt",
    });
  } catch (error) {
    console.error("Module creation error:", error);
    return NextResponse.json({ error: "Server-Fehler" }, { status: 500 });
  }
}
