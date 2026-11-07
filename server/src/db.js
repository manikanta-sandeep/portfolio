import Database from "better-sqlite3";

// Profile sections stored as ordered lists in the items table.
export const COLLECTIONS = [
  "experience",
  "education",
  "skills",
  "projects",
  "research",
  "teaching",
  "activities",
  "achievements",
  "certifications",
  "qrCodes"
];

// Each entry upgrades the schema by one version; never edit an entry that has shipped,
// add a new one instead. PRAGMA user_version records how many have been applied.
const MIGRATIONS = [
  `
  CREATE TABLE settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );

  CREATE TABLE items (
    id INTEGER PRIMARY KEY,
    collection TEXT NOT NULL,
    position INTEGER NOT NULL,
    data TEXT NOT NULL
  );
  CREATE INDEX items_by_collection ON items (collection, position);

  CREATE TABLE posts (
    id INTEGER PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    subtitle TEXT NOT NULL DEFAULT '',
    summary TEXT NOT NULL DEFAULT '',
    category TEXT NOT NULL,
    tags TEXT NOT NULL DEFAULT '[]',
    content TEXT NOT NULL DEFAULT '',
    published_on TEXT NOT NULL,
    published INTEGER NOT NULL DEFAULT 1,
    featured INTEGER NOT NULL DEFAULT 0,
    progress TEXT NOT NULL DEFAULT '',
    cover TEXT NOT NULL DEFAULT '',
    stack TEXT NOT NULL DEFAULT '[]',
    source_url TEXT NOT NULL DEFAULT '',
    demo_url TEXT NOT NULL DEFAULT '',
    views INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  -- One row per post, visitor, and day so repeat visits the same day count once.
  CREATE TABLE post_views (
    post_id INTEGER NOT NULL REFERENCES posts (id) ON DELETE CASCADE,
    visitor TEXT NOT NULL,
    day TEXT NOT NULL,
    PRIMARY KEY (post_id, visitor, day)
  );
  CREATE INDEX post_views_by_day ON post_views (day);

  CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    username TEXT NOT NULL UNIQUE COLLATE NOCASE,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE sessions (
    token_hash TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    expires_at INTEGER NOT NULL
  );

  CREATE TABLE messages (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT NOT NULL DEFAULT '',
    message TEXT NOT NULL,
    is_read INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  `,
  // Site analytics. Times are epoch milliseconds. "visitor" is a salted hash of IP, browser,
  // and day (no IP is stored); "session" is a random id from the visitor's tab.
  `
  CREATE TABLE analytics_pageviews (
    id TEXT PRIMARY KEY,
    ts INTEGER NOT NULL,
    last_seen INTEGER NOT NULL,
    visitor TEXT NOT NULL,
    session TEXT NOT NULL,
    entry INTEGER NOT NULL DEFAULT 0,
    path TEXT NOT NULL,
    referrer TEXT NOT NULL DEFAULT '',
    source TEXT NOT NULL DEFAULT '',
    device TEXT NOT NULL DEFAULT '',
    browser TEXT NOT NULL DEFAULT '',
    os TEXT NOT NULL DEFAULT '',
    engaged_ms INTEGER NOT NULL DEFAULT 0
  );
  CREATE INDEX analytics_pageviews_by_ts ON analytics_pageviews (ts);
  CREATE INDEX analytics_pageviews_by_last_seen ON analytics_pageviews (last_seen);

  CREATE TABLE analytics_events (
    id INTEGER PRIMARY KEY,
    ts INTEGER NOT NULL,
    visitor TEXT NOT NULL,
    session TEXT NOT NULL,
    path TEXT NOT NULL,
    kind TEXT NOT NULL,
    label TEXT NOT NULL,
    target TEXT NOT NULL DEFAULT ''
  );
  CREATE INDEX analytics_events_by_ts ON analytics_events (ts);
  `
];

export function openDatabase(file) {
  const db = new Database(file);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  db.pragma("busy_timeout = 5000");

  const applied = db.pragma("user_version", { simple: true });
  MIGRATIONS.slice(applied).forEach((sql, index) => {
    db.transaction(() => {
      db.exec(sql);
      db.pragma(`user_version = ${applied + index + 1}`);
    })();
  });

  return db;
}
