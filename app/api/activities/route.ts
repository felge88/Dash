import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import db from "@/lib/database";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    }

    // Get recent activities for the user
    const activities = await db.getRecentActivities(user.id, 10);

    // Parse and enhance activity data
    const enhancedActivities = activities.map(activity => {
      let metadata = {};
      try {
        metadata = JSON.parse(activity.metadata || '{}');
      } catch (e) {
        metadata = {};
      }

      return {
        id: activity.id,
        action: activity.action,
        module_type: activity.module_type,
        status: activity.status,
        message: activity.message,
        metadata,
        created_at: activity.created_at,
        // Format for display
        display_time: new Date(activity.created_at).toLocaleString('de-DE'),
        display_action: getDisplayAction(activity.action, activity.module_type),
      };
    });

    return NextResponse.json({
      activities: enhancedActivities,
      summary: {
        total_activities: activities.length,
        last_login: getLastLogin(activities),
        last_logout: getLastLogout(activities),
      }
    });
  } catch (error) {
    console.error("Error fetching activities:", error);
    return NextResponse.json({ error: "Server-Fehler" }, { status: 500 });
  }
}

function getDisplayAction(action: string, moduleType: string): string {
  const actionMap: { [key: string]: string } = {
    'login': 'Anmeldung',
    'logout': 'Abmeldung',
    'toggle': 'Modul umgeschaltet',
    'profile_update': 'Profil aktualisiert',
    'password_change': 'Passwort geändert',
  };

  const moduleMap: { [key: string]: string } = {
    'auth': 'Authentifizierung',
    'profile': 'Profil',
    'instagram': 'Instagram',
    'youtube': 'YouTube',
    'admin': 'Administration',
  };

  const actionText = actionMap[action] || action;
  const moduleText = moduleMap[moduleType] || moduleType;

  return `${actionText} - ${moduleText}`;
}

function getLastLogin(activities: any[]): string | null {
  const loginActivity = activities.find(a => a.action === 'login' && a.status === 'success');
  return loginActivity ? new Date(loginActivity.created_at).toLocaleString('de-DE') : null;
}

function getLastLogout(activities: any[]): string | null {
  const logoutActivity = activities.find(a => a.action === 'logout');
  return logoutActivity ? new Date(logoutActivity.created_at).toLocaleString('de-DE') : null;
}
