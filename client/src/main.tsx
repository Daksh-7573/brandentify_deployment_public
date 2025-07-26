import { createRoot } from "react-dom/client";
import App from "./App";
import SimpleApp from "./simple-app";
import "./index.css";

// Initialize Firebase and other services
import "./lib/firebase";

// Performance measurement
const appStartTime = performance.now();
console.log('[PERF] React app initialization started');

// Remove HTML loader immediately when React app starts
const loader = document.getElementById('app-loader');
if (loader) {
  loader.style.opacity = '0';
  loader.style.transition = 'opacity 0.15s ease-out';
  setTimeout(() => {
    loader.style.display = 'none';
    console.log('[PERF] Skeleton loader removed in', (performance.now() - appStartTime).toFixed(2), 'ms');
  }, 150);
}

// Check if we should use the simple app or the full app
const useSimpleApp = false; // Set to true for testing

// Progressive rendering - start with critical components
const renderApp = () => {
  const renderStartTime = performance.now();
  console.log('[PERF] React rendering started');
  
  createRoot(document.getElementById("root")!).render(
    useSimpleApp ? <SimpleApp /> : <App />
  );
  
  // Report rendering time after React has mounted
  setTimeout(() => {
    console.log('[PERF] React app rendered in', (performance.now() - renderStartTime).toFixed(2), 'ms');
    console.log('[PERF] Total initialization time:', (performance.now() - appStartTime).toFixed(2), 'ms');
  }, 0);
};

// Optimize rendering timing
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', renderApp);
} else {
  renderApp();
}
