"use client"
import { SidebarProvider, Sidebar, SidebarTrigger } from "@/components/ui/sidebar"
import { Skeleton } from "@/components/ui/skeleton"

// new hook (see hooks/use-current-user.ts)
import { useCurrentUser } from "@/hooks/use-current-user"

const { user, isLoading } = useCurrentUser()

export const SidebarComponent = () => {
  return (
    <SidebarProvider>
      <Sidebar>
        {/* …your sidebar sections… */}
        <div className="px-4 py-2 text-sm text-white/60">
          {isLoading ? (
            <Skeleton className="h-4 w-24 bg-white/20" />
          ) : (
            <span>
              Angemeldet&nbsp;als&nbsp;
              <span className="font-semibold text-red-400">{user?.username}</span>
            </span>
          )}
        </div>
      </Sidebar>
      <SidebarTrigger />
    </SidebarProvider>
  )
}
