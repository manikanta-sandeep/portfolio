import { slugify } from "./format";
import { markdownToBlocks } from "./markdown";

const WORDS_PER_MINUTE = 200;

export const POSTS_PER_PAGE = 9;

// Newest first; every list, hero, and previous/next link relies on this order.
export function sortPosts(posts) {
  return [...posts].sort((a, b) => b.date.localeCompare(a.date));
}

export function blockText(block) {
  if (typeof block === "string") {
    return block;
  }
  return [block.text, block.items?.join(" "), block.code, block.caption, block.alt]
    .filter(Boolean)
    .join(" ");
}

export function postBlocks(post) {
  return markdownToBlocks(post.content);
}

export function postText(post) {
  return postBlocks(post).map(blockText).join(" ");
}

export function readingTime(post) {
  const words = postText(post).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

export function totalViews(posts) {
  return posts.reduce((total, post) => total + (post.views || 0), 0);
}

export function getCategories(posts) {
  const counts = new Map();
  posts.forEach((post) => {
    counts.set(post.category, (counts.get(post.category) || 0) + 1);
  });
  return [...counts.entries()]
    .map(([name, count]) => ({ name, slug: slugify(name), count }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function getTags(posts) {
  return [...new Set(posts.flatMap((post) => post.tags))].sort();
}

export function getHeadings(blocks) {
  return blocks
    .filter((block) => typeof block === "object" && block.type === "h2")
    .map((block) => ({ id: slugify(block.text), text: block.text }));
}

export function getAdjacentPosts(posts, id) {
  const index = posts.findIndex((post) => post.id === id);
  return {
    previous: index >= 0 ? posts[index + 1] : undefined,
    next: index > 0 ? posts[index - 1] : undefined
  };
}

export function getRelatedPosts(posts, post, limit = 3) {
  return posts
    .filter((candidate) => candidate.id !== post.id)
    .map((candidate) => {
      const sharedTags = candidate.tags.filter((tag) => post.tags.includes(tag)).length;
      const sameCategory = candidate.category === post.category ? 2 : 0;
      return { candidate, score: sameCategory + sharedTags };
    })
    .sort((a, b) => b.score - a.score || b.candidate.date.localeCompare(a.candidate.date))
    .slice(0, limit)
    .map(({ candidate }) => candidate);
}
