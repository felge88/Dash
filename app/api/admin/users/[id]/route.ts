import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import database from "@/lib/database"

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user || !user.is_admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = Number.parseInt(params.id)

    // Don't allow deleting self
    if (userId === user.id) {
      return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 })
    }

    // Delete user and related data
    await database.transaction(async () => {
      await database.run("DELETE FROM user_modules WHERE user_id = ?", [userId])
      await database.run("DELETE FROM activity_logs WHERE user_id = ?", [userId])
      await database.run("DELETE FROM instagram_accounts WHERE user_id = ?", [userId])
      await database.run("DELETE FROM users WHERE id = ?", [userId])
    })

    // Log the activity
    await database.logActivity(user.id, "admin", "user_deleted", "success", `User ${userId} deleted`, {
      deleted_user_id: userId,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
