"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

export default function Preloader() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 2500)

    return () => clearTimeout(timer)
  }, [])

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div initial={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }} className="preloader">
          <div className="preloader-content">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
              className="spinner"
            />
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
              className="loading-text glitch-text"
              data-text="SYSTEM LOADING"
            >
              SYSTEM LOADING
            </motion.div>
            <motion.div
              animate={{ width: ["0%", "100%"] }}
              transition={{ duration: 2, ease: "easeInOut" }}
              className="w-64 h-1 bg-horror-surface rounded-full overflow-hidden mx-auto mt-8"
            >
              <div className="h-full bg-horror-accent rounded-full" />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
