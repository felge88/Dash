import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import { cookies } from "next/headers"
import { db } from "./database"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production"

export interface User {
  id: number
  username: string
  is_admin: boolean
}

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash)
}

export function generateToken(user: User): string {
  return jwt.sign({ id: user.id, username: user.username, is_admin: user.is_admin }, JWT_SECRET, { expiresIn: "7d" })
}

export function verifyToken(token: string): User | null {
  try {
    return jwt.verify(token, JWT_SECRET) as User
  } catch {
    return null
  }
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("auth-token")?.value

    if (!token) return null

    return verifyToken(token)
  } catch {
    return null
  }
}

export async function authenticateUser(username: string, password: string): Promise<User | null> {
  try {
    const user = await db.getUser(username)
    if (!user) return null

    const isValid = await verifyPassword(password, user.password_hash)
    if (!isValid) return null

    await db.updateLastLogin(user.id)

    return {
      id: user.id,
      username: user.username,
      is_admin: user.is_admin,
    }
  } catch {
    return null
  }
}
