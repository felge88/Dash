# 🚀 Blaster - Komplette Installationsanleitung

## ✅ Alle Probleme wurden behoben!

### 🔧 Behobene Probleme:

1. **✅ Multer CVE**: Version auf `1.4.5-lts.1` korrigiert
2. **✅ Doppelte Pakete**: autoprefixer aus dependencies entfernt, sqlite dopplung bereinigt
3. **✅ pnpm-lock.yaml**: Bereits entfernt, nur npm-lock.json vorhanden
4. **✅ Projekt-Pfade**: Vereinheitlicht auf `/home/deploy/blaster`
5. **✅ PM2 Ecosystem**: Läuft aus Projektordner mit korrekten Pfaden
6. **✅ lib/database.ts**: Bereits vorhanden und funktionsfähig
7. **✅ init-db.js**: Korrekte Datei vorhanden und funktionsfähig
8. **✅ Cleanup Script**: Doppelte npm install entfernt
9. **✅ PM2 Logs**: Korrekte Pfade zu `/var/log/pm2`
10. **✅ Root-Ausführung**: Korrekt implementiert in root-install.sh

## 🎯 Installationsschritte:

### 1. **Frischer Ubuntu 22.04 Server**

```bash
# Als root einloggen
```

### 2. **Repository klonen**

```bash
git clone https://github.com/felge88/Dash.git
cd Dash
git checkout Blaster
```

### 3. **Root-Installation ausführen**

```bash
chmod +x root-install.sh
./root-install.sh
```

### 4. **Installation validieren**

```bash
# Als deploy user
su - deploy
cd /home/deploy/blaster
./validate-setup.sh
```

### 5. **Anwendung starten**

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## 📋 Projekt-Struktur:

```
/home/deploy/blaster/           # Hauptprojekt
├── database.sqlite             # SQLite Datenbank (root-level)
├── ecosystem.config.js         # PM2 Konfiguration
├── package.json               # Dependencies (bereinigt)
├── root-install.sh            # Root-Installation
├── validate-setup.sh          # System-Validierung
├── lib/database.ts            # Datenbank-Wrapper
├── scripts/init-db.js         # Datenbank-Initialisierung
└── /var/log/pm2/             # PM2 Logs
```

## 🔧 Wichtige Konfigurationen:

### **package.json**

- ✅ Multer: `1.4.5-lts.1` (CVE-sicher)
- ✅ Keine doppelten Pakete
- ✅ Korrekte devDependencies

### **PM2 Ecosystem**

- ✅ Logs in `/var/log/pm2/`
- ✅ Läuft aus Projektordner
- ✅ Korrekte Pfade

### **Datenbank**

- ✅ SQLite in `database.sqlite` (root-level)
- ✅ Automatische Initialisierung
- ✅ Korrekte Pfade in allen Scripts

## 🌐 Zugriff:

- **HTTP**: `http://server-ip`
- **HTTPS**: `https://domain.com` (mit SSL)
- **Logs**: `pm2 logs`
- **Status**: `pm2 status`

## 🛠️ Troubleshooting:

### **Installation fehlgeschlagen**

```bash
# Logs prüfen
tail -f /var/log/dash-installation.log

# Validierung ausführen
./validate-setup.sh
```

### **PM2 Probleme**

```bash
# PM2 neu starten
pm2 restart all
pm2 save

# Logs prüfen
pm2 logs
```

### **Datenbank Probleme**

```bash
# Datenbank neu initialisieren
rm -f database.sqlite
npm run db:init
```

## 🎉 Fertig!

Das System ist jetzt komplett installiert und betriebsbereit. Alle bekannten Probleme wurden behoben und die Installation erfolgt vollautomatisch.

### **Letzte Schritte:**

1. `./root-install.sh` ausführen
2. `./validate-setup.sh` zur Überprüfung
3. `pm2 status` für Status-Check
4. Browser öffnen und testen

**Viel Erfolg! 🚀**
