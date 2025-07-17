import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import instagramService from "@/lib/services/instagram";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    }

    const config = await instagramService.getAutomationConfig(user.id);
    return NextResponse.json({ config });
  } catch (error) {
    console.error("Error fetching automation config:", error);
    return NextResponse.json({ error: "Server-Fehler" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    }

    const config = await request.json();
    const result = await instagramService.configureAutomation(user.id, config);

    if (!result.success) {
      return NextResponse.json(
        { error: result.message || "Konfiguration fehlgeschlagen" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Automatisierung konfiguriert",
    });
  } catch (error) {
    console.error("Error configuring automation:", error);
    return NextResponse.json({ error: "Server-Fehler" }, { status: 500 });
  }
}
