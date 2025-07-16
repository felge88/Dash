"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

const quotes = [
  "Der Erfolg ist die Summe kleiner Anstrengungen, die Tag für Tag wiederholt werden.",
  "Innovation unterscheidet zwischen einem Anführer und einem Nachfolger.",
  "Die Zukunft gehört denen, die an die Schönheit ihrer Träume glauben.",
  "Automatisierung ist nicht das Ende der Arbeit, sondern der Beginn der Kreativität.",
  "Code ist Poesie in Bewegung.",
  "Träume groß, starte klein, bewege dich schnell.",
  "Technologie ist am besten, wenn sie Menschen zusammenbringt.",
  "Die beste Zeit, einen Baum zu pflanzen, war vor 20 Jahren. Die zweitbeste Zeit ist jetzt.",
  "Perfektion ist nicht erreichbar, aber wenn wir nach Perfektion streben, können wir Exzellenz erreichen.",
  "Der einzige Weg, großartige Arbeit zu leisten, ist zu lieben, was du tust.",
]

export default function QuoteDisplay() {
  const [currentQuote, setCurrentQuote] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % quotes.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative h-16 flex items-center justify-center">
      <AnimatePresence mode="wait">
        <motion.p
          key={currentQuote}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="text-gray-400 text-center italic max-w-2xl px-4"
        >
          "{quotes[currentQuote]}"
        </motion.p>
      </AnimatePresence>
    </div>
  )
}
