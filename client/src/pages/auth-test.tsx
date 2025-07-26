import { useState, useEffect } from 'react';
import { auth, googleProvider } from '@/lib/firebase';
import { signInWithPopup, signInWithRedirect, getRedirectResult, Auth, GoogleAuthProvider } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AuthTestPage() {
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const addLog = (message: string) => {
    console.log(message);
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testPopupAuth = async () => {
    setLoading(true);
    addLog("Testing popup authentication...");
    
    try {
      const result = await signInWithPopup(auth as Auth, googleProvider as GoogleAuthProvider);
      addLog(`✅ Popup success: ${result.user.email}`);
      addLog(`User UID: ${result.user.uid}`);
      addLog(`Display Name: ${result.user.displayName}`);
    } catch (error: any) {
      addLog(`❌ Popup failed: ${error.code} - ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testRedirectAuth = async () => {
    setLoading(true);
    addLog("Testing redirect authentication...");
    
    try {
      localStorage.setItem('auth_test_redirect', 'true');
      await signInWithRedirect(auth as Auth, googleProvider as GoogleAuthProvider);
      addLog("🔄 Redirect initiated...");
    } catch (error: any) {
      addLog(`❌ Redirect failed: ${error.code} - ${error.message}`);
      setLoading(false);
    }
  };

  const checkRedirectResult = async () => {
    addLog("Checking redirect result...");
    
    try {
      const result = await getRedirectResult(auth as Auth);
      if (result && result.user) {
        addLog(`✅ Redirect result: ${result.user.email}`);
        localStorage.removeItem('auth_test_redirect');
      } else {
        addLog("No redirect result found");
      }
    } catch (error: any) {
      addLog(`❌ Redirect result error: ${error.code} - ${error.message}`);
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  // Check for redirect result on page load
  useEffect(() => {
    if (localStorage.getItem('auth_test_redirect')) {
      setTimeout(checkRedirectResult, 1000);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Google Authentication Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Button 
                onClick={testPopupAuth} 
                disabled={loading}
                variant="outline"
              >
                Test Popup Auth
              </Button>
              
              <Button 
                onClick={testRedirectAuth} 
                disabled={loading}
                variant="outline"
              >
                Test Redirect Auth
              </Button>
              
              <Button 
                onClick={checkRedirectResult} 
                disabled={loading}
                variant="outline"
              >
                Check Redirect Result
              </Button>
              
              <Button 
                onClick={clearLogs} 
                variant="destructive"
              >
                Clear Logs
              </Button>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-semibold">Environment Info:</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p>Hostname: {window.location.hostname}</p>
                <p>Protocol: {window.location.protocol}</p>
                <p>Is Replit Domain: {window.location.hostname.includes('replit') ? 'Yes' : 'No'}</p>
                <p>Firebase Project: {import.meta.env.VITE_FIREBASE_PROJECT_ID || 'Not set'}</p>
                <p>API Key Present: {import.meta.env.VITE_FIREBASE_API_KEY ? 'Yes' : 'No'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Authentication Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 p-4 rounded max-h-96 overflow-y-auto">
              {logs.length === 0 ? (
                <p className="text-gray-500">No logs yet. Click a test button above.</p>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className="text-sm font-mono mb-1">
                    {log}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}