import { defineConfig } from "vite";
import { fileURLToPath, URL } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    hmr: {
      overlay: false,
    },
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },

  assetsInclude: ["**/*.svg", "**/*.csv"],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return undefined;
          if (id.includes("jspdf")) return "pdf";
          if (id.includes("html-to-image") || id.includes("html2canvas")) return "html2image";
          if (id.includes("recharts") || id.includes("d3")) return "charts";
          if (id.includes("appwrite")) return "appwrite";
          if (id.includes("framer-motion") || id.includes("gsap")) return "animations";
          return undefined;
        },
      },
    },
  },
});
