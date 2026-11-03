function escapeXml(value) {
  return value.replace(/[<>&'"]/g, (char) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[char]);
}

// Built per request from the database, so new posts and projects appear immediately.
export function buildSitemap(siteUrl, { profile, posts }) {
  const pages = [
    { path: "/", priority: "1.0", changefreq: "weekly" },
    { path: "/blog", priority: "0.9", changefreq: "weekly" },
    ...["/experience", "/skills", "/projects", "/extracurriculars", "/contact"].map((path) => ({
      path,
      priority: "0.8",
      changefreq: "monthly"
    })),
    ...(profile.projects || []).map((item) => ({ path: `/projects/${item.id}`, priority: "0.7", changefreq: "monthly" })),
    ...(profile.research || []).map((item) => ({ path: `/research/${item.id}`, priority: "0.7", changefreq: "monthly" })),
    ...posts.map((post) => ({ path: `/blog/${post.id}`, priority: "0.7", changefreq: "monthly", lastmod: post.date }))
  ];

  const urls = pages
    .map(({ path, priority, changefreq, lastmod }) =>
      [
        "  <url>",
        `    <loc>${escapeXml(`${siteUrl}${path}`)}</loc>`,
        lastmod ? `    <lastmod>${lastmod}</lastmod>` : null,
        `    <changefreq>${changefreq}</changefreq>`,
        `    <priority>${priority}</priority>`,
        "  </url>"
      ]
        .filter(Boolean)
        .join("\n")
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}
