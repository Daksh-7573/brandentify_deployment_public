import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Initialize Firebase and other services with error handling
try {
  import("./lib/firebase").then(() => {
    console.log("Firebase initialized successfully");
  }).catch((error) => {
    console.error("Firebase initialization failed:", error);
  });
} catch (error) {
  console.error("Firebase import failed:", error);
}

const rootElement = document.getElementById("root");
if (rootElement) {
  try {
    createRoot(rootElement).render(<App />);
    console.log("React app mounted successfully");
  } catch (error) {
    console.error("React app mounting failed:", error);
    // Fallback to simple content
    rootElement.innerHTML = `
      <div style="padding: 20px; font-family: Arial, sans-serif;">
        <h1>Application Loading Error</h1>
        <p>The main application failed to load. Please check the console for details.</p>
        <pre>${error}</pre>
      </div>
    `;
  }
} else {
  console.error("Root element not found");
}
