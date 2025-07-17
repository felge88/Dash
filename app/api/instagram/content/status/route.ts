import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import db from "@/lib/database";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    }

    // Mock content status - in real implementation this would check actual automation status
    const status = {
      status: "inactive", // inactive | generating | uploading | completed
      current_task: null,
      progress: 0,
      estimated_completion: null,
    };

    // Check if there are any active automation tasks
    const activeAutomation = await db.get(
      "SELECT * FROM instagram_automation WHERE user_id = ? AND is_active = true",
      [user.id]
    );

    if (activeAutomation) {
      // Simulate different statuses based on time or other factors
      const now = new Date();
      const minute = now.getMinutes();

      if (minute < 15) {
        status.status = "generating";
        status.current_task = "Generiere Bild und Text...";
        status.progress = Math.floor(Math.random() * 60) + 20;
      } else if (minute < 30) {
        status.status = "uploading";
        status.current_task = "Lade Beitrag hoch...";
        status.progress = Math.floor(Math.random() * 40) + 60;
      } else if (minute < 45) {
        status.status = "completed";
        status.current_task = "Beitrag erfolgreich veröffentlicht";
        status.progress = 100;
      }
    }

    return NextResponse.json(status);
  } catch (error) {
    console.error("Error fetching content status:", error);
    return NextResponse.json({ error: "Server-Fehler" }, { status: 500 });
  }
}
