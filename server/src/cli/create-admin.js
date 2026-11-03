// Creates an admin account, or resets its password if it exists:
//   npm run create-admin -- <username>
// The password is read from the ADMIN_PASSWORD environment variable, or asked for.
import fs from "node:fs";
import readline from "node:readline";
import { MIN_PASSWORD_LENGTH, hashPassword } from "../auth.js";
import { config } from "../config.js";
import { openDatabase } from "../db.js";

function askHidden(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    // Echo nothing while the password is typed.
    rl._writeToOutput = (chunk) => {
      if (chunk.includes(question)) {
        rl.output.write(chunk);
      }
    };
    rl.question(question, (answer) => {
      rl.close();
      process.stdout.write("\n");
      resolve(answer);
    });
  });
}

const username = (process.argv[2] || "").trim();
if (!/^[A-Za-z0-9._-]{3,40}$/.test(username)) {
  console.error("Usage: npm run create-admin -- <username>  (3-40 letters, numbers, . _ -)");
  process.exit(1);
}

let password = process.env.ADMIN_PASSWORD;
if (!password) {
  password = await askHidden(`Password for ${username}: `);
  const confirm = await askHidden("Repeat password: ");
  if (password !== confirm) {
    console.error("Passwords did not match.");
    process.exit(1);
  }
}
if (password.length < MIN_PASSWORD_LENGTH) {
  console.error(`Use at least ${MIN_PASSWORD_LENGTH} characters.`);
  process.exit(1);
}

fs.mkdirSync(config.dataDir, { recursive: true });
const db = openDatabase(config.dbFile);
const existing = db.prepare("SELECT id FROM users WHERE username = ?").get(username);
if (existing) {
  db.transaction(() => {
    db.prepare("UPDATE users SET password_hash = ? WHERE id = ?").run(hashPassword(password), existing.id);
    db.prepare("DELETE FROM sessions WHERE user_id = ?").run(existing.id);
  })();
  console.log(`Password reset for "${username}"; existing sessions were signed out.`);
} else {
  db.prepare("INSERT INTO users (username, password_hash) VALUES (?, ?)").run(username, hashPassword(password));
  console.log(`Admin "${username}" created. Sign in at /admin.`);
}
db.close();
