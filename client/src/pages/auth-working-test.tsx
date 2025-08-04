import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

export default function AuthWorkingTest() {
  const [status, setStatus] = useState("Testing working authentication methods");
  const [logs, setLogs] = useState<string[]>([]);
  const { signInWithGoogle, isAuthenticated, user, isLoading } = useAuth();

  const addLog = (message: string, type: 'info' | 'error' | 'success' = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] [${type.toUpperCase()}] ${message}`;
    setLogs(prev => [...prev, logEntry]);
    console.log(logEntry);
  };

  useEffect(() => {
    checkCurrentAuthState();
  }, [isAuthenticated, user]);

  const checkCurrentAuthState = () => {
    addLog("Checking current authentication state...");
    addLog(`Is Authenticated: ${isAuthenticated}`);
    addLog(`User: ${user ? user.email : 'No user'}`);
    addLog(`Is Loading: ${isLoading}`);
    
    if (isAuthenticated && user) {
      setStatus(`✅ Currently authenticated as: ${user.email}`);
      addLog("User is properly authenticated!", 'success');
    } else {
      setStatus("❌ Not authenticated - ready to test login");
    }
  };

  const testMainAuthFlow = async () => {
    addLog("Testing main authentication flow from useAuth...");
    setStatus("Testing main auth flow...");
    
    try {
      addLog("Calling signInWithGoogle from auth context...");
      addLog(`Current loading state: ${isLoading}`);
      addLog(`Current auth state: ${isAuthenticated}`);
      
      // Call the authentication function
      await signInWithGoogle();
      
      addLog("signInWithGoogle call completed - checking for redirect...");
      
      // Check if redirect was initiated
      const redirectAttempt = sessionStorage.getItem('redirect_auth_attempt');
      const redirectTime = sessionStorage.getItem('redirect_auth_time');
      
      if (redirectAttempt) {
        addLog(`Redirect attempt initiated at: ${redirectTime}`, 'success');
        addLog("If redirect is working, you should be redirected to Google now", 'success');
        setStatus("✅ Redirect authentication initiated - you should be redirected to Google");
      } else {
        addLog("No redirect attempt flag found - authentication may have failed", 'error');
        setStatus("❌ Redirect authentication was not initiated");
      }
      
    } catch (error) {
      addLog(`Main auth flow failed: ${error}`, 'error');
      setStatus(`❌ Main auth flow failed: ${error}`);
      
      // Log additional error details
      if (error instanceof Error) {
        addLog(`Error details: ${error.message}`, 'error');
        addLog(`Error stack: ${error.stack?.substring(0, 200)}...`, 'error');
      }
    }
  };

  const testDirectRedirect = async () => {
    addLog("Testing direct Firebase redirect authentication...");
    
    try {
      const { signInWithRedirect, GoogleAuthProvider } = await import('firebase/auth');
      const { auth } = await import('@/lib/firebase');
      
      // Get Firebase configuration details
      const config = (auth as any).config;
      addLog(`Firebase Auth Domain: ${config.authDomain}`);
      addLog(`Firebase Project ID: ${config.projectId}`);
      addLog(`Firebase API Key: ${config.apiKey?.substring(0, 20)}...`);
      addLog(`Current Domain: ${window.location.hostname}`);
      
      // Check if current domain matches expected patterns
      if (window.location.hostname.includes('replit.dev')) {
        addLog("Detected Replit development domain", 'info');
      } else if (window.location.hostname.includes('replit.app')) {
        addLog("Detected Replit app domain", 'info');
      }
      
      // Create a fresh Google provider with enhanced settings
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account',
        access_type: 'online',
        include_granted_scopes: 'true'
      });
      provider.addScope('email');
      provider.addScope('profile');
      
      addLog("Google provider configured with enhanced settings");
      addLog("Initiating direct signInWithRedirect...");
      
      // Store redirect attempt for tracking
      sessionStorage.setItem('direct_redirect_attempt', 'true');
      sessionStorage.setItem('direct_redirect_time', new Date().toISOString());
      
      // Initiate the redirect
      await signInWithRedirect(auth, provider);
      
      addLog("Direct redirect initiated successfully", 'success');
      addLog("You should be redirected to Google authentication now", 'success');
      
    } catch (error: any) {
      addLog(`Direct redirect failed: ${error.message}`, 'error');
      addLog(`Error code: ${error.code}`, 'error');
      
      // Check for specific error types
      if (error.code === 'auth/unauthorized-domain') {
        addLog("Domain authorization error - check Firebase Console", 'error');
        addLog(`Add domain ${window.location.hostname} to authorized domains`, 'error');
      } else if (error.code === 'auth/invalid-api-key') {
        addLog("Invalid API key - check environment variables", 'error');
      }
    }
  };

  const checkForRedirectResult = async () => {
    addLog("Manually checking for redirect result...");
    
    try {
      const { getRedirectResult } = await import('firebase/auth');
      const { auth } = await import('@/lib/firebase');
      
      const result = await getRedirectResult(auth);
      
      if (result && result.user) {
        addLog(`Redirect result found: ${result.user.email}`, 'success');
        addLog(`User UID: ${result.user.uid}`, 'success');
        setStatus(`✅ Redirect result found: ${result.user.email}`);
        
        // Store success
        sessionStorage.setItem('manual_redirect_success', JSON.stringify({
          email: result.user.email,
          uid: result.user.uid,
          timestamp: new Date().toISOString()
        }));
        
      } else {
        addLog("No redirect result found");
        
        // Check for stored redirect attempts
        const directAttempt = sessionStorage.getItem('direct_redirect_attempt');
        const redirectAttempt = sessionStorage.getItem('redirect_auth_attempt');
        
        if (directAttempt || redirectAttempt) {
          addLog("Previous redirect attempt detected but no result", 'error');
          addLog("This suggests the redirect didn't complete successfully", 'error');
        } else {
          addLog("No previous redirect attempts found");
        }
      }
      
    } catch (error) {
      addLog(`Error checking redirect result: ${error}`, 'error');
    }
  };

  const simulateSuccessfulAuth = () => {
    addLog("Simulating successful authentication for testing...");
    
    // This would be replaced with actual authentication in production
    const mockUser = {
      email: "test@example.com",
      uid: "test-uid-123",
      displayName: "Test User"
    };
    
    sessionStorage.setItem('mock_auth_success', JSON.stringify({
      ...mockUser,
      timestamp: new Date().toISOString()
    }));
    
    addLog("Mock authentication stored in session", 'success');
    setStatus("✅ Mock authentication successful (for testing UI flow)");
  };

  const clearAllAuthState = () => {
    addLog("Clearing all authentication state...");
    
    // Clear session storage
    const keys = [
      'authSuccess',
      'redirect_auth_attempt',
      'redirect_auth_time',
      'direct_redirect_attempt', 
      'direct_redirect_time',
      'popup_auth_attempt',
      'popup_auth_time',
      'manual_redirect_success',
      'mock_auth_success'
    ];
    
    keys.forEach(key => {
      sessionStorage.removeItem(key);
      addLog(`Cleared: ${key}`);
    });
    
    localStorage.clear();
    addLog("Cleared local storage");
    
    setStatus("🔄 All auth state cleared - ready for fresh test");
    addLog("All authentication state cleared", 'success');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Working Authentication Test</h1>
        
        <div className="bg-blue-900/20 border border-blue-600 rounded-lg p-4 mb-6">
          <h3 className="text-blue-400 font-semibold mb-2">Current Status</h3>
          <p className="text-blue-200 text-sm">{status}</p>
          <div className="mt-2 text-sm">
            <span className="text-blue-300">Auth State:</span> {isAuthenticated ? '✅ Authenticated' : '❌ Not Authenticated'} | 
            <span className="text-blue-300"> User:</span> {user?.email || 'None'} |
            <span className="text-blue-300"> Loading:</span> {isLoading ? 'Yes' : 'No'}
          </div>
        </div>

        <div className="bg-green-900/20 border border-green-600 rounded-lg p-4 mb-6">
          <h3 className="text-green-400 font-semibold mb-2">Testing Strategy</h3>
          <p className="text-green-200 text-sm">
            Browser permissions are working correctly. Now testing actual authentication methods 
            to identify which approach works with your Firebase configuration.
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <Button
            onClick={testMainAuthFlow}
            disabled={isLoading}
            className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg text-white"
          >
            Test Main Auth Flow (useAuth)
          </Button>
          
          <Button
            onClick={testDirectRedirect}
            className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg text-white"
          >
            Test Direct Firebase Redirect
          </Button>
          
          <Button
            onClick={checkForRedirectResult}
            className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg text-white"
          >
            Check for Redirect Result
          </Button>
          
          <Button
            onClick={simulateSuccessfulAuth}
            className="bg-yellow-600 hover:bg-yellow-700 px-6 py-3 rounded-lg text-white"
          >
            Simulate Successful Auth (Testing)
          </Button>
          
          <Button
            onClick={clearAllAuthState}
            className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-lg text-white"
          >
            Clear All Auth State
          </Button>
        </div>
        
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Authentication Test Logs</h2>
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