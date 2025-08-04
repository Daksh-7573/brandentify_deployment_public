import { useEffect, useState } from "react";

export default function AdvancedAuthTest() {
  const [logs, setLogs] = useState<string[]>([]);
  const [firebaseConfig, setFirebaseConfig] = useState<any>(null);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
    console.log(`[AdvancedAuthTest] ${message}`);
  };

  useEffect(() => {
    const runTests = async () => {
      addLog("Starting advanced Firebase authentication tests...");
      
      try {
        // Test 1: Check environment variables
        const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
        const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
        const appId = import.meta.env.VITE_FIREBASE_APP_ID;
        
        addLog(`Environment variables: API Key ${apiKey ? 'present' : 'missing'}, Project ID: ${projectId}, App ID ${appId ? 'present' : 'missing'}`);
        
        // Test 2: Import Firebase and check configuration
        const firebaseModule = await import('@/lib/firebase');
        addLog(`Firebase module imported successfully`);
        
        // Test 3: Check Firebase app configuration
        const { getApps } = await import('firebase/app');
        const apps = getApps();
        addLog(`Firebase apps initialized: ${apps.length}`);
        
        if (apps.length > 0) {
          const app = apps[0];
          const config = (app as any).options;
          setFirebaseConfig(config);
          addLog(`Firebase config: authDomain=${config.authDomain}, projectId=${config.projectId}`);
        }
        
        // Test 4: Check auth state
        const auth = firebaseModule.auth;
        if (auth) {
          addLog(`Auth object available, current user: ${(auth as any).currentUser ? 'signed in' : 'not signed in'}`);
          
          // Test 5: Check Google provider configuration
          const googleProvider = firebaseModule.googleProvider;
          if (googleProvider) {
            addLog(`Google provider available with scopes: ${(googleProvider as any)._scopes?.join(', ') || 'default'}`);
          } else {
            addLog(`Google provider not available`);
          }
        } else {
          addLog(`Auth object not available`);
        }
        
        // Test 6: Try to detect popup blocking
        addLog("Testing popup functionality...");
        const testPopup = window.open('about:blank', 'test', 'width=1,height=1');
        if (testPopup) {
          addLog("Popup test: Browser allows popups");
          testPopup.close();
        } else {
          addLog("Popup test: Browser is blocking popups");
        }
        
        // Test 7: Check domain configuration
        addLog(`Current domain: ${window.location.hostname}`);
        addLog(`Current protocol: ${window.location.protocol}`);
        addLog(`Full URL: ${window.location.href}`);
        
      } catch (error) {
        addLog(`Test failed: ${error}`);
      }
    };
    
    runTests();
  }, []);

  const testDirectGoogleAuth = async () => {
    addLog("Testing direct Google authentication with enhanced configuration...");
    
    try {
      // Import Firebase Auth functions directly
      const { signInWithPopup, GoogleAuthProvider, getAuth } = await import('firebase/auth');
      const { getApps } = await import('firebase/app');
      
      // Get the Firebase app
      const apps = getApps();
      if (apps.length === 0) {
        throw new Error("No Firebase app initialized");
      }
      
      const app = apps[0];
      const auth = getAuth(app);
      
      // Create a fresh Google provider with enhanced settings
      const provider = new GoogleAuthProvider();
      provider.addScope('https://www.googleapis.com/auth/userinfo.email');
      provider.addScope('https://www.googleapis.com/auth/userinfo.profile');
      provider.setCustomParameters({
        prompt: 'consent',
        access_type: 'online',
        include_granted_scopes: 'true'
      });
      
      addLog("Attempting signInWithPopup with enhanced provider configuration...");
      addLog("Popup timeout: 120 seconds");
      
      // Add a timeout to prevent indefinite waiting
      const authPromise = signInWithPopup(auth, provider);
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Authentication timeout after 120 seconds')), 120000);
      });
      
      const result = await Promise.race([authPromise, timeoutPromise]) as any;
      addLog(`Authentication successful: ${result.user.email}`);
      addLog(`User details: ${result.user.displayName}, verified: ${result.user.emailVerified}`);
      
    } catch (error: any) {
      addLog(`Direct authentication failed: ${error.code} - ${error.message}`);
      
      if (error.code === 'auth/popup-closed-by-user') {
        addLog("Popup was closed before authentication completed. This might be due to:");
        addLog("1. User closed the popup manually");
        addLog("2. Popup blocked by browser settings");
        addLog("3. Authentication redirect issue");
        addLog("Trying redirect method as fallback...");
        
        // Automatically try redirect as fallback
        setTimeout(() => testRedirectAuth(), 2000);
      } else if (error.code === 'auth/popup-blocked') {
        addLog("Popup was blocked by browser. Please enable popups and try again.");
      }
    }
  };

  const testRedirectAuth = async () => {
    addLog("Testing redirect authentication...");
    
    try {
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
      
      addLog("Initiating redirect authentication...");
      await signInWithRedirect(auth, provider);
      
    } catch (error: any) {
      addLog(`Redirect authentication failed: ${error.code} - ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Advanced Firebase Authentication Test</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="space-x-4">
            <button
              onClick={testDirectGoogleAuth}
              className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-lg text-white font-medium"
            >
              Test Direct Google Auth
            </button>
            <button
              onClick={testRedirectAuth}
              className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg text-white font-medium"
            >
              Test Redirect Auth
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Firebase Configuration</h2>
            <pre className="text-sm bg-gray-900 p-4 rounded overflow-auto max-h-64">
              {firebaseConfig ? JSON.stringify(firebaseConfig, null, 2) : 'Loading...'}
            </pre>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Test Results</h2>
            <div className="text-sm bg-gray-900 p-4 rounded h-64 overflow-y-auto">
              {logs.map((log, index) => (
                <div key={index} className="mb-1 font-mono">{log}</div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="mt-6 bg-yellow-900/20 border border-yellow-600 rounded-lg p-4">
          <h3 className="text-yellow-400 font-semibold mb-2">Debugging Information</h3>
          <div className="text-yellow-200 text-sm space-y-1">
            <p><strong>Domain:</strong> {window.location.hostname}</p>
            <p><strong>Protocol:</strong> {window.location.protocol}</p>
            <p><strong>User Agent:</strong> {navigator.userAgent.slice(0, 100)}...</p>
            <p><strong>Popup Support:</strong> {typeof window.open === 'function' ? 'Available' : 'Not Available'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}