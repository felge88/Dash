import type React from "react"
import { Suspense } from "react"
import { getCurrentUser } from "@/lib/auth"
import Sidebar from "@/components/sidebar"
import { Toaster } from "@/components/ui/toaster"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  if (!user) {
    // Handle case where user is not logged in, e.g., redirect to login
    return null
  }

  return (
    <div id="dashboard-layout" className="flex min-h-screen bg-background">
      <Suspense fallback={<div>Loading Sidebar...</div>}>
        <Sidebar user={user} />
      </Suspense>
      <main id="main-content" className="flex-1 p-8 transition-all duration-300 ml-64">
        {children}
      </main>
      <Toaster />
    </div>
  )
}
