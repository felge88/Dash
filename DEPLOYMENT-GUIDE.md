# 🚀 Ubuntu 22.04 Server Installation Guide

## Automation Dashboard Deployment auf 194.164.62.92

### 📋 Voraussetzungen

- Frischer Ubuntu 22.04 Server
- Root oder sudo Zugriff
- Internet-Verbindung
- Domain/IP: 194.164.62.92

---

## 🔧 SCHRITT 1: System Updates & Basis-Software

```bash
# System aktualisieren
sudo apt update && sudo apt upgrade -y

# Basis-Tools installieren
sudo apt install -y curl wget git unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release

# Firewall konfigurieren
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 3000/tcp
sudo ufw status
```

---

## 🐳 SCHRITT 2: Docker Installation

```bash
# Docker GPG Key hinzufügen
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Docker Repository hinzufügen
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Docker installieren
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Docker Service starten
sudo systemctl start docker
sudo systemctl enable docker

# User zu Docker Gruppe hinzufügen
sudo usermod -aG docker $USER

# Docker Compose installieren
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Installation prüfen
docker --version
docker-compose --version
```

**🔄 WICHTIG: Jetzt neu einloggen oder Server neustarten!**

```bash
sudo reboot
```

---

## 📂 SCHRITT 3: Node.js Installation (Backup-Methode)

```bash
# NodeSource Repository hinzufügen
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -

# Node.js installieren
sudo apt install -y nodejs

# NPM Global Packages
sudo npm install -g pnpm pm2

# Versionen prüfen
node --version
npm --version
pnpm --version
pm2 --version
```

---

## 🗂️ SCHRITT 4: Projekt-Verzeichnis erstellen

```bash
# Arbeitsverzeichnis erstellen
sudo mkdir -p /opt/automation-dashboard
sudo chown $USER:$USER /opt/automation-dashboard
cd /opt/automation-dashboard

# Git Repository klonen (ersetze mit deiner Repository-URL)
git clone https://github.com/felge88/Dash.git .

# Oder: Dateien manuell hochladen via SCP/SFTP
# scp -r ./Dash/* user@194.164.62.92:/opt/automation-dashboard/
```

---

## ⚙️ SCHRITT 5: Environment Configuration

```bash
# .env Datei erstellen
cp .env.example .env

# .env bearbeiten
nano .env
```

**📝 .env Inhalt anpassen:**

```env
# Database
DATABASE_URL=./data/database.sqlite

# JWT Authentication
JWT_SECRET=IhrSuperGeheimesJWTSchlüsselMindestens32ZeichenLang123456789

# External APIs (Optional - können später hinzugefügt werden)
INSTAGRAM_CLIENT_ID=your-instagram-client-id
INSTAGRAM_CLIENT_SECRET=your-instagram-client-secret
YOUTUBE_API_KEY=your-youtube-api-key
OPENAI_API_KEY=your-openai-api-key

# Server Configuration
PORT=3000
NODE_ENV=production
HOSTNAME=0.0.0.0

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
```

---

## 🐳 SCHRITT 6: Docker Deployment (Empfohlen)

```bash
# Notwendige Verzeichnisse erstellen
mkdir -p data uploads logs
mkdir -p uploads/{profiles,instagram,youtube}

# Docker Compose starten
docker-compose up -d

# Logs überwachen
docker-compose logs -f

# Status prüfen
docker-compose ps
```

**✅ Dashboard ist jetzt verfügbar unter:** `http://194.164.62.92:3000`

---

## 🔄 SCHRITT 7: Alternative - Manuelle Installation

Falls Docker Probleme macht:

```bash
# Dependencies installieren
npm install

# Datenbank initialisieren
npm run db:init

# Application builden
npm run build

# PM2 für Production
pm2 start npm --name "automation-dashboard" -- start
pm2 startup
pm2 save

# PM2 Status prüfen
pm2 status
pm2 logs automation-dashboard
```

---

## 🌐 SCHRITT 8: Nginx Reverse Proxy (Optional aber empfohlen)

```bash
# Nginx installieren
sudo apt install -y nginx

# Nginx Konfiguration erstellen
sudo nano /etc/nginx/sites-available/automation-dashboard
```

**📝 Nginx Config:**

```nginx
server {
    listen 80;
    server_name 194.164.62.92;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Nginx Site aktivieren
sudo ln -s /etc/nginx/sites-available/automation-dashboard /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default

# Nginx testen und starten
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx
```

