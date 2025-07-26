import { createRoot } from "react-dom/client";
import App from "./App";
import SimpleApp from "./simple-app";
import "./index.css";

// Initialize Firebase and other services
import "./lib/firebase";

// Remove HTML loader immediately when React app starts
const loader = document.getElementById('app-loader');
if (loader) {
  loader.style.display = 'none';
}

// Check if we should use the simple app or the full app
const useSimpleApp = false; // Set to true for testing

createRoot(document.getElementById("root")!).render(
  useSimpleApp ? <SimpleApp /> : <App />
);
