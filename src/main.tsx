
import React from "react";
import ReactDOM from "react-dom/client";
import { AuthProvider } from "@/context/AuthContext";
import App from "./App";
import "./index.css";

// Import your publishable key
const PUBLISHABLE_KEY = "pk_test_YW1wbGUtcXVhaWwtMTAuY2xlcmsuYWNjb3VudHMuZGV2JA";

if (!PUBLISHABLE_KEY) {
  console.warn("Missing Clerk Publishable Key. Please add VITE_CLERK_PUBLISHABLE_KEY to your environment variables.");
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
