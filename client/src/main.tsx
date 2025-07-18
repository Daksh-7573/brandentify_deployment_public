import { createRoot } from "react-dom/client";
import MinimalApp from "./minimal-app";

const rootElement = document.getElementById("root");
if (rootElement) {
  createRoot(rootElement).render(<MinimalApp />);
  console.log("Minimal React app mounted successfully");
} else {
  console.error("Root element not found");
}
