// public/404.html turns deep links into "/?/path&query" so GitHub Pages serves the app.
// Restore the real URL before the router reads it. This must run from the bundle, not an
// inline <head> script: rewriting the URL earlier would make the relative ./assets/ tags
// resolve against the deep path.
export function restoreRedirectedPath() {
  const { pathname, search, hash } = window.location;
  if (search[1] !== "/") {
    return;
  }
  const decoded = search
    .slice(1)
    .split("&")
    .map((part) => part.replace(/~and~/g, "&"))
    .join("?");
  window.history.replaceState(null, "", pathname.slice(0, -1) + decoded + hash);
}

// The site is served from either the domain root or /portfolio (GitHub Pages project site).
export const basename = window.location.pathname.startsWith("/portfolio") ? "/portfolio" : "/";

// Resolves a file in public/ against the hosting path so "/resume.pdf" also works under /portfolio.
export function publicUrl(path) {
  if (!path || /^(https?:|mailto:|data:)/.test(path)) {
    return path;
  }

  const prefix = basename === "/" ? "" : basename;
  return `${prefix}${path.startsWith("/") ? path : `/${path}`}`;
}
