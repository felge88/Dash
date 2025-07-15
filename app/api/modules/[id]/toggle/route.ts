import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { db } from "@/lib/database"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 })
    }

    const { is_active } = await request.json()
    const moduleId = Number.parseInt(params.id)

    // Log the activity
    await db.logModuleActivity(
      moduleId,
      user.id,
      is_active ? "activated" : "deactivated",
      `Modul ${is_active ? "aktiviert" : "deaktiviert"} von ${user.username}`,
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error toggling module:", error)
    return NextResponse.json({ error: "Interner Serverfehler" }, { status: 500 })
  }
}
