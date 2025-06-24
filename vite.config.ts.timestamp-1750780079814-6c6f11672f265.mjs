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
  server: {
    port: 443,
    https: getHttpsConfig(),
    host: true,
    proxy: {
      "/api": {
        target: "https://localhost:443",
        secure: false,
        changeOrigin: true
      }
    }
  }
}));
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9wcm9qZWN0XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3Byb2plY3Qvdml0ZS5jb25maWcudHNcIjtcbmltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gXCJ2aXRlXCI7XG5pbXBvcnQgcmVhY3QgZnJvbSBcIkB2aXRlanMvcGx1Z2luLXJlYWN0XCI7XG5pbXBvcnQgcGF0aCBmcm9tIFwicGF0aFwiO1xuaW1wb3J0IGZzIGZyb20gXCJmc1wiO1xuaW1wb3J0IHsgY29tcG9uZW50VGFnZ2VyIH0gZnJvbSBcImxvdmFibGUtdGFnZ2VyXCI7XG5cbi8vIENoZWNrIGlmIFNTTCBjZXJ0aWZpY2F0ZXMgZXhpc3QgZm9yIEhUVFBTXG5jb25zdCBoYXNDZXJ0aWZpY2F0ZXMgPSAoKSA9PiB7XG4gIHRyeSB7XG4gICAgcmV0dXJuIGZzLmV4aXN0c1N5bmMoJy4vbG9jYWxob3N0LWtleS5wZW0nKSAmJiBmcy5leGlzdHNTeW5jKCcuL2xvY2FsaG9zdC5wZW0nKTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxufTtcblxuLy8gQ29uZmlndXJlIEhUVFBTIGlmIGNlcnRpZmljYXRlcyBhcmUgYXZhaWxhYmxlXG5jb25zdCBnZXRIdHRwc0NvbmZpZyA9ICgpID0+IHtcbiAgaWYgKGhhc0NlcnRpZmljYXRlcygpKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGtleTogZnMucmVhZEZpbGVTeW5jKCcuL2xvY2FsaG9zdC1rZXkucGVtJyksXG4gICAgICBjZXJ0OiBmcy5yZWFkRmlsZVN5bmMoJy4vbG9jYWxob3N0LnBlbScpXG4gICAgfTtcbiAgfVxuICByZXR1cm4gdW5kZWZpbmVkO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKCh7IG1vZGUgfSkgPT4gKHtcbiAgcGx1Z2luczogW1xuICAgIHJlYWN0KCksXG4gICAgbW9kZSA9PT0gJ2RldmVsb3BtZW50JyAmJiBjb21wb25lbnRUYWdnZXIoKSxcbiAgXS5maWx0ZXIoQm9vbGVhbiksXG4gIHJlc29sdmU6IHtcbiAgICBhbGlhczoge1xuICAgICAgXCJAXCI6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwiLi9zcmNcIiksXG4gICAgfSxcbiAgfSxcbiAgc2VydmVyOiB7XG4gICAgcG9ydDogNDQzLFxuICAgIGh0dHBzOiBnZXRIdHRwc0NvbmZpZygpLFxuICAgIGhvc3Q6IHRydWUsXG4gICAgcHJveHk6IHtcbiAgICAgICcvYXBpJzoge1xuICAgICAgICB0YXJnZXQ6ICdodHRwczovL2xvY2FsaG9zdDo0NDMnLFxuICAgICAgICBzZWN1cmU6IGZhbHNlLFxuICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWVcbiAgICAgIH1cbiAgICB9XG4gIH1cbn0pKTtcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFDQSxTQUFTLG9CQUFvQjtBQUM3QixPQUFPLFdBQVc7QUFDbEIsT0FBTyxVQUFVO0FBQ2pCLE9BQU8sUUFBUTtBQUNmLFNBQVMsdUJBQXVCO0FBTGhDLElBQU0sbUNBQW1DO0FBUXpDLElBQU0sa0JBQWtCLE1BQU07QUFDNUIsTUFBSTtBQUNGLFdBQU8sR0FBRyxXQUFXLHFCQUFxQixLQUFLLEdBQUcsV0FBVyxpQkFBaUI7QUFBQSxFQUNoRixTQUFTLEdBQUc7QUFDVixXQUFPO0FBQUEsRUFDVDtBQUNGO0FBR0EsSUFBTSxpQkFBaUIsTUFBTTtBQUMzQixNQUFJLGdCQUFnQixHQUFHO0FBQ3JCLFdBQU87QUFBQSxNQUNMLEtBQUssR0FBRyxhQUFhLHFCQUFxQjtBQUFBLE1BQzFDLE1BQU0sR0FBRyxhQUFhLGlCQUFpQjtBQUFBLElBQ3pDO0FBQUEsRUFDRjtBQUNBLFNBQU87QUFDVDtBQUVBLElBQU8sc0JBQVEsYUFBYSxDQUFDLEVBQUUsS0FBSyxPQUFPO0FBQUEsRUFDekMsU0FBUztBQUFBLElBQ1AsTUFBTTtBQUFBLElBQ04sU0FBUyxpQkFBaUIsZ0JBQWdCO0FBQUEsRUFDNUMsRUFBRSxPQUFPLE9BQU87QUFBQSxFQUNoQixTQUFTO0FBQUEsSUFDUCxPQUFPO0FBQUEsTUFDTCxLQUFLLEtBQUssUUFBUSxrQ0FBVyxPQUFPO0FBQUEsSUFDdEM7QUFBQSxFQUNGO0FBQUEsRUFDQSxRQUFRO0FBQUEsSUFDTixNQUFNO0FBQUEsSUFDTixPQUFPLGVBQWU7QUFBQSxJQUN0QixNQUFNO0FBQUEsSUFDTixPQUFPO0FBQUEsTUFDTCxRQUFRO0FBQUEsUUFDTixRQUFRO0FBQUEsUUFDUixRQUFRO0FBQUEsUUFDUixjQUFjO0FBQUEsTUFDaEI7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUNGLEVBQUU7IiwKICAibmFtZXMiOiBbXQp9Cg==
