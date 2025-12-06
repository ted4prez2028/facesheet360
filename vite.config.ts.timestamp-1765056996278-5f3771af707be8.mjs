// vite.config.ts
import { defineConfig } from "file:///home/project/node_modules/vite/dist/node/index.js";
import react from "file:///home/project/node_modules/@vitejs/plugin-react/dist/index.mjs";
import path from "path";
import fs from "fs";
import { componentTagger } from "file:///home/project/node_modules/lovable-tagger/dist/index.js";
var __vite_injected_original_dirname = "/home/project";
var hasCertificates = () => {
  try {
    return fs.existsSync("./localhost-key.pem") && fs.existsSync("./localhost.pem");
  } catch (e) {
    return false;
  }
};
var getHttpsConfig = () => {
  if (hasCertificates()) {
    return {
      key: fs.readFileSync("./localhost-key.pem"),
      cert: fs.readFileSync("./localhost.pem")
    };
  }
  return void 0;
};
var vite_config_default = defineConfig(({ mode }) => ({
  plugins: [
    react(),
    mode === "development" && componentTagger()
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src")
    }
  },
  build: {
    rollupOptions: {
      external: ["three"],
      output: {
        manualChunks: {
          "react-vendor": ["react", "react-dom", "react-router-dom"],
          "ui-vendor": ["@radix-ui/react-dialog", "@radix-ui/react-dropdown-menu", "@radix-ui/react-select"],
          "chart-vendor": ["recharts"],
          "ai-vendor": ["@tensorflow/tfjs", "@tensorflow/tfjs-backend-webgl"],
          "blockchain-vendor": ["ethers"]
        }
      }
    },
    chunkSizeWarningLimit: 1e3,
    sourcemap: false,
    // Disable in production for better performance
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,
        // Remove console.log in production
        drop_debugger: true
      }
    }
  },
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "@tanstack/react-query",
      "@supabase/supabase-js"
    ]
  },
  server: {
    port: 8080,
    https: getHttpsConfig(),
    host: true,
    proxy: {
      "/api": {
        target: "https://localhost:8080",
        secure: false,
        changeOrigin: true
      }
    }
  }
}));
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9wcm9qZWN0XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3Byb2plY3Qvdml0ZS5jb25maWcudHNcIjtcbmltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gXCJ2aXRlXCI7XG5pbXBvcnQgcmVhY3QgZnJvbSBcIkB2aXRlanMvcGx1Z2luLXJlYWN0XCI7XG5pbXBvcnQgcGF0aCBmcm9tIFwicGF0aFwiO1xuaW1wb3J0IGZzIGZyb20gXCJmc1wiO1xuaW1wb3J0IHsgY29tcG9uZW50VGFnZ2VyIH0gZnJvbSBcImxvdmFibGUtdGFnZ2VyXCI7XG5cbi8vIENoZWNrIGlmIFNTTCBjZXJ0aWZpY2F0ZXMgZXhpc3QgZm9yIEhUVFBTXG5jb25zdCBoYXNDZXJ0aWZpY2F0ZXMgPSAoKSA9PiB7XG4gIHRyeSB7XG4gICAgcmV0dXJuIGZzLmV4aXN0c1N5bmMoJy4vbG9jYWxob3N0LWtleS5wZW0nKSAmJiBmcy5leGlzdHNTeW5jKCcuL2xvY2FsaG9zdC5wZW0nKTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxufTtcblxuLy8gQ29uZmlndXJlIEhUVFBTIGlmIGNlcnRpZmljYXRlcyBhcmUgYXZhaWxhYmxlXG5jb25zdCBnZXRIdHRwc0NvbmZpZyA9ICgpID0+IHtcbiAgaWYgKGhhc0NlcnRpZmljYXRlcygpKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGtleTogZnMucmVhZEZpbGVTeW5jKCcuL2xvY2FsaG9zdC1rZXkucGVtJyksXG4gICAgICBjZXJ0OiBmcy5yZWFkRmlsZVN5bmMoJy4vbG9jYWxob3N0LnBlbScpXG4gICAgfTtcbiAgfVxuICByZXR1cm4gdW5kZWZpbmVkO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKCh7IG1vZGUgfSkgPT4gKHtcbiAgcGx1Z2luczogW1xuICAgIHJlYWN0KCksXG4gICAgbW9kZSA9PT0gJ2RldmVsb3BtZW50JyAmJiBjb21wb25lbnRUYWdnZXIoKSxcbiAgXS5maWx0ZXIoQm9vbGVhbiksXG4gIHJlc29sdmU6IHtcbiAgICBhbGlhczoge1xuICAgICAgXCJAXCI6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwiLi9zcmNcIiksXG4gICAgfSxcbiAgfSxcbiAgYnVpbGQ6IHtcbiAgICByb2xsdXBPcHRpb25zOiB7XG4gICAgICBleHRlcm5hbDogWyd0aHJlZSddLFxuICAgICAgb3V0cHV0OiB7XG4gICAgICAgIG1hbnVhbENodW5rczoge1xuICAgICAgICAgICdyZWFjdC12ZW5kb3InOiBbJ3JlYWN0JywgJ3JlYWN0LWRvbScsICdyZWFjdC1yb3V0ZXItZG9tJ10sXG4gICAgICAgICAgJ3VpLXZlbmRvcic6IFsnQHJhZGl4LXVpL3JlYWN0LWRpYWxvZycsICdAcmFkaXgtdWkvcmVhY3QtZHJvcGRvd24tbWVudScsICdAcmFkaXgtdWkvcmVhY3Qtc2VsZWN0J10sXG4gICAgICAgICAgJ2NoYXJ0LXZlbmRvcic6IFsncmVjaGFydHMnXSxcbiAgICAgICAgICAnYWktdmVuZG9yJzogWydAdGVuc29yZmxvdy90ZmpzJywgJ0B0ZW5zb3JmbG93L3RmanMtYmFja2VuZC13ZWJnbCddLFxuICAgICAgICAgICdibG9ja2NoYWluLXZlbmRvcic6IFsnZXRoZXJzJ10sXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0sXG4gICAgY2h1bmtTaXplV2FybmluZ0xpbWl0OiAxMDAwLFxuICAgIHNvdXJjZW1hcDogZmFsc2UsIC8vIERpc2FibGUgaW4gcHJvZHVjdGlvbiBmb3IgYmV0dGVyIHBlcmZvcm1hbmNlXG4gICAgbWluaWZ5OiAndGVyc2VyJyxcbiAgICB0ZXJzZXJPcHRpb25zOiB7XG4gICAgICBjb21wcmVzczoge1xuICAgICAgICBkcm9wX2NvbnNvbGU6IHRydWUsIC8vIFJlbW92ZSBjb25zb2xlLmxvZyBpbiBwcm9kdWN0aW9uXG4gICAgICAgIGRyb3BfZGVidWdnZXI6IHRydWUsXG4gICAgICB9LFxuICAgIH0sXG4gIH0sXG4gIG9wdGltaXplRGVwczoge1xuICAgIGluY2x1ZGU6IFtcbiAgICAgICdyZWFjdCcsXG4gICAgICAncmVhY3QtZG9tJyxcbiAgICAgICdyZWFjdC1yb3V0ZXItZG9tJyxcbiAgICAgICdAdGFuc3RhY2svcmVhY3QtcXVlcnknLFxuICAgICAgJ0BzdXBhYmFzZS9zdXBhYmFzZS1qcycsXG4gICAgXSxcbiAgfSxcbiAgc2VydmVyOiB7XG4gICAgcG9ydDogODA4MCxcbiAgICBodHRwczogZ2V0SHR0cHNDb25maWcoKSxcbiAgICBob3N0OiB0cnVlLFxuICAgIHByb3h5OiB7XG4gICAgICAnL2FwaSc6IHtcbiAgICAgICAgdGFyZ2V0OiAnaHR0cHM6Ly9sb2NhbGhvc3Q6ODA4MCcsXG4gICAgICAgIHNlY3VyZTogZmFsc2UsXG4gICAgICAgIGNoYW5nZU9yaWdpbjogdHJ1ZVxuICAgICAgfVxuICAgIH1cbiAgfVxufSkpO1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUNBLFNBQVMsb0JBQW9CO0FBQzdCLE9BQU8sV0FBVztBQUNsQixPQUFPLFVBQVU7QUFDakIsT0FBTyxRQUFRO0FBQ2YsU0FBUyx1QkFBdUI7QUFMaEMsSUFBTSxtQ0FBbUM7QUFRekMsSUFBTSxrQkFBa0IsTUFBTTtBQUM1QixNQUFJO0FBQ0YsV0FBTyxHQUFHLFdBQVcscUJBQXFCLEtBQUssR0FBRyxXQUFXLGlCQUFpQjtBQUFBLEVBQ2hGLFNBQVMsR0FBRztBQUNWLFdBQU87QUFBQSxFQUNUO0FBQ0Y7QUFHQSxJQUFNLGlCQUFpQixNQUFNO0FBQzNCLE1BQUksZ0JBQWdCLEdBQUc7QUFDckIsV0FBTztBQUFBLE1BQ0wsS0FBSyxHQUFHLGFBQWEscUJBQXFCO0FBQUEsTUFDMUMsTUFBTSxHQUFHLGFBQWEsaUJBQWlCO0FBQUEsSUFDekM7QUFBQSxFQUNGO0FBQ0EsU0FBTztBQUNUO0FBRUEsSUFBTyxzQkFBUSxhQUFhLENBQUMsRUFBRSxLQUFLLE9BQU87QUFBQSxFQUN6QyxTQUFTO0FBQUEsSUFDUCxNQUFNO0FBQUEsSUFDTixTQUFTLGlCQUFpQixnQkFBZ0I7QUFBQSxFQUM1QyxFQUFFLE9BQU8sT0FBTztBQUFBLEVBQ2hCLFNBQVM7QUFBQSxJQUNQLE9BQU87QUFBQSxNQUNMLEtBQUssS0FBSyxRQUFRLGtDQUFXLE9BQU87QUFBQSxJQUN0QztBQUFBLEVBQ0Y7QUFBQSxFQUNBLE9BQU87QUFBQSxJQUNMLGVBQWU7QUFBQSxNQUNiLFVBQVUsQ0FBQyxPQUFPO0FBQUEsTUFDbEIsUUFBUTtBQUFBLFFBQ04sY0FBYztBQUFBLFVBQ1osZ0JBQWdCLENBQUMsU0FBUyxhQUFhLGtCQUFrQjtBQUFBLFVBQ3pELGFBQWEsQ0FBQywwQkFBMEIsaUNBQWlDLHdCQUF3QjtBQUFBLFVBQ2pHLGdCQUFnQixDQUFDLFVBQVU7QUFBQSxVQUMzQixhQUFhLENBQUMsb0JBQW9CLGdDQUFnQztBQUFBLFVBQ2xFLHFCQUFxQixDQUFDLFFBQVE7QUFBQSxRQUNoQztBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsSUFDQSx1QkFBdUI7QUFBQSxJQUN2QixXQUFXO0FBQUE7QUFBQSxJQUNYLFFBQVE7QUFBQSxJQUNSLGVBQWU7QUFBQSxNQUNiLFVBQVU7QUFBQSxRQUNSLGNBQWM7QUFBQTtBQUFBLFFBQ2QsZUFBZTtBQUFBLE1BQ2pCO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFBQSxFQUNBLGNBQWM7QUFBQSxJQUNaLFNBQVM7QUFBQSxNQUNQO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQUEsRUFDQSxRQUFRO0FBQUEsSUFDTixNQUFNO0FBQUEsSUFDTixPQUFPLGVBQWU7QUFBQSxJQUN0QixNQUFNO0FBQUEsSUFDTixPQUFPO0FBQUEsTUFDTCxRQUFRO0FBQUEsUUFDTixRQUFRO0FBQUEsUUFDUixRQUFRO0FBQUEsUUFDUixjQUFjO0FBQUEsTUFDaEI7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUNGLEVBQUU7IiwKICAibmFtZXMiOiBbXQp9Cg==
