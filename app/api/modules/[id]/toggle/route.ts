import { type NextRequest, NextResponse } from "next/server";
import { authenticateRequest, requireAuth } from "@/lib/auth-new";
import database from "@/lib/database";

interface ModuleToggleRequest {
  is_active: boolean;
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await authenticateRequest(request);
    requireAuth(user);

    const moduleId = parseInt(params.id);
    if (isNaN(moduleId)) {
      return NextResponse.json(
        { success: false, error: "Invalid module ID" },
        { status: 400 }
      );
    }

    const body: ModuleToggleRequest = await request.json();
    const { is_active } = body;

    if (typeof is_active !== "boolean") {
      return NextResponse.json(
        { success: false, error: "is_active must be a boolean" },
        { status: 400 }
      );
    }

    // Toggle module for user
    await database.toggleUserModule(user!.id, moduleId, is_active);

    // Log activity
    await database.logActivity(
      user!.id,
      "module",
      is_active ? "module_enabled" : "module_disabled",
      "success",
      `Module ${moduleId} ${is_active ? "enabled" : "disabled"}`,
      { module_id: moduleId }
    );

    return NextResponse.json({
      success: true,
      message: `Module ${is_active ? "enabled" : "disabled"} successfully`,
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
