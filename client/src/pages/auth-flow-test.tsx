import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

export default function AuthFlowTest() {
  const [status, setStatus] = useState("Ready to test authentication flow");
  const [logs, setLogs] = useState<string[]>([]);
  const { signInWithGoogle, isAuthenticated, user, isLoading } = useAuth();

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
    console.log(`[AuthFlowTest] ${message}`);
  };

  const testFullAuthFlow = async () => {
    try {
      setStatus("Testing complete authentication flow...");
      addLog("Starting full authentication flow test");
      
      // Clear any previous auth flags
      sessionStorage.removeItem('authSuccess');
      sessionStorage.removeItem('popup_auth_attempt');
      sessionStorage.removeItem('popup_auth_time');
      
      addLog("Initiating Google sign-in...");
      
      // Call the auth context method
      await signInWithGoogle();
      
      addLog("Google sign-in method completed");
      
      // Check authentication state after a brief delay
      setTimeout(() => {
        addLog(`Authentication state: ${isAuthenticated ? 'Authenticated' : 'Not authenticated'}`);
        addLog(`User: ${user ? user.email : 'No user'}`);
        addLog(`Loading: ${isLoading}`);
        
        if (isAuthenticated && user) {
          setStatus(`Authentication successful: ${user.email}`);
          addLog("✅ Full authentication flow completed successfully");
        } else {
          setStatus("Authentication flow completed but user not set");
          addLog("❌ Authentication flow issue - user state not updated");
        }
      }, 3000);
      
    } catch (error) {
      addLog(`Authentication flow failed: ${error}`);
      setStatus(`Authentication failed: ${error}`);
    }
  };

  const checkCurrentAuthState = () => {
    addLog("Checking current authentication state...");
    addLog(`Is Authenticated: ${isAuthenticated}`);
    addLog(`User: ${user ? JSON.stringify({email: user.email, name: user.name}) : 'No user'}`);
    addLog(`Is Loading: ${isLoading}`);
    
    const authSuccess = sessionStorage.getItem('authSuccess');
    const popupAttempt = sessionStorage.getItem('popup_auth_attempt');
    const popupTime = sessionStorage.getItem('popup_auth_time');
    
    addLog(`Session flags - authSuccess: ${authSuccess}, popupAttempt: ${popupAttempt}, popupTime: ${popupTime}`);
  };

  const clearAuthState = () => {
    addLog("Clearing all auth state and session storage...");
    sessionStorage.clear();
    localStorage.clear();
    setStatus("Auth state cleared");
    addLog("All auth state cleared - ready for fresh test");
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Authentication Flow Test</h1>
        
        <div className="bg-blue-900/20 border border-blue-600 rounded-lg p-4 mb-6">
          <h3 className="text-blue-400 font-semibold mb-2">Current Status</h3>
          <p className="text-blue-200 text-sm">{status}</p>
          <div className="mt-2 text-sm">
            <span className="text-blue-300">Auth State:</span> {isAuthenticated ? '✅ Authenticated' : '❌ Not Authenticated'} | 
            <span className="text-blue-300"> User:</span> {user?.email || 'None'} |
            <span className="text-blue-300"> Loading:</span> {isLoading ? 'Yes' : 'No'}
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <Button
            onClick={testFullAuthFlow}
            disabled={isLoading}
            className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg text-white"
          >
            {isLoading ? 'Processing...' : 'Test Complete Authentication Flow'}
          </Button>
          
          <Button
            onClick={checkCurrentAuthState}
            className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg text-white"
          >
            Check Current Auth State
          </Button>
          
          <Button
            onClick={clearAuthState}
            className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-lg text-white"
          >
            Clear Auth State
          </Button>
        </div>
        
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Debug Logs</h2>
          <div className="text-sm bg-gray-900 p-4 rounded h-96 overflow-y-auto">
            {logs.map((log, index) => (
              <div key={index} className="mb-1 font-mono">{log}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}