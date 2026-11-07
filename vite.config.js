import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import seoHtml from "./seo-html.js";

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
  plugins: [react(), seoHtml()]
});
