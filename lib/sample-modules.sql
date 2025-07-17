-- Beispiel-Module hinzufügen
INSERT OR IGNORE INTO modules (name, description, type, is_active, config) VALUES
('Instagram Automation', 'Automatisiere deine Instagram Posts und Interaktionen', 'instagram', true, '{"auto_like": true, "auto_follow": false, "post_schedule": ["09:00", "15:00", "20:00"]}'),
('YouTube Downloader', 'Lade Videos und Audio von YouTube herunter', 'youtube', true, '{"quality": "720p", "format": "mp4", "audio_only": false}'),
('Email Notifications', 'Sende automatische E-Mail-Benachrichtigungen', 'email', true, '{"smtp_server": "", "port": 587, "encryption": "tls"}'),
('Data Analytics', 'Analysiere und visualisiere deine Daten', 'analytics', false, '{"charts": true, "export": true, "realtime": false}'),
('File Organizer', 'Organisiere Dateien automatisch nach Regeln', 'file', false, '{"watch_folder": "", "rules": []}'),
('Social Media Monitor', 'Überwache Mentions und Keywords auf Social Media', 'monitor', false, '{"platforms": ["twitter", "facebook"], "keywords": []}');
