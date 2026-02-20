import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { readFileSync } from "fs";

// Read version from package.json — single source of truth
const pkg = JSON.parse(
  readFileSync(new URL("./package.json", import.meta.url), "utf-8"),
);

export default defineConfig({
  plugins: [react()],
  define: {
    // Injected at build time — no runtime cost
    "import.meta.env.VITE_APP_VERSION": JSON.stringify(pkg.version),
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
