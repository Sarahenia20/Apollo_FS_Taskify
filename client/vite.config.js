import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 4201, 
    proxy: {
      // Proxy API requests (includes auth endpoints)
      "/api": "http://localhost:3333",
    },
  },
});
