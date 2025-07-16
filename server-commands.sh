#!/bin/bash
# ===========================================
# 🚀 KOMPLETTE AUTOMATISCHE SERVER-INSTALLATION
# Führe diese Commands auf deinem Ubuntu Server aus!
# ===========================================

echo "🚀 Starting Automation Dashboard Installation..."
echo "============================================="

# SCHRITT 1: Setup-Script herunterladen
echo "📥 Downloading setup script..."
wget -O setup-server.sh https://raw.githubusercontent.com/felge88/Dash/Blaster/setup-server.sh
chmod +x setup-server.sh

# SCHRITT 2: Automatische System-Installation
echo "🔧 Running automated setup..."
sudo ./setup-server.sh

echo "⏳ Waiting for reboot... (if prompted, reboot and continue with next steps)"
echo ""
echo "NACH DEM REBOOT - Führe diese Commands aus:"
echo "=========================================="

# SCHRITT 3: Projekt klonen und konfigurieren
cat << 'EOF'

# 1. Zum Projekt-Verzeichnis wechseln
cd /opt/automation-dashboard

# 2. Git Repository klonen
git clone https://github.com/felge88/Dash.git .

# 3. Branch wechseln (falls nötig)
git checkout Blaster

# 4. Environment konfigurieren
cp .env.example .env

# 5. .env Datei bearbeiten (WICHTIG!)
nano .env

# In nano ändern:
# JWT_SECRET=IhrSuperGeheimesJWTSchlüsselMindestens32ZeichenLang123456789
# NODE_ENV=production
# CORS_ORIGIN=http://194.164.62.92

# 6. Docker Container starten
docker-compose up -d

# 7. Status prüfen
docker-compose ps
docker-compose logs -f

# 8. Dashboard testen
curl http://localhost:3000/api/health

EOF

echo ""
echo "✅ Setup-Script bereit!"
echo "Führe jetzt aus: sudo ./setup-server.sh"
