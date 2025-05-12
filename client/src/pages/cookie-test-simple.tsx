import React, { useEffect, useState } from 'react';

// Simple test page without any fancy components
const CookieTestSimple: React.FC = () => {
  const [localStorageContent, setLocalStorageContent] = useState<string>('');
  const [apiResponse, setApiResponse] = useState<{ anonymous: string }>({
    anonymous: ''
  });
  
  // Load localStorage content
  useEffect(() => {
    const checkLocalStorage = () => {
      try {
        const cookiePrefs = localStorage.getItem('cookieConsent');
        setLocalStorageContent(
          `cookieConsent: ${cookiePrefs || 'not set'}`
        );
      } catch (e) {
        setLocalStorageContent('Error accessing localStorage');
      }
    };
    
    checkLocalStorage();
  }, []);
  
  // Check API endpoints
  const checkApiEndpoints = async () => {
    try {
      // Try anonymous endpoint
      const anonResp = await fetch('/api/privacy/cookie-consent/anonymous');
      const anonText = anonResp.ok 
        ? JSON.stringify(await anonResp.json(), null, 2) 
        : `Status: ${anonResp.status} - ${anonResp.statusText}`;
      
      setApiResponse({
        anonymous: anonText
      });
      
      alert("API Endpoints Checked");
    } catch (error) {
      console.error('Error checking endpoints:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      setApiResponse({
        anonymous: `Error: ${errorMessage}`
      });
      
      alert("Error checking endpoints: " + errorMessage);
    }
  };
  
  // Save simple preferences
  const saveSimplePreferences = async () => {
    try {
      // Simple preferences to save
      const preferences = {
        essential: true,
        functional: true,
        analytics: false,
        advertising: false,
        social: false
      };
      
      // Save to localStorage
      localStorage.setItem('cookieConsent', JSON.stringify(preferences));
      
      // Use the anonymous endpoint to store in session
      const response = await fetch('/api/privacy/cookie-consent/anonymous', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preferences),
      });
      
      if (response.ok) {
        alert("Preferences saved successfully");
      } else {
        alert("Failed to save preferences");
      }
    } catch (error) {
      alert("Error: " + (error instanceof Error ? error.message : String(error)));
    }
  };
  
  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'Arial, sans-serif',
      maxWidth: '800px',
      margin: '0 auto' 
    }}>
      <h1 style={{ marginBottom: '20px' }}>Simple Cookie Test Page</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>LocalStorage Content:</h3>
        <pre style={{ 
          backgroundColor: '#f5f5f5', 
          padding: '10px', 
          borderRadius: '4px',
          overflow: 'auto'
        }}>
          {localStorageContent}
        </pre>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>API Response:</h3>
        <pre style={{ 
          backgroundColor: '#f5f5f5', 
          padding: '10px', 
          borderRadius: '4px',
          overflow: 'auto',
          height: '200px'
        }}>
          {apiResponse.anonymous}
        </pre>
      </div>
      
      <div>
        <button 
          style={{
            padding: '10px 15px',
            marginRight: '10px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
          onClick={saveSimplePreferences}
        >
          Save Simple Preferences
        </button>
        
        <button 
          style={{
            padding: '10px 15px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
          onClick={checkApiEndpoints}
        >
          Check API Endpoints
        </button>
      </div>
    </div>
  );
};

export default CookieTestSimple;