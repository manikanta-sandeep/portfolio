import { blogPosts } from "../../src/data/blogData.js";
import { profileData } from "../../src/data/profileData.js";
import { COLLECTIONS } from "./db.js";
import { createPost, saveCollection, saveProfile } from "./content.js";

// Fills an empty database with the content from src/data so a fresh install shows the
// same site. Does nothing once a profile exists, so admin edits are never overwritten.
export function seedIfEmpty(db) {
  if (db.prepare("SELECT 1 FROM settings WHERE key = 'profile'").get()) {
    return false;
  }

  db.transaction(() => {
    const profile = Object.fromEntries(Object.entries(profileData).filter(([key]) => !COLLECTIONS.includes(key)));
    saveProfile(db, profile);
    COLLECTIONS.forEach((name) => saveCollection(db, name, profileData[name] || []));
    blogPosts.forEach((post) =>
      createPost(db, {
        ...post,
        slug: post.id,
        published: true,
        sourceUrl: post.links?.source,
        demoUrl: post.links?.demo
      })
    );
  })();
  return true;
}
