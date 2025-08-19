import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';

/**
 * Google Authentication Test Component
 * Debug version with detailed logging
 */
export function GoogleAuthTest() {
  const [isLoading, setIsLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const { toast } = useToast();
  const { signIn } = useAuth();
  const [, navigate] = useLocation();

  const addLog = (message: string) => {
    console.log(message);
    setLogs(prev => [...prev.slice(-10), `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  useEffect(() => {
    // Check for redirect result on mount
    const checkRedirectResult = async () => {
      try {
        addLog('Checking for redirect result...');
        
        const [
          { initializeApp },
          { getAuth, getRedirectResult }
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

        const app = initializeApp(firebaseConfig, 'google-auth-test');
        const auth = getAuth(app);

        const result = await getRedirectResult(auth);
        
        if (result?.user) {
          addLog(`✅ Redirect result found: ${result.user.email}`);
          
          // Create account via backend
          const userData = {
            firebaseUid: result.user.uid,
            email: result.user.email || '',
            name: result.user.displayName || 'Google User',
            photoURL: result.user.photoURL || '',
            googleId: result.user.uid,
            authProvider: 'google',
            emailVerified: result.user.emailVerified
          };

          addLog('Sending data to backend...');
          const response = await fetch('/api/auth/google-signin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
          });

          const data = await response.json();
          
          if (data.success) {
            addLog('✅ Backend authentication successful');
            signIn(data.user);
            
            toast({
              title: 'Google Authentication Successful!',
              description: `Welcome ${data.user.name}`
            });

            navigate('/industry-pulse');
          } else {
            addLog(`❌ Backend error: ${data.message}`);
          }
        } else {
          addLog('No redirect result found');
        }
      } catch (error: any) {
        addLog(`❌ Error checking redirect: ${error.message}`);
      }
    };

    checkRedirectResult();
  }, []);

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    addLog('Starting Google authentication...');

    try {
      const [
        { initializeApp },
        { getAuth, signInWithRedirect, GoogleAuthProvider }
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
      const app = initializeApp(firebaseConfig, 'google-auth-test');
      const auth = getAuth(app);
      
      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');

      addLog('Opening Google popup...');
      const { signInWithPopup } = await import('firebase/auth');
      
      const result = await signInWithPopup(auth, provider);
      addLog(`✅ Popup authentication successful: ${result.user.email}`);
      
      // Create account via backend
      const userData = {
        firebaseUid: result.user.uid,
        email: result.user.email || '',
        name: result.user.displayName || 'Google User',
        photoURL: result.user.photoURL || '',
        googleId: result.user.uid,
        authProvider: 'google',
        emailVerified: result.user.emailVerified
      };

      addLog('Sending data to backend...');
      const response = await fetch('/api/auth/google-signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });

      const data = await response.json();
      
      if (data.success) {
        addLog('✅ Backend authentication successful');
        signIn(data.user);
        
        toast({
          title: 'Google Authentication Successful!',
          description: `Welcome ${data.user.name}`
        });

        navigate('/industry-pulse');
      } else {
        addLog(`❌ Backend error: ${data.message}`);
      }
      
    } catch (error: any) {
      addLog(`❌ Authentication error: ${error.message}`);
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-white mb-2">Google Auth Test</h3>
        <Button 
          onClick={handleGoogleAuth}
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        >
          {isLoading ? 'Redirecting...' : 'Test Google Auth'}
        </Button>
      </div>
      
      {logs.length > 0 && (
        <div className="mt-4 p-3 bg-black/20 rounded-lg max-h-40 overflow-y-auto">
          <h4 className="text-sm font-medium text-white mb-2">Debug Logs:</h4>
          {logs.map((log, index) => (
            <div key={index} className="text-xs text-gray-300 font-mono">
              {log}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}