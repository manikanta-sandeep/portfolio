// schema.org structured data describing the site owner. Search engines use it to connect
// every form of the name, the photo, and the linked profiles to this website.
// Plain functions with no browser APIs, so vite.config.js can reuse them at build time.

function absoluteUrl(siteUrl, path) {
  if (!path) {
    return undefined;
  }
  return /^https?:\/\//.test(path) ? path : `${siteUrl}${path.startsWith("/") ? "" : "/"}${path}`;
}

export function personId(site) {
  return `${site.siteUrl}/#person`;
}

export function personSchema(profile, site) {
  const fullName = profile.fullName || profile.displayName;
  const alternateNames = [fullName, ...(site.alternateNames || [])].filter((name) => name && name !== profile.displayName);

  return {
    "@type": "Person",
    "@id": personId(site),
    name: profile.displayName,
    alternateName: [...new Set(alternateNames)],
    givenName: profile.displayName.split(" ")[0],
    familyName: fullName.split(" ").at(-1),
    url: site.siteUrl,
    image: absoluteUrl(site.siteUrl, profile.photo),
    jobTitle: profile.role,
    description: profile.summary,
    email: profile.email ? `mailto:${profile.email}` : undefined,
    sameAs: [profile.linkedin, profile.github].filter(Boolean),
    alumniOf: (profile.education || []).map((item) => ({
      "@type": "CollegeOrUniversity",
      name: item.institution.split(",")[0],
      url: item.url || undefined
    })),
    knowsAbout: (profile.skills || []).slice(0, 20).map((skill) => skill.name)
  };
}

// Home page: a ProfilePage about the person, plus the WebSite (Google uses its name as the
// site name shown in results).
export function homeSchema(profile, site) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      personSchema(profile, site),
      {
        "@type": "WebSite",
        "@id": `${site.siteUrl}/#website`,
        name: site.siteName,
        alternateName: [new URL(site.siteUrl).host, `${site.siteName} Portfolio`],
        url: `${site.siteUrl}/`,
        publisher: { "@id": personId(site) }
      },
      {
        "@type": "ProfilePage",
        "@id": `${site.siteUrl}/#profilepage`,
        url: `${site.siteUrl}/`,
        name: site.homeTitle || site.siteName,
        mainEntity: { "@id": personId(site) },
        isPartOf: { "@id": `${site.siteUrl}/#website` }
      }
    ]
  };
}

// Author reference for blog posts and projects.
export function authorRef(profile, site) {
  return { "@type": "Person", "@id": personId(site), name: profile.displayName, url: site.siteUrl };
}
