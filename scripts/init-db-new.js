const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const fs = require("fs");

// Ensure data directory exists
const dataDir = path.join(__dirname, "..", "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, "database.sqlite");

async function initializeDatabase() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error("Database connection failed:", err);
        reject(err);
        return;
      }

      console.log("✅ Connected to SQLite database");

      // Read and execute schema
      const schemaPath = path.join(__dirname, "..", "lib", "db-schema.sql");

      if (fs.existsSync(schemaPath)) {
        const schema = fs.readFileSync(schemaPath, "utf8");

        db.exec(schema, (err) => {
          if (err) {
            console.error("❌ Schema execution failed:", err);
            reject(err);
          } else {
            console.log("✅ Database schema initialized successfully");

            // Close database connection
            db.close((err) => {
              if (err) {
                console.error("❌ Database close error:", err);
                reject(err);
              } else {
                console.log("✅ Database initialization completed");
                resolve();
              }
            });
          }
        });
      } else {
        console.error("❌ Schema file not found:", schemaPath);
        reject(new Error("Schema file not found"));
      }
    });
  });
}

// Run initialization
initializeDatabase()
  .then(() => {
    console.log("\n🎉 Database setup completed successfully!");
    console.log("📊 Default admin user created:");
    console.log("   Username: admin");
    console.log("   Password: admin123");
    console.log("   ⚠️  Please change the password after first login!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Database initialization failed:", error);
    process.exit(1);
  });
