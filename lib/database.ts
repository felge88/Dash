import sqlite3 from "sqlite3"
import { promisify } from "util"
import path from "path"
import fs from "fs"

const dataDir = path.join(process.cwd(), "data")
const dbPath = path.join(dataDir, "database.sqlite")

class Database {
  private db: sqlite3.Database
  private initialized = false

  constructor() {
    // Ensure data directory exists
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true })
    }

    this.db = new sqlite3.Database(dbPath)
    this.init()
  }

  private async init() {
    if (this.initialized) return

    const run = promisify(this.db.run.bind(this.db))

    try {
      // Load and execute schema
      const schemaPath = path.join(process.cwd(), 'lib', 'db-schema.sql')
      
      if (fs.existsSync(schemaPath)) {
        const schema = fs.readFileSync(schemaPath, 'utf8')
        
        // Split schema into individual statements and execute
        const statements = schema.split(';').filter(stmt => stmt.trim())
        
        for (const statement of statements) {
          if (statement.trim()) {
            try {
              await run(statement.trim())
            } catch (error) {
              console.warn('Schema statement warning:', error)
            }
          }
        }
        
        console.log("Database schema initialized successfully")
      } else {
        console.warn('Schema file not found, using fallback tables')
        // Fallback minimal tables
        await this.createFallbackTables(run)
      }

      this.initialized = true
    } catch (error) {
      console.error("Database initialization error:", error)
      throw error
    }
  }

  private async createFallbackTables(run: any) {
    // Minimal fallback tables
    await run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        email TEXT,
        name TEXT,
        profile_image TEXT,
        is_admin BOOLEAN DEFAULT FALSE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_login DATETIME,
        settings JSON DEFAULT '{}'
      )
    `)

    await run(`
      CREATE TABLE IF NOT EXISTS modules (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        description TEXT,
        type TEXT NOT NULL,
        is_active BOOLEAN DEFAULT FALSE,
        config JSON DEFAULT '{}',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)
  }

  async get(query: string, params: any[] = []): Promise<any> {
    await this.ensureInitialized()
    const get = promisify(this.db.get.bind(this.db))
    return await get(query, params)
  }

  async all(query: string, params: any[] = []): Promise<any[]> {
    await this.ensureInitialized()
    const all = promisify(this.db.all.bind(this.db))
    return await all(query, params)
  }

  async run(query: string, params: any[] = []): Promise<{ lastID: number; changes: number }> {
    await this.ensureInitialized()
    const run = promisify(this.db.run.bind(this.db))
    const result = await run(query, params)
    return { 
      lastID: (result as any).lastID || 0, 
      changes: (result as any).changes || 0 
    }
  }

  async transaction(callback: () => Promise<void>): Promise<void> {
    await this.ensureInitialized()
    const run = promisify(this.db.run.bind(this.db))
    
    try {
      await run('BEGIN TRANSACTION')
      await callback()
      await run('COMMIT')
    } catch (error) {
      await run('ROLLBACK')
      throw error
    }
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.init()
    }
  }

  close(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) reject(err)
        else resolve()
      })
    })
  }

  // Utility methods for common operations
  async getUserById(id: number): Promise<any> {
    return await this.get('SELECT * FROM users WHERE id = ?', [id])
  }

  async getUserByUsername(username: string): Promise<any> {
    return await this.get('SELECT * FROM users WHERE username = ?', [username])
  }

  async createUser(userData: {
    username: string
    password_hash: string
    email?: string
    name?: string
    is_admin?: boolean
  }): Promise<number> {
    const result = await this.run(
      `INSERT INTO users (username, password_hash, email, name, is_admin) 
       VALUES (?, ?, ?, ?, ?)`,
      [
        userData.username,
        userData.password_hash,
        userData.email || null,
        userData.name || null,
        userData.is_admin || false
      ]
    )
    return result.lastID
  }

  async updateUserLogin(userId: number): Promise<void> {
    await this.run(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
      [userId]
    )
  }

  async getModulesForUser(userId: number): Promise<any[]> {
    return await this.all(`
      SELECT m.*, um.is_active as user_active, um.config as user_config
      FROM modules m
      LEFT JOIN user_modules um ON m.id = um.module_id AND um.user_id = ?
      ORDER BY m.name
    `, [userId])
  }

  async toggleUserModule(userId: number, moduleId: number, isActive: boolean): Promise<void> {
    await this.run(
      `INSERT OR REPLACE INTO user_modules (user_id, module_id, is_active) 
       VALUES (?, ?, ?)`,
      [userId, moduleId, isActive]
    )
  }

  async logActivity(
    userId: number, 
    moduleType: string, 
    action: string, 
    status: 'success' | 'error' | 'info', 
    message?: string, 
    metadata?: any
  ): Promise<void> {
    await this.run(
      `INSERT INTO activity_logs (user_id, module_type, action, status, message, metadata) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        userId,
        moduleType,
        action,
        status,
        message || null,
        metadata ? JSON.stringify(metadata) : '{}'
      ]
    )
  }

  async getRecentActivities(userId: number, limit: number = 50): Promise<any[]> {
    return await this.all(
      `SELECT * FROM activity_logs 
       WHERE user_id = ? 
       ORDER BY created_at DESC 
       LIMIT ?`,
      [userId, limit]
    )
  }
}

// Singleton instance
const database = new Database()
export default database
