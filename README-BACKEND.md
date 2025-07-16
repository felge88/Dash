# 🤖 Automation Dashboard - Horror Theme

Ein vollständiges **Node.js/Next.js Backend** für ein **Automation Dashboard** mit **Horror-Theme UI**. Das System bietet Instagram-Automatisierung, YouTube-Downloads und umfassendes Benutzer-Management.

## 🎯 Features

### 🔐 **Authentication & User Management**

- JWT-basierte Authentifizierung
- Benutzer- und Admin-Rollen
- Sichere Passwort-Hashing (bcrypt)
- Session-Management

### 📱 **Instagram Integration**

- Account-Verbindung und -Management
- Automatische Content-Generierung (OpenAI)
- Post-Scheduling und Approval-Workflow
- Live-Statistiken und Engagement-Tracking
- Hashtag-Generierung

### 📺 **YouTube Downloader**

- Multi-URL/Batch-Downloads
- Unterstützte Formate: MP3, MP4, WAV, FLAC
- Real-time Progress-Tracking
- Archiv-Management mit Storage-Überwachung
- Automatische Cleanup-Jobs

### 📊 **Analytics & Monitoring**

- Real-time Dashboard-Statistiken
- Aktivitäts-Logs und Performance-Metriken
- Benutzer-spezifische Insights
- System-Health-Monitoring

### ⚙️ **Automation & Scheduling**

- Cron-Job-System für zeitgesteuerte Aufgaben
- Automatische Content-Generierung
- Scheduled Posts und Cleanup-Tasks
- Background-Job-Processing

## 🚀 Quick Start

### **Voraussetzungen**

- Node.js 18+
- npm oder pnpm
- Git

### **Installation**

1. **Repository klonen**

```bash
git clone <repository-url>
cd Dash
```

2. **Dependencies installieren**

```bash
npm install
# oder
pnpm install
```

3. **Environment konfigurieren**

```bash
cp .env.example .env
```

Bearbeite `.env` und füge deine API-Keys hinzu:

```env
JWT_SECRET=your-super-secret-jwt-key-change-in-production
INSTAGRAM_CLIENT_ID=your-instagram-client-id
INSTAGRAM_CLIENT_SECRET=your-instagram-client-secret
YOUTUBE_API_KEY=your-youtube-api-key
OPENAI_API_KEY=your-openai-api-key
```

4. **Datenbank initialisieren**

```bash
npm run db:init
```

5. **Development Server starten**

```bash
npm run dev
```

🎉 **Dashboard verfügbar unter:** `http://localhost:3000`

### **Standard-Login**

- **Username:** `admin`
- **Password:** `admin123`
- ⚠️ **Wichtig:** Passwort nach erstem Login ändern!

## 📁 Projektstruktur

```
📦 Dash/
├── 🔧 app/api/                 # API Routes
│   ├── auth/                   # Authentication APIs
│   ├── modules/                # Module Management
│   ├── instagram/              # Instagram Integration
│   ├── youtube/                # YouTube Downloader
│   ├── stats/                  # Analytics APIs
│   └── admin/                  # Admin-only APIs
├── 🎨 components/              # React Components
├── 📊 lib/                     # Core Libraries
│   ├── auth-new.ts            # Authentication Logic
│   ├── database.ts            # Database Operations
│   ├── services/              # Business Logic
│   │   ├── instagram.ts       # Instagram Service
│   │   └── youtube.ts         # YouTube Service
│   └── automation/            # Automation & Scheduling
├── 📁 data/                    # SQLite Database
├── 📁 uploads/                 # File Storage
│   ├── profiles/              # Profile Images
│   ├── instagram/             # Instagram Content
│   └── youtube/               # Downloaded Files
├── 🐳 docker-compose.yml       # Docker Configuration
├── 🔧 Dockerfile              # Docker Build
└── 📚 scripts/                 # Database Scripts
```

## 🔌 API Endpunkte

### **Authentication**

- `POST /api/auth/login` - Benutzer-Login
- `POST /api/auth/logout` - Benutzer-Logout
- `GET /api/auth/me` - Aktuelle Benutzer-Info

### **Module Management**

- `GET /api/modules` - Alle Module für Benutzer
- `POST /api/modules/{id}/toggle` - Modul aktivieren/deaktivieren

### **Instagram**

- `POST /api/instagram/connect` - Account verbinden
- `GET /api/instagram/accounts` - Verbundene Accounts
- `GET /api/instagram/accounts/{id}/stats` - Live-Statistiken
- `POST /api/instagram/automation/configure` - Automatisierung konfigurieren
- `POST /api/instagram/generate-content` - Content generieren
- `GET /api/instagram/posts/pending` - Posts zur Genehmigung
- `POST /api/instagram/posts/{id}/approve` - Post genehmigen

