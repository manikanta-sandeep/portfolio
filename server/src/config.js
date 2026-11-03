import path from "node:path";
import { fileURLToPath } from "node:url";

const serverRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dataDir = path.resolve(process.env.DATA_DIR || path.join(serverRoot, "data"));

export const config = {
  port: Number(process.env.PORT || 3001),
  host: process.env.HOST || "127.0.0.1",
  isProduction: process.env.NODE_ENV === "production",
  siteUrl: (process.env.SITE_URL || "https://sandeeppuppala.com").replace(/\/$/, ""),
  dataDir,
  dbFile: path.join(dataDir, "portfolio.db"),
  uploadsDir: path.join(dataDir, "uploads"),
  sessionDays: 14
};
