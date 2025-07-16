import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest, requireAuth } from "@/lib/auth-new";
import youtubeService from "@/lib/services/youtube";

interface DownloadRequest {
  urls: string[];
  format: "mp3" | "mp4" | "wav" | "flac";
}

export async function POST(request: NextRequest) {
  try {
    const user = await authenticateRequest(request);
    requireAuth(user);

    const body: DownloadRequest = await request.json();
    const { urls, format } = body;

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json(
        { success: false, error: "URLs array is required" },
        { status: 400 }
      );
    }

    if (!format || !["mp3", "mp4", "wav", "flac"].includes(format)) {
      return NextResponse.json(
        {
          success: false,
          error: "Valid format is required (mp3, mp4, wav, flac)",
        },
        { status: 400 }
      );
    }

    const result = await youtubeService.initiateDownload(user!.id, {
      urls,
      format,
    });

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.message || "Failed to initiate downloads",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      downloads: result.downloads,
      message: `Initiated ${result.downloads?.length || 0} download(s)`,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Authentication required") {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    console.error("YouTube download API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await authenticateRequest(request);
    requireAuth(user);

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const downloads = await youtubeService.getDownloads(
      user!.id,
      status || undefined
    );

    return NextResponse.json({
      success: true,
      downloads,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Authentication required") {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    console.error("YouTube downloads API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
