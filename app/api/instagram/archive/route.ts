import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import database from "@/lib/database"

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const posts = await database.all(
      `
      SELECT ip.*, ia.username as account_username
      FROM instagram_posts ip
      JOIN instagram_accounts ia ON ip.account_id = ia.id
      WHERE ip.user_id = ? AND ip.status = 'posted'
      ORDER BY ip.posted_at DESC
      LIMIT 50
    `,
      [user.id],
    )

    // Calculate performance based on engagement metrics
    const postsWithPerformance = posts.map((post) => {
      const likes = post.likes || 0
      const comments = post.comments || 0
      const shares = post.shares || 0
      const totalEngagement = likes + comments * 3 + shares * 5

      let performance = "poor"
      if (totalEngagement > 1000) performance = "excellent"
      else if (totalEngagement > 500) performance = "good"
      else if (totalEngagement > 100) performance = "average"

      return {
        ...post,
        performance,
      }
    })

    return NextResponse.json({ posts: postsWithPerformance })
  } catch (error) {
    console.error("Error fetching post archive:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
