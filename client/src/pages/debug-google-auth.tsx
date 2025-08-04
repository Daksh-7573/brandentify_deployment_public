import { useState, useEffect } from "react";

export default function DebugGoogleAuth() {
  const [logs, setLogs] = useState<string[]>([]);
  const [authConfig, setAuthConfig] = useState<any>(null);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
    console.log(`[DebugAuth] ${message}`);
  };

  useEffect(() => {
    const initDebug = async () => {
      addLog("Starting comprehensive Google Auth debug...");
      
      try {
        // Check Firebase configuration
        const { getApps } = await import('firebase/app');
        const apps = getApps();
        
        if (apps.length > 0) {
          const config = (apps[0] as any).options;
          setAuthConfig(config);
          addLog(`Firebase config loaded: authDomain=${config.authDomain}`);
        }
        
        // Check environment variables
        const envs = {
          apiKey: import.meta.env.VITE_FIREBASE_API_KEY ? 'present' : 'missing',
          projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'missing',
          appId: import.meta.env.VITE_FIREBASE_APP_ID ? 'present' : 'missing'
        };
        addLog(`Environment: ${JSON.stringify(envs)}`);
        
        // Check current domain authorization
        addLog(`Current domain: ${window.location.hostname}`);
        addLog(`Current URL: ${window.location.href}`);
        
      } catch (error) {
        addLog(`Debug initialization failed: ${error}`);
      }
    };
    
    initDebug();
  }, []);

  const testDirectGoogleSignIn = async () => {
    addLog("Testing direct Google sign-in with minimal configuration...");
    
    try {
      const { getAuth, GoogleAuthProvider, signInWithPopup } = await import('firebase/auth');
      const { getApps } = await import('firebase/app');
      
      const apps = getApps();
      const auth = getAuth(apps[0]);
      
      // Create minimal provider
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      
      addLog("Attempting popup sign-in...");
      const result = await signInWithPopup(auth, provider);
      addLog(`SUCCESS: ${result.user.email}`);
      
    } catch (error: any) {
      addLog(`POPUP FAILED: ${error.code} - ${error.message}`);
      
      if (error.code === 'auth/popup-closed-by-user') {
        addLog("Popup closed by user - trying redirect method...");
        await testRedirectMethod();
      }
    }
  };

  const testRedirectMethod = async () => {
    addLog("Testing redirect method...");
    
    try {
      const { getAuth, GoogleAuthProvider, signInWithRedirect } = await import('firebase/auth');
      const { getApps } = await import('firebase/app');
      
      const apps = getApps();
      const auth = getAuth(apps[0]);
      
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      
      addLog("Initiating redirect...");
      await signInWithRedirect(auth, provider);
      
    } catch (error: any) {
      addLog(`REDIRECT FAILED: ${error.code} - ${error.message}`);
    }
  };

  const checkCurrentAuthState = async () => {
    addLog("Checking current authentication state...");
    
    try {
      const { getAuth, getRedirectResult } = await import('firebase/auth');
      const { getApps } = await import('firebase/app');
      
      const apps = getApps();
      const auth = getAuth(apps[0]);
      
      // Check for redirect result
      addLog("Checking for redirect result...");
      const redirectResult = await getRedirectResult(auth);
      
      if (redirectResult) {
        addLog(`REDIRECT RESULT FOUND: ${redirectResult.user.email}`);
        addLog(`User UID: ${redirectResult.user.uid}`);
        addLog(`Provider data: ${JSON.stringify(redirectResult.user.providerData)}`);
      } else {
        addLog("No redirect result found");
      }
      
      // Check current user
      if (auth.currentUser) {
        addLog(`CURRENT USER: ${auth.currentUser.email}`);
        addLog(`UID: ${auth.currentUser.uid}`);
        addLog(`Email verified: ${auth.currentUser.emailVerified}`);
      } else {
        addLog("No current user");
      }
      
    } catch (error) {
      addLog(`Auth state check failed: ${error}`);
    }
  };

  const testAuthDomainFix = async () => {
    addLog("Testing authentication with corrected domain configuration...");
    
    try {
      // Import Firebase modules
      const { initializeApp } = await import('firebase/app');
      const { getAuth, GoogleAuthProvider, signInWithPopup } = await import('firebase/auth');
      
      // Create a test config with the correct authDomain
      const testConfig = {
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
        authDomain: "brandentifier-app.firebaseapp.com", // Force correct domain
        projectId: "brandentifier-app",
        storageBucket: "brandentifier-app.appspot.com",
        messagingSenderId: "330211556822",
        appId: import.meta.env.VITE_FIREBASE_APP_ID
      };
      
      addLog(`Testing with authDomain: ${testConfig.authDomain}`);
      
      // Initialize a test app
      const testApp = initializeApp(testConfig, 'test-app');
      const testAuth = getAuth(testApp);
      
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      
      addLog("Attempting sign-in with corrected configuration...");
      const result = await signInWithPopup(testAuth, provider);
      addLog(`SUCCESS with corrected config: ${result.user.email}`);
      
    } catch (error: any) {
      addLog(`Test with corrected config failed: ${error.code} - ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Google Authentication Debug Tool</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="space-y-4">
            <button
              onClick={testDirectGoogleSignIn}
              className="w-full bg-red-600 hover:bg-red-700 px-6 py-3 rounded-lg text-white font-medium"
            >
              Test Direct Google Sign-In
            </button>
            
            <button
              onClick={checkCurrentAuthState}
              className="w-full bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg text-white font-medium"
            >
              Check Auth State
            </button>
            
            <button
              onClick={testAuthDomainFix}
              className="w-full bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg text-white font-medium"
            >
              Test Domain Fix
            </button>
            
            <button
              onClick={() => setLogs([])}
              className="w-full bg-gray-600 hover:bg-gray-700 px-6 py-3 rounded-lg text-white font-medium"
            >
              Clear Logs
            </button>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Firebase Configuration</h2>
            <pre className="text-sm bg-gray-900 p-4 rounded overflow-auto max-h-48">
              {authConfig ? JSON.stringify(authConfig, null, 2) : 'Loading...'}
            </pre>
          </div>
        </div>
        
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Debug Logs</h2>
          <div className="bg-gray-900 p-4 rounded h-96 overflow-y-auto">
            {logs.length === 0 ? (
              <div className="text-gray-400 italic">No logs yet. Click a test button to start debugging.</div>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="mb-1 font-mono text-sm">{log}</div>
              ))
            )}
          </div>
        </div>
        
        <div className="mt-6 bg-yellow-900/20 border border-yellow-600 rounded-lg p-4">
          <h3 className="text-yellow-400 font-semibold mb-2">Common Issues</h3>
          <div className="text-yellow-200 text-sm space-y-2">
            <p><strong>Popup closes after 5-6 seconds:</strong> Usually indicates domain authorization or configuration issue</p>
            <p><strong>auth/popup-closed-by-user:</strong> Can be caused by incorrect authDomain configuration</p>
            <p><strong>Blank popup:</strong> Domain not properly authorized in Firebase Console</p>
            <p><strong>Expected authDomain:</strong> brandentifier-app.firebaseapp.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}