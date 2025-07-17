#!/bin/bash
# Development Server Starter Script für Bash
# Dieses Skript startet den Development Server

echo "🚀 Starte Automation Dashboard Development Server..."
echo ""

# Prüfe Node.js Installation
if command -v node &> /dev/null; then
    nodeVersion=$(node --version)
    echo "✅ Node.js gefunden: $nodeVersion"
else
    echo "❌ Node.js nicht gefunden. Bitte installieren Sie Node.js von https://nodejs.org"
    exit 1
fi

# Installiere pnpm falls nicht vorhanden
if command -v pnpm &> /dev/null; then
    pnpmVersion=$(pnpm --version)
    echo "✅ pnpm gefunden: $pnpmVersion"
else
    echo "📦 Installiere pnpm..."
    npm install -g pnpm
fi

# Installiere Dependencies
echo "📦 Installiere Dependencies..."
pnpm install

# Initialisiere Datenbank
echo "🗄️ Initialisiere Datenbank..."
if [ -f "scripts/init-db-new.js" ]; then
    node scripts/init-db-new.js
else
    echo "⚠️ Datenbank-Initialisierungsscript nicht gefunden"
fi

# Starte Development Server
echo ""
echo "🌐 Starte Development Server auf http://localhost:3000"
echo "   Drücken Sie Ctrl+C zum Stoppen"
echo ""

pnpm dev
