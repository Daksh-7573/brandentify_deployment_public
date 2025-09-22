import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function AuthDebugDetailed() {
  const [logs, setLogs] = useState<string[]>([]);
  const [authState, setAuthState] = useState<any>(null);
  const [firebaseConfig, setFirebaseConfig] = useState<any>(null);

  const addLog = (message: string, type: 'info' | 'error' | 'success' = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] [${type.toUpperCase()}] ${message}`;
    setLogs(prev => [...prev, logEntry]);
    console.log(logEntry);
  };

  useEffect(() => {
    initializeDetailedDebugging();
  }, []);

  const initializeDetailedDebugging = async () => {
    addLog("Starting detailed authentication debugging...");
    
    try {
      // Check environment variables
      const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
      const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
      const appId = import.meta.env.VITE_FIREBASE_APP_ID;
      
      addLog(`Environment check - API Key: ${apiKey ? 'Present (' + apiKey.substring(0, 10) + '...)' : 'MISSING'}`);
      addLog(`Environment check - Project ID: ${projectId || 'MISSING'}`);
      addLog(`Environment check - App ID: ${appId ? 'Present (' + appId.substring(0, 10) + '...)' : 'MISSING'}`);
      
      if (!apiKey || !projectId || !appId) {
        addLog("CRITICAL: Missing Firebase environment variables", 'error');
        return;
      }
      
      // Import and check Firebase
      addLog("Importing Firebase configuration...");
      const firebaseModule = await import('@/lib/firebase');
      
      addLog("Firebase module imported successfully");
      addLog(`Auth object: ${firebaseModule.auth ? 'Available' : 'NULL'}`);
      addLog(`Google Provider: ${firebaseModule.googleProvider ? 'Available' : 'NULL'}`);
      
      // Get Firebase config details
      const authConfig = (firebaseModule.auth as any)?.config;
      if (authConfig) {
        setFirebaseConfig(authConfig);
        addLog(`Firebase config - Auth Domain: ${authConfig.authDomain}`);
        addLog(`Firebase config - Project ID: ${authConfig.projectId}`);
        addLog(`Firebase config - API Key: ${authConfig.apiKey?.substring(0, 10)}...`);
      } else {
        addLog("Firebase config not available", 'error');
      }
      
      // Set up auth state monitoring
      if (firebaseModule.auth) {
        const unsubscribe = (firebaseModule.auth as any).onAuthStateChanged((user: any) => {
          setAuthState(user);
          if (user) {
            addLog(`Auth state changed: User signed in - ${user.email}`, 'success');
            addLog(`User details: UID=${user.uid}, Verified=${user.emailVerified}`);
          } else {
            addLog("Auth state changed: No user signed in");
          }
        });
        
        addLog("Auth state listener established");
        return () => unsubscribe();
      }
      
    } catch (error) {
      addLog(`Initialization failed: ${error}`, 'error');
    }
  };

  const testDetailedPopupAuth = async () => {
    addLog("Starting detailed popup authentication test...");
    
    try {
      // Clear previous error logs
      sessionStorage.removeItem('lastAuthError');
      
      // Import Firebase auth methods
      const { signInWithPopup } = await import('firebase/auth');
      const { auth, googleProvider } = await import('@/lib/firebase');
      
      addLog("Firebase imports successful");
      
      // Log pre-auth state
      addLog(`Pre-auth check - Current user: ${(auth as any)?.currentUser?.email || 'None'}`);
      addLog(`Google provider configured: ${googleProvider ? 'Yes' : 'No'}`);
      
      // Test popup window creation
      addLog("Testing popup window creation...");
      const testPopup = window.open('', '_blank', 'width=1,height=1');
      if (testPopup) {
        testPopup.close();
        addLog("Popup creation: SUCCESS");
      } else {
        addLog("Popup creation: BLOCKED - browser is blocking popups", 'error');
        return;
      }
      
      // Log authentication attempt
      addLog("Attempting signInWithPopup...");
      addLog(`Timestamp: ${new Date().toISOString()}`);
      
      const result = await signInWithPopup(auth as any, googleProvider as any);
      
      addLog(`Authentication SUCCESS: ${result.user.email}`, 'success');
      addLog(`User UID: ${result.user.uid}`);
      addLog(`Display Name: ${result.user.displayName}`);
      addLog(`Email Verified: ${result.user.emailVerified}`);
      addLog(`Provider Data: ${JSON.stringify(result.user.providerData)}`);
      
    } catch (error: any) {
      addLog(`Authentication FAILED: ${error.code} - ${error.message}`, 'error');
      
      // Log detailed error information
      addLog(`Error code: ${error.code}`);
      addLog(`Error message: ${error.message}`);
      addLog(`Error stack: ${error.stack}`);
      
      if (error.customData) {
        addLog(`Custom data: ${JSON.stringify(error.customData)}`);
      }
      
      // Check for specific error patterns
      if (error.code === 'auth/popup-closed-by-user') {
        addLog("Analysis: User closed popup before completing authentication", 'error');
      } else if (error.code === 'auth/popup-blocked') {
        addLog("Analysis: Browser blocked the popup window", 'error');
      } else if (error.code === 'auth/unauthorized-domain') {
        addLog("Analysis: Domain not authorized in Firebase Console", 'error');
      } else if (error.code === 'auth/operation-not-allowed') {
        addLog("Analysis: Google sign-in not enabled in Firebase Console", 'error');
      } else {
        addLog(`Analysis: Unexpected error - ${error.code}`, 'error');
      }
      
      // Store error for later analysis
      sessionStorage.setItem('lastAuthError', JSON.stringify({
        code: error.code,
        message: error.message,
        timestamp: new Date().toISOString()
      }));
    }
  };

  const checkLastError = () => {
    const lastError = sessionStorage.getItem('lastAuthError');
    if (lastError) {
      const errorData = JSON.parse(lastError);
      addLog(`Last stored error: ${errorData.code} - ${errorData.message} (${errorData.timestamp})`);
    } else {
      addLog("No previous error found in session storage");
    }
  };

  const testNetworkConnectivity = async () => {
    addLog("Testing network connectivity to Firebase services...");
    
    try {
      // Test Firebase API connectivity
      const response = await fetch('https://identitytoolkit.googleapis.com/v1/projects', {
        method: 'GET',
        mode: 'no-cors'
      });
      addLog("Firebase API connectivity: Accessible");
    } catch (error) {
      addLog(`Firebase API connectivity: Failed - ${error}`, 'error');
    }
    
    try {
      // Test Google OAuth connectivity
      const response = await fetch('https://accounts.google.com', {
        method: 'GET',
        mode: 'no-cors'
      });
      addLog("Google OAuth connectivity: Accessible");
    } catch (error) {
      addLog(`Google OAuth connectivity: Failed - ${error}`, 'error');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Detailed Authentication Debug</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Current Auth State</h3>
            <pre className="text-sm bg-gray-900 p-3 rounded overflow-auto">
              {authState ? JSON.stringify({
                email: authState.email,
                uid: authState.uid,
                displayName: authState.displayName,
                emailVerified: authState.emailVerified
              }, null, 2) : 'No authenticated user'}
            </pre>
          </div>
          
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Firebase Config</h3>
            <pre className="text-sm bg-gray-900 p-3 rounded overflow-auto">
              {firebaseConfig ? JSON.stringify({
                authDomain: firebaseConfig.authDomain,
                projectId: firebaseConfig.projectId,
                apiKey: firebaseConfig.apiKey?.substring(0, 10) + '...'
              }, null, 2) : 'Config not loaded'}
            </pre>
          </div>
          
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Environment</h3>
            <div className="text-sm space-y-1">
              <div>Domain: {window.location.hostname}</div>
              <div>Protocol: {window.location.protocol}</div>
              <div>User Agent: {navigator.userAgent.substring(0, 50)}...</div>
            </div>
          </div>
        </div>
        
        <div className="space-y-4 mb-6">
          <Button
            onClick={testDetailedPopupAuth}
            className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-lg text-white"
          >
            Test Detailed Popup Authentication
          </Button>
          
          <Button
            onClick={checkLastError}
            className="bg-yellow-600 hover:bg-yellow-700 px-6 py-3 rounded-lg text-white"
          >
            Check Last Error
          </Button>
          
          <Button
            onClick={testNetworkConnectivity}
            className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg text-white"
          >
            Test Network Connectivity
          </Button>
        </div>
        
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Detailed Debug Logs</h2>
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