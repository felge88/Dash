import type React from "react"
import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import Sidebar from "@/components/sidebar"
import { Suspense } from "react"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="flex min-h-screen bg-horror-bg">
      <Suspense fallback={<div className="w-64 bg-horror-surface border-r border-horror-border" />}>
        <Sidebar user={user} />
      </Suspense>
      <main className="flex-1 ml-64 p-8">
        <Suspense fallback={<p className="text-gray-400">Lade&nbsp;Dashboard…</p>}>{children}</Suspense>
      </main>
    </div>
  )
}
