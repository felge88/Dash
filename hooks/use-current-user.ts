"use client"

import useSWR from "swr"

interface CurrentUser {
  id: number
  username: string
  is_admin: boolean
  profile_image?: string
}

const fetcher = (url: string) => fetch(url, { credentials: "include" }).then((res) => res.json())

export function useCurrentUser() {
  const { data, error, isLoading, mutate } = useSWR<CurrentUser>("/api/auth/me", fetcher)

  return {
    user: data,
    isLoading,
    isError: !!error,
    mutate,
  }
}
