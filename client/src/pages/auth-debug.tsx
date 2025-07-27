import { useEffect, useState } from 'react';
import { signInWithRedirect, getRedirectResult, onAuthStateChanged, Auth, GoogleAuthProvider } from 'firebase/auth';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

export default function AuthDebugPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [logs, setLogs] = useState<string[]>([]);
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [testing, setTesting] = useState(false);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ${message}`;
    setLogs(prev => [logMessage, ...prev.slice(0, 19)]);
    console.log(logMessage);
  };

  useEffect(() => {
    // Collect debug information
    const hostname = window.location.hostname;
    const origin = window.location.origin;
    const currentPath = window.location.pathname;
    const urlParams = new URLSearchParams(window.location.search);
    
    setDebugInfo({
      hostname,
      origin,
      currentPath,
      urlParams: Object.fromEntries(urlParams.entries()),
      firebaseConfig: {
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY ? 'Present' : 'Missing',
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'Missing',
        appId: import.meta.env.VITE_FIREBASE_APP_ID ? 'Present' : 'Missing',
      },
      authState: {
        isAuthenticated,
        isLoading,
        hasUser: !!user,
        userEmail: user?.email || 'None'
      }
    });

    addLog(`Debug page loaded - Auth: ${isAuthenticated}, Loading: ${isLoading}`);
    addLog(`Domain: ${hostname}`);
    addLog(`Firebase Project: ${import.meta.env.VITE_FIREBASE_PROJECT_ID || 'Not set'}`);
    
    if (user) {
      addLog(`Current user: ${user.email}`);
    }

    // Check for redirect result
    const checkRedirect = async () => {
      try {
        addLog('Checking for redirect result...');
        // Import Firebase objects dynamically to avoid type issues
        const firebaseModule = await import('@/lib/firebase');
        const auth = firebaseModule.auth as Auth;
        
        const result = await getRedirectResult(auth);
        if (result) {
          addLog(`Redirect result found: ${result.user.email}`);
        } else {
          addLog('No redirect result found');
        }
      } catch (error: any) {
        addLog(`Redirect check error: ${error.message}`);
      }
    };

    checkRedirect();

    // Set up auth state listener for real-time updates
    const setupAuthListener = async () => {
      try {
        const firebaseModule = await import('@/lib/firebase');
        const auth = firebaseModule.auth as Auth;
        
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
          if (firebaseUser) {
            addLog(`Firebase user detected: ${firebaseUser.email}`);
          } else {
            addLog('No Firebase user detected');
          }
        });
        
        return unsubscribe;
      } catch (error: any) {
        addLog(`Auth listener setup error: ${error.message}`);
        return () => {};
      }
    };

    setupAuthListener();

    return () => unsubscribe();
  }, []);

  const testGoogleSignIn = async () => {
    setTesting(true);
    addLog('Starting Google sign-in test...');
    
    try {
      // Import Firebase objects dynamically
      const firebaseModule = await import('@/lib/firebase');
      const auth = firebaseModule.auth as Auth;
      const googleProvider = firebaseModule.googleProvider as GoogleAuthProvider;
      
      // Store redirect attempt marker
      localStorage.setItem('google_auth_redirect_attempt', 'true');
      localStorage.setItem('google_auth_redirect_time', Date.now().toString());
      
      addLog('Initiating Google redirect...');
      await signInWithRedirect(auth, googleProvider);
      
      // This won't execute until after redirect
      addLog('Redirect initiated successfully');
    } catch (error: any) {
      addLog(`Sign-in error: ${error.code} - ${error.message}`);
      setTesting(false);
    }
  };

  const testBackendConnection = async () => {
    addLog('Testing backend connection...');
    try {
      const response = await fetch('/api/health');
      if (response.ok) {
        addLog('Backend connection successful');
      } else {
        addLog(`Backend returned status: ${response.status}`);
      }
    } catch (error: any) {
      addLog(`Backend connection failed: ${error.message}`);
    }
  };

  const clearAuthData = () => {
    addLog('Clearing auth data...');
    localStorage.removeItem('google_auth_redirect_attempt');
    localStorage.removeItem('google_auth_redirect_time');
    localStorage.removeItem('authAttemptInProgress');
    localStorage.removeItem('authAttemptTime');
    sessionStorage.removeItem('firebase_auth_error');
    addLog('Auth data cleared');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="bg-gray-800 border-gray-700 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-400" />
              Firebase Authentication Debug Panel
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Current Status */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Current Status</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    {isAuthenticated ? (
                      <CheckCircle className="h-4 w-4 text-green-400" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-400" />
                    )}
                    <span>Authentication: {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 text-yellow-400 animate-spin" />
                    ) : (
                      <CheckCircle className="h-4 w-4 text-green-400" />
                    )}
                    <span>Loading: {isLoading ? 'Yes' : 'No'}</span>
                  </div>
                  {user && (
                    <div className="text-green-400">
                      User: {user.name} ({user.email})
                    </div>
                  )}
                </div>
              </div>

              {/* Environment Info */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Environment</h3>
                <div className="space-y-1 text-sm font-mono bg-gray-900 p-3 rounded">
                  <div>Hostname: {debugInfo.hostname}</div>
                  <div>Origin: {debugInfo.origin}</div>
                  <div>Path: {debugInfo.currentPath}</div>
                  <div>Project ID: {debugInfo.firebaseConfig?.projectId}</div>
                  <div>API Key: {debugInfo.firebaseConfig?.apiKey}</div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex flex-wrap gap-3">
              <Button 
                onClick={testGoogleSignIn} 
                disabled={testing || isAuthenticated}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {testing ? 'Testing...' : 'Test Google Sign-In'}
              </Button>
              <Button 
                onClick={testBackendConnection}
                variant="outline"
                className="border-gray-600 text-white hover:bg-gray-700"
              >
                Test Backend
              </Button>
              <Button 
                onClick={clearAuthData}
                variant="outline"
                className="border-orange-600 text-orange-400 hover:bg-orange-900"
              >
                Clear Auth Data
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Log Output */}
        <Card className="bg-gray-800 border-gray-700 text-white">
          <CardHeader>
            <CardTitle>Debug Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-black p-4 rounded font-mono text-sm max-h-96 overflow-y-auto">
              {logs.length === 0 ? (
                <div className="text-gray-500">No logs yet...</div>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className="text-green-400 mb-1">
                    {log}
                  </div>
                ))
              )}
            </div>
            <Button 
              onClick={() => setLogs([])}
              variant="outline"
              size="sm"
              className="mt-3 border-gray-600 text-white hover:bg-gray-700"
            >
              Clear Logs
            </Button>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="bg-blue-900/20 border-blue-600 text-white">
          <CardHeader>
            <CardTitle className="text-blue-400">Firebase Setup Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p>If authentication is failing, ensure these domains are added to Firebase Console:</p>
            <div className="bg-blue-900/30 p-3 rounded font-mono text-xs space-y-1">
              <div>1. {debugInfo.hostname}</div>
              <div>2. *.replit.dev</div>
              <div>3. *.replit.app</div>
              <div>4. localhost (for local development)</div>
            </div>
            <p className="text-blue-300">
              Go to: <span className="font-mono">Firebase Console → Authentication → Settings → Authorized domains</span>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}