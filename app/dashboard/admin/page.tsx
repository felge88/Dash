"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminPanel from "./admin-panel";

interface User {
  id: number;
  username: string;
  email: string;
  is_admin: boolean;
  created_at: string;
}

interface Module {
  id: number;
  name: string;
  description: string;
  command: string;
  is_active: boolean;
}

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function loadData() {
      try {
        // Check if user is admin
        const profileResponse = await fetch("/api/profile");
        if (!profileResponse.ok) {
          router.push("/dashboard");
          return;
        }

        const user = await profileResponse.json();
        if (!user.is_admin) {
          router.push("/dashboard");
          return;
        }

        // Load users and modules
        const [usersResponse, modulesResponse] = await Promise.all([
          fetch("/api/admin/users"),
          fetch("/api/admin/modules"),
        ]);

        if (usersResponse.ok) {
          const usersData = await usersResponse.json();
          setUsers(usersData);
        }

        if (modulesResponse.ok) {
          const modulesData = await modulesResponse.json();
          setModules(modulesData);
        }

        setLoading(false);
      } catch (err) {
        console.error("Admin page error:", err);
        setError("Fehler beim Laden der Admin-Daten");
        setLoading(false);
      }
    }

    loadData();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-white">Lade Admin-Daten...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-red-400">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Administration</h1>
        <p className="text-gray-400">Benutzer- und Modulverwaltung</p>
      </div>

      <AdminPanel initialUsers={users} initialModules={modules} />
    </div>
  );
}
