import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import { NextRequest } from 'next/server'
import database from './database'

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production'
const SALT_ROUNDS = 12

export interface User {
  id: number
  username: string
  email?: string
  name?: string
  is_admin: boolean
  profile_image?: string
  settings?: any
}

export interface JWTPayload {
  userId: number
  username: string
  is_admin: boolean
  iat?: number
  exp?: number
}

// Password utilities
export const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, SALT_ROUNDS)
}

export const verifyPassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword)
}

// JWT utilities
export const generateToken = (user: User): string => {
  const payload: JWTPayload = {
    userId: user.id,
    username: user.username,
    is_admin: user.is_admin
  }
  
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '24h'
  })
}

export const verifyToken = (token: string): JWTPayload | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch (error) {
    return null
  }
}

// Authentication middleware
export const authenticateUser = async (request: NextRequest): Promise<User | null> => {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null
    }

    const token = authHeader.substring(7)
    const payload = verifyToken(token)
    
    if (!payload) {
      return null
    }

    // Get fresh user data from database
    const user = await database.getUserById(payload.userId)
    if (!user) {
      return null
    }

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      is_admin: user.is_admin,
      profile_image: user.profile_image,
      settings: user.settings ? JSON.parse(user.settings) : {}
    }
  } catch (error) {
    console.error('Authentication error:', error)
    return null
  }
}

// Login function
export const loginUser = async (username: string, password: string): Promise<{ user: User; token: string } | null> => {
  try {
    const dbUser = await database.getUserByUsername(username)
    if (!dbUser) {
      return null
    }

    const isValidPassword = await verifyPassword(password, dbUser.password_hash)
    if (!isValidPassword) {
      return null
    }

    // Update last login
    await database.updateUserLogin(dbUser.id)

    const user: User = {
      id: dbUser.id,
      username: dbUser.username,
      email: dbUser.email,
      name: dbUser.name,
      is_admin: dbUser.is_admin,
      profile_image: dbUser.profile_image,
      settings: dbUser.settings ? JSON.parse(dbUser.settings) : {}
    }

    const token = generateToken(user)

    return { user, token }
  } catch (error) {
    console.error('Login error:', error)
    return null
  }
}

// Authorization helpers
export const requireAuth = (user: User | null): User => {
  if (!user) {
    throw new Error('Authentication required')
  }
  return user
}

export const requireAdmin = (user: User | null): User => {
  const authenticatedUser = requireAuth(user)
  if (!authenticatedUser.is_admin) {
    throw new Error('Admin access required')
  }
  return authenticatedUser
}
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
