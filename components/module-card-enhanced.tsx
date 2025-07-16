"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Settings, Activity } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"

interface ModuleCardProps {
  module: {
    id: number
    name: string
    description: string
    is_active: boolean
    script_path: string
  }
  onToggle: (moduleId: number, isActive: boolean) => void
  onConfigure?: (moduleId: number) => void
  onClick?: (moduleId: number) => void
}

const moduleConfig = {
  "Instagram Automation": {
    icon: "📸",
    color: "from-pink-500 to-red-500",
    glowColor: "rgba(255,64,129,0.5)",
  },
  "YouTube Downloader": {
    icon: "🎥",
    color: "from-purple-500 to-indigo-500",
    glowColor: "rgba(156,39,176,0.5)",
  },
  "Web Scraper": {
    icon: "🕷️",
    color: "from-orange-500 to-red-500",
    glowColor: "rgba(255,87,34,0.5)",
  },
  "Email Automation": {
    icon: "📧",
    color: "from-yellow-500 to-orange-500",
    glowColor: "rgba(255,193,7,0.5)",
  },
  "Social Media Monitor": {
    icon: "👁️",
    color: "from-pink-500 to-purple-500",
    glowColor: "rgba(233,30,99,0.5)",
  },
  "Content Generator": {
    icon: "✨",
    color: "from-green-500 to-teal-500",
    glowColor: "rgba(76,175,80,0.5)",
  },
}

export default function ModuleCardEnhanced({ module, onToggle, onConfigure, onClick }: ModuleCardProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const config = moduleConfig[module.name as keyof typeof moduleConfig] || {
    icon: "🤖",
    color: "from-gray-500 to-gray-600",
    glowColor: "rgba(0,255,65,0.5)",
  }

  const handleToggle = async () => {
    setIsLoading(true)
    try {
      await onToggle(module.id, !module.is_active)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCardClick = () => {
    if (onClick) {
      onClick(module.id)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{
        scale: 1.05,
        rotateY: 10,
        z: 50,
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="relative cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Hologram Effect */}
      <motion.div
        animate={{
          opacity: isHovered ? 1 : 0,
          scale: isHovered ? 1.1 : 1,
        }}
        className="absolute inset-0 rounded-lg"
        style={{
          background: `linear-gradient(45deg, ${config.glowColor}, transparent, ${config.glowColor})`,
          filter: "blur(20px)",
          zIndex: -1,
        }}
      />

      <Card
        className={cn(
          "bg-horror-surface/90 border-horror-border h-full backdrop-blur-sm transition-all duration-500",
          "hover:border-opacity-100 relative overflow-hidden",
        )}
        style={{
          borderColor: isHovered ? config.glowColor : undefined,
          boxShadow: isHovered ? `0 0 30px ${config.glowColor}` : undefined,
        }}
      >
        {/* Animated Background Gradient */}
        <motion.div
          animate={{
            opacity: isHovered ? 0.1 : 0,
            scale: isHovered ? 1 : 0.8,
          }}
          className={cn("absolute inset-0 bg-gradient-to-br", config.color)}
        />

        {/* Holographic Lines */}
        <motion.div
          animate={{
            opacity: isHovered ? 0.3 : 0,
            x: isHovered ? [0, 100, 0] : 0,
          }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0"
          style={{ transform: "skewX(-45deg)" }}
        />

        <CardHeader className="pb-3 relative z-10">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <motion.div
                animate={{
                  rotate: module.is_active ? 360 : 0,
                  scale: isHovered ? 1.2 : 1,
                }}
                transition={{
                  rotate: { duration: 2, repeat: module.is_active ? Number.POSITIVE_INFINITY : 0, ease: "linear" },
                  scale: { duration: 0.3 },
                }}
                className="text-4xl"
              >
                {config.icon}
              </motion.div>
              <div>
                <CardTitle className="text-xl font-bold text-white mb-1">{module.name}</CardTitle>
                <p className="text-sm text-gray-400">{module.description}</p>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0 relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <motion.div
                animate={{
                  scale: module.is_active ? [1, 1.3, 1] : 1,
                  boxShadow: module.is_active
                    ? [`0 0 0 ${config.glowColor}`, `0 0 20px ${config.glowColor}`, `0 0 0 ${config.glowColor}`]
                    : "0 0 0 rgba(0,0,0,0)",
                }}
                transition={{ duration: 1, repeat: module.is_active ? Number.POSITIVE_INFINITY : 0 }}
                className={cn("w-3 h-3 rounded-full", module.is_active ? "bg-white" : "bg-gray-500")}
              />
              <span className="text-sm font-medium text-white">{module.is_active ? "AKTIV" : "INAKTIV"}</span>
            </div>
          </div>

          <div className="flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3">
              <Switch
                checked={module.is_active}
                onCheckedChange={handleToggle}
                disabled={isLoading}
                className="data-[state=checked]:bg-horror-accent"
              />
              <span className="text-sm text-gray-400">{module.is_active ? "Stoppen" : "Starten"}</span>
            </div>

            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:text-horror-accent"
                onClick={(e) => {
                  e.stopPropagation()
                  console.log("Logs für", module.name)
                }}
              >
                <Activity size={16} />
              </Button>
              {onConfigure && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation()
                    onConfigure(module.id)
                  }}
                  className="text-gray-400 hover:text-horror-accent"
                >
                  <Settings size={16} />
                </Button>
              )}
            </div>
          </div>

          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-3 flex items-center gap-2 text-horror-accent"
            >
              <div className="w-4 h-4 border-2 border-horror-accent border-t-transparent rounded-full animate-spin" />
              <span className="text-sm">Wird verarbeitet...</span>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
