#!/bin/bash
# ===========================================
# 🚀 AUTOMATISCHE SERVER-INSTALLATION
# Führe diese Commands im VS Code SSH Terminal aus!
# ===========================================

echo "🚀 Starting Automation Dashboard Installation on Ubuntu Server..."
echo "================================================================="

# SCHRITT 1: System prüfen
echo "📊 System Information:"
whoami
pwd
uname -a
echo ""

# SCHRITT 2: Setup-Script herunterladen
echo "📥 Downloading setup script..."
wget -O setup-server.sh https://raw.githubusercontent.com/felge88/Dash/Blaster/setup-server.sh
chmod +x setup-server.sh

# SCHRITT 3: System-Installation starten
echo "🔧 Starting automated system setup..."
sudo ./setup-server.sh

echo "✅ System setup completed!"
echo ""

# SCHRITT 4: Projekt deployment vorbereiten
echo "📦 Preparing project deployment..."
sudo mkdir -p /opt/automation-dashboard
sudo chown $USER:$USER /opt/automation-dashboard
cd /opt/automation-dashboard

# SCHRITT 5: Repository klonen
echo "📥 Cloning repository..."
git clone https://github.com/felge88/Dash.git .
git checkout Blaster

# SCHRITT 6: Environment konfigurieren
echo "⚙️ Setting up environment..."
cp .env.example .env

# Automatische .env Konfiguration
cat > .env << 'ENV_EOF'
# Database
DATABASE_URL=./data/database.sqlite

# JWT Authentication (WICHTIG: In Production ändern!)
JWT_SECRET=IhrSuperGeheimesJWTSchlüsselMindestens32ZeichenLang123456789

# Server Configuration
PORT=3000
NODE_ENV=production
HOSTNAME=0.0.0.0

# External APIs (Optional - später konfigurieren)
INSTAGRAM_CLIENT_ID=your-instagram-client-id
INSTAGRAM_CLIENT_SECRET=your-instagram-client-secret
YOUTUBE_API_KEY=your-youtube-api-key
OPENAI_API_KEY=your-openai-api-key

# File Storage
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS
CORS_ORIGIN=http://194.164.62.92:3000

# Security
BCRYPT_ROUNDS=12
SESSION_TIMEOUT=86400000

# Automation
ENABLE_CRON_JOBS=true
INSTAGRAM_AUTO_POST=false
YOUTUBE_AUTO_CLEANUP=true
ENV_EOF

# SCHRITT 7: Verzeichnisse erstellen
echo "📁 Creating directories..."
mkdir -p data uploads logs
mkdir -p uploads/{profiles,instagram,youtube}

# SCHRITT 8: Docker Container starten
echo "🐳 Starting Docker containers..."
docker-compose up -d

# SCHRITT 9: Status prüfen
echo "📊 Checking status..."
sleep 5
docker-compose ps
echo ""

# SCHRITT 10: Health Check
echo "🏥 Health check..."
sleep 10
curl -f http://localhost:3000/api/health || echo "Health check pending..."

echo ""
echo "================================================================="
echo "🎉 INSTALLATION COMPLETED!"
echo "================================================================="
echo ""
echo "✅ Dashboard URL: http://194.164.62.92:3000"
echo "✅ Login: admin / admin123 (SOFORT ÄNDERN!)"
echo ""
echo "📊 Status Commands:"
echo "   docker-compose ps              # Container Status"
echo "   docker-compose logs -f         # Live Logs"
echo "   sudo systemctl status nginx    # Nginx Status"
echo "   sudo ufw status                # Firewall Status"
echo ""
echo "🔧 Management Commands:"
echo "   docker-compose restart         # Restart Services"
echo "   docker-compose down            # Stop Services"
echo "   docker-compose up -d           # Start Services"
echo ""
echo "🌐 Access Dashboard:"
echo "   Direct: http://194.164.62.92:3000"
echo "   Nginx:  http://194.164.62.92"
echo ""
echo "⚠️  WICHTIG: Ändere sofort das Admin-Passwort nach dem ersten Login!"
