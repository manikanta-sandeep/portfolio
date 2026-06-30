import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/",
  server: {
    watch: {
      usePolling: true,
      interval: 120
    }
  },
  plugins: [react()],
});
