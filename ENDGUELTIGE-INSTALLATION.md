# 🚀 ENDGÜLTIGE DASH-INSTALLATION 

## ⚡ 1-BEFEHL INSTALLATION

```bash
curl -fsSL https://raw.githubusercontent.com/felge88/Dash/Blaster/deploy-server.sh | bash
```

**Das war's! Nach 5-10 Minuten ist die Anwendung unter http://194.164.62.92 erreichbar.**

---

## 🔧 Bei Problemen: Manuelle Schritte

### STEP 1: System vorbereiten
```bash
sudo apt update && sudo apt install -y curl wget git nodejs npm nginx sqlite3
```

### STEP 2: Projekt setup
```bash
sudo mkdir -p /var/www/dash-automation
sudo chown -R $USER:$USER /var/www/dash-automation
cd /var/www/dash-automation
git clone https://github.com/felge88/Dash.git .
git checkout Blaster
```

### STEP 3: Dependencies KORREKT installieren
```bash
# WICHTIG: Korrigierte package.json verwenden
cp package-fixed.json package.json
cp next.config-fixed.js next.config.js

# Clean install
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### STEP 4: Environment & Database
```bash
cp .env.production .env.local
mkdir -p data
node scripts/init-db.js
```

### STEP 5: Build & Deploy
```bash
npm run build
npm install -g pm2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### STEP 6: Nginx Configuration
```bash
sudo cp nginx.conf /etc/nginx/sites-available/dash-automation
sudo ln -sf /etc/nginx/sites-available/dash-automation /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl restart nginx
```

---

## 🎯 Installation prüfen

1. **App Status**: `pm2 status` ✅
2. **Nginx Status**: `sudo systemctl status nginx` ✅  
3. **Website**: http://194.164.62.92 ✅
4. **Login**: admin / admin123 ✅

---

## 🆘 Schnelle Problem-Fixes

### Problem: "Cannot find module"
```bash
cd /var/www/dash-automation
npm install @radix-ui/react-avatar@^1.0.4 @radix-ui/react-progress@^1.0.3 @radix-ui/react-tabs@^1.0.4
pm2 restart dash-automation
```

### Problem: "Multer version not found"
```bash
npm install multer@1.4.4 @types/multer@^1.4.11
pm2 restart dash-automation
```

### Problem: "App directory not found"
```bash
ls -la app/
# Falls leer: git checkout HEAD -- app/
pm2 restart dash-automation
```

### Problem: Port bereits verwendet
```bash
sudo lsof -i :3000
sudo kill -9 <PID>
pm2 restart dash-automation
```

---

## 💡 Wichtige Punkte

✅ **Automatisches Script behebt ALLE bekannten Probleme**  
✅ **Korrigierte package.json mit richtigen Versionen**  
✅ **Next.js Config mit TypeScript-Ignore**  
✅ **PM2 mit automatischem Restart**  
✅ **Nginx mit Security Headers**  
✅ **SQLite Database Auto-Init**  

---

## 🚀 NACH DER INSTALLATION

1. **Admin-Passwort ändern** (wichtig!)
2. **Instagram API Credentials hinzufügen**
3. **SSL aktivieren**: `sudo certbot --nginx`
4. **Monitoring**: `pm2 monit`

**Fertig! Die Anwendung läuft produktionsbereit unter http://194.164.62.92** 🎉
