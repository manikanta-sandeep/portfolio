import fs from "node:fs";
import { createApp } from "./app.js";
import { config } from "./config.js";
import { openDatabase } from "./db.js";
import { seedIfEmpty } from "./seed.js";

fs.mkdirSync(config.dataDir, { recursive: true });
const db = openDatabase(config.dbFile);
if (seedIfEmpty(db)) {
  console.log("Seeded an empty database from src/data.");
}
if (!db.prepare("SELECT 1 FROM users").get()) {
  console.log('No admin account yet. Create one with "npm run create-admin -- <username>" in server/.');
}

const app = createApp({ db, uploadsDir: config.uploadsDir, siteUrl: config.siteUrl });
const server = app.listen(config.port, config.host, () => {
  console.log(`Portfolio API listening on http://${config.host}:${config.port} (data: ${config.dataDir})`);
});

function shutdown() {
  server.close(() => {
    db.close();
    process.exit(0);
  });
}
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
