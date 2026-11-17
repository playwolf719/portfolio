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
          // Stable React vendor chunk; the signal field uses native Canvas.
          react: ["react", "react-dom"],
        },
      },
    },
  },
  plugins: [react()],
});
