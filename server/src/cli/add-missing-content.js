// Adds content from src/data that an existing database doesn't have yet: new projects and
// other section entries, new blog posts, and profile fields added after the profile was
// saved (e.g. a new "kaggle" link). It never edits or removes anything already there.
//
//   node src/cli/add-missing-content.js           list what would be added
//   node src/cli/add-missing-content.js --apply   add it
//
// On the server: sudo -u portfolio env DATA_DIR=/var/lib/portfolio node /opt/portfolio/server/src/cli/add-missing-content.js
import fs from "node:fs";
import { blogPosts } from "../../../src/data/blogData.js";
import { profileData } from "../../../src/data/profileData.js";
import { PROFILE_FIELDS } from "../../../shared/contentSchema.js";
import { config } from "../config.js";
import { createPost, getCollection, getProfile, listPosts, saveCollection, saveProfile } from "../content.js";
import { COLLECTIONS, openDatabase } from "../db.js";

const apply = process.argv.includes("--apply");

// How an entry is recognised in each section (seed entries have no database ids).
function identity(item) {
  return String(item.id || item.title || item.name || item.degree || `${item.role}|${item.company || item.organization}`)
    .trim()
    .toLowerCase();
}

if (!fs.existsSync(config.dbFile)) {
  console.error(`No database at ${config.dbFile}. Start the API once to create it.`);
  process.exit(1);
}
const db = openDatabase(config.dbFile);
const plan = [];

// Profile: fill fields that didn't exist when the profile was last saved. Fields you cleared
// are stored as empty values, so they are left alone.
const profile = getProfile(db);
const newFields = PROFILE_FIELDS.filter((field) => !(field.key in profile) && profileData[field.key] !== undefined);
newFields.forEach((field) => plan.push(`profile: ${field.key} = ${JSON.stringify(profileData[field.key])}`));

// Sections: insert each missing seed entry before the next seed entry the database has,
// so new projects land in the same place as in src/data (e.g. at the top).
const sectionUpdates = {};
COLLECTIONS.forEach((name) => {
  const seed = profileData[name] || [];
  const current = getCollection(db, name);
  const have = new Set(current.map(identity));
  const missing = seed.filter((item) => !have.has(identity(item)));
  if (missing.length === 0) {
    return;
  }
  const merged = [...current];
  missing.forEach((item) => {
    const seedIndex = seed.indexOf(item);
    const next = seed.slice(seedIndex + 1).find((later) => have.has(identity(later)));
    const at = next ? merged.findIndex((entry) => identity(entry) === identity(next)) : merged.length;
    merged.splice(at, 0, item);
    have.add(identity(item));
  });
  sectionUpdates[name] = merged;
  missing.forEach((item) => plan.push(`${name}: + ${item.title || item.name || item.role || item.id}`));
});

// Blog posts that aren't in the database yet (matched by URL slug).
const slugs = new Set(listPosts(db, { includeDrafts: true }).map((post) => post.id));
const newPosts = blogPosts.filter((post) => !slugs.has(post.id));
newPosts.forEach((post) => plan.push(`posts: + ${post.title} (/blog/${post.id})`));

if (plan.length === 0) {
  console.log("Nothing to add: the database already has everything in src/data.");
  process.exit(0);
}
console.log(`${apply ? "Adding" : "Would add"} ${plan.length} item(s) to ${config.dbFile}:`);
plan.forEach((line) => console.log(`  ${line}`));

if (!apply) {
  console.log("\nRun again with --apply to add them.");
  process.exit(0);
}

db.transaction(() => {
  if (newFields.length > 0) {
    saveProfile(db, { ...profile, ...Object.fromEntries(newFields.map((field) => [field.key, profileData[field.key]])) });
  }
  Object.entries(sectionUpdates).forEach(([name, items]) => saveCollection(db, name, items));
  newPosts.forEach((post) =>
    createPost(db, { ...post, slug: post.id, published: true, sourceUrl: post.links?.source, demoUrl: post.links?.demo })
  );
})();
console.log("Done.");
