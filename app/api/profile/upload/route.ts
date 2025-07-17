import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import db from "@/lib/database";
import fs from "fs";
import path from "path";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "Keine Datei hochgeladen" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Nur Bilddateien sind erlaubt" },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Datei zu groß (max 5MB)" },
        { status: 400 }
      );
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(
      process.cwd(),
      "public",
      "uploads",
      "profiles"
    );
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const extension = path.extname(file.name);
    const filename = `${user.id}-${timestamp}${extension}`;
    const filePath = path.join(uploadsDir, filename);

    // Save file
    const buffer = await file.arrayBuffer();
    fs.writeFileSync(filePath, Buffer.from(buffer));

    // Update user profile in database
    const profileImageUrl = `/uploads/profiles/${filename}`;
    await db.updateUserProfile(user.id, { profile_image: profileImageUrl });

    return NextResponse.json({
      success: true,
      profileImageUrl,
      message: "Profilbild erfolgreich hochgeladen",
    });
  } catch (error) {
    console.error("Profile upload error:", error);
    return NextResponse.json({ error: "Server-Fehler" }, { status: 500 });
  }
}
