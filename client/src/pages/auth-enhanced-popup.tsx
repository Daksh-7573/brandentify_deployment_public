import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { signInWithPopup, GoogleAuthProvider, getAuth } from 'firebase/auth';

export default function AuthEnhancedPopup() {
  const [status, setStatus] = useState("Ready to test enhanced popup authentication");
  const [logs, setLogs] = useState<string[]>([]);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const addLog = (message: string, type: 'info' | 'error' | 'success' = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] [${type.toUpperCase()}] ${message}`;
    setLogs(prev => [...prev, logEntry]);
    console.log(logEntry);
  };

  const testEnhancedAuth = async () => {
    if (isAuthenticating) {
      addLog("Authentication already in progress...", 'info');
      return;
    }

    setIsAuthenticating(true);
    setStatus("Starting enhanced authentication...");
    addLog("Starting enhanced popup authentication test...");

    try {
      // Check environment variables first
      const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
      const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
      const appId = import.meta.env.VITE_FIREBASE_APP_ID;

      addLog(`Environment - API Key: ${apiKey ? 'Present' : 'MISSING'}`);
      addLog(`Environment - Project ID: ${projectId || 'MISSING'}`);
      addLog(`Environment - App ID: ${appId ? 'Present' : 'MISSING'}`);

      if (!apiKey || !projectId || !appId) {
        throw new Error("Missing Firebase environment variables");
      }

      // Create a fresh Firebase configuration
      const firebaseConfig = {
        apiKey: apiKey,
        authDomain: `${projectId}.firebaseapp.com`,
        projectId: projectId,
        storageBucket: `${projectId}.appspot.com`,
        appId: appId,
      };

      addLog(`Using auth domain: ${firebaseConfig.authDomain}`);
      addLog(`Project ID: ${firebaseConfig.projectId}`);

      // Import Firebase
      const { initializeApp, getApps } = await import('firebase/app');
      
      // Initialize or get existing Firebase app
      let app;
      const existingApps = getApps();
      if (existingApps.length > 0) {
        app = existingApps[0];
        addLog("Using existing Firebase app");
      } else {
        app = initializeApp(firebaseConfig);
        addLog("Initialized new Firebase app");
      }

      // Get auth instance
      const auth = getAuth(app);
      addLog(`Auth instance created for project: ${auth.app.options.projectId}`);

      // Create Google provider with enhanced configuration
      const provider = new GoogleAuthProvider();
      
      // Enhanced provider configuration for better popup handling
      provider.setCustomParameters({
        prompt: 'select_account',
        access_type: 'online',
        include_granted_scopes: 'true'
      });

      // Add required scopes
      provider.addScope('email');
      provider.addScope('profile');
      provider.addScope('openid');

      addLog("Google provider configured with enhanced settings");

      // Test popup creation first
      addLog("Testing popup window capabilities...");
      const testPopup = window.open('', '_blank', 'width=500,height=600,scrollbars=yes,resizable=yes');
      if (testPopup) {
        testPopup.close();
        addLog("Popup creation: SUCCESS");
      } else {
        addLog("Popup creation: BLOCKED", 'error');
        throw new Error("Popup blocked by browser");
      }

      // Set popup timeout handling
      addLog("Attempting signInWithPopup with enhanced timeout handling...");
      
      // Create a promise with timeout to handle popup closure
      const authPromise = signInWithPopup(auth, provider);
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('Authentication timeout - popup took too long'));
        }, 60000); // 60 second timeout
      });

      // Race between auth and timeout
      const result = await Promise.race([authPromise, timeoutPromise]);

      if (result && typeof result === 'object' && 'user' in result) {
        addLog(`Authentication SUCCESS: ${result.user.email}`, 'success');
        addLog(`User UID: ${result.user.uid}`, 'success');
        addLog(`Display Name: ${result.user.displayName}`, 'success');
        addLog(`Email Verified: ${result.user.emailVerified}`, 'success');
        
        setStatus(`✅ Authentication successful: ${result.user.email}`);
        
        // Store success in session for other pages to check
        sessionStorage.setItem('enhanced_auth_success', JSON.stringify({
          email: result.user.email,
          uid: result.user.uid,
          timestamp: new Date().toISOString()
        }));

      } else {
        throw new Error("Invalid authentication result");
      }

    } catch (error: any) {
      addLog(`Authentication FAILED: ${error.code || 'unknown'} - ${error.message}`, 'error');
      
      // Enhanced error analysis
      if (error.code === 'auth/popup-closed-by-user') {
        addLog("ANALYSIS: Popup closed before authentication completed", 'error');
        addLog("This usually means the popup timed out or user cancelled", 'error');
      } else if (error.code === 'auth/popup-blocked') {
        addLog("ANALYSIS: Browser blocked the popup window", 'error');
      } else if (error.code === 'auth/unauthorized-domain') {
        addLog("ANALYSIS: Current domain not authorized in Firebase Console", 'error');
        addLog(`Current domain: ${window.location.hostname}`, 'error');
      } else if (error.message.includes('timeout')) {
        addLog("ANALYSIS: Authentication timed out after 60 seconds", 'error');
      } else {
        addLog(`ANALYSIS: Unexpected error - ${error.code || 'unknown'}`, 'error');
      }
      
      setStatus(`❌ Authentication failed: ${error.message}`);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const testDirectGoogleAuth = async () => {
    addLog("Testing direct Google OAuth without Firebase wrapper...");
    
    try {
      // Create a direct Google OAuth URL
      const clientId = import.meta.env.VITE_FIREBASE_API_KEY; // This might not work, but let's try
      const redirectUri = encodeURIComponent(window.location.origin + '/auth-callback');
      const scope = encodeURIComponent('email profile openid');
      
      const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${clientId}&` +
        `redirect_uri=${redirectUri}&` +
        `scope=${scope}&` +
        `response_type=code&` +
        `access_type=online&` +
        `prompt=select_account`;
      
      addLog(`Direct Google URL: ${googleAuthUrl.substring(0, 100)}...`);
      
      // Open in popup
      const popup = window.open(googleAuthUrl, 'google-auth', 'width=500,height=600,scrollbars=yes');
      if (popup) {
        addLog("Direct Google OAuth popup opened successfully");
      } else {
        addLog("Failed to open direct Google OAuth popup", 'error');
      }
      
    } catch (error) {
      addLog(`Direct Google OAuth failed: ${error}`, 'error');
    }
  };

  const checkEnvironmentVariables = () => {
    addLog("Checking all environment variables...");
    
    const envVars = [
      'VITE_FIREBASE_API_KEY',
      'VITE_FIREBASE_PROJECT_ID', 
      'VITE_FIREBASE_APP_ID'
    ];
    
    envVars.forEach(varName => {
      const value = import.meta.env[varName];
      addLog(`${varName}: ${value ? `Present (${value.substring(0, 20)}...)` : 'MISSING'}`);
    });
    
    // Also check window.location details
    addLog(`Current URL: ${window.location.href}`);
    addLog(`Current hostname: ${window.location.hostname}`);
    addLog(`Current protocol: ${window.location.protocol}`);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Enhanced Popup Authentication Test</h1>
        
        <div className="bg-blue-900/20 border border-blue-600 rounded-lg p-4 mb-6">
          <h3 className="text-blue-400 font-semibold mb-2">Current Status</h3>
          <p className="text-blue-200 text-sm">{status}</p>
        </div>

        <div className="space-y-4 mb-6">
          <Button
            onClick={testEnhancedAuth}
            disabled={isAuthenticating}
            className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg text-white"
          >
            {isAuthenticating ? 'Authenticating...' : 'Test Enhanced Popup Authentication'}
          </Button>
          
          <Button
            onClick={testDirectGoogleAuth}
            className="bg-orange-600 hover:bg-orange-700 px-6 py-3 rounded-lg text-white"
          >
            Test Direct Google OAuth
          </Button>
          
          <Button
            onClick={checkEnvironmentVariables}
            className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg text-white"
          >
            Check Environment Variables
          </Button>
        </div>
        
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Enhanced Debug Logs</h2>
          <div className="text-sm bg-gray-900 p-4 rounded h-96 overflow-y-auto font-mono">
            {logs.map((log, index) => (
              <div 
                key={index} 
                className={`mb-1 ${
                  log.includes('[ERROR]') ? 'text-red-400' : 
                  log.includes('[SUCCESS]') ? 'text-green-400' : 
                  'text-gray-300'
                }`}
              >
                {log}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}