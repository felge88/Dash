# 🚀 STEP-BY-STEP: VS Code SSH + Automatische Installation

## 📋 VORBEREITUNG

1. **VS Code öffnen**
2. **Remote-SSH Extension** installiert haben
3. **SSH-Verbindung zu 194.164.62.92** eingerichtet

---

## 🔗 SCHRITT 1: Mit Server verbinden

### In VS Code:

```
Ctrl+Shift+P → "Remote-SSH: Connect to Host"
→ 194.164.62.92 auswählen
→ Linux auswählen
→ Passwort eingeben
```

### Terminal öffnen:

```
Ctrl+` (Backtick) → Neues Terminal
```

---

## ⚡ SCHRITT 2: Automatische Installation

### Im SSH-Terminal ausführen:

```bash
# 1. Setup-Script herunterladen
wget -O setup-server.sh https://raw.githubusercontent.com/felge88/Dash/Blaster/setup-server.sh
chmod +x setup-server.sh

# 2. Automatische System-Installation starten
sudo ./setup-server.sh

# 3. WARTEN bis Script fertig ist (ca. 5-10 Minuten)
# Falls Reboot erforderlich → Server startet neu
```

---

## 🔄 SCHRITT 3: Nach Reboot (falls nötig)

### Wieder mit SSH verbinden und fortfahren:

```bash
# 1. Zum Projekt-Verzeichnis
cd /opt/automation-dashboard

# 2. Repository klonen
git clone https://github.com/felge88/Dash.git .

# 3. Auf richtigen Branch wechseln
git checkout Blaster

# 4. Environment konfigurieren
cp .env.example .env

# 5. .env bearbeiten (KRITISCH!)
nano .env
```

### 📝 In nano ändern:

```env
JWT_SECRET=IhrSuperGeheimesJWTSchlüsselMindestens32ZeichenLang123456789
NODE_ENV=production
CORS_ORIGIN=http://194.164.62.92
DATABASE_URL=./data/database.sqlite
PORT=3000
```

### Speichern in nano:

```
Ctrl+X → Y → Enter
```

---

## 🐳 SCHRITT 4: Docker starten

```bash
# 1. Notwendige Ordner erstellen
mkdir -p data uploads logs
mkdir -p uploads/{profiles,instagram,youtube}

# 2. Docker Container starten
docker-compose up -d

# 3. Status prüfen
docker-compose ps

# 4. Logs verfolgen
docker-compose logs -f

# 5. Health Check
curl http://localhost:3000/api/health
```

---

## ✅ SCHRITT 5: Zugriff testen

### Dashboard öffnen:

- **Direkt:** http://194.164.62.92:3000
- **Mit Nginx:** http://194.164.62.92

### Login:

- **Username:** admin
- **Password:** admin123
- **⚠️ SOFORT ÄNDERN!**

---

## 🔧 TROUBLESHOOTING

### Docker läuft nicht:

```bash
sudo systemctl restart docker
docker-compose down
docker-compose up -d
```

### Port nicht erreichbar:

```bash
sudo ufw allow 3000/tcp
sudo netstat -tulpn | grep :3000
```

### Logs prüfen:

```bash
docker-compose logs automation-dashboard
sudo tail -f /var/log/nginx/error.log
```

### Nginx neu starten:

```bash
sudo systemctl restart nginx
sudo nginx -t
```

---

## 🎯 SCHNELL-COMMANDS (Alles auf einmal)

```bash
# Komplett-Installation in einem Durchgang:
wget -O setup-server.sh https://raw.githubusercontent.com/felge88/Dash/Blaster/setup-server.sh && \
chmod +x setup-server.sh && \
sudo ./setup-server.sh && \
cd /opt/automation-dashboard && \
git clone https://github.com/felge88/Dash.git . && \
cp .env.example .env && \
echo "🔧 Jetzt .env bearbeiten: nano .env" && \
echo "🚀 Dann starten: docker-compose up -d"
```

**⚠️ WICHTIG:** Nach dem Schnell-Command noch `.env` bearbeiten und `docker-compose up -d` ausführen!

---

## 📊 ÜBERWACHUNG

### System-Status:

```bash
htop                    # System Resources
df -h                   # Disk Usage
free -h                 # Memory Usage
docker stats            # Container Stats
sudo ufw status         # Firewall Status
```

### Service-Status:

```bash
sudo systemctl status docker
sudo systemctl status nginx
docker-compose ps
```

**🎉 Nach erfolgreicher Installation ist dein Dashboard unter http://194.164.62.92 erreichbar!**
