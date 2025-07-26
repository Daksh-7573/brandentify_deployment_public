import { createRoot } from "react-dom/client";
import App from "./App";
import SimpleApp from "./simple-app";
import "./index.css";

// Initialize Firebase and other services
import "./lib/firebase";

// Remove HTML loader immediately when React app starts
const loader = document.getElementById('app-loader');
if (loader) {
  loader.style.opacity = '0';
  loader.style.transition = 'opacity 0.15s ease-out';
  setTimeout(() => {
    loader.style.display = 'none';
  }, 150);
}

// Check if we should use the simple app or the full app
const useSimpleApp = false; // Set to true for testing

// Progressive rendering - start with critical components
const renderApp = () => {
  createRoot(document.getElementById("root")!).render(
    useSimpleApp ? <SimpleApp /> : <App />
  );
};

// Optimize rendering timing
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', renderApp);
} else {
  renderApp();
}
