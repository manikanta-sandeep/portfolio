// Private notes and files for the signed-in owner, for moving text and files between
// devices. Files live in DATA_DIR/drive (never under the public /uploads) and are only
// served through the signed-in download route, always as an attachment.
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import multer from "multer";
import { HttpError, badRequest, notFound } from "./errors.js";

const MB = 1024 * 1024;
export const MAX_FILE_BYTES = 100 * MB;
export const MAX_TOTAL_BYTES = 5 * 1024 * MB;
const MAX_FILES_PER_UPLOAD = 20;
const MAX_NOTE_LENGTH = 100_000;

// ---------- Notes ----------

function noteBody(input) {
  const body = typeof input?.body === "string" ? input.body : "";
  if (!body.trim()) {
    throw badRequest("Write or paste something first.");
  }
  if (body.length > MAX_NOTE_LENGTH) {
    throw badRequest(`A note can be at most ${MAX_NOTE_LENGTH.toLocaleString("en-US")} characters.`);
  }
  return body;
}

export function listNotes(db) {
  return db.prepare("SELECT id, body, created_at, updated_at FROM notes ORDER BY updated_at DESC, id DESC").all();
}

function getNote(db, id) {
  const note = db.prepare("SELECT id, body, created_at, updated_at FROM notes WHERE id = ?").get(id);
  if (!note) {
    throw notFound("Note not found.");
  }
  return note;
}

export function createNote(db, input) {
  const { lastInsertRowid } = db.prepare("INSERT INTO notes (body) VALUES (?)").run(noteBody(input));
  return getNote(db, lastInsertRowid);
}

export function updateNote(db, id, input) {
  const { changes } = db
    .prepare("UPDATE notes SET body = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
    .run(noteBody(input), id);
  if (changes === 0) {
    throw notFound("Note not found.");
  }
  return getNote(db, id);
}

export function deleteNote(db, id) {
  if (db.prepare("DELETE FROM notes WHERE id = ?").run(id).changes === 0) {
    throw notFound("Note not found.");
  }
}

// ---------- Files ----------

// Streams uploads straight to disk (the VM has 1 GB of memory) under random names.
export function driveUploadMiddleware(driveDir) {
  const upload = multer({
    storage: multer.diskStorage({
      destination: driveDir,
      filename: (req, file, done) => done(null, `${Date.now()}-${crypto.randomBytes(8).toString("hex")}`)
    }),
    limits: { fileSize: MAX_FILE_BYTES, files: MAX_FILES_PER_UPLOAD },
    // Browsers send UTF-8 file names; without this, names like "résumé.pdf" arrive garbled.
    defParamCharset: "utf8"
  }).array("files", MAX_FILES_PER_UPLOAD);

  return (req, res, next) =>
    upload(req, res, (error) => {
      if (error?.code === "LIMIT_FILE_SIZE") {
        next(new HttpError(413, `Each file can be at most ${MAX_FILE_BYTES / MB} MB.`));
      } else if (error?.code === "LIMIT_FILE_COUNT" || error?.code === "LIMIT_UNEXPECTED_FILE") {
        next(badRequest(`Upload at most ${MAX_FILES_PER_UPLOAD} files at a time.`));
      } else {
        next(error);
      }
    });
}

function cleanName(name) {
  const base = path
    .basename(String(name || "").replace(/\\/g, "/"))
    .replace(/\p{Cc}/gu, "")
    .trim();
  return base.slice(0, 200) || "file";
}

function usedBytes(db) {
  return db.prepare("SELECT COALESCE(SUM(size), 0) AS total FROM drive_files").get().total;
}

export function listFiles(db) {
  const files = db.prepare("SELECT id, name, size, created_at FROM drive_files ORDER BY id DESC").all();
  return { files, used: usedBytes(db), limit: MAX_TOTAL_BYTES, maxFileSize: MAX_FILE_BYTES };
}

export function saveFiles(db, driveDir, files = []) {
  if (files.length === 0) {
    throw badRequest("Choose at least one file.");
  }
  const incoming = files.reduce((total, file) => total + file.size, 0);
  if (usedBytes(db) + incoming > MAX_TOTAL_BYTES) {
    files.forEach((file) => fs.rmSync(path.join(driveDir, file.filename), { force: true }));
    throw new HttpError(413, `Not enough space: files can use at most ${MAX_TOTAL_BYTES / 1024 / MB} GB. Delete some first.`);
  }
  const insert = db.prepare("INSERT INTO drive_files (name, stored_name, size) VALUES (?, ?, ?)");
  db.transaction(() => files.forEach((file) => insert.run(cleanName(file.originalname), file.filename, file.size)))();
  return listFiles(db);
}

export function getFile(db, driveDir, id) {
  const row = db.prepare("SELECT name, stored_name FROM drive_files WHERE id = ?").get(id);
  if (!row) {
    throw notFound("File not found.");
  }
  return { name: row.name, path: path.join(driveDir, row.stored_name) };
}

export function deleteFile(db, driveDir, id) {
  const { path: file } = getFile(db, driveDir, id);
  db.prepare("DELETE FROM drive_files WHERE id = ?").run(id);
  fs.rmSync(file, { force: true });
}
