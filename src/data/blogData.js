export const blogPosts = [
  {
    id: "engineering-principles-for-reliable-systems",
    slug: "engineering-principles-for-reliable-systems",
    title: "Engineering Principles for Reliable Systems",
    date: "2026-06-30",
    tags: ["architecture", "reliability", "backend"],
    summary:
      "A practical checklist I use to keep production systems stable while shipping features quickly.",
    content: [
      "Reliability is not an afterthought. It starts with clear ownership boundaries, deterministic release processes, and high-signal observability.",
      "I treat every production change as an experiment: define success criteria, monitor impact, and include rollback readiness before merge.",
      "Simple systems with explicit contracts are easier to test and recover. Complexity should be intentional and documented."
    ]
  },
  {
    id: "practical-seo-for-developer-portfolios",
    slug: "practical-seo-for-developer-portfolios",
    title: "Practical SEO for Developer Portfolios",
    date: "2026-06-25",
    tags: ["seo", "web", "portfolio"],
    summary:
      "How to structure metadata, schema, robots, and sitemaps so search engines can crawl your site efficiently.",
    content: [
      "Crawlability begins with semantic HTML and useful page text. Bots and users should both understand what each page is about.",
      "Then add metadata in layers: title, description, canonical URL, Open Graph, Twitter cards, and structured data JSON-LD.",
      "Finally, provide robots.txt and sitemap.xml so discovery and indexing are straightforward for search engines."
    ]
  }
];
