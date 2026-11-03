import { useEffect } from "react";
import PropTypes from "prop-types";
import { siteConfig } from "../data/profileData";

function upsertMeta(selector, attrs) {
  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement("meta");
    document.head.appendChild(element);
  }

  Object.entries(attrs).forEach(([key, value]) => {
    element.setAttribute(key, value);
  });
}

function upsertLink(selector, attrs) {
  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement("link");
    document.head.appendChild(element);
  }

  Object.entries(attrs).forEach(([key, value]) => {
    element.setAttribute(key, value);
  });
}

// `fullTitle` replaces the whole <title>; otherwise the page title is followed by the site name.
export default function Seo({ title, fullTitle, description, path = "/", type = "website", schema, noindex = false }) {
  useEffect(() => {
    const pageTitle = fullTitle || (title ? `${title} | ${siteConfig.siteName}` : siteConfig.siteName);
    const pageDescription = description || siteConfig.defaultDescription;
    const canonical = `${siteConfig.siteUrl}${path === "/" ? "/" : path}`;

    document.title = pageTitle;

    upsertMeta("meta[name='description']", { name: "description", content: pageDescription });
    upsertMeta("meta[name='robots']", {
      name: "robots",
      content: noindex ? "noindex, follow" : "index, follow, max-image-preview:large"
    });

    upsertMeta("meta[property='og:title']", { property: "og:title", content: pageTitle });
    upsertMeta("meta[property='og:description']", { property: "og:description", content: pageDescription });
    upsertMeta("meta[property='og:type']", { property: "og:type", content: type });
    upsertMeta("meta[property='og:url']", { property: "og:url", content: canonical });
    upsertMeta("meta[property='og:image']", { property: "og:image", content: siteConfig.socialImage });
    upsertMeta("meta[property='og:site_name']", { property: "og:site_name", content: siteConfig.siteName });
    upsertMeta("meta[property='og:locale']", { property: "og:locale", content: siteConfig.locale });

    upsertMeta("meta[name='twitter:card']", { name: "twitter:card", content: "summary_large_image" });
    upsertMeta("meta[name='twitter:title']", { name: "twitter:title", content: pageTitle });
    upsertMeta("meta[name='twitter:description']", { name: "twitter:description", content: pageDescription });
    upsertMeta("meta[name='twitter:image']", { name: "twitter:image", content: siteConfig.socialImage });

    upsertLink("link[rel='canonical']", { rel: "canonical", href: canonical });

    // One structured-data block per page (index.html ships the home page's); pages without
    // their own schema drop it rather than publishing an empty one.
    const schemaId = "app-schema";
    let schemaTag = document.getElementById(schemaId);
    if (!schema) {
      schemaTag?.remove();
    } else {
      if (!schemaTag) {
        schemaTag = document.createElement("script");
        schemaTag.type = "application/ld+json";
        schemaTag.id = schemaId;
        document.head.appendChild(schemaTag);
      }
      schemaTag.textContent = JSON.stringify(schema);
    }
  }, [title, fullTitle, description, path, type, schema, noindex]);

  return null;
}

Seo.propTypes = {
  title: PropTypes.string,
  fullTitle: PropTypes.string,
  description: PropTypes.string,
  path: PropTypes.string,
  type: PropTypes.string,
  schema: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  noindex: PropTypes.bool
};
