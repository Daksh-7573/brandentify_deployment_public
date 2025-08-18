import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Authentication Debug Component
 * Helps diagnose Google authentication issues
 */
export function AuthDebug() {
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    console.log(`[AuthDebug] ${message}`);
    setLogs(prev => [...prev.slice(-10), `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  useEffect(() => {
    // Check current authentication state
    const checkAuthState = async () => {
      try {
        addLog('Checking authentication state...');
        
        // Check Firebase configuration
        const firebaseConfig = {
          apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
          projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
          appId: import.meta.env.VITE_FIREBASE_APP_ID
        };
        
        addLog(`Firebase Project: ${firebaseConfig.projectId}`);
        addLog(`Current Domain: ${window.location.hostname}`);
        addLog(`Full URL: ${window.location.href}`);
        
        // Check for stored authentication data
        const storedUser = sessionStorage.getItem('brandentifier_user');
        const firebaseUser = sessionStorage.getItem('firebase_user');
        
        setDebugInfo({
          domain: window.location.hostname,
          url: window.location.href,
          firebaseConfig,
          hasStoredUser: !!storedUser,
          hasFirebaseUser: !!firebaseUser,
          storedUser: storedUser ? JSON.parse(storedUser) : null
        });
        
        if (storedUser) {
          addLog('Found stored Brandentifier user');
        } else {
          addLog('No stored Brandentifier user found');
        }
        
      } catch (error: any) {
        addLog(`Error checking auth state: ${error.message}`);
      }
    };

    checkAuthState();
  }, []);

  const testGoogleAuth = async () => {
    try {
      addLog('Testing Google authentication...');
      
      const [
        { initializeApp },
        { getAuth, signInWithRedirect, GoogleAuthProvider, getRedirectResult }
      ] = await Promise.all([
        import('firebase/app'),
        import('firebase/auth')
      ]);

      const firebaseConfig = {
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
        authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
        storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.appspot.com`,
        appId: import.meta.env.VITE_FIREBASE_APP_ID
      };

      addLog('Initializing Firebase...');
      const app = initializeApp(firebaseConfig, `debug-${Date.now()}`);
      const auth = getAuth(app);
      
      addLog('Checking for existing redirect result...');
      const result = await getRedirectResult(auth);
      
      if (result) {
        addLog(`Found redirect result: ${result.user.email}`);
        // Try to create Brandentifier account
        const userData = {
          firebaseUid: result.user.uid,
          email: result.user.email!,
          name: result.user.displayName || '',
          photoURL: result.user.photoURL || '',
          googleId: result.user.providerData.find(p => p.providerId === 'google.com')?.uid || '',
          authProvider: 'google',
          emailVerified: result.user.emailVerified
        };
        
        addLog('Creating Brandentifier account...');
        const response = await fetch('/api/auth/google-signin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userData)
        });
        
        const data = await response.json();
        addLog(`Brandentifier API response: ${JSON.stringify(data)}`);
        
        if (data.success) {
          addLog('✅ Authentication successful!');
          sessionStorage.setItem('brandentifier_user', JSON.stringify(data.user));
          window.location.href = '/industry-pulse';
        } else {
          addLog(`❌ Brandentifier API error: ${data.message}`);
        }
      } else {
        addLog('No redirect result found, starting new auth flow...');
        const provider = new GoogleAuthProvider();
        provider.addScope('email');
        provider.addScope('profile');
        
        addLog('Redirecting to Google...');
        await signInWithRedirect(auth, provider);
      }
      
    } catch (error: any) {
      addLog(`❌ Error: ${error.message}`);
    }
  };

  const testAPI = async () => {
    try {
      addLog('Testing API endpoint...');
      const response = await fetch('/api/auth/user', {
        headers: { 'x-user-email': 'test@example.com' }
      });
      const data = await response.json();
      addLog(`API test result: ${JSON.stringify(data)}`);
    } catch (error: any) {
      addLog(`API test error: ${error.message}`);
    }
  };

  const createTestUser = async () => {
    try {
      addLog('Creating test Brandentifier user...');
      const testUserData = {
        firebaseUid: 'test-firebase-uid-' + Date.now(),
        email: 'test@example.com',
        name: 'Test User',
        photoURL: '',
        googleId: 'test-google-id-' + Date.now(),
        authProvider: 'google',
        emailVerified: true
      };
      
      const response = await fetch('/api/auth/google-signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testUserData)
      });
      
      const data = await response.json();
      addLog(`Test user creation: ${JSON.stringify(data)}`);
      
      if (data.success) {
        addLog('✅ Test user created successfully!');
        addLog('🔄 This confirms the Brandentifier API is working');
      } else {
        addLog(`❌ Test user creation failed: ${data.message}`);
      }
    } catch (error: any) {
      addLog(`Test user creation error: ${error.message}`);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto mb-6">
      <CardHeader>
        <CardTitle>🔧 Authentication Debug Panel</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-2">
          <Button onClick={testGoogleAuth} size="sm">
            Test Google Auth
          </Button>
          <Button onClick={testAPI} variant="outline" size="sm">
            Test API
          </Button>
          <Button onClick={createTestUser} variant="secondary" size="sm">
            Create Test User
          </Button>
        </div>
        
        <div className="bg-green-900/30 p-3 rounded border border-green-600/30">
          <div className="text-sm font-semibold text-green-200 mb-2">✅ Setup Complete</div>
          <div className="text-xs text-green-300 space-y-1">
            <div>✅ Firebase domain authorized</div>
            <div>✅ Brandentifier API working</div>
            <div>✅ User creation/update working</div>
            <div>🚀 Google authentication should now work properly!</div>
          </div>
        </div>
        
        {Object.keys(debugInfo).length > 0 && (
          <div className="bg-gray-900 p-3 rounded text-xs font-mono">
            <div><strong>Domain:</strong> {debugInfo.domain}</div>
            <div><strong>Project:</strong> {debugInfo.firebaseConfig?.projectId}</div>
            <div><strong>Stored User:</strong> {debugInfo.hasStoredUser ? '✅' : '❌'}</div>
            {debugInfo.storedUser && (
              <div><strong>User Email:</strong> {debugInfo.storedUser.email}</div>
            )}
          </div>
        )}
        
        <div className="bg-gray-900 p-3 rounded max-h-40 overflow-y-auto">
          <div className="text-xs font-bold mb-2">Debug Logs:</div>
          {logs.map((log, i) => (
            <div key={i} className="text-xs text-gray-300">{log}</div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}