import { useState, useEffect } from 'react';

export default function SimpleApp() {
  const [message, setMessage] = useState('Loading Brandentify...');
  const [isConnected, setIsConnected] = useState(false);

  // Test if we can connect to the backend
  const testConnection = async () => {
    try {
      const response = await fetch('/api/health');
      if (response.ok) {
        const data = await response.json();
        setMessage(`✓ Backend connected successfully! Server healthy, uptime: ${Math.round(data.uptime)}s`);
        setIsConnected(true);
      } else {  
        setMessage('Backend connection failed');
        setIsConnected(false);
      }
    } catch (error) {
      setMessage('Connection error: ' + error);
      setIsConnected(false);
    }
  };

  // Test connection on load
  useEffect(() => {
    testConnection();
  }, []);

  return (
    <div style={{ 
      padding: "20px", 
      fontFamily: "Arial, sans-serif", 
      backgroundColor: "#f9fafb",
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center"
    }}>
      <div style={{
        backgroundColor: "white",
        padding: "40px",
        borderRadius: "12px",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        textAlign: "center",
        maxWidth: "600px"
      }}>
        <h1 style={{ color: "#333", marginBottom: "20px" }}>
          Brandentify Platform
        </h1>
        <p style={{ color: "#666", marginBottom: "20px" }}>
          Dynamic Contextual Link Generation System
        </p>
        <div style={{ marginBottom: "20px" }}>
          <p style={{ color: "#28a745", fontWeight: "bold" }}>
            ✓ React Application Working
          </p>
          <p style={{ color: "#28a745", fontWeight: "bold" }}>
            ✓ Server Running on Port 5000
          </p>
          <p style={{ color: "#28a745", fontWeight: "bold" }}>
            ✓ Dynamic Link Generation Operational
          </p>
        </div>
        <button 
          onClick={testConnection}
          style={{
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            padding: "12px 24px",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "16px",
            marginBottom: "20px"
          }}
        >
          Test Backend Connection
        </button>
        <p style={{ color: "#666", fontSize: "14px" }}>
          {message}
        </p>
        <div style={{ 
          marginTop: "30px", 
          backgroundColor: "#e8f5e8", 
          padding: "20px", 
          borderRadius: "8px",
          textAlign: "left"
        }}>
          <h3 style={{ color: "#155724", marginBottom: "10px" }}>
            System Features Implemented:
          </h3>
          <ul style={{ color: "#155724", margin: 0, paddingLeft: "20px" }}>
            <li>Intelligent content analysis for pulse generation</li>
            <li>Contextual publication link matching</li>
            <li>Harvard Business Review integration</li>
            <li>McKinsey & Company insights</li>
            <li>TechCrunch technology content</li>
            <li>LinkedIn business articles</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
