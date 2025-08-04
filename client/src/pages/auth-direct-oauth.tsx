import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function AuthDirectOAuth() {
  const [status, setStatus] = useState("Ready to test direct OAuth");
  const [logs, setLogs] = useState<string[]>([]);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const addLog = (message: string, type: 'info' | 'error' | 'success' = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] [${type.toUpperCase()}] ${message}`;
    setLogs(prev => [...prev, logEntry]);
    console.log(logEntry);
  };

  useEffect(() => {
    // Check for OAuth callback parameters
    checkOAuthCallback();
  }, []);

  const checkOAuthCallback = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const error = urlParams.get('error');
    const state = urlParams.get('state');

    if (code) {
      addLog(`OAuth authorization code received: ${code.substring(0, 20)}...`, 'success');
      handleOAuthCallback(code);
    } else if (error) {
      addLog(`OAuth error received: ${error}`, 'error');
      const errorDesc = urlParams.get('error_description');
      if (errorDesc) {
        addLog(`Error description: ${errorDesc}`, 'error');
      }
    } else if (state && !code && !error) {
      addLog("OAuth state parameter found but no code/error - possible timeout", 'error');
    }
  };

  const handleOAuthCallback = async (code: string) => {
    addLog("Processing OAuth authorization code...");
    
    try {
      // In a real implementation, you would send this code to your backend
      // to exchange for access tokens. For now, we'll just show success.
      addLog("Authorization code received successfully!", 'success');
      setStatus("✅ OAuth authorization successful - code received");
      
      // Store the success state
      sessionStorage.setItem('oauth_success', JSON.stringify({
        code: code.substring(0, 20) + '...',
        timestamp: new Date().toISOString()
      }));
      
    } catch (error) {
      addLog(`Error processing OAuth callback: ${error}`, 'error');
    }
  };

  const testDirectGoogleOAuth = () => {
    if (isAuthenticating) {
      addLog("Authentication already in progress...", 'info');
      return;
    }

    setIsAuthenticating(true);
    setStatus("Starting direct Google OAuth...");
    addLog("Starting direct Google OAuth test...");

    try {
      // Get the Google Client ID from Firebase API Key (this is a workaround)
      const firebaseApiKey = import.meta.env.VITE_FIREBASE_API_KEY;
      const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
      
      // For Firebase projects, the OAuth client ID is often the project number + app domain
      // But we'll need to extract it from the Firebase config or use a separate OAuth client
      
      addLog("Note: Direct OAuth requires a separate Google OAuth Client ID");
      addLog("Firebase API keys are not the same as OAuth Client IDs");
      addLog("You would need to create a separate OAuth client in Google Cloud Console");
      
      const mockClientId = "your-oauth-client-id.apps.googleusercontent.com";
      const redirectUri = encodeURIComponent(window.location.href);
      const scope = encodeURIComponent('openid email profile');
      const state = Math.random().toString(36).substring(2, 15);
      
      const googleOAuthUrl = 
        `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${mockClientId}&` +
        `redirect_uri=${redirectUri}&` +
        `scope=${scope}&` +
        `response_type=code&` +
        `state=${state}&` +
        `access_type=online&` +
        `prompt=select_account`;
      
      addLog("Direct OAuth URL constructed:");
      addLog(googleOAuthUrl.substring(0, 150) + "...");
      
      addLog("To implement direct OAuth:", 'info');
      addLog("1. Create OAuth 2.0 client in Google Cloud Console", 'info');
      addLog("2. Add your domain to authorized redirect URIs", 'info');
      addLog("3. Use the OAuth client ID (not Firebase API key)", 'info');
      addLog("4. Handle the authorization code exchange on your backend", 'info');
      
      setStatus("Direct OAuth setup instructions provided");
      
    } catch (error) {
      addLog(`Direct OAuth setup failed: ${error}`, 'error');
      setStatus(`❌ Direct OAuth failed: ${error}`);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const testFirebaseWithDebugging = async () => {
    addLog("Testing Firebase with enhanced debugging...");
    
    try {
      const { signInWithPopup } = await import('firebase/auth');
      const { auth, googleProvider } = await import('@/lib/firebase');
      
      // Log detailed Firebase configuration
      const config = (auth as any).config;
      addLog(`Firebase Auth Domain: ${config.authDomain}`);
      addLog(`Firebase Project ID: ${config.projectId}`);
      addLog(`Firebase API Key: ${config.apiKey?.substring(0, 20)}...`);
      
      // Check if auth domain resolves
      addLog("Testing auth domain connectivity...");
      
      try {
        const response = await fetch(`https://${config.authDomain}/__/auth/handler`, {
          method: 'HEAD',
          mode: 'no-cors'
        });
        addLog("Auth domain is accessible");
      } catch (error) {
        addLog(`Auth domain connectivity issue: ${error}`, 'error');
      }
      
      // Create a custom popup with specific dimensions and features
      addLog("Testing custom popup configuration...");
      
      const popupFeatures = [
        'width=500',
        'height=600',
        'top=' + (window.screen.height / 2 - 300),
        'left=' + (window.screen.width / 2 - 250),
        'toolbar=no',
        'location=no',
        'directories=no',
        'status=no',
        'menubar=no',
        'scrollbars=yes',
        'resizable=yes',
        'copyhistory=no'
      ].join(',');
      
      addLog(`Popup features: ${popupFeatures}`);
      
      // Test manual popup creation
      const testUrl = `https://${config.authDomain}/__/auth/handler?state=test`;
      const testPopup = window.open(testUrl, 'firebase-auth-test', popupFeatures);
      
      if (testPopup) {
        addLog("Custom popup created successfully");
        
        // Close the test popup after 2 seconds
        setTimeout(() => {
          if (testPopup && !testPopup.closed) {
            testPopup.close();
            addLog("Test popup closed");
          }
        }, 2000);
        
      } else {
        addLog("Custom popup creation failed - browser blocking", 'error');
      }
      
    } catch (error) {
      addLog(`Firebase debugging failed: ${error}`, 'error');
    }
  };

  const checkPopupPermissions = () => {
    addLog("Checking popup permissions and browser settings...");
    
    // Check popup blocker
    const testPopup = window.open('', '_blank', 'width=1,height=1');
    if (testPopup) {
      testPopup.close();
      addLog("✅ Popup permission: ALLOWED");
    } else {
      addLog("❌ Popup permission: BLOCKED", 'error');
      addLog("Please allow popups for this site in your browser settings", 'error');
    }
    
    // Check browser details
    addLog(`Browser: ${navigator.userAgent}`);
    addLog(`Screen size: ${window.screen.width}x${window.screen.height}`);
    addLog(`Window size: ${window.innerWidth}x${window.innerHeight}`);
    addLog(`Cookie enabled: ${navigator.cookieEnabled}`);
    addLog(`Java enabled: ${navigator.javaEnabled()}`);
    
    // Check if third-party cookies are enabled (important for OAuth)
    addLog("Checking third-party cookie support...");
    
    // Test storage access
    try {
      localStorage.setItem('test', 'value');
      localStorage.removeItem('test');
      addLog("✅ Local storage: WORKING");
    } catch (error) {
      addLog("❌ Local storage: BLOCKED", 'error');
    }
    
    try {
      sessionStorage.setItem('test', 'value');
      sessionStorage.removeItem('test');
      addLog("✅ Session storage: WORKING");
    } catch (error) {
      addLog("❌ Session storage: BLOCKED", 'error');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Direct OAuth Authentication Test</h1>
        
        <div className="bg-blue-900/20 border border-blue-600 rounded-lg p-4 mb-6">
          <h3 className="text-blue-400 font-semibold mb-2">Current Status</h3>
          <p className="text-blue-200 text-sm">{status}</p>
        </div>

        <div className="bg-red-900/20 border border-red-600 rounded-lg p-4 mb-6">
          <h3 className="text-red-400 font-semibold mb-2">Popup Timeout Issue</h3>
          <p className="text-red-200 text-sm">
            Firebase popup is timing out after 10 seconds even with domain authorization. 
            This suggests a deeper configuration issue or browser compatibility problem.
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <Button
            onClick={testDirectGoogleOAuth}
            disabled={isAuthenticating}
            className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg text-white"
          >
            {isAuthenticating ? 'Setting up...' : 'Setup Direct Google OAuth'}
          </Button>
          
          <Button
            onClick={testFirebaseWithDebugging}
            className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg text-white"
          >
            Debug Firebase Configuration
          </Button>
          
          <Button
            onClick={checkPopupPermissions}
            className="bg-orange-600 hover:bg-orange-700 px-6 py-3 rounded-lg text-white"
          >
            Check Browser Permissions
          </Button>
        </div>
        
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Debug Logs</h2>
          <div className="text-sm bg-gray-900 p-4 rounded h-96 overflow-y-auto font-mono">
            {logs.map((log, index) => (
              <div 
                key={index} 
                className={`mb-1 ${
                  log.includes('[ERROR]') ? 'text-red-400' : 
                  log.includes('[SUCCESS]') ? 'text-green-400' : 
                  log.includes('[INFO]') && log.includes('✅') ? 'text-green-400' :
                  log.includes('[INFO]') && log.includes('❌') ? 'text-red-400' :
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