// Vite plugin: writes the home page's title, description, social tags, structured data, and a
// plain-HTML summary into index.html at build time, so crawlers that don't run JavaScript
// (and link previews) still see who the site is about. Values come from src/data/profileData.js;
// once the app loads, the Seo component keeps them up to date per page.
import { profileData, siteConfig } from "./src/data/profileData.js";
import { homeSchema } from "./src/lib/schema.js";

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
}

function headTags() {
  const title = escapeHtml(siteConfig.homeTitle);
  const description = escapeHtml(siteConfig.defaultDescription);
  const image = escapeHtml(siteConfig.socialImage);
  // Escape "<" so the JSON can never close the script tag early.
  const schema = JSON.stringify(homeSchema(profileData, siteConfig)).replace(/</g, "\\u003c");
  return [
    `<title>${title}</title>`,
    `<meta name="description" content="${description}" />`,
    `<meta name="author" content="${escapeHtml(profileData.displayName)}" />`,
    `<meta property="og:type" content="profile" />`,
    `<meta property="og:site_name" content="${escapeHtml(siteConfig.siteName)}" />`,
    `<meta property="og:title" content="${title}" />`,
    `<meta property="og:description" content="${description}" />`,
    `<meta property="og:image" content="${image}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta property="og:image:alt" content="${escapeHtml(profileData.displayName)}" />`,
    `<meta property="profile:first_name" content="${escapeHtml(profileData.displayName.split(" ")[0])}" />`,
    `<meta property="profile:last_name" content="${escapeHtml(profileData.displayName.split(" ").at(-1))}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${title}" />`,
    `<meta name="twitter:description" content="${description}" />`,
    `<meta name="twitter:image" content="${image}" />`,
    // Same id the Seo component updates, so there is only ever one block.
    `<script type="application/ld+json" id="app-schema">${schema}</script>`
  ].join("\n    ");
}

function bodyContent() {
  const profile = profileData;
  const links = [
    ["Experience", "/experience"],
    ["Skills", "/skills"],
    ["Projects", "/projects"],
    ["Blog", "/blog"],
    ["Contact", "/contact"],
    ["LinkedIn", profile.linkedin],
    ["GitHub", profile.github]
  ].filter(([, href]) => href);
  return `<div class="prerender">
        <h1>${escapeHtml(profile.displayName)}</h1>
        <p>${escapeHtml(profile.fullName)} · ${escapeHtml(profile.headline)}</p>
        <p>${escapeHtml(profile.summary)}</p>
        <nav>${links.map(([label, href]) => `<a href="${escapeHtml(href)}">${label}</a>`).join(" ")}</nav>
      </div>`;
}

export default function seoHtml() {
  return {
    name: "seo-html",
    transformIndexHtml(html) {
      return html.replace("<!-- seo:head -->", headTags()).replace("<!-- seo:body -->", bodyContent());
    }
  };
}
