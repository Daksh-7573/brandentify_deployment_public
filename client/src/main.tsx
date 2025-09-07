import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "./context/simple-auth-context";
import Landing from "@/pages/landing";
import "./index.css";

console.log('🚀 Main.tsx executing - loading Brandentifier app');

// Remove loader immediately
const loader = document.getElementById('app-loader');
if (loader) {
  loader.style.display = 'none';
  console.log('✅ Skeleton loader removed');
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div>
          <Landing />
          <Toaster />
        </div>
      </AuthProvider>
    </QueryClientProvider>
  );
}

// Mount the React app
try {
  const root = createRoot(document.getElementById("root")!);
  root.render(<App />);
  console.log('✅ Brandentifier app mounted successfully');
} catch (error) {
  console.error('❌ Error mounting app:', error);
  
  // Fallback display if React fails
  const rootEl = document.getElementById("root");
  if (rootEl) {
    rootEl.innerHTML = `
      <div style="padding: 40px; background: #dc3545; color: white; text-align: center;">
        <h1>App Loading Error</h1>
        <p>There was an issue loading the Brandentifier app.</p>
        <p>Error: ${error}</p>
        <button onclick="location.reload()" style="padding: 10px 20px; margin-top: 20px;">Reload Page</button>
      </div>
    `;
  }
}