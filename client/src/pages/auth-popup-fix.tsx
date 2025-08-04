import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function AuthPopupFix() {
  const [status, setStatus] = useState("Ready to test");
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
    console.log(`[AuthPopupFix] ${message}`);
  };

  const testRedirectAuth = async () => {
    try {
      setStatus("Testing redirect authentication...");
      addLog("Starting redirect authentication test");
      
      // Import Firebase redirect methods
      const { signInWithRedirect, getRedirectResult } = await import('firebase/auth');
      const { auth, googleProvider } = await import('@/lib/firebase');
      
      addLog("Firebase imports successful");
      addLog("Initiating redirect to Google...");
      
      // Use redirect instead of popup to avoid white screen issues
      await signInWithRedirect(auth as any, googleProvider as any);
      
    } catch (error) {
      addLog(`Redirect auth failed: ${error}`);
      setStatus(`Redirect failed: ${error}`);
    }
  };

  const checkRedirectResult = async () => {
    try {
      setStatus("Checking redirect result...");
      addLog("Checking for redirect result");
      
      const { getRedirectResult } = await import('firebase/auth');
      const { auth } = await import('@/lib/firebase');
      
      const result = await getRedirectResult(auth as any);
      
      if (result) {
        addLog(`Redirect successful: ${result.user.email}`);
        setStatus(`Redirect successful: ${result.user.email}`);
      } else {
        addLog("No redirect result found");
        setStatus("No redirect result found");
      }
      
    } catch (error) {
      addLog(`Redirect result check failed: ${error}`);
      setStatus(`Redirect result failed: ${error}`);
    }
  };

  const testDirectGoogleAuth = () => {
    addLog("Opening direct Google OAuth URL...");
    
    const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
    const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
    const currentDomain = window.location.origin;
    
    // Create direct Google OAuth URL
    const googleAuthUrl = `https://accounts.google.com/oauth/authorize?` +
      `client_id=${apiKey}&` +
      `response_type=code&` +
      `scope=email%20profile&` +
      `redirect_uri=${encodeURIComponent(currentDomain + '/auth-callback')}&` +
      `state=firebase_auth`;
    
    addLog(`Opening URL: ${googleAuthUrl}`);
    window.open(googleAuthUrl, '_blank', 'width=500,height=600');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Authentication Popup Fix</h1>
        
        <div className="bg-red-900/20 border border-red-600 rounded-lg p-4 mb-6">
          <h3 className="text-red-400 font-semibold mb-2">Popup White Screen Issue</h3>
          <p className="text-red-200 text-sm">
            The white screen in Google popup indicates domain authorization issues.
            <br />
            <strong>Solution:</strong> Add this domain to Firebase Console authorized domains:
            <br />
            <code className="bg-red-800/30 px-2 py-1 rounded mt-1 inline-block">
              {window.location.hostname}
            </code>
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <Button
            onClick={testRedirectAuth}
            className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg text-white"
          >
            Test Redirect Authentication (Alternative to Popup)
          </Button>
          
          <Button
            onClick={checkRedirectResult}
            className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg text-white"
          >
            Check Redirect Result
          </Button>
          
          <Button
            onClick={testDirectGoogleAuth}
            className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg text-white"
          >
            Test Direct Google OAuth URL
          </Button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Status</h2>
            <p className="text-sm bg-gray-900 p-4 rounded">{status}</p>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Debug Logs</h2>
            <div className="text-sm bg-gray-900 p-4 rounded h-64 overflow-y-auto">
              {logs.map((log, index) => (
                <div key={index} className="mb-1 font-mono">{log}</div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="mt-8 bg-blue-900/20 border border-blue-600 rounded-lg p-4">
          <h3 className="text-blue-400 font-semibold mb-2">Next Steps</h3>
          <ul className="text-blue-200 text-sm space-y-1">
            <li>1. Go to Firebase Console → Authentication → Settings → Authorized domains</li>
            <li>2. Add: {window.location.hostname}</li>
            <li>3. Add: *.replit.dev and *.replit.app</li>
            <li>4. Try the "Test Redirect Authentication" button as an alternative</li>
          </ul>
        </div>
      </div>
    </div>
  );
}