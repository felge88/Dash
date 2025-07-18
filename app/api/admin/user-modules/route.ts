import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import database from "@/lib/database"

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user || !user.is_admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userModules = await database.all(`
      SELECT user_id, module_id, is_active 
      FROM user_modules
    `)

    return NextResponse.json({ userModules })
  } catch (error) {
    console.error("Error fetching user modules:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || !user.is_admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { user_id, module_id, is_active } = await request.json()

    await database.run(
      `
      INSERT OR REPLACE INTO user_modules (user_id, module_id, is_active)
      VALUES (?, ?, ?)
    `,
      [user_id, module_id, is_active],
    )

    // Log the activity
    await database.logActivity(
      user.id,
      "admin",
      "user_module_updated",
      "success",
      `Module permission updated for user ${user_id}`,
      { target_user_id: user_id, module_id, is_active },
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating user module:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
