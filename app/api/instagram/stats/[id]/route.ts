import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import instagramService from "@/lib/services/instagram";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    }

    const accountId = parseInt(params.id);
    const stats = await instagramService.getAccountStats(accountId);

    if (!stats) {
      return NextResponse.json(
        { error: "Account nicht gefunden" },
        { status: 404 }
      );
    }

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching Instagram stats:", error);
    return NextResponse.json({ error: "Server-Fehler" }, { status: 500 });
  }
}
