import { createRoot } from "react-dom/client";
import App from "./App";
import SimpleApp from "./simple-app";
import "./index.css";

// Note: Firebase removed - using custom OAuth only

// Performance measurement
const appStartTime = performance.now();
console.log('[PERF] React app initialization started');

// Lazy load non-critical CSS after first paint
const loadNonCriticalCSS = () => {
  if (document.readyState === 'complete') {
    // Dynamically load heavy animation and theme CSS after paint
    const styleSheets = [
      './styles/neo-glass-main.css',
      './styles/neo-glass-theme.css',
      './styles/neo-glass-spotify.css',
      './styles/neopastel.css'
    ];
    
    styleSheets.forEach(sheet => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = sheet;
      link.media = 'print';
      link.onload = function() {
        link.media = 'all';
      };
      document.head.appendChild(link);
    });
  }
};

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
  
  // Load non-critical CSS after first paint
  if (document.readyState === 'loading') {
    document.addEventListener('load', loadNonCriticalCSS);
  } else {
    setTimeout(loadNonCriticalCSS, 100);
  }
  
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
