"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Youtube, Download, Music, Trash2, Archive, Play } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import AnimatedBackground from "@/components/animated-background"

interface DownloadItem {
  id: number
  title: string
  url: string
  format: string
  status: "pending" | "downloading" | "completed" | "error"
  progress: number
  size?: string
}

export default function YouTubeDownloaderPage() {
  const [urls, setUrls] = useState("")
  const [format, setFormat] = useState("mp3")
  const [downloads, setDownloads] = useState<DownloadItem[]>([
    {
      id: 1,
      title: "Amazing Song - Artist Name",
      url: "https://youtube.com/watch?v=example1",
      format: "mp3",
      status: "completed",
      progress: 100,
      size: "4.2 MB",
    },
    {
      id: 2,
      title: "Cool Video Title",
      url: "https://youtube.com/watch?v=example2",
      format: "mp4",
      status: "downloading",
      progress: 67,
    },
  ])

  const [archive, setArchive] = useState([
    {
      id: 1,
      title: "Downloaded Song 1.mp3",
      size: "4.2 MB",
      downloadDate: "2024-01-15",
    },
    {
      id: 2,
      title: "Downloaded Song 2.mp3",
      size: "3.8 MB",
      downloadDate: "2024-01-14",
    },
  ])

  const handleStartDownload = () => {
    const urlList = urls.split("\n").filter((url) => url.trim())
    const newDownloads = urlList.map((url, index) => ({
      id: Date.now() + index,
      title: `Lade Titel... (${url.substring(0, 30)}...)`,
      url: url.trim(),
      format,
      status: "pending" as const,
      progress: 0,
    }))

    setDownloads((prev) => [...prev, ...newDownloads])
    setUrls("")

    // Simulate download progress
    newDownloads.forEach((download) => {
      setTimeout(() => {
        setDownloads((prev) => prev.map((d) => (d.id === download.id ? { ...d, status: "downloading" } : d)))

        const progressInterval = setInterval(() => {
          setDownloads((prev) => {
            const updated = prev.map((d) => {
              if (d.id === download.id && d.progress < 100) {
                return { ...d, progress: d.progress + Math.random() * 20 }
              }
              return d
            })

            const current = updated.find((d) => d.id === download.id)
            if (current && current.progress >= 100) {
              clearInterval(progressInterval)
              return updated.map((d) =>
                d.id === download.id
                  ? { ...d, status: "completed", progress: 100, size: `${(Math.random() * 5 + 2).toFixed(1)} MB` }
                  : d,
              )
            }

            return updated
          })
        }, 500)
      }, 1000)
    })
  }

  const handleDeleteDownload = (id: number) => {
    setDownloads((prev) => prev.filter((d) => d.id !== id))
  }

  const handleDeleteArchiveItem = (id: number) => {
    setArchive((prev) => prev.filter((item) => item.id !== id))
  }

  const handleClearArchive = () => {
    if (confirm("Alle Dateien aus dem Archiv löschen?")) {
      setArchive([])
    }
  }

  return (
    <div className="space-y-8 relative">
      <AnimatedBackground variant="youtube" />

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-4 mb-4">
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            className="p-3 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"
          >
            <Youtube className="w-8 h-8 text-white" />
          </motion.div>
          <div>
            <motion.h1
              animate={{
                textShadow: [
                  "0 0 20px rgba(156,39,176,0.8)",
                  "0 0 30px rgba(156,39,176,1)",
                  "0 0 20px rgba(156,39,176,0.8)",
                ],
              }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
              className="text-4xl font-bold text-purple-400 glitch-text"
              data-text="YOUTUBE DOWNLOADER"
            >
              YOUTUBE DOWNLOADER
            </motion.h1>
            <p className="text-gray-400 text-lg">Lade Videos und Musik von YouTube herunter</p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Download Interface */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
          <Card className="bg-horror-surface/80 border-purple-500/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-purple-400 flex items-center gap-2">
                <Download className="w-5 h-5" />
                Neuer Download
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-gray-300">YouTube URLs oder Songnamen</Label>
                <textarea
                  value={urls}
                  onChange={(e) => setUrls(e.target.value)}
                  className="w-full h-32 mt-2 p-3 bg-horror-bg border border-purple-500/30 rounded-md text-white placeholder-gray-400 resize-none focus:border-purple-400 focus:outline-none"
                  placeholder={`Gib hier YouTube-URLs oder Songnamen ein (eine pro Zeile):

https://youtube.com/watch?v=example1
https://youtube.com/watch?v=example2
Amazing Song - Artist Name
Cool Video Title`}
                />
              </div>

              <div>
                <Label className="text-gray-300">Format</Label>
                <Select value={format} onValueChange={setFormat}>
                  <SelectTrigger className="bg-horror-bg border-purple-500/30 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-horror-surface border-purple-500/30">
                    <SelectItem value="mp3">MP3 (Audio)</SelectItem>
                    <SelectItem value="mp4">MP4 (Video)</SelectItem>
                    <SelectItem value="wav">WAV (Audio)</SelectItem>
                    <SelectItem value="flac">FLAC (Audio)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleStartDownload}
                disabled={!urls.trim()}
                className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600"
              >
                <Download className="w-4 h-4 mr-2" />
                Download starten
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Active Downloads */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
          <Card className="bg-horror-surface/80 border-purple-500/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-purple-400 flex items-center gap-2">
                <Play className="w-5 h-5" />
                Aktive Downloads
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {downloads.length > 0 ? (
                  downloads.map((download) => (
                    <motion.div
                      key={download.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 bg-horror-bg/50 rounded-lg border border-purple-500/20"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-white text-sm font-medium truncate">{download.title}</p>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteDownload(download.id)}
                          className="text-gray-400 hover:text-red-400 h-6 w-6"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            download.status === "completed"
                              ? "bg-green-500/20 text-green-400"
                              : download.status === "downloading"
                                ? "bg-purple-500/20 text-purple-400"
                                : download.status === "error"
                                  ? "bg-red-500/20 text-red-400"
                                  : "bg-gray-500/20 text-gray-400"
                          }`}
                        >
                          {download.status === "completed"
                            ? "Fertig"
                            : download.status === "downloading"
                              ? "Lädt..."
                              : download.status === "error"
                                ? "Fehler"
                                : "Wartend"}
                        </span>
                        <span className="text-xs text-gray-400">{download.format.toUpperCase()}</span>
                        {download.size && <span className="text-xs text-gray-400">{download.size}</span>}
                      </div>
                      {download.status === "downloading" && (
                        <div className="w-full bg-horror-bg rounded-full h-2">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${download.progress}%` }}
                            className="bg-gradient-to-r from-purple-500 to-indigo-500 h-2 rounded-full"
                          />
                        </div>
                      )}
                    </motion.div>
                  ))
                ) : (
                  <p className="text-gray-400 text-center py-8">Keine aktiven Downloads</p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Archive */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card className="bg-horror-surface/80 border-purple-500/30 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-purple-400 flex items-center gap-2">
                <Archive className="w-5 h-5" />
                Archiv ({archive.length} Dateien)
              </CardTitle>
              <Button
                onClick={handleClearArchive}
                variant="ghost"
                className="text-gray-400 hover:text-red-400"
                disabled={archive.length === 0}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Alle löschen
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {archive.length > 0 ? (
                archive.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between p-3 bg-horror-bg/50 rounded-lg border border-purple-500/20"
                  >
                    <div className="flex items-center gap-3">
                      <Music className="w-4 h-4 text-purple-400" />
                      <div>
                        <p className="text-white text-sm font-medium">{item.title}</p>
                        <p className="text-xs text-gray-400">
                          {item.size} • {item.downloadDate}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" className="text-gray-400 hover:text-purple-400 h-8 w-8">
                        <Download className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteArchiveItem(item.id)}
                        className="text-gray-400 hover:text-red-400 h-8 w-8"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </motion.div>
                ))
              ) : (
                <p className="text-gray-400 text-center py-8">Archiv ist leer</p>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
