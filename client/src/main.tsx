import { createRoot } from "react-dom/client";
import App from "./App";
import SimpleApp from "./simple-app";
import "./index.css";

// Initialize Firebase and other services
import "./lib/firebase";

// Check if we should use the simple app or the full app
const useSimpleApp = false; // Set to true for testing

console.log("main.tsx: Starting React app initialization");
console.log("main.tsx: DOM ready state:", document.readyState);
console.log("main.tsx: Root element found:", !!document.getElementById("root"));

const rootElement = document.getElementById("root");
if (!rootElement) {
  console.error("main.tsx: Root element not found!");
} else {
  console.log("main.tsx: Creating React root and rendering...");
  const root = createRoot(rootElement);
  root.render(useSimpleApp ? <SimpleApp /> : <App />);
  console.log("main.tsx: React render call completed");
}
