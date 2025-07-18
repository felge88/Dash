import { NextResponse } from "next/server";
import database from "@/lib/database";

export async function GET() {
  try {
    const checks = {
      timestamp: new Date().toISOString(),
      database: "unknown",
      pm2: "unknown",
      disk: "unknown",
      memory: "unknown",
    };

    // Database health check
    try {
      await database.get("SELECT 1 as test");
      checks.database = "healthy";
    } catch (error) {
      checks.database = "unhealthy";
    }

    // PM2 process check
    try {
      const { execSync } = require("child_process");
      const pm2Status = execSync("pm2 jlist", { encoding: "utf8" });
      const processes = JSON.parse(pm2Status);
      const dashProcess = processes.find(
        (p: any) => p.name === "dash-automation"
      );

      if (dashProcess && dashProcess.pm2_env.status === "online") {
        checks.pm2 = "healthy";
      } else {
        checks.pm2 = "unhealthy";
      }
    } catch (error) {
      checks.pm2 = "unavailable";
    }

    // Disk space check
    try {
      const { execSync } = require("child_process");
      const diskInfo = execSync("df -h / | tail -1", { encoding: "utf8" });
      const usage = diskInfo.split(/\s+/)[4];
      const usagePercent = parseInt(usage.replace("%", ""));

      if (usagePercent < 85) {
        checks.disk = "healthy";
      } else if (usagePercent < 95) {
        checks.disk = "warning";
      } else {
        checks.disk = "critical";
      }
    } catch (error) {
      checks.disk = "unavailable";
    }

    // Memory check
    try {
      const { execSync } = require("child_process");
      const memInfo = execSync(
        "free -m | grep \"Mem:\" | awk '{print $3/$2 * 100.0}'",
        { encoding: "utf8" }
      );
      const memoryUsage = parseFloat(memInfo.trim());

      if (memoryUsage < 80) {
        checks.memory = "healthy";
      } else if (memoryUsage < 90) {
        checks.memory = "warning";
      } else {
        checks.memory = "critical";
      }
    } catch (error) {
      checks.memory = "unavailable";
    }

    // Determine overall status
    const hasUnhealthy = Object.values(checks).some(
      (status) => status === "unhealthy" || status === "critical"
    );
    const hasWarning = Object.values(checks).some(
      (status) => status === "warning"
    );

    let overallStatus = "healthy";
    let httpStatus = 200;

    if (hasUnhealthy) {
      overallStatus = "unhealthy";
      httpStatus = 503;
    } else if (hasWarning) {
      overallStatus = "warning";
      httpStatus = 200;
    }

    return NextResponse.json(
      {
        status: overallStatus,
        checks,
        uptime: process.uptime(),
        version: process.env.npm_package_version || "1.0.0",
      },
      { status: httpStatus }
    );
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
