// Initial blog posts. The API seeds its database from this file on first start; after that,
// write and edit posts in /admin. Post content is Markdown (see src/lib/markdown.js):
//   ## Heading / ### Subheading     (## headings build the table of contents)
//   - item  or  1. item             lists
//   > quote
//   ```lang ... ```                 code blocks
//   ![alt](url "caption")           image on its own line
//   @[video](url poster-url "caption")
//   @[youtube](video-id "title")
//   **bold**, `code`, [link](url)   inside paragraphs
// Optional post fields: subtitle, featured, status ("Completed" | "In Progress"), cover,
// stack (tech chips), links: { source, demo }.
export const blogPosts = [
  {
    id: "engineering-principles-for-reliable-systems",
    title: "Engineering Principles for Reliable Systems",
    date: "2026-06-30",
    category: "Software Engineering",
    tags: ["architecture", "reliability", "backend"],
    featured: true,
    summary:
      "A practical checklist I use to keep production systems stable while shipping features quickly.",
    content: `## Ownership and observability

Reliability is not an afterthought. It starts with clear ownership boundaries, deterministic release processes, and high-signal observability.

## Every change is an experiment

I treat every production change as an experiment: define success criteria, monitor impact, and include rollback readiness before merge.

## Intentional complexity

Simple systems with explicit contracts are easier to test and recover. Complexity should be intentional and documented.`
  },
  {
    id: "practical-seo-for-developer-portfolios",
    title: "Practical SEO for Developer Portfolios",
    date: "2026-06-25",
    category: "Web Development",
    tags: ["seo", "web", "portfolio"],
    featured: true,
    summary:
      "How to structure metadata, schema, robots, and sitemaps so search engines can crawl your site efficiently.",
    content: `## Semantic HTML first

Crawlability begins with semantic HTML and useful page text. Bots and users should both understand what each page is about.

## Layered metadata

Then add metadata in layers: title, description, canonical URL, Open Graph, Twitter cards, and structured data JSON-LD.

## Robots and sitemaps

Finally, provide robots.txt and sitemap.xml so discovery and indexing are straightforward for search engines.`
  }
];
