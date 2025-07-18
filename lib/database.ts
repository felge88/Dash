import sqlite3 from "sqlite3";
import { promisify } from "util";
import path from "path";
import fs from "fs";

// Use root level database for production
const dbPath = path.join(process.cwd(), "database.sqlite");

class Database {
  private db: sqlite3.Database;
  private initialized = false;

  constructor() {
    // Ensure database directory exists
    const dbDir = path.dirname(dbPath);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    this.db = new sqlite3.Database(dbPath);
    this.init();
  }

  private async init() {
    if (this.initialized) return;

    const run = promisify(this.db.run.bind(this.db));

    try {
      // Enable WAL mode for better performance
      await run("PRAGMA journal_mode=WAL;");
      await run("PRAGMA synchronous=NORMAL;");
      await run("PRAGMA cache_size=10000;");
      await run("PRAGMA temp_store=MEMORY;");
      console.log("✅ SQLite performance optimizations enabled");

      // Load and execute schema
      const schemaPath = path.join(process.cwd(), "lib", "db-schema.sql");

      if (fs.existsSync(schemaPath)) {
        const schema = fs.readFileSync(schemaPath, "utf8");

        // Split schema into individual statements and execute
        const statements = schema.split(";").filter((stmt) => stmt.trim());

        for (const statement of statements) {
          if (statement.trim()) {
            try {
              await run(statement.trim());
            } catch (error) {
              console.warn("Schema statement warning:", error);
            }
          }
        }

        console.log("Database schema initialized successfully");

        // Initialize sample modules
        await this.initializeSampleModules();
        console.log("Sample modules initialized");
      } else {
        console.warn("Schema file not found, using fallback tables");
        // Fallback minimal tables
        await this.createFallbackTables(run);

        // Initialize sample modules for fallback too
        await this.initializeSampleModules();
        console.log("Sample modules initialized (fallback)");
      }

      this.initialized = true;
    } catch (error) {
      console.error("Database initialization error:", error);
      throw error;
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
    `);

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
    `);

    await run(`
      CREATE TABLE IF NOT EXISTS user_modules (
        user_id INTEGER,
        module_id INTEGER,
        is_active BOOLEAN DEFAULT FALSE,
        config JSON DEFAULT '{}',
        granted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, module_id)
      )
    `);

    await run(`
      CREATE TABLE IF NOT EXISTS activity_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        module_type TEXT NOT NULL,
        action TEXT NOT NULL,
        status TEXT NOT NULL,
        message TEXT,
        metadata JSON DEFAULT '{}',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }

  async get(query: string, params: any[] = []): Promise<any> {
    await this.ensureInitialized();
    const get = promisify(this.db.get.bind(this.db));
    return await get(query, params);
  }

  async all(query: string, params: any[] = []): Promise<any[]> {
    await this.ensureInitialized();
    const all = promisify(this.db.all.bind(this.db));
    return await all(query, params);
  }

  async run(
    query: string,
    params: any[] = []
  ): Promise<{ lastID: number; changes: number }> {
    await this.ensureInitialized();
    const run = promisify(this.db.run.bind(this.db));
    const result = await run(query, params);
    return {
      lastID: (result as any).lastID || 0,
      changes: (result as any).changes || 0,
    };
  }

  async transaction(callback: () => Promise<void>): Promise<void> {
    await this.ensureInitialized();
    const run = promisify(this.db.run.bind(this.db));

    try {
      await run("BEGIN TRANSACTION");
      await callback();
      await run("COMMIT");
    } catch (error) {
      await run("ROLLBACK");
      throw error;
    }
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.init();
    }
  }

  close(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  // Utility methods for common operations
  async getUserById(id: number): Promise<any> {
    return await this.get("SELECT * FROM users WHERE id = ?", [id]);
  }

  async getUserByUsername(username: string): Promise<any> {
    return await this.get("SELECT * FROM users WHERE username = ?", [username]);
  }

  async createUser(userData: {
    username: string;
    password_hash: string;
    email?: string;
    name?: string;
    is_admin?: boolean;
  }): Promise<number> {
    const result = await this.run(
      `INSERT INTO users (username, password_hash, email, name, is_admin) 
       VALUES (?, ?, ?, ?, ?)`,
      [
        userData.username,
        userData.password_hash,
        userData.email || null,
        userData.name || null,
        userData.is_admin || false,
      ]
    );
    return result.lastID;
  }

  async updateUserLogin(userId: number): Promise<void> {
    await this.run(
      "UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?",
      [userId]
    );
  }

  async getModulesForUser(userId: number): Promise<any[]> {
    return await this.all(
      `
      SELECT m.*, um.is_active as user_active, um.config as user_config
      FROM modules m
      LEFT JOIN user_modules um ON m.id = um.module_id AND um.user_id = ?
      ORDER BY m.name
    `,
      [userId]
    );
  }

  async toggleUserModule(
    userId: number,
    moduleId: number,
    isActive: boolean
  ): Promise<void> {
    await this.run(
      `INSERT OR REPLACE INTO user_modules (user_id, module_id, is_active) 
       VALUES (?, ?, ?)`,
      [userId, moduleId, isActive]
    );
  }

  async logActivity(
    userId: number,
    moduleType: string,
    action: string,
    status: "success" | "error" | "info",
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
        metadata ? JSON.stringify(metadata) : "{}",
      ]
    );
  }

  async getRecentActivities(
    userId: number,
    limit: number = 50
  ): Promise<any[]> {
    return await this.all(
      `SELECT * FROM activity_logs 
       WHERE user_id = ? 
       ORDER BY created_at DESC 
       LIMIT ?`,
      [userId, limit]
    );
  }

  async getAllUsers(): Promise<any[]> {
    return await this.all(
      "SELECT id, username, email, name, is_admin, created_at, last_login FROM users ORDER BY created_at DESC"
    );
  }

  async getAllModules(): Promise<any[]> {
    return await this.all("SELECT * FROM modules ORDER BY name");
  }

  async updateUserProfile(
    userId: number,
    updates: {
      name?: string;
      email?: string;
      profile_image?: string;
    }
  ): Promise<void> {
    const fields: string[] = [];
    const values: any[] = [];

    if (updates.name !== undefined) {
      fields.push("name = ?");
      values.push(updates.name);
    }
    if (updates.email !== undefined) {
      fields.push("email = ?");
      values.push(updates.email);
    }
    if (updates.profile_image !== undefined) {
      fields.push("profile_image = ?");
      values.push(updates.profile_image);
    }

    if (fields.length > 0) {
      values.push(userId);
      const result = await this.run(
        `UPDATE users SET ${fields.join(", ")} WHERE id = ?`,
        values
      );

      if (result.changes === 0) {
        throw new Error("User not found or no changes made");
      }

      console.log(`Updated user ${userId} profile:`, {
        fields,
        changes: result.changes,
      });
    }
  }

  async updateUserSettings(userId: number, settings: any): Promise<void> {
    await this.run("UPDATE users SET settings = ? WHERE id = ?", [
      JSON.stringify(settings),
      userId,
    ]);
  }

  async initializeSampleModules(): Promise<void> {
    const sampleModules = [
      {
        name: "Instagram Automation",
        description: "Automatisiere deine Instagram Posts und Interaktionen",
        type: "instagram",
        is_active: true,
        config:
          '{"auto_like": true, "auto_follow": false, "post_schedule": ["09:00", "15:00", "20:00"]}',
      },
      {
        name: "YouTube Downloader",
        description: "Lade Videos und Audio von YouTube herunter",
        type: "youtube",
        is_active: true,
        config: '{"quality": "720p", "format": "mp4", "audio_only": false}',
      },
      {
        name: "Email Notifications",
        description: "Sende automatische E-Mail-Benachrichtigungen",
        type: "email",
        is_active: true,
        config: '{"smtp_server": "", "port": 587, "encryption": "tls"}',
      },
      {
        name: "Data Analytics",
        description: "Analysiere und visualisiere deine Daten",
        type: "analytics",
        is_active: false,
        config: '{"charts": true, "export": true, "realtime": false}',
      },
      {
        name: "File Organizer",
        description: "Organisiere Dateien automatisch nach Regeln",
        type: "file",
        is_active: false,
        config: '{"watch_folder": "", "rules": []}',
      },
      {
        name: "Social Media Monitor",
        description: "Überwache Mentions und Keywords auf Social Media",
        type: "monitor",
        is_active: false,
        config: '{"platforms": ["twitter", "facebook"], "keywords": []}',
      },
    ];

    for (const module of sampleModules) {
      try {
        await this.run(
          `INSERT OR IGNORE INTO modules (name, description, type, is_active, config) 
           VALUES (?, ?, ?, ?, ?)`,
          [
            module.name,
            module.description,
            module.type,
            module.is_active,
            module.config,
          ]
        );
      } catch (error) {
        console.warn("Sample module insert warning:", error);
      }
    }
  }
}

// Singleton instance
const database = new Database();
export default database;
