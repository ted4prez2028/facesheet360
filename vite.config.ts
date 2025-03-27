
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import fs from 'fs';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Check if SSL certificates exist for HTTPS
  const keyPath = path.join(process.cwd(), 'ssl/localhost.key');
  const certPath = path.join(process.cwd(), 'ssl/localhost.crt');
  const httpsConfig = fs.existsSync(keyPath) && fs.existsSync(certPath)
    ? {
        key: fs.readFileSync(keyPath),
        cert: fs.readFileSync(certPath),
      }
    : undefined;

  return {
    server: {
      host: "::",
      port: 8080,
      https: httpsConfig, // Enable HTTPS if certificates exist
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
