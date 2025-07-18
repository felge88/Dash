const database = require("../lib/database.ts").default;

async function initializeDatabase() {
  console.log("Initializing database with sample modules...");

  try {
    await database.initializeSampleModules();
    console.log("Database initialization completed successfully");
  } catch (error) {
    console.error("Database initialization failed:", error);
  } finally {
    await database.close();
  }
}

initializeDatabase();
