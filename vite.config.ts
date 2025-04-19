
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import fs from "fs";

// Check if SSL certificates exist for HTTPS
const hasCertificates = () => {
  try {
    return fs.existsSync('./localhost-key.pem') && fs.existsSync('./localhost.pem');
  } catch (e) {
    return false;
  }
};

// Configure HTTPS if certificates are available
const getHttpsConfig = () => {
  if (hasCertificates()) {
    return {
      key: fs.readFileSync('./localhost-key.pem'),
      cert: fs.readFileSync('./localhost.pem')
    };
  }
  return undefined;
};

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 8080,
    https: getHttpsConfig(),
    host: true
  }
});
