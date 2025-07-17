# Development Server Starter Script
# Dieses Skript startet den Development Server

Write-Host "🚀 Starte Automation Dashboard Development Server..." -ForegroundColor Green
Write-Host ""

# Prüfe Node.js Installation
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js gefunden: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js nicht gefunden. Bitte installieren Sie Node.js von https://nodejs.org" -ForegroundColor Red
    exit 1
}

# Installiere pnpm falls nicht vorhanden
try {
    $pnpmVersion = pnpm --version
    Write-Host "✅ pnpm gefunden: $pnpmVersion" -ForegroundColor Green
} catch {
    Write-Host "📦 Installiere pnpm..." -ForegroundColor Yellow
    npm install -g pnpm
}

# Installiere Dependencies
Write-Host "📦 Installiere Dependencies..." -ForegroundColor Yellow
pnpm install

# Initialisiere Datenbank
Write-Host "🗄️ Initialisiere Datenbank..." -ForegroundColor Yellow
if (Test-Path "scripts/init-db-new.js") {
    node scripts/init-db-new.js
} else {
    Write-Host "⚠️ Datenbank-Initialisierungsscript nicht gefunden" -ForegroundColor Yellow
}

# Starte Development Server
Write-Host ""
Write-Host "🌐 Starte Development Server auf http://localhost:3000" -ForegroundColor Green
Write-Host "   Drücken Sie Ctrl+C zum Stoppen" -ForegroundColor Gray
Write-Host ""

pnpm dev
