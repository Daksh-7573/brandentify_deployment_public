import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Remove HTML loader immediately when React app starts
const loader = document.getElementById('app-loader');
if (loader) {
  loader.style.opacity = '0';
  loader.style.transition = 'opacity 0.15s ease-out';
  setTimeout(() => {
    loader.style.display = 'none';
    console.log('Skeleton loader removed');
  }, 150);
}

// Simple function to mount app
const renderApp = () => {
  const root = document.getElementById("root");
  if (root) {
    createRoot(root).render(<App />);
    console.log('React app mounted successfully');
  } else {
    console.error('Root element not found');
  }
};

// Render the app
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', renderApp);
} else {
  renderApp();
}