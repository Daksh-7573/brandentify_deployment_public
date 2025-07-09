import { createRoot } from "react-dom/client";

// Simple test component to isolate the issue
function SimpleApp() {
  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>React App is Working!</h1>
      <p>This is a simple test to ensure React can mount properly.</p>
    </div>
  );
}

const rootElement = document.getElementById("root");
if (rootElement) {
  createRoot(rootElement).render(<SimpleApp />);
} else {
  console.error("Root element not found");
}