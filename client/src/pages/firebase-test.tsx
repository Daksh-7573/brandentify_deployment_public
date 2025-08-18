import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

export default function FirebaseTestPage() {
  const [firebaseStatus, setFirebaseStatus] = useState<string>('Checking...');
  const [authStatus, setAuthStatus] = useState<string>('Not checked');
  const [user, setUser] = useState<any>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
    console.log(message);
  };

  useEffect(() => {
    checkFirebaseConnection();
  }, []);

  const checkFirebaseConnection = async () => {
    try {
      addLog('Testing Firebase configuration...');
      
      // Check environment variables
      const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
      const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
      const appId = import.meta.env.VITE_FIREBASE_APP_ID;
      
      addLog(`API Key: ${apiKey ? 'Present' : 'Missing'}`);
      addLog(`Project ID: ${projectId || 'Missing'}`);
      addLog(`App ID: ${appId ? 'Present' : 'Missing'}`);
      
      if (!apiKey || !projectId || !appId) {
        setFirebaseStatus('❌ Missing Firebase configuration');
        return;
      }
      
      // Test Firebase initialization
      const { auth } = await import('@/lib/firebase-auth');
      addLog('Firebase auth imported successfully');
      
      // Check current auth state
      const currentUser = auth.currentUser;
      addLog(`Current Firebase user: ${currentUser ? currentUser.email : 'None'}`);
      
      setFirebaseStatus('✅ Firebase configured correctly');
      
      // Set up auth state listener
      const { onAuthStateChanged } = await import('firebase/auth');
      onAuthStateChanged(auth, (user) => {
        if (user) {
          addLog(`Auth state changed: User logged in - ${user.email}`);
          addLog(`User ID: ${user.uid}`);
          addLog(`Display Name: ${user.displayName || 'Not set'}`);
          
          // Check stored auth data
          const storedAuth = localStorage.getItem('brandentifier_auth');
          const storedUser = sessionStorage.getItem('brandentifier_user');
          addLog(`Stored auth flag: ${storedAuth || 'Not set'}`);
          addLog(`Stored user data: ${storedUser ? 'Present' : 'Not set'}`);
          
          setUser(user);
          setAuthStatus('✅ Authenticated');
        } else {
          addLog('Auth state changed: User logged out');
          setUser(null);
          setAuthStatus('❌ Not authenticated');
        }
      });
      
      // Check for redirect result immediately and handle redirect
      const { handleRedirectResult } = await import('@/lib/firebase-auth');
      try {
        const redirectUser = await handleRedirectResult();
        if (redirectUser) {
          addLog(`Redirect result found: ${redirectUser.email}`);
          addLog('User will be redirected to Industry Pulse in a moment...');
          // handleRedirectResult will handle the redirect automatically
        } else {
          addLog('No redirect result found');
        }
      } catch (redirectError: any) {
        addLog(`Redirect result error: ${redirectError.message}`);
      }
      
    } catch (error: any) {
      addLog(`Error: ${error.message}`);
      setFirebaseStatus('❌ Firebase connection failed');
    }
  };

  const testGoogleSignIn = async () => {
    try {
      addLog('Testing Google sign-in...');
      addLog('Clearing any existing auth data...');
      
      // Clear existing auth data
      sessionStorage.removeItem('brandentifier_user');
      localStorage.removeItem('brandentifier_auth');
      
      const { signInWithGoogle } = await import('@/lib/firebase-auth');
      await signInWithGoogle();
      addLog('Google sign-in initiated - you should be redirected to Google OAuth');
      addLog('After completing Google login, you will be redirected back here');
    } catch (error: any) {
      addLog(`Google sign-in error: ${error.message}`);
    }
  };

  const testSignOut = async () => {
    try {
      addLog('Testing sign out...');
      const { logout } = await import('@/lib/firebase-auth');
      await logout();
      addLog('Sign out completed');
    } catch (error: any) {
      addLog(`Sign out error: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Firebase Authentication Test</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-800/50 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Firebase Status</h2>
            <p className="text-lg mb-4">{firebaseStatus}</p>
            <Button onClick={checkFirebaseConnection} variant="outline">
              Recheck Firebase
            </Button>
          </div>

          <div className="bg-gray-800/50 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Authentication Status</h2>
            <p className="text-lg mb-2">{authStatus}</p>
            {user && (
              <div className="text-sm text-gray-300 mb-4">
                <p>Email: {user.email}</p>
                <p>Name: {user.displayName}</p>
                <p>UID: {user.uid}</p>
              </div>
            )}
            <div className="space-x-2">
              <Button onClick={testGoogleSignIn} variant="default">
                Test Google Sign-In
              </Button>
              {user && (
                <Button onClick={testSignOut} variant="outline">
                  Test Sign Out
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Debug Logs</h2>
          <div className="bg-black/30 rounded p-4 max-h-96 overflow-y-auto">
            {logs.map((log, index) => (
              <div key={index} className="text-sm text-gray-300 mb-1 font-mono">
                {log}
              </div>
            ))}
          </div>
          <Button 
            onClick={() => setLogs([])} 
            variant="outline" 
            size="sm" 
            className="mt-4"
          >
            Clear Logs
          </Button>
        </div>
      </div>
    </div>
  );
}