"use client"

import { motion } from "framer-motion"

interface AnimatedBackgroundProps {
  variant?: "default" | "instagram" | "youtube" | "email" | "scraper" | "monitor" | "generator"
}

const colorVariants = {
  default: {
    primary: "rgba(0,255,65,0.1)",
    secondary: "rgba(0,255,65,0.05)",
  },
  instagram: {
    primary: "rgba(255,64,129,0.1)",
    secondary: "rgba(255,64,129,0.05)",
  },
  youtube: {
    primary: "rgba(156,39,176,0.1)",
    secondary: "rgba(156,39,176,0.05)",
  },
  email: {
    primary: "rgba(255,193,7,0.1)",
    secondary: "rgba(255,193,7,0.05)",
  },
  scraper: {
    primary: "rgba(255,87,34,0.1)",
    secondary: "rgba(255,87,34,0.05)",
  },
  monitor: {
    primary: "rgba(233,30,99,0.1)",
    secondary: "rgba(233,30,99,0.05)",
  },
  generator: {
    primary: "rgba(76,175,80,0.1)",
    secondary: "rgba(76,175,80,0.05)",
  },
}

export default function AnimatedBackground({ variant = "default" }: AnimatedBackgroundProps) {
  const colors = colorVariants[variant]

  return (
    <div className="fixed inset-0 -z-10">
      <div className="absolute inset-0 bg-gradient-to-br from-horror-bg via-horror-surface to-horror-bg" />
      <motion.div
        animate={{
          background: [
            `radial-gradient(circle at 20% 50%, ${colors.primary} 0%, transparent 50%)`,
            `radial-gradient(circle at 80% 50%, ${colors.primary} 0%, transparent 50%)`,
            `radial-gradient(circle at 50% 20%, ${colors.primary} 0%, transparent 50%)`,
            `radial-gradient(circle at 50% 80%, ${colors.primary} 0%, transparent 50%)`,
          ],
        }}
        transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
        className="absolute inset-0"
      />
      <motion.div
        animate={{
          background: [
            `radial-gradient(circle at 70% 30%, ${colors.secondary} 0%, transparent 40%)`,
            `radial-gradient(circle at 30% 70%, ${colors.secondary} 0%, transparent 40%)`,
            `radial-gradient(circle at 80% 80%, ${colors.secondary} 0%, transparent 40%)`,
            `radial-gradient(circle at 20% 20%, ${colors.secondary} 0%, transparent 40%)`,
          ],
        }}
        transition={{ duration: 12, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
        className="absolute inset-0"
      />
    </div>
  )
}
