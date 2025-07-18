import sqlite3 from "sqlite3";

const db = new sqlite3.Database("database.sqlite");

export default {
  // Generic query method
  query: (sql: string, params: any[] = []) =>
    new Promise<any>((resolve, reject) =>
      db.get(sql, params, (err, row) => (err ? reject(err) : resolve(row)))
    ),

  // User methods
  getUserById: (id: number) =>
    new Promise<any>((resolve, reject) =>
      db.get("SELECT * FROM users WHERE id = ?", [id], (err, row) =>
        err ? reject(err) : resolve(row)
      )
    ),

  getUserByUsername: (username: string) =>
    new Promise<any>((resolve, reject) =>
      db.get("SELECT * FROM users WHERE username = ?", [username], (err, row) =>
        err ? reject(err) : resolve(row)
      )
    ),

  getUserByEmail: (email: string) =>
    new Promise<any>((resolve, reject) =>
      db.get("SELECT * FROM users WHERE email = ?", [email], (err, row) =>
        err ? reject(err) : resolve(row)
      )
    ),

  updateUserLogin: (id: number) =>
    new Promise<any>((resolve, reject) =>
      db.run(
        "UPDATE users SET last_login = datetime('now') WHERE id = ?",
        [id],
        (err) => (err ? reject(err) : resolve(true))
      )
    ),

  // Generic query methods
  get: (query: string, params: any[] = []) =>
    new Promise<any>((resolve, reject) =>
      db.get(query, params, (err, row) => (err ? reject(err) : resolve(row)))
    ),

  all: (query: string, params: any[] = []) =>
    new Promise<any[]>((resolve, reject) =>
      db.all(query, params, (err, rows) => (err ? reject(err) : resolve(rows)))
    ),

  run: (query: string, params: any[] = []) =>
    new Promise<any>((resolve, reject) =>
      db.run(query, params, function (err) {
        err ? reject(err) : resolve({ id: this.lastID, changes: this.changes });
      })
    ),

  // Module methods
  getAllModules: () =>
    new Promise<any[]>((resolve, reject) =>
      db.all("SELECT * FROM modules ORDER BY name", (err, rows) =>
        err ? reject(err) : resolve(rows)
      )
    ),

  getModuleById: (id: number) =>
    new Promise<any>((resolve, reject) =>
      db.get("SELECT * FROM modules WHERE id = ?", [id], (err, row) =>
        err ? reject(err) : resolve(row)
      )
    ),

  // Activity methods
  getActivities: (limit: number = 50) =>
    new Promise<any[]>((resolve, reject) =>
      db.all(
        "SELECT * FROM activities ORDER BY timestamp DESC LIMIT ?",
        [limit],
        (err, rows) => (err ? reject(err) : resolve(rows))
      )
    ),

  createActivity: (userId: number, action: string, details: string) =>
    new Promise<any>((resolve, reject) =>
      db.run(
        "INSERT INTO activities (user_id, action, details, timestamp) VALUES (?, ?, ?, datetime('now'))",
        [userId, action, details],
        function (err) {
          err ? reject(err) : resolve({ id: this.lastID });
        }
      )
    ),

  // Close database connection
  close: () =>
    new Promise<void>((resolve, reject) =>
      db.close((err) => (err ? reject(err) : resolve()))
    ),
};
