import crypto from "node:crypto";
import {
  COLLECTION_SCHEMAS,
  POST_FIELDS,
  PROFILE_FIELDS,
  cleanRecord,
  slugify
} from "../../shared/contentSchema.js";
import { COLLECTIONS } from "./db.js";
import { HttpError, badRequest, notFound } from "./errors.js";

const MAX_ITEMS_PER_COLLECTION = 200;

function parseJson(text, fallback) {
  try {
    return JSON.parse(text);
  } catch {
    return fallback;
  }
}

function validate(fields, input) {
  const { value, errors } = cleanRecord(fields, input);
  if (Object.keys(errors).length > 0) {
    const error = badRequest(Object.values(errors)[0]);
    error.fields = errors;
    throw error;
  }
  return value;
}

// ---------- Profile ----------

export function getProfile(db) {
  const row = db.prepare("SELECT value FROM settings WHERE key = 'profile'").get();
  return row ? parseJson(row.value, {}) : {};
}

export function saveProfile(db, input) {
  const profile = validate(PROFILE_FIELDS, input);
  db.prepare("INSERT INTO settings (key, value) VALUES ('profile', ?) ON CONFLICT (key) DO UPDATE SET value = excluded.value").run(
    JSON.stringify(profile)
  );
  return profile;
}

// ---------- Collections (experience, skills, projects, ...) ----------

function assertCollection(name) {
  if (!COLLECTIONS.includes(name)) {
    throw notFound(`Unknown section "${name}".`);
  }
}

export function getCollection(db, name) {
  assertCollection(name);
  return db
    .prepare("SELECT data FROM items WHERE collection = ? ORDER BY position")
    .all(name)
    .map((row) => parseJson(row.data, {}));
}

// Replaces the whole list; the order of the array becomes the display order.
export function saveCollection(db, name, input) {
  assertCollection(name);
  if (!Array.isArray(input)) {
    throw badRequest("Expected a list of entries.");
  }
  if (input.length > MAX_ITEMS_PER_COLLECTION) {
    throw badRequest(`A section can hold at most ${MAX_ITEMS_PER_COLLECTION} entries.`);
  }

  const { fields } = COLLECTION_SCHEMAS[name];
  const items = input.map((entry, index) => {
    try {
      return validate(fields, entry);
    } catch (error) {
      error.message = `Entry ${index + 1}: ${error.message}`;
      error.index = index;
      throw error;
    }
  });

  if (fields.some((field) => field.key === "id")) {
    const seen = new Set();
    items.forEach((item, index) => {
      if (seen.has(item.id)) {
        const error = badRequest(`Entry ${index + 1}: the URL slug "${item.id}" is already used.`);
        error.index = index;
        throw error;
      }
      seen.add(item.id);
    });
  }

  db.transaction(() => {
    db.prepare("DELETE FROM items WHERE collection = ?").run(name);
    const insert = db.prepare("INSERT INTO items (collection, position, data) VALUES (?, ?, ?)");
    items.forEach((item, position) => insert.run(name, position, JSON.stringify(item)));
  })();
  return items;
}

// ---------- Posts ----------

function rowToPost(row) {
  return {
    id: row.slug,
    dbId: row.id,
    title: row.title,
    subtitle: row.subtitle,
    summary: row.summary,
    category: row.category,
    tags: parseJson(row.tags, []),
    content: row.content,
    date: row.published_on,
    published: Boolean(row.published),
    featured: Boolean(row.featured),
    status: row.progress,
    cover: row.cover,
    stack: parseJson(row.stack, []),
    links: { source: row.source_url, demo: row.demo_url },
    views: row.views,
    updatedAt: row.updated_at
  };
}

export function listPosts(db, { includeDrafts = false } = {}) {
  const where = includeDrafts ? "" : "WHERE published = 1";
  return db.prepare(`SELECT * FROM posts ${where} ORDER BY published_on DESC, id DESC`).all().map(rowToPost);
}

