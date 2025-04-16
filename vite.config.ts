
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import fs from 'fs';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Check if SSL certificates exist for HTTPS
  const keyPath = path.join(process.cwd(), 'localhost-key.pem');
  const certPath = path.join(process.cwd(), 'localhost.pem');
  const httpsConfig = fs.existsSync(keyPath) && fs.existsSync(certPath)
    ? {
        key: fs.readFileSync(keyPath),
        cert: fs.readFileSync(certPath),
      }
    : undefined;

  // Force HTTPS configuration to be present
  if (!httpsConfig) {
    console.error('SSL certificates not found! HTTPS is required.');
    process.exit(1);
  }

  return {
    server: {
      host: "0.0.0.0", // Allow connections from all network interfaces
      port: 8080, // Use port 8080 as specified
      https: httpsConfig, // Enable HTTPS using the provided certificates
    },
    plugins: [
      react(),
      mode === 'development' &&
      componentTagger(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
