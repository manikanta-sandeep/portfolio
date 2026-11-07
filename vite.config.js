import fs from "node:fs";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import seoHtml from "./seo-html.js";

// A folder in public/ named like a page (e.g. public/projects/) becomes a real directory on
// the server, and nginx then answers /projects with a 403 instead of the app. Fail early.
function publicFolderGuard() {
  const check = () => {
    const routes = new Set([...fs.readFileSync("src/App.jsx", "utf8").matchAll(/path="([^"/:*]+)/g)].map((m) => m[1]));
    const clashes = fs
      .readdirSync("public", { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && routes.has(entry.name))
      .map((entry) => `public/${entry.name}/`);
    if (clashes.length > 0) {
      throw new Error(`${clashes.join(", ")} has the same name as a page path. Rename the folder (e.g. to public/media/).`);
    }
  };
  return { name: "public-folder-guard", buildStart: check, configureServer: check };
}

// In development the API (server/, `npm run dev:api`) runs on port 3001; Vite forwards API
// and upload requests to it, the same way nginx does in production. The sitemap is served
// by the API too, so it always lists the current posts.
const apiTarget = process.env.API_URL || "http://127.0.0.1:3001";

export default defineConfig({
  // Absolute asset paths, so deep links like /blog/some-post load /assets/... rather than
  // /blog/assets/.... The GitHub Pages build overrides this with --base=/portfolio/.
  base: "/",
  server: {
    watch: {
      usePolling: true,
      interval: 120
    },
    proxy: {
      "/api": apiTarget,
      "/uploads": apiTarget,
      "/sitemap.xml": apiTarget
    }
  },
  preview: {
    proxy: {
      "/api": apiTarget,
      "/uploads": apiTarget,
      "/sitemap.xml": apiTarget
    }
  },
  plugins: [react(), seoHtml(), publicFolderGuard()]
});
