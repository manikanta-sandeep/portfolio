import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import multer from "multer";
import { badRequest } from "./errors.js";

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

// Allowed types are identified by their leading bytes, not the client's filename or MIME
// type. SVG is deliberately excluded: it can carry script that would run on this origin.
const SIGNATURES = [
  { ext: ".jpg", test: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  { ext: ".png", test: (b) => b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) },
  { ext: ".gif", test: (b) => b.subarray(0, 4).toString("ascii") === "GIF8" },
  { ext: ".webp", test: (b) => b.subarray(0, 4).toString("ascii") === "RIFF" && b.subarray(8, 12).toString("ascii") === "WEBP" },
  { ext: ".pdf", test: (b) => b.subarray(0, 5).toString("ascii") === "%PDF-" }
];

export const uploadMiddleware = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_UPLOAD_BYTES, files: 1 }
}).single("file");

export function saveUpload(uploadsDir, file) {
  if (!file) {
    throw badRequest("Choose a file to upload.");
  }
  const match = SIGNATURES.find((signature) => signature.test(file.buffer));
  if (!match) {
    throw badRequest("Only JPEG, PNG, GIF, WebP images and PDF files can be uploaded.");
  }
  const name = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}${match.ext}`;
  fs.writeFileSync(path.join(uploadsDir, name), file.buffer);
  return { url: `/uploads/${name}`, size: file.size };
}
