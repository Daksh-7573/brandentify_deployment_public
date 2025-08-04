import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { signInWithRedirect, getRedirectResult, GoogleAuthProvider, getAuth } from 'firebase/auth';

export default function AuthRedirectTest() {
  const [status, setStatus] = useState("Ready to test redirect authentication");
  const [logs, setLogs] = useState<string[]>([]);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const addLog = (message: string, type: 'info' | 'error' | 'success' = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] [${type.toUpperCase()}] ${message}`;
    setLogs(prev => [...prev, logEntry]);
    console.log(logEntry);
  };

  useEffect(() => {
    // Check for redirect result when page loads
    checkRedirectResult();
  }, []);

  const checkRedirectResult = async () => {
    addLog("Checking for redirect result on page load...");
    
    try {
      const { auth } = await import('@/lib/firebase');
      const result = await getRedirectResult(auth);
      
      if (result) {
        addLog(`Redirect result found: ${result.user.email}`, 'success');
        setStatus(`✅ Redirect authentication successful: ${result.user.email}`);
        
        // Store success
        sessionStorage.setItem('redirect_auth_success', JSON.stringify({
          email: result.user.email,
          uid: result.user.uid,
          timestamp: new Date().toISOString()
        }));
        
      } else {
        addLog("No redirect result found");
        
        // Check if we were expecting a redirect result
        const redirectAttempt = sessionStorage.getItem('redirect_auth_attempt');
        if (redirectAttempt) {
          addLog("Previous redirect attempt detected but no result found", 'error');
        }
      }
    } catch (error: any) {
      addLog(`Error checking redirect result: ${error.message}`, 'error');
    }
  };

  const testRedirectAuth = async () => {
    if (isAuthenticating) {
      addLog("Authentication already in progress...", 'info');
      return;
    }

    setIsAuthenticating(true);
    setStatus("Starting redirect authentication...");
    addLog("Starting redirect authentication test...");

    try {
      // Import Firebase
      const { auth, googleProvider } = await import('@/lib/firebase');
      
      addLog(`Auth domain: ${(auth as any).config.authDomain}`);
      addLog(`Project ID: ${(auth as any).config.projectId}`);
      addLog(`Current domain: ${window.location.hostname}`);
      
      // Clear any previous results
      sessionStorage.removeItem('redirect_auth_success');
      sessionStorage.setItem('redirect_auth_attempt', 'true');
      sessionStorage.setItem('redirect_auth_time', new Date().toISOString());
      
      addLog("Initiating signInWithRedirect...");
      await signInWithRedirect(auth, googleProvider);
      
      // This line should not be reached as redirect will navigate away
      addLog("Redirect initiated - page should navigate to Google", 'success');
      
    } catch (error: any) {
      addLog(`Redirect authentication FAILED: ${error.code} - ${error.message}`, 'error');
      
      if (error.code === 'auth/unauthorized-domain') {
        addLog("SOLUTION: Add this domain to Firebase Console authorized domains:", 'error');
        addLog(`Domain to add: ${window.location.hostname}`, 'error');
      }
      
      setStatus(`❌ Redirect authentication failed: ${error.message}`);
      setIsAuthenticating(false);
    }
  };

  const checkDomainAuthorization = () => {
    addLog("Checking domain authorization status...");
    
    const currentDomain = window.location.hostname;
    addLog(`Current domain: ${currentDomain}`);
    addLog(`Current URL: ${window.location.href}`);
    addLog(`Protocol: ${window.location.protocol}`);
    
    // Check if domain looks like a Replit domain
    if (currentDomain.includes('replit.dev')) {
      addLog("This is a Replit development domain", 'info');
      addLog("You need to add this exact domain to Firebase Console authorized domains", 'info');
    } else if (currentDomain.includes('replit.app')) {
      addLog("This is a Replit app domain", 'info');
      addLog("You need to add this exact domain to Firebase Console authorized domains", 'info');
    } else if (currentDomain === 'localhost') {
      addLog("This is localhost - should work if localhost is authorized", 'info');
    }
    
    addLog("Firebase Console steps:", 'info');
    addLog("1. Go to Firebase Console → Authentication → Settings", 'info');
    addLog("2. Scroll to 'Authorized domains'", 'info');
    addLog(`3. Add: ${currentDomain}`, 'info');
    addLog("4. Save changes and try authentication again", 'info');
  };

  const testDirectGoogleRedirect = () => {
    addLog("Testing direct Google redirect (bypass Firebase)...");
    
    const clientId = "your-google-client-id"; // This would need to be configured
    const redirectUri = encodeURIComponent(window.location.origin + '/auth-callback');
    const scope = encodeURIComponent('email profile openid');
    
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${clientId}&` +
      `redirect_uri=${redirectUri}&` +
      `scope=${scope}&` +
      `response_type=code&` +
      `access_type=online&` +
      `prompt=select_account`;
    
    addLog(`Direct redirect URL: ${googleAuthUrl.substring(0, 100)}...`);
    addLog("Note: This requires a separate Google OAuth client ID", 'info');
    
    // window.location.href = googleAuthUrl; // Uncomment to test
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Redirect Authentication Test</h1>
        
        <div className="bg-blue-900/20 border border-blue-600 rounded-lg p-4 mb-6">
          <h3 className="text-blue-400 font-semibold mb-2">Current Status</h3>
          <p className="text-blue-200 text-sm">{status}</p>
        </div>

        <div className="bg-yellow-900/20 border border-yellow-600 rounded-lg p-4 mb-6">
          <h3 className="text-yellow-400 font-semibold mb-2">Important for Replit Domains</h3>
          <p className="text-yellow-200 text-sm">
            Redirect authentication works better than popup on Replit domains. 
            Make sure your domain is added to Firebase Console authorized domains.
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <Button
            onClick={testRedirectAuth}
            disabled={isAuthenticating}
            className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg text-white"
          >
            {isAuthenticating ? 'Redirecting...' : 'Test Redirect Authentication'}
          </Button>
          
          <Button
            onClick={checkDomainAuthorization}
            className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg text-white"
          >
            Check Domain Authorization
          </Button>
          
          <Button
            onClick={testDirectGoogleRedirect}
            className="bg-orange-600 hover:bg-orange-700 px-6 py-3 rounded-lg text-white"
          >
            Test Direct Google Redirect
          </Button>
          
          <Button
            onClick={checkRedirectResult}
            className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg text-white"
          >
            Check Redirect Result
          </Button>
        </div>
        
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Redirect Debug Logs</h2>
          <div className="text-sm bg-gray-900 p-4 rounded h-96 overflow-y-auto font-mono">
            {logs.map((log, index) => (
              <div 
                key={index} 
                className={`mb-1 ${
                  log.includes('[ERROR]') ? 'text-red-400' : 
                  log.includes('[SUCCESS]') ? 'text-green-400' : 
                  log.includes('[INFO]') && log.includes('Firebase Console') ? 'text-blue-400' :
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