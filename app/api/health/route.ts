import { NextResponse } from "next/server";
import database from "@/lib/database";

export async function GET() {
  try {
    // Check database connection
    await database.get("SELECT 1 as test");

    // Check if uploads directory exists
    const fs = require("fs");
    const path = require("path");
    const uploadsDir = path.join(process.cwd(), "uploads");

    if (!fs.existsSync(uploadsDir)) {
      throw new Error("Uploads directory not found");
    }

    return NextResponse.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      version: "1.0.0",
      services: {
        database: "connected",
        filesystem: "accessible",
      },
    });
  } catch (error) {
    console.error("Health check failed:", error);

    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 503 }
    );
  }
}