### **YouTube**

- `POST /api/youtube/download` - Download starten
- `GET /api/youtube/download` - Aktive Downloads
- `DELETE /api/youtube/download/{id}` - Download löschen
- `GET /api/youtube/download/{id}/file` - Datei herunterladen

### **Statistics**

- `GET /api/stats/dashboard` - Dashboard-Statistiken
- `GET /api/stats/activities` - Letzte Aktivitäten

## 🗄️ Datenbank Schema

### **Kern-Tabellen**

- `users` - Benutzer-Verwaltung
- `modules` - Verfügbare Module
- `user_modules` - Benutzer-Modul-Berechtigungen
- `activity_logs` - Aktivitäts-Protokolle

### **Instagram-Tabellen**

- `instagram_accounts` - Verbundene Accounts
- `instagram_automation` - Automatisierungs-Konfiguration
- `instagram_posts` - Generierte Posts

### **YouTube-Tabellen**

- `youtube_downloads` - Download-Verwaltung

## ⚙️ Automatisierung

### **Cron Jobs**

- **Alle 15 Min:** Geplante Posts prüfen und veröffentlichen
- **Täglich 6:00:** Instagram-Statistiken synchronisieren
- **Stündlich:** Automatische Content-Generierung
- **Täglich 2:00:** Alte Logs bereinigen
- **Täglich 3:00:** Alte Downloads bereinigen

### **Content-Generierung**

- OpenAI-Integration für automatische Post-Erstellung
- Custom Prompts und Topic-basierte Generierung
- Hashtag-Generierung und Optimierung
- Approval-Workflow für Qualitätskontrolle

## 🐳 Docker Deployment

### **Development**

```bash
docker-compose up -d
```

### **Production Build**

```bash
docker build -t automation-dashboard .
docker run -d \
  --name dashboard \
  -p 3000:3000 \
  -v $(pwd)/data:/app/data \
  -v $(pwd)/uploads:/app/uploads \
  --env-file .env \
  automation-dashboard
```

## 🔧 Konfiguration

### **Environment Variables**

| Variable       | Beschreibung                  | Standard                 |
| -------------- | ----------------------------- | ------------------------ |
| `JWT_SECRET`   | JWT-Verschlüsselungsschlüssel | -                        |
| `DATABASE_URL` | SQLite-Datenbank-Pfad         | `./data/database.sqlite` |
| `UPLOAD_DIR`   | Upload-Verzeichnis            | `./uploads`              |
| `PORT`         | Server-Port                   | `3000`                   |
| `NODE_ENV`     | Environment                   | `development`            |

### **API-Keys (Optional)**

| Variable                  | Service                     | Verwendung          |
| ------------------------- | --------------------------- | ------------------- |
| `INSTAGRAM_CLIENT_ID`     | Instagram Basic Display API | Account-Verbindung  |
| `INSTAGRAM_CLIENT_SECRET` | Instagram Basic Display API | OAuth-Flow          |
| `YOUTUBE_API_KEY`         | YouTube Data API v3         | Video-Metadaten     |
| `OPENAI_API_KEY`          | OpenAI API                  | Content-Generierung |

## 📊 Monitoring & Logs

### **Health Check**

```bash
curl http://localhost:3000/api/health
```

### **Database Monitoring**

```bash
# Benutzer-Aktivität
SELECT * FROM activity_logs ORDER BY created_at DESC LIMIT 10;

# System-Statistiken
SELECT module_type, COUNT(*) as count
FROM activity_logs
WHERE created_at >= datetime('now', '-24 hours')
GROUP BY module_type;
```

## 🔒 Sicherheit

### **Implementierte Maßnahmen**

- ✅ JWT-Token-Authentifizierung
- ✅ Password-Hashing (bcrypt, 12 rounds)
- ✅ Rate Limiting auf API-Endpunkten
- ✅ Input-Validierung und Sanitization
- ✅ SQL-Injection-Schutz (Prepared Statements)
- ✅ CORS-Konfiguration
- ✅ File-Upload-Sicherheit
- ✅ Error-Handling ohne Daten-Leaks

## 🚨 Troubleshooting

### **Häufige Probleme**

#### **"Database not initialized"**

```bash
npm run db:reset
```

#### **"Module not found" Errors**

```bash
npm install
npm run clean
npm run dev
```

#### **Permission Errors (Docker)**

```bash
sudo chown -R $USER:$USER data uploads logs
```

---

**⚡ Entwickelt für maximale Performance und Skalierbarkeit**
**🎨 Designed mit Horror-Theme für einzigartiges Nutzererlebnis**
**🔐 Enterprise-ready mit umfassenden Sicherheitsmaßnahmen**
