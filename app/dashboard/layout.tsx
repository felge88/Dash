import type React from "react"
import { Suspense } from "react"
import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import Sidebar from "@/components/sidebar"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()
  if (!user) redirect("/login")

  return (
    <div className="flex min-h-screen bg-horror-bg sidebar-expanded" id="dashboard-layout">
      <Suspense fallback={<p className="px-4 py-2 text-gray-400">Lade Sidebar…</p>}>
        <Sidebar />
      </Suspense>

      <main id="main-content" className="flex-1 p-8 transition-all duration-300" style={{ marginLeft: "256px" }}>
        <Suspense fallback={<p className="text-gray-400">Lade Dashboard…</p>}>{children}</Suspense>
      </main>
    </div>
  )
}
