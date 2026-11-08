// Overwrites chosen profile fields and sections in the database with their values from
// src/data/profileData.js. Use it after rewriting content in src/data (for example a new
// headline and skills list). It replaces whatever /admin has for those parts, so it lists the
// changes first and backs the database up before writing.
//
//   node src/cli/update-from-data.js role headline skills           list what would change
//   node src/cli/update-from-data.js role headline skills --apply   change it
//
// Names are profile field keys (role, headline, summary, ...) or sections (skills, projects, ...).
// On the server: sudo -u portfolio env DATA_DIR=/var/lib/portfolio node /opt/portfolio/server/src/cli/update-from-data.js ...
import fs from "node:fs";
import path from "node:path";
import { profileData } from "../../../src/data/profileData.js";
import { COLLECTION_SCHEMAS, PROFILE_FIELDS, cleanRecord } from "../../../shared/contentSchema.js";
import { config } from "../config.js";
import { getCollection, getProfile, saveCollection, saveProfile } from "../content.js";
import { COLLECTIONS, openDatabase } from "../db.js";

const args = process.argv.slice(2);
const apply = args.includes("--apply");
const names = args.filter((arg) => !arg.startsWith("--"));
const fieldKeys = new Set(PROFILE_FIELDS.map((field) => field.key));

const unknown = names.filter((name) => !fieldKeys.has(name) && !COLLECTIONS.includes(name));
if (names.length === 0 || unknown.length > 0) {
  if (unknown.length > 0) {
    console.error(`Unknown: ${unknown.join(", ")}`);
  }
  console.error(`Usage: update-from-data.js <name>... [--apply]
  profile fields: ${[...fieldKeys].join(", ")}
  sections: ${COLLECTIONS.join(", ")}`);
  process.exit(1);
}
if (!fs.existsSync(config.dbFile)) {
  console.error(`No database at ${config.dbFile}. Start the API once to create it.`);
  process.exit(1);
}

const db = openDatabase(config.dbFile);
const profile = getProfile(db);
const short = (value) => {
  const text = JSON.stringify(value) ?? "(none)";
  return text.length > 90 ? `${text.slice(0, 87)}...` : text;
};

const fields = names.filter((name) => fieldKeys.has(name) && JSON.stringify(profile[name]) !== JSON.stringify(profileData[name]));
// Compare sections in the cleaned form they are stored in.
const stored = (name, items) => JSON.stringify(items.map((item) => cleanRecord(COLLECTION_SCHEMAS[name].fields, item).value));
const sections = names.filter(
  (name) => COLLECTIONS.includes(name) && stored(name, getCollection(db, name)) !== stored(name, profileData[name] || [])
);
if (fields.length + sections.length === 0) {
  console.log("Nothing to change: the database already matches src/data for those.");
  process.exit(0);
}

console.log(`${apply ? "Updating" : "Would update"} ${config.dbFile}:`);
fields.forEach((key) => console.log(`  profile.${key}\n    now: ${short(profile[key])}\n    new: ${short(profileData[key])}`));
sections.forEach((name) => {
  const now = getCollection(db, name).length;
  console.log(`  ${name}: replace ${now} entr${now === 1 ? "y" : "ies"} with ${(profileData[name] || []).length} from src/data`);
});

if (!apply) {
  console.log("\nRun again with --apply to change them.");
  process.exit(0);
}

const backup = path.join(path.dirname(config.dbFile), `backup-${new Date().toISOString().replace(/[:.]/g, "-")}.db`);
await db.backup(backup);
console.log(`Backed up the database to ${backup}`);

db.transaction(() => {
  if (fields.length > 0) {
    saveProfile(db, { ...profile, ...Object.fromEntries(fields.map((key) => [key, profileData[key]])) });
  }
  sections.forEach((name) => saveCollection(db, name, profileData[name] || []));
})();
console.log("Done.");
