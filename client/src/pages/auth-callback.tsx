import { useEffect, useState } from "react";
import { useLocation } from "wouter";

export default function AuthCallback() {
  const [, setLocation] = useLocation();
  const [status, setStatus] = useState("Processing authentication...");

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const redirectUrl = urlParams.get('redirectUrl');
        
        setStatus("Authentication successful! Redirecting...");
        
        // Close popup if this is in a popup
        if (window.opener) {
          window.close();
          return;
        }
        
        // Otherwise redirect to the intended destination
        if (redirectUrl) {
          const targetUrl = decodeURIComponent(redirectUrl);
          const path = new URL(targetUrl).pathname;
          setLocation(path);
        } else {
          setLocation('/dashboard');
        }
        
      } catch (error) {
        console.error("Auth callback error:", error);
        setStatus(`Authentication error: ${error}`);
      }
    };

    handleAuthCallback();
  }, [setLocation]);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-lg">{status}</p>
      </div>
    </div>
  );
}