import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { mockApiPlugin } from "./src/test/mockApi.js";

const API_TARGET =
  "https://crossdevicetracker-api-hy-erhyaffahwaufsba.southeastasia-01.azurewebsites.net";

export default defineConfig(({ mode }) => {
  const testMode = mode === "test";

  return {
  plugins: [react(), testMode ? mockApiPlugin() : null].filter(Boolean),
  server: {
    host: "0.0.0.0",
    port: 5173,
    allowedHosts: true,
    proxy: testMode
      ? undefined
      : {
          "/api": {
            target: API_TARGET,
            changeOrigin: true,
            secure: true,
          },
        },
  },
  preview: {
    host: "0.0.0.0",
    port: 4173,
    allowedHosts: true,
  },
  };
});
