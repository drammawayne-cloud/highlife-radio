CREATE TABLE IF NOT EXISTS highlife_alert_subscribers(token TEXT PRIMARY KEY, secret_hash TEXT NOT NULL, created_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS highlife_alert_state(id INTEGER PRIMARY KEY CHECK(id=1), live_key TEXT NOT NULL, updated_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS highlife_alert_deliveries(event_id TEXT NOT NULL, token TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'pending', created_at INTEGER NOT NULL, PRIMARY KEY(event_id,token));
