"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Preloader from "@/components/preloader"

export default function HomePage() {
  const [showPreloader, setShowPreloader] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowPreloader(false)
      router.push("/login")
    }, 3000)

    return () => clearTimeout(timer)
  }, [router])

  return <div>{showPreloader && <Preloader />}</div>
}
