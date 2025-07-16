import sqlite3 from "sqlite3"
import { promisify } from "util"
import path from "path"

const dbPath = path.join(process.cwd(), "data", "database.sqlite")

class Database {
  private db: sqlite3.Database

  constructor() {
    this.db = new sqlite3.Database(dbPath)
    this.init()
  }

  private async init() {
    const run = promisify(this.db.run.bind(this.db))

    try {
      // Users table
      await run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          is_admin BOOLEAN DEFAULT FALSE,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          last_login DATETIME
        )
      `)
      console.log("Tabelle 'users' erstellt/verifiziert.")

      // Modules table
      await run(`
        CREATE TABLE IF NOT EXISTS modules (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT UNIQUE NOT NULL,
          description TEXT,
          script_path TEXT,
          is_active BOOLEAN DEFAULT FALSE,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `)
      console.log("Tabelle 'modules' erstellt/verifiziert.")

      // User modules permissions
      await run(`
        CREATE TABLE IF NOT EXISTS user_modules (
          user_id INTEGER,
          module_id INTEGER,
          granted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id),
          FOREIGN KEY (module_id) REFERENCES modules (id),
          PRIMARY KEY (user_id, module_id)
        )
      `)
      console.log("Tabelle 'user_modules' erstellt/verifiziert.")

      // Module logs
      await run(`
        CREATE TABLE IF NOT EXISTS module_logs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          module_id INTEGER,
          user_id INTEGER,
          status TEXT NOT NULL,
          message TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (module_id) REFERENCES modules (id),
          FOREIGN KEY (user_id) REFERENCES users (id)
        )
      `)
      console.log("Tabelle 'module_logs' erstellt/verifiziert.")

      // Insert default admin user if not exists
      const bcrypt = require("bcryptjs")
      const adminPassword = await bcrypt.hash("admin123", 10)

      await run(
        `
        INSERT OR IGNORE INTO users (username, password_hash, is_admin)
        VALUES ('admin', ?, TRUE)
      `,
        [adminPassword],
      )
      console.log("Admin-Benutzer 'admin' erstellt/verifiziert.")

      // Insert default modules
      const defaultModules = [
        {
          name: "Instagram Automation",
          description: "Automatisierte Instagram-Aktionen wie Follow, Like und Comment",
          script_path: "instagram-bot.py",
        },
        {
          name: "YouTube Downloader",
          description: "YouTube Videos und Playlists herunterladen",
          script_path: "youtube-downloader.py",
        },
        {
          name: "Web Scraper",
          description: "Automatisiertes Sammeln von Daten aus Websites",
          script_path: "web-scraper.py",
        },
        {
          name: "Email Automation",
          description: "Automatisierte E-Mail-Verarbeitung und -Versendung",
          script_path: "email-bot.py",
        },
        {
          name: "Social Media Monitor",
          description: "Überwachung von Social Media Aktivitäten",
          script_path: "social-monitor.py",
        },
        {
          name: "Content Generator",
          description: "Automatische Generierung von Social Media Content",
          script_path: "content-generator.py",
        },
      ]

      for (const module of defaultModules) {
        await run(
          `
          INSERT OR IGNORE INTO modules (name, description, script_path)
          VALUES (?, ?, ?)
        `,
          [module.name, module.description, module.script_path],
        )
        console.log(`Modul '${module.name}' erstellt/verifiziert.`)
      }
    } catch (error) {
      console.error("Fehler bei der Datenbankinitialisierung:", error)
    }
  }

  async getUser(username: string) {
    const get = promisify(this.db.get.bind(this.db))
    try {
      const user = await get("SELECT * FROM users WHERE username = ?", [username])
      if (!user) {
        console.warn(`Benutzer '${username}' nicht in der Datenbank gefunden.`)
      }
      return user
    } catch (error) {
      console.error(`Fehler beim Abrufen des Benutzers '${username}':`, error)
      throw error
    }
  }

  async getAllUsers() {
    const all = promisify(this.db.all.bind(this.db))
    return await all("SELECT id, username, is_admin, created_at, last_login FROM users")
  }

  async createUser(username: string, passwordHash: string, isAdmin = false) {
    const run = promisify(this.db.run.bind(this.db))
    return await run("INSERT INTO users (username, password_hash, is_admin) VALUES (?, ?, ?)", [
      username,
      passwordHash,
      isAdmin,
    ])
  }

  async deleteUser(userId: number) {
    const run = promisify(this.db.run.bind(this.db))
    await run("DELETE FROM user_modules WHERE user_id = ?", [userId])
    return await run("DELETE FROM users WHERE id = ?", [userId])
  }

  async updateUserPassword(userId: number, passwordHash: string) {
    const run = promisify(this.db.run.bind(this.db))
    return await run("UPDATE users SET password_hash = ? WHERE id = ?", [passwordHash, userId])
  }

  async getAllModules() {
    const all = promisify(this.db.all.bind(this.db))
    return await all("SELECT * FROM modules ORDER BY name")
  }

  async getUserModules(userId: number) {
    const all = promisify(this.db.all.bind(this.db))
    return await all(
      `
      SELECT m.* FROM modules m
      JOIN user_modules um ON m.id = um.module_id
      WHERE um.user_id = ?
      ORDER BY m.name
    `,
      [userId],
    )
  }

  async grantModuleAccess(userId: number, moduleId: number) {
    const run = promisify(this.db.run.bind(this.db))
    return await run("INSERT OR IGNORE INTO user_modules (user_id, module_id) VALUES (?, ?)", [userId, moduleId])
  }

  async revokeModuleAccess(userId: number, moduleId: number) {
    const run = promisify(this.db.run.bind(this.db))
    return await run("DELETE FROM user_modules WHERE user_id = ? AND module_id = ?", [userId, moduleId])
  }

  async logModuleActivity(moduleId: number, userId: number, status: string, message: string) {
    const run = promisify(this.db.run.bind(this.db))
    return await run("INSERT INTO module_logs (module_id, user_id, status, message) VALUES (?, ?, ?, ?)", [
      moduleId,
      userId,
      status,
      message,
    ])
  }

  async getModuleLogs(moduleId?: number, limit = 100) {
    const all = promisify(this.db.all.bind(this.db))
    const query = moduleId
      ? "SELECT ml.*, m.name as module_name, u.username FROM module_logs ml JOIN modules m ON ml.module_id = m.id JOIN users u ON ml.user_id = u.id WHERE ml.module_id = ? ORDER BY ml.created_at DESC LIMIT ?"
      : "SELECT ml.*, m.name as module_name, u.username FROM module_logs ml JOIN modules m ON ml.module_id = m.id JOIN users u ON ml.user_id = u.id ORDER BY ml.created_at DESC LIMIT ?"

    return moduleId ? await all(query, [moduleId, limit]) : await all(query, [limit])
  }

  async updateLastLogin(userId: number) {
    const run = promisify(this.db.run.bind(this.db))
    return await run("UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?", [userId])
  }
}

export const db = new Database()
