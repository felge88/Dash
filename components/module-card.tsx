"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Settings, Activity } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { cn, getStatusColor } from "@/lib/utils"

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
}

const moduleIcons: { [key: string]: string } = {
  "Instagram Automation": "📸",
  "YouTube Downloader": "🎥",
  "Web Scraper": "🕷️",
  "Email Automation": "📧",
  "Social Media Monitor": "👁️",
  "Content Generator": "✨",
}

export default function ModuleCard({ module, onToggle, onConfigure }: ModuleCardProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleToggle = async () => {
    setIsLoading(true)
    try {
      await onToggle(module.id, !module.is_active)
    } finally {
      setIsLoading(false)
    }
  }

  const icon = moduleIcons[module.name] || "🤖"

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, rotateY: 5 }}
      className="module-card group cursor-pointer"
    >
      <Card className="bg-transparent border-horror-border h-full">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ rotate: module.is_active ? 360 : 0 }}
                transition={{ duration: 2, repeat: module.is_active ? Number.POSITIVE_INFINITY : 0, ease: "linear" }}
                className="text-3xl"
              >
                {icon}
              </motion.div>
              <div>
                <CardTitle className="text-lg font-bold text-white mb-1">{module.name}</CardTitle>
                <p className="text-sm text-gray-400">{module.description}</p>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="flex items-center justify-between mb-4">
            <div className={cn("flex items-center gap-2", getStatusColor(module.is_active ? "active" : "inactive"))}>
              <motion.div
                animate={{ scale: module.is_active ? [1, 1.2, 1] : 1 }}
                transition={{ duration: 1, repeat: module.is_active ? Number.POSITIVE_INFINITY : 0 }}
                className={cn(
                  "w-3 h-3 rounded-full",
                  module.is_active ? "bg-horror-accent shadow-lg shadow-horror-accent/50" : "bg-gray-500",
                )}
              />
              <span className="text-sm font-medium">{module.is_active ? "AKTIV" : "INAKTIV"}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
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
                onClick={() => console.log("Logs für", module.name)}
              >
                <Activity size={16} />
              </Button>
              {onConfigure && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onConfigure(module.id)}
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
