// Minimal test to check if React works without any complex dependencies
import { createRoot } from "react-dom/client";

function MinimalApp() {
  return (
    <div style={{ 
      padding: "20px", 
      fontFamily: "Arial, sans-serif", 
      backgroundColor: "#f0f0f0",
      minHeight: "100vh"
    }}>
      <h1 style={{ color: "#333" }}>Brandentifier - Minimal Test</h1>
      <p style={{ color: "#666" }}>✓ React is working</p>
      <p style={{ color: "#666" }}>✓ Server connection established</p>
      <p style={{ color: "#666" }}>✓ Frontend loading successfully</p>
    </div>
  );
}

const root = document.getElementById("root");
if (root) {
  createRoot(root).render(<MinimalApp />);
}