**✅ Dashboard jetzt verfügbar unter:** `http://194.164.62.92`

---

## 🔒 SCHRITT 9: SSL Certificate (Let's Encrypt)

Nur wenn du eine Domain hast:

```bash
# Certbot installieren
sudo snap install core; sudo snap refresh core
sudo snap install --classic certbot
sudo ln -s /snap/bin/certbot /usr/bin/certbot

# SSL Certificate beantragen (ersetze mit deiner Domain)
sudo certbot --nginx -d yourdomain.com

# Auto-Renewal testen
sudo certbot renew --dry-run
```

---

## 🔍 SCHRITT 10: System Monitoring & Logs

```bash
# System Status prüfen
sudo systemctl status docker
sudo systemctl status nginx

# Docker Logs
docker-compose logs -f

# PM2 Logs (wenn manuell installiert)
pm2 logs

# System Resources
htop
df -h
free -h

# Firewall Status
sudo ufw status

# Listening Ports
sudo netstat -tulpn | grep :3000
sudo netstat -tulpn | grep :80
```

---

## 🚨 SCHRITT 11: Troubleshooting

### Port 3000 nicht erreichbar:

```bash
# Port freigeben
sudo ufw allow 3000/tcp

# Process auf Port prüfen
sudo lsof -i :3000

# Docker Container prüfen
docker-compose ps
docker-compose logs automation-dashboard
```

### Docker Probleme:

```bash
# Docker neu starten
sudo systemctl restart docker

# Container neu builden
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Nginx Probleme:

```bash
# Nginx Status
sudo systemctl status nginx

# Nginx Logs
sudo tail -f /var/log/nginx/error.log

# Konfiguration testen
sudo nginx -t
```

### Database Probleme:

```bash
# Database neu initialisieren
docker-compose exec automation-dashboard npm run db:reset

# Oder manuell:
rm -f data/database.sqlite
npm run db:init
```

---

## ✅ SCHRITT 12: Erste Anmeldung

1. **Browser öffnen:** `http://194.164.62.92:3000` (oder Port 80 mit Nginx)
2. **Login-Daten:**
   - Username: `admin`
   - Password: `admin123`
3. **Sofort Passwort ändern!**

---

## 🔄 SCHRITT 13: Maintenance & Updates

```bash
# System Updates
sudo apt update && sudo apt upgrade -y

# Docker Images updaten
docker-compose pull
docker-compose up -d

# Logs rotieren
sudo logrotate -f /etc/logrotate.conf

# Backup Database
cp data/database.sqlite data/database.sqlite.backup.$(date +%Y%m%d)

# Cleanup alte Docker Images
docker system prune -f
```

---

## 📊 SCHRITT 14: Performance Monitoring

```bash
# htop installieren
sudo apt install -y htop

# System Monitoring
htop

# Disk Usage
df -h
du -sh /opt/automation-dashboard/*

# Memory Usage
free -h

# Docker Stats
docker stats
```

---

## 🎯 Zusammenfassung - Schnelle Installation:

```bash
# 1. System Setup
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget git docker.io docker-compose nginx

# 2. Docker Setup
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker $USER
sudo reboot

# 3. Project Setup
sudo mkdir -p /opt/automation-dashboard
sudo chown $USER:$USER /opt/automation-dashboard
cd /opt/automation-dashboard
git clone https://github.com/felge88/Dash.git .

# 4. Configuration
cp .env.example .env
nano .env  # JWT_SECRET und andere Werte anpassen

# 5. Start Application
docker-compose up -d

# 6. Access Dashboard
# http://194.164.62.92:3000
# Login: admin / admin123
```

**🎉 Fertig! Dashboard läuft auf http://194.164.62.92:3000**

---

## ⚠️ Wichtige Sicherheitshinweise:

1. **Passwort sofort ändern** nach erstem Login
2. **JWT_SECRET** mit starkem, zufälligem Schlüssel ersetzen
3. **Firewall** nur notwendige Ports öffnen
4. **SSL Certificate** für HTTPS verwenden
5. **Regelmäßige Backups** der Database
6. **System Updates** regelmäßig einspielen

**📧 Bei Problemen:** Logs prüfen und entsprechende Troubleshooting-Schritte befolgen!