export function getPostById(db, id) {
  const row = db.prepare("SELECT * FROM posts WHERE id = ?").get(id);
  if (!row) {
    throw notFound("Post not found.");
  }
  return rowToPost(row);
}

function postColumns(input) {
  const post = validate(POST_FIELDS, input);
  const slug = post.slug || slugify(post.title);
  if (!slug) {
    throw badRequest("Add a URL slug; the title has no letters or numbers to build one from.");
  }
  return {
    slug,
    title: post.title,
    subtitle: post.subtitle,
    summary: post.summary,
    category: post.category,
    tags: JSON.stringify(post.tags),
    content: post.content,
    published_on: post.date,
    published: post.published ? 1 : 0,
    featured: post.featured ? 1 : 0,
    progress: post.status,
    cover: post.cover,
    stack: JSON.stringify(post.stack),
    source_url: post.sourceUrl,
    demo_url: post.demoUrl
  };
}

function rethrowSlugConflict(error, slug) {
  if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
    throw new HttpError(409, `Another post already uses the URL slug "${slug}".`);
  }
  throw error;
}

export function createPost(db, input) {
  const columns = postColumns(input);
  const names = Object.keys(columns);
  try {
    const { lastInsertRowid } = db
      .prepare(`INSERT INTO posts (${names.join(", ")}) VALUES (${names.map((name) => `@${name}`).join(", ")})`)
      .run(columns);
    return getPostById(db, lastInsertRowid);
  } catch (error) {
    return rethrowSlugConflict(error, columns.slug);
  }
}

export function updatePost(db, id, input) {
  getPostById(db, id);
  const columns = postColumns(input);
  const assignments = Object.keys(columns).map((name) => `${name} = @${name}`);
  try {
    db.prepare(`UPDATE posts SET ${assignments.join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE id = @id`).run({
      ...columns,
      id
    });
  } catch (error) {
    rethrowSlugConflict(error, columns.slug);
  }
  return getPostById(db, id);
}

export function deletePost(db, id) {
  const { changes } = db.prepare("DELETE FROM posts WHERE id = ?").run(id);
  if (changes === 0) {
    throw notFound("Post not found.");
  }
}

// ---------- Views ----------

function viewSalt(db) {
  const row = db.prepare("SELECT value FROM settings WHERE key = 'view_salt'").get();
  if (row) {
    return row.value;
  }
  const salt = crypto.randomBytes(32).toString("hex");
  db.prepare("INSERT OR IGNORE INTO settings (key, value) VALUES ('view_salt', ?)").run(salt);
  return db.prepare("SELECT value FROM settings WHERE key = 'view_salt'").get().value;
}

// Counts at most one view per visitor, post, and day. Visitors are identified by a salted
// hash of IP and user agent, so no IP address is stored.
export function recordView(db, slug, { ip, userAgent }) {
  const post = db.prepare("SELECT id, views FROM posts WHERE slug = ? AND published = 1").get(slug);
  if (!post) {
    throw notFound("Post not found.");
  }

  const day = new Date().toISOString().slice(0, 10);
  const visitor = crypto
    .createHash("sha256")
    .update(`${viewSalt(db)}|${day}|${ip}|${userAgent}`)
    .digest("hex");

  return db.transaction(() => {
    // Rows from earlier days are no longer needed for de-duplication.
    db.prepare("DELETE FROM post_views WHERE day < ?").run(day);
    const { changes } = db
      .prepare("INSERT OR IGNORE INTO post_views (post_id, visitor, day) VALUES (?, ?, ?)")
      .run(post.id, visitor, day);
    if (changes === 0) {
      return { views: post.views, counted: false };
    }
    db.prepare("UPDATE posts SET views = views + 1 WHERE id = ?").run(post.id);
    return { views: post.views + 1, counted: true };
  })();
}

// ---------- Public content ----------

export function getPublicContent(db) {
  const profile = getProfile(db);
  COLLECTIONS.forEach((name) => {
    profile[name] = getCollection(db, name);
  });
  const posts = listPosts(db).map(({ dbId, published, updatedAt, ...post }) => post);
  return { profile, posts };
}
