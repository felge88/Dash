import type React from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import Sidebar from "@/components/sidebar";
import { Suspense } from "react";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen bg-horror-bg" id="dashboard-layout">
      {/* Sidebar (lazy) */}
      <Suspense
        fallback={<p className="text-gray-400 px-4 py-2">Lade&nbsp;Sidebar…</p>}
      >
        <Sidebar user={user} />
      </Suspense>

      {/* Main content - dynamically adjusted based on sidebar */}
      <main
        className="flex-1 p-8 transition-all duration-300"
        style={{ marginLeft: "256px" }}
        id="main-content"
      >
        <Suspense
          fallback={<p className="text-gray-400">Lade&nbsp;Dashboard…</p>}
        >
          {children}
        </Suspense>
      </main>
    </div>
  );
}
