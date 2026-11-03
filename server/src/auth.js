import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { config } from "./config.js";
import { HttpError } from "./errors.js";

export const SESSION_COOKIE = "portfolio_session";
const BCRYPT_ROUNDS = 12;
export const MIN_PASSWORD_LENGTH = 10;
// Compared against when the username does not exist, so both cases take the same time.
const DUMMY_HASH = bcrypt.hashSync("not-a-real-password", BCRYPT_ROUNDS);

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function hashPassword(password) {
  return bcrypt.hashSync(password, BCRYPT_ROUNDS);
}

export function verifyCredentials(db, username, password) {
  const user = db.prepare("SELECT id, username, password_hash FROM users WHERE username = ?").get(username);
  const valid = bcrypt.compareSync(password, user ? user.password_hash : DUMMY_HASH);
  return user && valid ? { id: user.id, username: user.username } : null;
}

export function createSession(db, userId) {
  const token = crypto.randomBytes(32).toString("base64url");
  const expiresAt = Date.now() + config.sessionDays * 24 * 60 * 60 * 1000;
  db.prepare("DELETE FROM sessions WHERE expires_at < ?").run(Date.now());
  db.prepare("INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)").run(hashToken(token), userId, expiresAt);
  return { token, expiresAt };
}

export function destroySession(db, token) {
  if (token) {
    db.prepare("DELETE FROM sessions WHERE token_hash = ?").run(hashToken(token));
  }
}

export function sessionCookieOptions(expiresAt) {
  return {
    httpOnly: true,
    secure: config.isProduction,
    sameSite: "strict",
    path: "/",
    ...(expiresAt ? { expires: new Date(expiresAt) } : {})
  };
}

export function userFromRequest(db, req) {
  const token = req.cookies?.[SESSION_COOKIE];
  if (!token) {
    return null;
  }
  const row = db
    .prepare(
      `SELECT users.id, users.username FROM sessions
       JOIN users ON users.id = sessions.user_id
       WHERE sessions.token_hash = ? AND sessions.expires_at > ?`
    )
    .get(hashToken(token), Date.now());
  return row || null;
}

export function requireAuth(db) {
  return (req, res, next) => {
    const user = userFromRequest(db, req);
    if (!user) {
      next(new HttpError(401, "Please sign in."));
      return;
    }
    req.user = user;
    next();
  };
}

// The session cookie is SameSite=Strict; requiring a custom header on top means a
// cross-site form or image can never trigger a state change.
export function requireAppHeader(req, res, next) {
  if (req.method === "GET" || req.method === "HEAD" || req.get("X-Requested-With") === "portfolio") {
    next();
    return;
  }
  next(new HttpError(403, "Missing request header."));
}

// Small in-memory fixed-window limiter; enough for a single-server personal site.
export function rateLimit({ windowMs, max, message }) {
  const hits = new Map();
  return (req, res, next) => {
    const now = Date.now();
    const entry = hits.get(req.ip);
    if (!entry || entry.resetAt <= now) {
      hits.set(req.ip, { count: 1, resetAt: now + windowMs });
      if (hits.size > 10000) {
        hits.forEach((value, key) => value.resetAt <= now && hits.delete(key));
      }
      next();
      return;
    }
    entry.count += 1;
    if (entry.count > max) {
      res.set("Retry-After", String(Math.ceil((entry.resetAt - now) / 1000)));
      next(new HttpError(429, message));
      return;
    }
    next();
  };
}
