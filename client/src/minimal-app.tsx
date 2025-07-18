import { useState, useEffect } from 'react';

// Minimal working app to test basic connectivity
function MinimalApp() {
  const [apiStatus, setApiStatus] = useState('Testing...');
  const [pulses, setPulses] = useState<any[]>([]);

  useEffect(() => {
    // Test basic API connectivity
    const testApi = async () => {
      try {
        const response = await fetch('/api/pulses?limit=5');
        if (response.ok) {
          const data = await response.json();
          setApiStatus('✓ API Connected');
          setPulses(data.slice(0, 3));
        } else {
          setApiStatus(`✗ API Error: ${response.status}`);
        }
      } catch (error) {
        setApiStatus(`✗ Network Error: ${error.message}`);
      }
    };

    testApi();
  }, []);

  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'Arial, sans-serif',
      maxWidth: '800px',
      margin: '0 auto'
    }}>
      <h1>Brandentifier - Minimal Test</h1>
      <p><strong>API Status:</strong> {apiStatus}</p>
      
      {pulses.length > 0 && (
        <div>
          <h2>Sample Pulses:</h2>
          {pulses.map((pulse, index) => (
            <div key={index} style={{ 
              border: '1px solid #ddd', 
              margin: '10px 0', 
              padding: '10px',
              borderRadius: '4px'
            }}>
              <h3>{pulse.title || 'No title'}</h3>
              <p>{pulse.content?.substring(0, 100) || 'No content'}...</p>
              <small>Type: {pulse.type} | Category: {pulse.category}</small>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MinimalApp;