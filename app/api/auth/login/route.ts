import { type NextRequest, NextResponse } from "next/server";
import { loginUser } from "@/lib/auth-new";
import database from "@/lib/database";

interface LoginRequest {
  username: string;
  password: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json();
    const { username, password } = body;

    // Validate input
    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: "Username and password are required" },
        { status: 400 }
      );
    }

    // Attempt login
    const result = await loginUser(username, password);

    if (!result) {
      // Log failed login attempt
      try {
        const user = await database.getUserByUsername(username);
        if (user) {
          await database.logActivity(
            user.id,
            "auth",
            "login_failed",
            "error",
            "Invalid password attempt"
          );
        }
      } catch (error) {
        // Silent fail for logging
      }

      return NextResponse.json(
        { success: false, error: "Invalid username or password" },
        { status: 401 }
      );
    }

    // Log successful login
    await database.logActivity(
      result.user.id,
      "auth",
      "login_success",
      "success",
      "User logged in successfully"
    );

    return NextResponse.json({
      success: true,
      user: {
        id: result.user.id,
        username: result.user.username,
        name: result.user.name,
        email: result.user.email,
        is_admin: result.user.is_admin,
        profile_image: result.user.profile_image,
      },
      token: result.token,
    });
  } catch (error) {
    console.error("Login API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
