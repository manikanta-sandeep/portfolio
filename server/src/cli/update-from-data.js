// Overwrites chosen profile fields and sections in the database with their values from
// src/data/profileData.js, and with "posts", the text of existing blog posts from
// src/data/blogData.js (their publish state, date and views are kept). Use it after rewriting
// content in src/data (for example a new headline and skills list). It replaces whatever
// /admin has for those parts, so it lists the changes first and backs the database up first.
//
//   node src/cli/update-from-data.js role headline skills           list what would change
//   node src/cli/update-from-data.js role headline skills --apply   change it
//
// Names are profile field keys (role, headline, summary, ...), sections (skills, projects, ...) or "posts".
// On the server: sudo -u portfolio env DATA_DIR=/var/lib/portfolio node /opt/portfolio/server/src/cli/update-from-data.js ...
import fs from "node:fs";
import path from "node:path";
import { blogPosts } from "../../../src/data/blogData.js";
import { profileData } from "../../../src/data/profileData.js";
import { COLLECTION_SCHEMAS, PROFILE_FIELDS, cleanRecord } from "../../../shared/contentSchema.js";
import { config } from "../config.js";
import { getCollection, getProfile, listPosts, saveCollection, saveProfile, updatePost } from "../content.js";
import { COLLECTIONS, openDatabase } from "../db.js";

const args = process.argv.slice(2);
const apply = args.includes("--apply");
const names = args.filter((arg) => !arg.startsWith("--"));
const fieldKeys = new Set(PROFILE_FIELDS.map((field) => field.key));

const unknown = names.filter((name) => !fieldKeys.has(name) && !COLLECTIONS.includes(name) && name !== "posts");
if (names.length === 0 || unknown.length > 0) {
  if (unknown.length > 0) {
    console.error(`Unknown: ${unknown.join(", ")}`);
  }
  console.error(`Usage: update-from-data.js <name>... [--apply]
  profile fields: ${[...fieldKeys].join(", ")}
  sections: ${COLLECTIONS.join(", ")}
  posts: the text of blog posts already in the database`);
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
// Posts: the written parts come from src/data; publish state, date, featured and views stay.
const TEXT = ["title", "subtitle", "summary", "category", "tags", "content", "cover", "stack"];
const postUpdates = names.includes("posts")
  ? listPosts(db, { includeDrafts: true }).flatMap((current) => {
      const seed = blogPosts.find((post) => post.id === current.id);
      if (!seed) {
        return [];
      }
      const changed = TEXT.filter((key) => JSON.stringify(seed[key] ?? (Array.isArray(current[key]) ? [] : "")) !== JSON.stringify(current[key] ?? ""));
      if (changed.length === 0) {
        return [];
      }
      const input = {
        slug: current.id,
        date: current.date,
        published: current.published,
        featured: current.featured,
        status: current.status,
        sourceUrl: current.links.source,
        demoUrl: current.links.demo,
        ...Object.fromEntries(TEXT.map((key) => [key, seed[key] ?? current[key]]))
      };
      return [{ dbId: current.dbId, slug: current.id, changed, input }];
    })
  : [];

if (fields.length + sections.length + postUpdates.length === 0) {
  console.log("Nothing to change: the database already matches src/data for those.");
  process.exit(0);
}

console.log(`${apply ? "Updating" : "Would update"} ${config.dbFile}:`);
fields.forEach((key) => console.log(`  profile.${key}\n    now: ${short(profile[key])}\n    new: ${short(profileData[key])}`));
sections.forEach((name) => {
  const now = getCollection(db, name).length;
  console.log(`  ${name}: replace ${now} entr${now === 1 ? "y" : "ies"} with ${(profileData[name] || []).length} from src/data`);
});

postUpdates.forEach((post) => console.log(`  post /blog/${post.slug}: ${post.changed.join(", ")}`));

if (!apply) {
  console.log("\nRun again with --apply to change them.");
  process.exit(0);
}

const backup = path.join(path.dirname(config.dbFile), `backup-${new Date().toISOString().replace(/[:.]/g, "-")}.db`);
await db.backup(backup);
console.log(`Backed up the database to ${backup}`);

db.transaction(() => {
  if (fields.length > 0) {
    // Saving fills every profile field, so also carry over fields added since the profile was
    // last saved (as add-missing-content.js would); otherwise they'd be stored empty.
    const added = PROFILE_FIELDS.filter((field) => !(field.key in profile) && profileData[field.key] !== undefined);
    added.forEach((field) => console.log(`  also adding new field profile.${field.key}`));
    saveProfile(db, {
      ...profile,
      ...Object.fromEntries(added.map((field) => [field.key, profileData[field.key]])),
      ...Object.fromEntries(fields.map((key) => [key, profileData[key]]))
    });
  }
  sections.forEach((name) => saveCollection(db, name, profileData[name] || []));
  postUpdates.forEach((post) => updatePost(db, post.dbId, post.input));
})();
console.log("Done.");
