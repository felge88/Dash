-- Database Schema für Automation Dashboard
-- SQLite Datenbank mit allen erforderlichen Tabellen

-- Benutzer-Verwaltung
CREATE TABLE IF NOT EXISTS users (
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
CREATE TABLE IF NOT EXISTS modules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  type TEXT NOT NULL, -- 'instagram', 'youtube', 'email', etc.
  is_active BOOLEAN DEFAULT FALSE,
  config JSON DEFAULT '{}',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Benutzer-Modul-Berechtigungen
CREATE TABLE IF NOT EXISTS user_modules (
  user_id INTEGER,
  module_id INTEGER,
  is_active BOOLEAN DEFAULT FALSE,
  config JSON DEFAULT '{}',
  granted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  FOREIGN KEY (module_id) REFERENCES modules (id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, module_id)
);

-- Instagram-Accounts
CREATE TABLE IF NOT EXISTS instagram_accounts (
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
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- Instagram-Automatisierung-Einstellungen
CREATE TABLE IF NOT EXISTS instagram_automation (
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
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  FOREIGN KEY (account_id) REFERENCES instagram_accounts (id) ON DELETE CASCADE
);

-- Generierte Instagram-Posts
CREATE TABLE IF NOT EXISTS instagram_posts (
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
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  FOREIGN KEY (account_id) REFERENCES instagram_accounts (id) ON DELETE CASCADE,
  FOREIGN KEY (automation_id) REFERENCES instagram_automation (id) ON DELETE CASCADE
);

-- YouTube-Downloads
CREATE TABLE IF NOT EXISTS youtube_downloads (
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
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- Aktivitäts-Logs
CREATE TABLE IF NOT EXISTS activity_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  module_type TEXT NOT NULL,
  action TEXT NOT NULL,
  status TEXT NOT NULL, -- 'success', 'error', 'info'
  message TEXT,
  metadata JSON DEFAULT '{}',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- Datei-Uploads
CREATE TABLE IF NOT EXISTS file_uploads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  filename TEXT NOT NULL,
  original_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  upload_type TEXT, -- 'profile_image', 'content_image', etc.
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- Indizes für Performance-Optimierung
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_last_login ON users(last_login);
CREATE INDEX IF NOT EXISTS idx_user_modules_user_id ON user_modules(user_id);
CREATE INDEX IF NOT EXISTS idx_user_modules_module_id ON user_modules(module_id);
CREATE INDEX IF NOT EXISTS idx_instagram_accounts_user_id ON instagram_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_instagram_automation_user_id ON instagram_automation(user_id);
CREATE INDEX IF NOT EXISTS idx_instagram_automation_account_id ON instagram_automation(account_id);
CREATE INDEX IF NOT EXISTS idx_instagram_posts_user_id ON instagram_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_instagram_posts_status ON instagram_posts(status);
CREATE INDEX IF NOT EXISTS idx_instagram_posts_scheduled_at ON instagram_posts(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_youtube_downloads_user_id ON youtube_downloads(user_id);
CREATE INDEX IF NOT EXISTS idx_youtube_downloads_status ON youtube_downloads(status);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_file_uploads_user_id ON file_uploads(user_id);

-- Standard-Module einfügen
INSERT OR IGNORE INTO modules (name, description, type, is_active) VALUES 
  ('Instagram Automation', 'Automatisierte Instagram Content-Generierung und Posting', 'instagram', true),
  ('YouTube Downloader', 'YouTube Videos und Audio in verschiedenen Formaten herunterladen', 'youtube', true),
  ('Analytics Dashboard', 'Statistiken und Performance-Monitoring für alle Module', 'analytics', true);

-- Standard-Admin-User erstellen (Username: admin, Password: admin123)
-- Password-Hash für 'admin123': $2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RW1.bOn.G
INSERT OR IGNORE INTO users (username, password_hash, name, is_admin) VALUES 
  ('admin', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RW1.bOn.G', 'Administrator', true);

-- Admin-Benutzer zu allen Modulen hinzufügen
INSERT OR IGNORE INTO user_modules (user_id, module_id, is_active) 
  SELECT 1, id, true FROM modules;
