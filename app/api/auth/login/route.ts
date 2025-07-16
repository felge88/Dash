import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { authenticateUser, generateToken } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      console.error("Login-Fehler: Benutzername oder Passwort fehlen")
      return NextResponse.json({ error: "Username und Passwort erforderlich" }, { status: 400 })
    }

    const user = await authenticateUser(username, password)

    if (!user) {
      console.error(`Login-Fehler für Benutzer '${username}': Ungültige Anmeldedaten`)
      return NextResponse.json({ error: "Ungültige Anmeldedaten" }, { status: 401 })
    }

    const token = generateToken(user)
    const cookieStore = await cookies()

    cookieStore.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    console.log(`Benutzer '${username}' erfolgreich angemeldet.`)
    return NextResponse.json({ success: true, user: { username: user.username, is_admin: user.is_admin } })
  } catch (error) {
    console.error("Interner Serverfehler beim Login:", error)
    return NextResponse.json({ error: "Interner Serverfehler" }, { status: 500 })
  }
}
