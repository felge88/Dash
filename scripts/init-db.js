const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcryptjs");
const path = require("path");
const fs = require("fs");

// Use root level database for production
const dbPath = path.join(process.cwd(), "database.sqlite");

// Create database directory if it doesn't exist
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath);

async function initDatabase() {
  console.log("Initializing database...");

  // Create tables
  db.serialize(() => {
    // Users table
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        is_admin BOOLEAN DEFAULT FALSE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_login DATETIME
      )
    `);

    // Modules table
    db.run(`
      CREATE TABLE IF NOT EXISTS modules (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        description TEXT,
        script_path TEXT,
        is_active BOOLEAN DEFAULT FALSE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // User modules permissions
    db.run(`
      CREATE TABLE IF NOT EXISTS user_modules (
        user_id INTEGER,
        module_id INTEGER,
        granted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id),
        FOREIGN KEY (module_id) REFERENCES modules (id),
        PRIMARY KEY (user_id, module_id)
      )
    `);

    // Module logs
    db.run(`
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
    `);

    // Insert default admin user
    bcrypt.hash("admin123", 10, (err, hash) => {
      if (err) {
        console.error("Error hashing password:", err);
        return;
      }

      db.run(
        `INSERT OR IGNORE INTO users (username, password_hash, is_admin) VALUES (?, ?, ?)`,
        ["admin", hash, true],
        (err) => {
          if (err) {
            console.error("Error creating admin user:", err);
          } else {
            console.log("Admin user created/verified");
          }
        }
      );
    });

    // Insert default modules
    const defaultModules = [
      {
        name: "Instagram Automation",
        description:
          "Automatisierte Instagram-Aktionen wie Follow, Like und Comment",
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
    ];

    defaultModules.forEach((module) => {
      db.run(
        `INSERT OR IGNORE INTO modules (name, description, script_path) VALUES (?, ?, ?)`,
        [module.name, module.description, module.script_path],
        (err) => {
          if (err) {
            console.error(`Error creating module ${module.name}:`, err);
          }
        }
      );
    });
  });

  db.close((err) => {
    if (err) {
      console.error("Error closing database:", err);
    } else {
      console.log("Database initialized successfully!");
    }
  });
}

initDatabase();
