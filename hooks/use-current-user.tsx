"use client"

import useSWR from "swr"

export interface CurrentUser {
  id: number
  username: string
  is_admin: boolean
  name?: string
  profile_image?: string
}

const fetcher = (url: string) =>
  fetch(url, { credentials: "include" }).then(async (r) => {
    const json = await r.json()
    if (!json.success) throw new Error(json.error ?? "Unknown error")
    return json.user as CurrentUser
  })

/**
 * Client helper to read the signed-in user without importing server-only code.
 */
export function useCurrentUser() {
  const { data, error, isLoading, mutate } = useSWR<CurrentUser>("/api/auth/me", fetcher)

  return {
    user: data,
    isLoading,
    isError: !!error,
    mutate,
  }
}
