import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { db } from "@/lib/database"
import AdminPanel from "./admin-panel"

export default async function AdminPage() {
  const user = await getCurrentUser()

  if (!user || !user.is_admin) {
    redirect("/dashboard")
  }

  const users = await db.getAllUsers()
  const modules = await db.getAllModules()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Administration</h1>
        <p className="text-gray-400">Benutzer- und Modulverwaltung</p>
      </div>

      <AdminPanel initialUsers={users} initialModules={modules} />
    </div>
  )
}
