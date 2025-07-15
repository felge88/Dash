# Automation Dashboard

Eine moderne, private Automatisierungs-Plattform für 3-4 Benutzer mit Horror-Theme Design.

## Features

- 🎨 **Modernes Horror-Theme** - Dunkles Design mit Neon-Akzenten
- 🔐 **Sichere Authentifizierung** - JWT-basierte Anmeldung
- 🤖 **Modulares System** - Erweiterbar für verschiedene Automatisierungen
- 📊 **Statistik-Dashboard** - Übersicht über Modul-Performance
- 👑 **Admin-Panel** - Benutzerverwaltung und Modulfreigabe
- 📱 **Responsive Design** - Funktioniert auf allen Geräten

## Installation

### Mit Docker (Empfohlen)

\`\`\`bash
# Repository klonen
git clone <repository-url>
cd automation-dashboard

# Mit Docker Compose starten
docker-compose up -d
\`\`\`

### Manuell

\`\`\`bash
# Dependencies installieren
npm install

# Datenbank initialisieren
npm run db:init

# Development Server starten
npm run dev

# Oder für Production
npm run build
npm start
\`\`\`

## Standard-Login

- **Benutzername:** admin
- **Passwort:** admin123

## Verfügbare Module

- 📸 **Instagram Automation** - Automatisierte Instagram-Aktionen
- 🎥 **YouTube Downloader** - YouTube Videos herunterladen
- 🕷️ **Web Scraper** - Automatisiertes Web-Scraping
- 📧 **Email Automation** - E-Mail-Verarbeitung
- 👁️ **Social Media Monitor** - Social Media Überwachung
- ✨ **Content Generator** - Content-Generierung

## Deployment auf Debian Server

\`\`\`bash
# Docker installieren
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Docker Compose installieren
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Projekt deployen
git clone <repository-url>
cd automation-dashboard
docker-compose up -d
\`\`\`

## Entwicklung

\`\`\`bash
# Development Server
npm run dev

# Datenbank zurücksetzen
rm data/database.sqlite
npm run db:init

# Build für Production
npm run build
\`\`\`

## Lizenz

Private Nutzung - Alle Rechte vorbehalten
