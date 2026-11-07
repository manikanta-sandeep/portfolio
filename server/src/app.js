import fs from "node:fs";
import cookieParser from "cookie-parser";
import express from "express";
import { COLLECTION_SCHEMAS } from "../../shared/contentSchema.js";
import {
  MIN_PASSWORD_LENGTH,
  SESSION_COOKIE,
  createSession,
  destroySession,
  hashPassword,
  rateLimit,
  requireAppHeader,
  requireAuth,
  sessionCookieOptions,
  userFromRequest,
  verifyCredentials
} from "./auth.js";
import {
  createPost,
  deletePost,
  getCollection,
  getPostById,
  getProfile,
  getPublicContent,
  listPosts,
  recordView,
  saveCollection,
  saveProfile,
  updatePost,
  viewsArePublic
} from "./content.js";
import { HttpError, badRequest, notFound } from "./errors.js";
import { buildSitemap } from "./sitemap.js";
import { saveUpload, uploadMiddleware } from "./uploads.js";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function idParam(req) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    throw notFound();
  }
  return id;
}

function text(value, max) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export function createApp({ db, uploadsDir, siteUrl }) {
  fs.mkdirSync(uploadsDir, { recursive: true });

  const app = express();
  app.disable("x-powered-by");
  // nginx terminates connections in production, so trust its X-Forwarded-For for req.ip.
  app.set("trust proxy", "loopback");
  app.use(cookieParser());
  app.use(express.json({ limit: "1mb" }));
  app.use((req, res, next) => {
    res.set("X-Content-Type-Options", "nosniff");
    next();
  });

  app.use(
    "/uploads",
    express.static(uploadsDir, {
      fallthrough: false,
      index: false,
      maxAge: "30d",
      immutable: true
    })
  );

  app.get("/sitemap.xml", (req, res) => {
    res.type("application/xml").send(buildSitemap(siteUrl, getPublicContent(db)));
  });

  const api = express.Router();
  api.use((req, res, next) => {
    res.set("Cache-Control", "no-store");
    next();
  });
  api.use(requireAppHeader);

  // ---------- Public ----------

  api.get("/health", (req, res) => {
    res.json({ ok: true });
  });

  api.get("/content", (req, res) => {
    res.json(getPublicContent(db));
  });

  api.post("/posts/:slug/view", (req, res) => {
    let result;
    // Your own visits while signed in are not counted.
    if (userFromRequest(db, req)) {
      const post = listPosts(db).find((entry) => entry.id === req.params.slug);
      if (!post) {
        throw notFound("Post not found.");
      }
      result = { views: post.views, counted: false };
    } else {
      result = recordView(db, req.params.slug, { ip: req.ip, userAgent: req.get("User-Agent") || "" });
    }
    // Still counted when view counts are hidden, but the number isn't sent to the page.
    res.json(viewsArePublic(db) ? result : { counted: result.counted });
  });

  api.post(
    "/contact",
    rateLimit({ windowMs: 60 * 60 * 1000, max: 5, message: "Too many messages. Please try again later." }),
    (req, res) => {
      const body = req.body || {};
      // Hidden field that people never see; bots that fill it get a silent success.
      if (body.website) {
        res.status(201).json({ ok: true });
        return;
      }
      const message = {
        name: text(body.name, 100),
        email: text(body.email, 200),
        subject: text(body.subject, 150),
        message: text(body.message, 5000)
      };
      if (!message.name) {
        throw badRequest("Please enter your name.");
      }
      if (!EMAIL.test(message.email)) {
        throw badRequest("Please enter a valid email address.");
      }
      if (message.message.length < 10) {
        throw badRequest("Please write a message of at least 10 characters.");
      }
      db.prepare("INSERT INTO messages (name, email, subject, message) VALUES (@name, @email, @subject, @message)").run(
        message
      );
      res.status(201).json({ ok: true });
    }
  );

  // ---------- Auth ----------

  api.post(
    "/auth/login",
    rateLimit({ windowMs: 15 * 60 * 1000, max: 10, message: "Too many sign-in attempts. Try again in 15 minutes." }),
    (req, res) => {
      const username = text(req.body?.username, 100);
      const password = typeof req.body?.password === "string" ? req.body.password : "";
      const user = username && password ? verifyCredentials(db, username, password) : null;
      if (!user) {
        throw new HttpError(401, "Incorrect username or password.");
      }
      const { token, expiresAt } = createSession(db, user.id);
      res.cookie(SESSION_COOKIE, token, sessionCookieOptions(expiresAt));
      res.json({ user });
    }
  );

  api.post("/auth/logout", (req, res) => {
    destroySession(db, req.cookies?.[SESSION_COOKIE]);
    res.clearCookie(SESSION_COOKIE, sessionCookieOptions());
    res.json({ ok: true });
  });

  api.get("/auth/me", (req, res) => {
    res.json({ user: userFromRequest(db, req) });
  });

  // ---------- Admin (signed in only) ----------

  const admin = express.Router();
  admin.use(requireAuth(db));

  admin.post("/password", (req, res) => {
    const { currentPassword, newPassword } = req.body || {};
    if (!verifyCredentials(db, req.user.username, String(currentPassword || ""))) {
      throw badRequest("Your current password is incorrect.");
    }
    if (typeof newPassword !== "string" || newPassword.length < MIN_PASSWORD_LENGTH) {
      throw badRequest(`The new password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
    }
    db.transaction(() => {
      db.prepare("UPDATE users SET password_hash = ? WHERE id = ?").run(hashPassword(newPassword), req.user.id);
      // Sign out every other device; keep this one.
      db.prepare("DELETE FROM sessions WHERE user_id = ?").run(req.user.id);
    })();
    const { token, expiresAt } = createSession(db, req.user.id);
    res.cookie(SESSION_COOKIE, token, sessionCookieOptions(expiresAt));
    res.json({ ok: true });
  });

  admin.get("/summary", (req, res) => {
    const posts = db
      .prepare("SELECT COUNT(*) AS total, COALESCE(SUM(published = 0), 0) AS drafts, COALESCE(SUM(views), 0) AS views FROM posts")
      .get();
    const messages = db.prepare("SELECT COUNT(*) AS total, COALESCE(SUM(is_read = 0), 0) AS unread FROM messages").get();
    const topPosts = db.prepare("SELECT title, slug, views FROM posts WHERE published = 1 ORDER BY views DESC LIMIT 5").all();
    res.json({ posts, messages, topPosts });
  });

  admin.get("/posts", (req, res) => {
    res.json({ posts: listPosts(db, { includeDrafts: true }) });
  });
  admin.post("/posts", (req, res) => {
    res.status(201).json({ post: createPost(db, req.body) });
  });
  admin.get("/posts/:id", (req, res) => {
    res.json({ post: getPostById(db, idParam(req)) });
  });
  admin.put("/posts/:id", (req, res) => {
    res.json({ post: updatePost(db, idParam(req), req.body) });
  });
  admin.delete("/posts/:id", (req, res) => {
    deletePost(db, idParam(req));
    res.json({ ok: true });
  });

  admin.get("/profile", (req, res) => {
    res.json({ profile: getProfile(db) });
  });
  admin.put("/profile", (req, res) => {
    res.json({ profile: saveProfile(db, req.body) });
  });

  admin.get("/collections/:name", (req, res) => {
    res.json({ items: getCollection(db, req.params.name) });
  });
  admin.put("/collections/:name", (req, res) => {
    if (!COLLECTION_SCHEMAS[req.params.name]) {
      throw notFound(`Unknown section "${req.params.name}".`);
    }
    res.json({ items: saveCollection(db, req.params.name, req.body?.items) });
  });

  admin.get("/messages", (req, res) => {
    const messages = db.prepare("SELECT * FROM messages ORDER BY created_at DESC, id DESC").all();
    res.json({ messages: messages.map((message) => ({ ...message, is_read: Boolean(message.is_read) })) });
  });
  admin.patch("/messages/:id", (req, res) => {
    const { changes } = db.prepare("UPDATE messages SET is_read = ? WHERE id = ?").run(req.body?.read ? 1 : 0, idParam(req));
    if (changes === 0) {
      throw notFound("Message not found.");
    }
    res.json({ ok: true });
  });
  admin.delete("/messages/:id", (req, res) => {
    const { changes } = db.prepare("DELETE FROM messages WHERE id = ?").run(idParam(req));
    if (changes === 0) {
      throw notFound("Message not found.");
    }
    res.json({ ok: true });
  });

  admin.post("/uploads", uploadMiddleware, (req, res) => {
    res.status(201).json(saveUpload(uploadsDir, req.file));
  });

  api.use("/admin", admin);
  app.use("/api", api);

  app.use("/api", (req, res, next) => next(notFound("No such API endpoint.")));

  // eslint-disable-next-line no-unused-vars
  app.use((error, req, res, next) => {
    const status = error.status || error.statusCode || (error.code === "LIMIT_FILE_SIZE" ? 413 : 500);
    if (status >= 500) {
      console.error(error);
    }
    const message =
      error.code === "LIMIT_FILE_SIZE"
        ? "That file is too large (10 MB maximum)."
        : status >= 500
          ? "Something went wrong on the server."
          : error.message;
    res.status(status).json({ error: message, ...(error.fields ? { fields: error.fields } : {}), ...(error.index !== undefined ? { index: error.index } : {}) });
  });

  return app;
}
