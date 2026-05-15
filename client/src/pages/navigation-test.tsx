import { useLocation } from "wouter";

export default function NavigationTest() {
  const [location, navigate] = useLocation();

  const pages = [
    { name: "Home", path: "/" },
    { name: "Industry Pulse", path: "/industry-pulse" },
    { name: "Create Pulse (with URL inputs)", path: "/create-pulse" },
    { name: "Profile", path: "/profile" },
    { name: "Search", path: "/search" },
    { name: "Portfolio Builder", path: "/portfolio-builder" },
    { name: "Auth", path: "/auth" },
  ];

  return (
    <div style={{ 
      padding: "20px", 
      fontFamily: "Arial, sans-serif",
      backgroundColor: "#f8f9fa",
      minHeight: "100vh"
    }}>
      <div style={{
        maxWidth: "800px",
        margin: "0 auto",
        backgroundColor: "white",
        padding: "30px",
        borderRadius: "12px",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)"
      }}>
        <h1 style={{ color: "#333", marginBottom: "10px" }}>
          Brandentify Navigation Test
        </h1>
        <p style={{ color: "#666", marginBottom: "30px" }}>
          Current page: <strong>{location}</strong>
        </p>
        
        <div style={{ marginBottom: "30px" }}>
          <h2 style={{ color: "#333", marginBottom: "15px" }}>Available Pages:</h2>
          <div style={{ display: "grid", gap: "10px" }}>
            {pages.map((page) => (
              <button
                key={page.path}
                onClick={() => navigate(page.path)}
                style={{
                  padding: "12px 20px",
                  backgroundColor: location === page.path ? "#007bff" : "#6c757d",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "16px",
                  textAlign: "left"
                }}
              >
                {page.name} → {page.path}
              </button>
            ))}
          </div>
        </div>

        <div style={{
          backgroundColor: "#e8f5e8",
          padding: "20px",
          borderRadius: "8px",
          marginBottom: "20px"
        }}>
          <h3 style={{ color: "#155724", marginBottom: "10px" }}>
            URL Input Feature Location:
          </h3>
          <p style={{ color: "#155724", margin: 0 }}>
            The URL input functionality has been added to the <strong>Create Pulse</strong> page.
            Click the "Create Pulse" button above to access it.
          </p>
        </div>

        <div style={{
          backgroundColor: "#fff3cd",
          padding: "20px",
          borderRadius: "8px"
        }}>
          <h3 style={{ color: "#856404", marginBottom: "10px" }}>
            How to use URL inputs:
          </h3>
          <ol style={{ color: "#856404", margin: 0, paddingLeft: "20px" }}>
            <li>Go to Create Pulse page</li>
            <li>Select either "Images" or "Video" tab</li>
            <li>Look for "Add Image URL" or "Add Video URL" fields</li>
            <li>Paste your media URLs directly instead of uploading files</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
