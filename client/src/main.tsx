import { createRoot } from "react-dom/client";
import SimpleApp from "./App-simple";
import "./index.css";

const rootElement = document.getElementById("root");
if (rootElement) {
  try {
    createRoot(rootElement).render(<SimpleApp />);
    console.log("Simple React app mounted successfully");
  } catch (error) {
    console.error("React app mounting failed:", error);
  }
} else {
  console.error("Root element not found");
}
