# 🚀 BACKEND DEVELOPMENT PROMPT FÜR CHATGPT

## 📋 PROJEKT-ÜBERSICHT

Erstelle ein vollständiges **Node.js/Next.js Backend** für ein **Automation Dashboard** mit **Horror-Theme UI**. Das Frontend ist bereits vollständig implementiert und benötigt jetzt die entsprechenden Backend-APIs und Funktionalitäten.

---

## 🎯 SYSTEM-ANFORDERUNGEN

### **TECHNOLOGIE-STACK**
- **Framework:** Next.js 14 mit App Router
- **Runtime:** Node.js 18+
- **Datenbank:** SQLite (für einfache Deployment)
- **Authentication:** JWT-basiert
- **APIs:** Instagram Basic Display API, YouTube Data API v3, OpenAI API
- **File Storage:** Lokales Dateisystem
- **Scheduling:** node-cron für Automatisierung

### **DEPLOYMENT-ZIEL**
- **Server:** Debian Linux Server
- **Benutzer:** Maximal 3-4 private Benutzer
- **Skalierung:** Nicht erforderlich, einfache Lösung bevorzugt

---

## 📊 DATENBANK-SCHEMA

### **TABELLEN-STRUKTUR**

\`\`\`sql
-- Benutzer-Verwaltung
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  email TEXT,
  name TEXT,
  profile_image TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_login DATETIME,
  settings JSON DEFAULT '{}'
);

-- Module-System
CREATE TABLE modules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  type TEXT NOT NULL, -- 'instagram', 'youtube', 'email', etc.
  is_active BOOLEAN DEFAULT FALSE,
  config JSON DEFAULT '{}',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Benutzer-Modul-Berechtigungen
CREATE TABLE user_modules (
  user_id INTEGER,
  module_id INTEGER,
  is_active BOOLEAN DEFAULT FALSE,
  config JSON DEFAULT '{}',
  granted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id),
  FOREIGN KEY (module_id) REFERENCES modules (id),
  PRIMARY KEY (user_id, module_id)
);

-- Instagram-Accounts
CREATE TABLE instagram_accounts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  username TEXT NOT NULL,
  access_token TEXT,
  refresh_token TEXT,
  account_id TEXT,
  is_connected BOOLEAN DEFAULT FALSE,
  followers_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,
  posts_count INTEGER DEFAULT 0,
  last_sync DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id)
);

-- Instagram-Automatisierung-Einstellungen
CREATE TABLE instagram_automation (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  account_id INTEGER NOT NULL,
  auto_generate_content BOOLEAN DEFAULT TRUE,
  require_approval BOOLEAN DEFAULT TRUE,
  topics TEXT,
  post_times TEXT, -- JSON Array: ["09:00", "15:00", "20:00"]
  custom_prompt TEXT,
  is_active BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id),
  FOREIGN KEY (account_id) REFERENCES instagram_accounts (id)
);

-- Generierte Instagram-Posts
CREATE TABLE instagram_posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  account_id INTEGER NOT NULL,
  automation_id INTEGER NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  hashtags TEXT,
  status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'posted', 'failed'
  scheduled_at DATETIME,
  posted_at DATETIME,
  instagram_post_id TEXT,
  engagement_data JSON DEFAULT '{}',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id),
  FOREIGN KEY (account_id) REFERENCES instagram_accounts (id),
  FOREIGN KEY (automation_id) REFERENCES instagram_automation (id)
);

-- YouTube-Downloads
CREATE TABLE youtube_downloads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  format TEXT NOT NULL, -- 'mp3', 'mp4', 'wav', 'flac'
  status TEXT DEFAULT 'pending', -- 'pending', 'downloading', 'completed', 'error'
  progress INTEGER DEFAULT 0,
  file_path TEXT,
  file_size INTEGER,
  error_message TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME,
  FOREIGN KEY (user_id) REFERENCES users (id)
);

-- Aktivitäts-Logs
CREATE TABLE activity_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  module_type TEXT NOT NULL,
  action TEXT NOT NULL,
  status TEXT NOT NULL, -- 'success', 'error', 'info'
  message TEXT,
  metadata JSON DEFAULT '{}',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id)
);

-- Datei-Uploads
CREATE TABLE file_uploads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  filename TEXT NOT NULL,
  original_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  upload_type TEXT, -- 'profile_image', 'content_image', etc.
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id)
);
\`\`\`

---

## 🔌 API-ENDPUNKTE

### **AUTHENTICATION APIs**

\`\`\`typescript
// POST /api/auth/login
interface LoginRequest {
  username: string;
  password: string;
}
interface LoginResponse {
  success: boolean;
  user: { id: number; username: string; is_admin: boolean };
  token: string;
}

// POST /api/auth/logout
// GET /api/auth/me - Aktuelle Benutzer-Info
\`\`\`

### **USER MANAGEMENT APIs**

\`\`\`typescript
// GET /api/users/profile
// PUT /api/users/profile
interface ProfileUpdateRequest {
  name?: string;
  email?: string;
}

// PUT /api/users/password
interface PasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
}

// POST /api/users/upload-avatar
// Multipart file upload für Profilbild
\`\`\`

### **MODULE MANAGEMENT APIs**

\`\`\`typescript
// GET /api/modules - Alle Module für aktuellen User
// POST /api/modules/{id}/toggle
interface ModuleToggleRequest {
  is_active: boolean;
}

// GET /api/modules/stats - Modul-Statistiken
interface ModuleStatsResponse {
  totalModules: number;
  activeModules: number;
  totalExecutions: number;
  successRate: number;
}
\`\`\`

### **INSTAGRAM APIs**

\`\`\`typescript
// POST /api/instagram/connect
interface InstagramConnectRequest {
  username: string;
  password?: string; // Oder OAuth Flow
}

// GET /api/instagram/accounts - Alle verbundenen Accounts
// GET /api/instagram/accounts/{id}/stats - Live-Statistiken
interface InstagramStatsResponse {
  followers: number;
  following: number;
  posts: number;
  engagement_rate: number;
  recent_activity: any[];
}

// POST /api/instagram/automation/configure
interface AutomationConfigRequest {
  account_id: number;
  auto_generate: boolean;
  require_approval: boolean;
  topics: string;
  post_times: string[];
  custom_prompt?: string;
}

// POST /api/instagram/automation/start
// POST /api/instagram/automation/stop
// GET /api/instagram/posts/pending - Posts zur Genehmigung
// POST /api/instagram/posts/{id}/approve
// POST /api/instagram/posts/{id}/reject
// POST /api/instagram/generate-content
interface ContentGenerationRequest {
  account_id: number;
  topic?: string;
  custom_prompt?: string;
}
\`\`\`

### **YOUTUBE APIs**

\`\`\`typescript
// POST /api/youtube/download
interface YouTubeDownloadRequest {
  urls: string[]; // Array von URLs oder Song-Namen
  format: 'mp3' | 'mp4' | 'wav' | 'flac';
}

// GET /api/youtube/downloads - Aktive Downloads
// DELETE /api/youtube/downloads/{id}
// GET /api/youtube/archive - Heruntergeladene Dateien
// DELETE /api/youtube/archive/{id}
// DELETE /api/youtube/archive/all
// GET /api/youtube/download/{id}/file - Datei-Download
\`\`\`

### **STATISTICS APIs**

\`\`\`typescript
// GET /api/stats/dashboard
interface DashboardStatsResponse {
  modules: {
    total: number;
    active: number;
  };
  activities: {
    today: number;
    week: number;
    success_rate: number;
  };
  instagram: {
    accounts: number;
    posts_today: number;
    engagement: number;
  };
  youtube: {
    downloads_today: number;
    total_files: number;
    storage_used: string;
  };
}

// GET /api/stats/activities - Letzte Aktivitäten
\`\`\`

### **ADMIN APIs**

\`\`\`typescript
// GET /api/admin/users - Alle Benutzer (Admin only)
// POST /api/admin/users - Neuen Benutzer erstellen
interface CreateUserRequest {
  username: string;
  password: string;
  email?: string;
  is_admin?: boolean;
}

// DELETE /api/admin/users/{id}
// GET /api/admin/modules - Alle Module verwalten
// POST /api/admin/modules/{id}/assign-user
interface AssignModuleRequest {
  user_id: number;
}
\`\`\`

---

## 🤖 EXTERNE API-INTEGRATIONEN

### **1. INSTAGRAM BASIC DISPLAY API**
\`\`\`typescript
// Instagram OAuth Flow implementieren
// Access Token Management
// Posts abrufen und erstellen
// Statistiken synchronisieren
// Rate Limiting beachten

const instagramAPI = {
  baseURL: 'https://graph.instagram.com',
  endpoints: {
    userInfo: '/me',
    media: '/me/media',
    insights: '/{media-id}/insights'
  }
};
\`\`\`

### **2. YOUTUBE DATA API v3**
\`\`\`typescript
// YouTube Video-Informationen abrufen
// Download mit youtube-dl oder ähnlicher Library
// Metadaten extrahieren
// Format-Konvertierung

const youtubeAPI = {
  baseURL: 'https://www.googleapis.com/youtube/v3',
  endpoints: {
    search: '/search',
    videos: '/videos'
  }
};
\`\`\`

### **3. OPENAI API (ChatGPT)**
\`\`\`typescript
// Content-Generierung für Instagram
// Custom Prompts verarbeiten
// Bild-Beschreibungen generieren
// Hashtag-Vorschläge

const openaiAPI = {
  baseURL: 'https://api.openai.com/v1',
  endpoints: {
    chat: '/chat/completions',
    images: '/images/generations'
  }
};
\`\`\`

---

## ⚙️ AUTOMATISIERUNG & SCHEDULING

### **CRON-JOBS IMPLEMENTIEREN**

\`\`\`typescript
// Instagram Post-Scheduling
// Automatische Content-Generierung
// Statistiken-Synchronisation
// Cleanup-Tasks

const cronJobs = {
  // Alle 15 Minuten: Geplante Posts prüfen
  '*/15 * * * *': checkScheduledPosts,
  
  // Täglich um 6 Uhr: Statistiken synchronisieren
  '0 6 * * *': syncInstagramStats,
  
  // Stündlich: Content generieren (wenn aktiviert)
  '0 * * * *': generateScheduledContent,
  
  // Täglich um 2 Uhr: Cleanup alte Logs
  '0 2 * * *': cleanupOldLogs
};
\`\`\`

---

## 📁 FILE-MANAGEMENT

### **DATEI-STRUKTUR**
\`\`\`
uploads/
├── profiles/          # Profilbilder
├── instagram/         # Instagram Content
│   ├── images/
│   └── generated/
├── youtube/           # YouTube Downloads
│   ├── mp3/
│   ├── mp4/
│   └── temp/
└── temp/              # Temporäre Dateien
\`\`\`

### **FILE-UPLOAD HANDLING**
\`\`\`typescript
// Multer für File-Uploads
// Bildgrößen-Validierung
// Dateiformat-Prüfung
// Automatische Komprimierung
// Sichere Dateinamen-Generierung
\`\`\`

---

## 🔐 SICHERHEIT & VALIDIERUNG

### **AUTHENTICATION & AUTHORIZATION**
\`\`\`typescript
// JWT Token-Validierung
// Password Hashing (bcrypt)
// Rate Limiting
// CORS-Konfiguration
// Input-Sanitization
// SQL-Injection-Schutz
\`\`\`

### **API-SICHERHEIT**
\`\`\`typescript
// Request-Validierung mit Zod
// File-Upload-Sicherheit
// Environment Variables für API-Keys
// Error-Handling ohne sensitive Daten
// Logging für Security-Events
\`\`\`

---

## 📊 REAL-TIME FEATURES

### **WEBSOCKET-INTEGRATION**
\`\`\`typescript
// Live-Updates für Download-Progress
// Real-time Benachrichtigungen
// Live-Statistiken-Updates
// Automation-Status-Updates

// Socket.IO oder native WebSockets
const socketEvents = {
  'download-progress': updateDownloadProgress,
  'instagram-stats': updateInstagramStats,
  'automation-status': updateAutomationStatus,
  'new-activity': broadcastActivity
};
\`\`\`

---

## 🚀 DEPLOYMENT-KONFIGURATION

### **DOCKER SETUP**
\`\`\`dockerfile
# Multi-stage Build
# Node.js 18 Alpine
# SQLite Integration
# File-Permissions
# Health-Checks
\`\`\`

### **ENVIRONMENT VARIABLES**
\`\`\`env
# Database
DATABASE_URL=./data/database.sqlite

# JWT
JWT_SECRET=your-super-secret-jwt-key

# APIs
INSTAGRAM_CLIENT_ID=your-instagram-client-id
INSTAGRAM_CLIENT_SECRET=your-instagram-client-secret
YOUTUBE_API_KEY=your-youtube-api-key
OPENAI_API_KEY=your-openai-api-key

# File Storage
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760

# Server
PORT=3000
NODE_ENV=production
\`\`\`

---

## 📋 IMPLEMENTIERUNGS-CHECKLISTE

### **PHASE 1: CORE BACKEND**
- [ ] Datenbank-Schema erstellen
- [ ] Authentication-System
- [ ] User-Management APIs
- [ ] Module-Management APIs
- [ ] File-Upload-System
- [ ] Basic Error-Handling

### **PHASE 2: INSTAGRAM-INTEGRATION**
- [ ] Instagram API-Integration
- [ ] Account-Verbindung
- [ ] Statistiken-Synchronisation
- [ ] Content-Generierung (OpenAI)
- [ ] Post-Scheduling
- [ ] Approval-Workflow

### **PHASE 3: YOUTUBE-INTEGRATION**
- [ ] YouTube API-Integration
- [ ] Download-System (youtube-dl)
- [ ] Format-Konvertierung
- [ ] Progress-Tracking
- [ ] Archiv-Management
- [ ] Batch-Downloads

### **PHASE 4: AUTOMATISIERUNG**
- [ ] Cron-Job-System
- [ ] Real-time Updates
- [ ] WebSocket-Integration
- [ ] Notification-System
- [ ] Performance-Monitoring

### **PHASE 5: DEPLOYMENT**
- [ ] Docker-Konfiguration
- [ ] Debian-Server-Setup
- [ ] SSL-Zertifikate
- [ ] Backup-System
- [ ] Monitoring & Logging

---

## 🎯 SPEZIELLE ANFORDERUNGEN

### **INSTAGRAM-MODUL FEATURES**
1. **Account-Management:** Sichere Speicherung von Zugangsdaten
2. **Live-Statistiken:** Regelmäßige API-Calls für aktuelle Daten
3. **KI-Content-Generierung:** OpenAI-Integration mit Custom Prompts
4. **Scheduling:** Zeitbasierte Post-Veröffentlichung
5. **Approval-Workflow:** Posts vor Veröffentlichung genehmigen
6. **Engagement-Tracking:** Likes, Comments, Shares verfolgen

### **YOUTUBE-MODUL FEATURES**
1. **Multi-URL-Support:** Batch-Download von mehreren Videos
2. **Format-Flexibilität:** MP3, MP4, WAV, FLAC
3. **Progress-Tracking:** Live-Updates des Download-Fortschritts
4. **Archiv-System:** Verwaltung heruntergeladener Dateien
5. **Metadata-Extraktion:** Titel, Dauer, Thumbnail
6. **Storage-Management:** Speicherplatz-Überwachung

---

## 💡 ZUSÄTZLICHE ÜBERLEGUNGEN

### **PERFORMANCE-OPTIMIERUNG**
- Database-Indexing für häufige Queries
- Caching für API-Responses
- Background-Jobs für zeitaufwändige Tasks
- Compression für File-Downloads

### **ERROR-HANDLING**
- Comprehensive Logging-System
- User-friendly Error-Messages
- Retry-Mechanismen für API-Calls
- Graceful Degradation bei Service-Ausfällen

### **MONITORING**
- Health-Check-Endpoints
- Performance-Metriken
- Error-Rate-Tracking
- Resource-Usage-Monitoring

---

## 🎯 ERFOLGS-KRITERIEN

Das Backend ist erfolgreich implementiert, wenn:

1. ✅ **Alle Frontend-APIs funktionieren** - Jeder Frontend-Call hat eine funktionierende Backend-Response
2. ✅ **Instagram-Integration läuft** - Accounts können verbunden werden, Content wird generiert und gepostet
3. ✅ **YouTube-Downloads funktionieren** - Videos können heruntergeladen und verwaltet werden
4. ✅ **Real-time Updates** - Live-Statistiken und Progress-Updates funktionieren
5. ✅ **Automatisierung läuft** - Scheduled Posts und Background-Tasks funktionieren
6. ✅ **Sicherheit gewährleistet** - Authentication, Authorization und Data-Protection funktionieren
7. ✅ **Deployment-ready** - System läuft stabil auf Debian-Server

---

**WICHTIG:** Das Frontend ist bereits vollständig implementiert und wartet auf die Backend-Integration. Alle UI-Komponenten, API-Calls und Datenstrukturen sind bereits definiert und müssen nur noch mit funktionierenden Backend-Endpunkten verbunden werden.

Erstelle ein vollständiges, produktionsreifes Backend-System, das alle diese Anforderungen erfüllt!
