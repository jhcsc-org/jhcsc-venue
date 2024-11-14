import react from "@vitejs/plugin-react";
import * as path from "node:path";
import { defineConfig } from "vite";
import lqip from "vite-plugin-lqip";

export default defineConfig({
  plugins: [react(), lqip()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
