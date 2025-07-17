import { type NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import database from "@/lib/database";

interface ModuleToggleRequest {
  is_active: boolean;
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    }

    const moduleId = parseInt(params.id);
    if (isNaN(moduleId)) {
      return NextResponse.json(
        { success: false, error: "Ungültige Modul-ID" },
        { status: 400 }
      );
    }

    const body: ModuleToggleRequest = await request.json();
    const { is_active } = body;

    if (typeof is_active !== "boolean") {
      return NextResponse.json(
        { success: false, error: "is_active muss ein Boolean sein" },
        { status: 400 }
      );
    }

    // Toggle module for user
    await database.toggleUserModule(user.id, moduleId, is_active);

    // Log activity
    await database.logActivity(
      user.id,
      "module",
      is_active ? "activate" : "deactivate",
      "success",
      `Modul ${is_active ? "aktiviert" : "deaktiviert"}`,
      { module_id: moduleId }
    );

    return NextResponse.json({
      success: true,
      message: `Modul erfolgreich ${is_active ? "aktiviert" : "deaktiviert"}`,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Authentication required") {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    console.error("Module toggle API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
