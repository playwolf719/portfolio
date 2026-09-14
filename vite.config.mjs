import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: process.env.BASE_PATH || "/",
  optimizeDeps: {
    include: ["react", "react-dom/client"],
  },
  server: {
    warmup: {
      clientFiles: ["./src/main.jsx"],
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Split heavy/stable vendors into their own long-cacheable chunks.
          // Three.js is additionally lazy-loaded via the OrbitScene import,
          // so it stays off the initial critical path entirely.
          three: ["three"],
          motion: ["framer-motion"],
          react: ["react", "react-dom"],
        },
      },
    },
  },
  plugins: [react()],
});
