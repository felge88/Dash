"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import ModuleCardEnhanced from "@/components/module-card-enhanced";
import AnimatedBackground from "@/components/animated-background";
import { Card, CardContent } from "@/components/ui/card";

interface Module {
  id: number;
  name: string;
  description: string;
  type: string;
  is_active: boolean;
  user_active: boolean;
  config: any;
  user_config: any;
  created_at: string;
}

export default function ModulesPage() {
  const [modules, setModules] = useState<Module[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchModules();
  }, []);

  const fetchModules = async () => {
    try {
      const response = await fetch("/api/modules");
      if (response.ok) {
        const data = await response.json();
        setModules(data.modules || []);
      }
    } catch (error) {
      console.error("Error fetching modules:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleModule = async (moduleId: number, isActive: boolean) => {
    try {
      const response = await fetch(`/api/modules/${moduleId}/toggle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: isActive }),
      });

      if (response.ok) {
        setModules((prev) =>
          prev.map((module) =>
            module.id === moduleId
              ? { ...module, user_active: isActive }
              : module
          )
        );
      }
    } catch (error) {
      console.error("Error toggling module:", error);
    }
  };

  const handleModuleClick = (moduleId: number) => {
    const module = modules.find((m) => m.id === moduleId);
    if (module) {
      const moduleSlug = module.name.toLowerCase().replace(/\s+/g, "-");
      router.push(`/dashboard/modules/${moduleSlug}`);
    }
  };

  if (isLoading) {
    return (
      <div className="relative">
        <AnimatedBackground variant="default" />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{
                duration: 1,
                repeat: Number.POSITIVE_INFINITY,
                ease: "linear",
              }}
              className="w-12 h-12 border-4 border-horror-accent border-t-transparent rounded-full mx-auto mb-4"
            />
            <p className="text-gray-400 text-lg">Module werden geladen...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 relative">
      <AnimatedBackground variant="default" />

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <motion.h1
          animate={{
            textShadow: [
              "0 0 20px rgba(0,255,65,0.8)",
              "0 0 30px rgba(0,255,65,1)",
              "0 0 20px rgba(0,255,65,0.8)",
            ],
          }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
          className="text-4xl font-bold text-horror-accent mb-2 glitch-text"
          data-text="MODULE"
        >
          MODULE
        </motion.h1>
        <p className="text-gray-400 text-lg">
          Wähle ein Modul aus, um es zu verwalten
        </p>
      </motion.div>

      {modules.length > 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          style={{ perspective: "1000px" }}
        >
          {modules.map((module, index) => (
            <motion.div
              key={module.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <ModuleCardEnhanced
                module={module}
                onToggle={handleToggleModule}
                onClick={handleModuleClick}
              />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <Card className="bg-horror-surface/80 border-horror-border backdrop-blur-sm">
          <CardContent className="text-center py-16">
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
              className="text-6xl mb-4"
            >
              🤖
            </motion.div>
            <p className="text-gray-400 text-xl mb-4">Keine Module verfügbar</p>
            <p className="text-sm text-gray-500">
              Kontaktiere den Administrator, um Zugriff auf Module zu erhalten.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
