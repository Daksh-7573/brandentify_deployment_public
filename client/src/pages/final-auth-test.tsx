import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";

export default function FinalAuthTest() {
  const [logs, setLogs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user, isAuthenticated, refreshUserData } = useAuth();

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
    console.log(`[FinalAuthTest] ${message}`);
  };

  // Check for successful authentication on page load
  useEffect(() => {
    const checkAuthOnReturn = async () => {
      // Check if we just returned from authentication
      const authTestTime = sessionStorage.getItem('authTestTime');
      if (authTestTime) {
        const authTime = new Date(authTestTime);
        const now = new Date();
        const timeDiff = now.getTime() - authTime.getTime();
        
        // If less than 2 minutes ago, check for authentication
        if (timeDiff < 120000) {
          addLog("Detected recent authentication attempt, checking status...");
          
          // Wait a moment for auth state to settle
          setTimeout(async () => {
            await refreshUserData();
            await testAuthStatus();
          }, 1000);
        }
      }
      
      // Also check immediately if user is already authenticated
      if (isAuthenticated && user) {
        addLog(`Welcome back! You're signed in as: ${user.email}`);
      }
    };
    
    checkAuthOnReturn();
  }, [isAuthenticated, user]);

  const testUltimateGoogleAuth = async () => {
    if (isLoading) return;
    setIsLoading(true);
    addLog("Starting ultimate Google authentication test...");
    
    try {
      // Method 1: Try signInWithRedirect (most reliable for Replit)
      addLog("Method 1: Testing signInWithRedirect...");
      
      const { signInWithRedirect, GoogleAuthProvider, getAuth } = await import('firebase/auth');
      const { getApps } = await import('firebase/app');
      
      const apps = getApps();
      if (apps.length === 0) {
        throw new Error("No Firebase app initialized");
      }
      
      const app = apps[0];
      const auth = getAuth(app);
      
      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      
      addLog("Initiating redirect to Google OAuth...");
      addLog("You will be redirected to Google, then back to /auth-callback");
      
      // Store test info for callback
      sessionStorage.setItem('authTestSource', 'final-auth-test');
      sessionStorage.setItem('authTestTime', new Date().toISOString());
      
      await signInWithRedirect(auth, provider);
      
    } catch (error: any) {
      addLog(`Authentication failed: ${error.code} - ${error.message}`);
      setIsLoading(false);
    }
  };

  const testAuthStatus = async () => {
    addLog("Checking current authentication status...");
    
    try {
      const { getAuth, getRedirectResult } = await import('firebase/auth');
      const { getApps } = await import('firebase/app');
      
      const apps = getApps();
      const auth = getAuth(apps[0]);
      
      // Check for any pending redirect result first
      addLog("Checking for pending redirect result...");
      const redirectResult = await getRedirectResult(auth);
      if (redirectResult) {
        addLog(`Found redirect result: ${redirectResult.user.email}`);
        addLog("Processing redirect authentication...");
      } else {
        addLog("No pending redirect result found");
      }
      
      // Check current auth state
      if (auth.currentUser) {
        addLog(`✅ User IS signed in: ${auth.currentUser.email}`);
        addLog(`Display name: ${auth.currentUser.displayName || 'Not provided'}`);
        addLog(`Email verified: ${auth.currentUser.emailVerified}`);
        addLog(`UID: ${auth.currentUser.uid}`);
        addLog(`Photo URL: ${auth.currentUser.photoURL || 'Not provided'}`);
        
        // Get ID token to verify authentication
        const token = await auth.currentUser.getIdToken();
        addLog(`✅ ID Token obtained (length: ${token.length})`);
        
      } else {
        addLog("❌ No user is currently signed in");
        
        // Check if there's cached auth state
        const cachedAuth = (window as any).__brandentifier_cached_auth?.();
        if (cachedAuth) {
          addLog(`Found cached auth state: ${cachedAuth.email}`);
        } else {
          addLog("No cached auth state found");
        }
      }
      
      // Check auth state listener
      addLog("Setting up auth state listener for 10 seconds...");
      let listenerCount = 0;
      const unsubscribe = auth.onAuthStateChanged((user) => {
        listenerCount++;
        if (user) {
          addLog(`Auth listener ${listenerCount}: User detected - ${user.email}`);
        } else {
          addLog(`Auth listener ${listenerCount}: No user detected`);
        }
      });
      
      // Stop listening after 10 seconds
      setTimeout(() => {
        unsubscribe();
        addLog(`Auth listener stopped after ${listenerCount} state changes`);
      }, 10000);
      
    } catch (error) {
      addLog(`Status check failed: ${error}`);
    }
  };

  const signOut = async () => {
    addLog("Signing out...");
    
    try {
      const { signOut: firebaseSignOut, getAuth } = await import('firebase/auth');
      const { getApps } = await import('firebase/app');
      
      const apps = getApps();
      const auth = getAuth(apps[0]);
      
      await firebaseSignOut(auth);
      addLog("Successfully signed out");
      
    } catch (error) {
      addLog(`Sign out failed: ${error}`);
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Final Google Authentication Test</h1>
        
        <div className="bg-blue-900/20 border border-blue-600 rounded-lg p-6 mb-6">
          <h2 className="text-blue-400 font-semibold mb-3">Authentication Method: Redirect (Recommended for Replit)</h2>
          <p className="text-blue-200 mb-4">
            This test uses <code>signInWithRedirect</code> which is the most reliable method for Replit domains.
            After clicking "Test Google Auth", you'll be redirected to Google, then back to this site.
          </p>
          
          <div className="space-x-4">
            <button
              onClick={testUltimateGoogleAuth}
              disabled={isLoading}
              className={`px-6 py-3 rounded-lg font-medium ${
                isLoading 
                  ? 'bg-gray-600 cursor-not-allowed' 
                  : 'bg-green-600 hover:bg-green-700'
              } text-white`}
            >
              {isLoading ? 'Redirecting...' : 'Test Google Auth (Redirect)'}
            </button>
            
            <button
              onClick={testAuthStatus}
              className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg text-white font-medium"
            >
              Check Auth Status
            </button>
            
            <button
              onClick={signOut}
              className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-lg text-white font-medium"
            >
              Sign Out
            </button>
            
            <button
              onClick={clearLogs}
              className="bg-gray-600 hover:bg-gray-700 px-6 py-3 rounded-lg text-white font-medium"
            >
              Clear Logs
            </button>
          </div>
        </div>
        
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Test Logs</h2>
          <div className="bg-gray-900 p-4 rounded h-64 overflow-y-auto">
            {logs.length === 0 ? (
              <div className="text-gray-400 italic">No logs yet. Click "Test Google Auth" to start.</div>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="mb-1 font-mono text-sm">{log}</div>
              ))
            )}
          </div>
        </div>
        
        <div className="mt-6 bg-green-900/20 border border-green-600 rounded-lg p-4">
          <h3 className="text-green-400 font-semibold mb-2">Expected Flow</h3>
          <ol className="list-decimal list-inside text-green-200 text-sm space-y-1">
            <li>Click "Test Google Auth (Redirect)"</li>
            <li>Browser redirects to Google OAuth page</li>
            <li>Sign in with your Google account</li>
            <li>Google redirects back to /auth-callback</li>
            <li>Auth callback processes the result</li>
            <li>You're redirected back here and signed in</li>
          </ol>
        </div>
        
        <div className="mt-4 bg-yellow-900/20 border border-yellow-600 rounded-lg p-4">
          <h3 className="text-yellow-400 font-semibold mb-2">Troubleshooting</h3>
          <div className="text-yellow-200 text-sm space-y-1">
            <p><strong>If nothing happens:</strong> Check browser console for errors</p>
            <p><strong>If redirect fails:</strong> Verify domain is authorized in Firebase Console</p>
            <p><strong>If callback fails:</strong> Check /auth-callback page directly</p>
          </div>
        </div>
      </div>
    </div>
  );
}