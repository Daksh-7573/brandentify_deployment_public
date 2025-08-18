import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface FirebaseUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

/**
 * Simple Firebase Authentication Component
 * Bypasses complex AuthContext and provides direct Firebase integration
 */
export function SimpleFirebaseAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const { toast } = useToast();

  // Check for existing user and redirect results on mount
  useEffect(() => {
    checkAuthState();
    checkRedirectResult();
  }, []);

  const checkRedirectResult = async () => {
    try {
      const { getAuth, getRedirectResult } = await import('firebase/auth');
      const { initializeApp } = await import('firebase/app');
      
      const firebaseConfig = {
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
        authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
        storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.appspot.com`,
        appId: import.meta.env.VITE_FIREBASE_APP_ID
      };
      
      const app = initializeApp(firebaseConfig, 'redirect-check');
      const auth = getAuth(app);
      
      const result = await getRedirectResult(auth);
      
      if (result && result.user) {
        console.log('Found redirect result:', result.user.email);
        
        const userData = {
          uid: result.user.uid,
          email: result.user.email,
          displayName: result.user.displayName,
          photoURL: result.user.photoURL
        };
        
        setUser(userData);
        sessionStorage.setItem('firebase_user', JSON.stringify(userData));
        sessionStorage.setItem('user_authenticated', 'true');
        
        toast({
          title: 'Authentication Successful',
          description: `Welcome ${result.user.displayName || result.user.email}!`
        });
        
        setTimeout(() => {
          window.location.href = '/industry-pulse';
        }, 1500);
      }
    } catch (error) {
      console.error('Error checking redirect result:', error);
    }
  };

  const checkAuthState = async () => {
    try {
      const { auth } = await import('@/lib/firebase');
      if (auth && auth.currentUser) {
        setUser({
          uid: auth.currentUser.uid,
          email: auth.currentUser.email,
          displayName: auth.currentUser.displayName,
          photoURL: auth.currentUser.photoURL
        });
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
    }
  };

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    
    try {
      console.log('Starting direct Firebase authentication...');
      
      // Import Firebase modules directly
      const { initializeApp } = await import('firebase/app');
      const { getAuth, GoogleAuthProvider, signInWithPopup } = await import('firebase/auth');
      
      // Get Firebase config from environment
      const firebaseConfig = {
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
        authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
        storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.appspot.com`,
        appId: import.meta.env.VITE_FIREBASE_APP_ID
      };
      
      console.log('Firebase config:', {
        projectId: firebaseConfig.projectId,
        authDomain: firebaseConfig.authDomain,
        hasApiKey: !!firebaseConfig.apiKey
      });
      
      // Initialize Firebase with unique app name to avoid conflicts
      const appName = `simple-auth-${Date.now()}`;
      let app;
      let auth;
      
      try {
        app = initializeApp(firebaseConfig, appName);
        auth = getAuth(app);
        console.log('Firebase initialized successfully with app:', appName);
      } catch (initError: any) {
        console.error('Firebase initialization failed:', initError);
        throw new Error(`Firebase initialization failed: ${initError.message}`);
      }
      
      if (!auth) {
        throw new Error('Firebase Auth not properly initialized');
      }
      
      // Create Google provider
      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      
      console.log('Opening Google authentication popup...');
      
      // Attempt popup authentication with timeout and better error handling
      const popupPromise = signInWithPopup(auth, provider);
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('Authentication timeout after 60 seconds'));
        }, 60000);
      });
      
      const result = await Promise.race([popupPromise, timeoutPromise]);
      
      if (result && result.user) {
        console.log('Authentication successful:', result.user.email);
        
        const userData = {
          uid: result.user.uid,
          email: result.user.email,
          displayName: result.user.displayName,
          photoURL: result.user.photoURL
        };
        
        setUser(userData);
        
        // Store user data for app use
        sessionStorage.setItem('firebase_user', JSON.stringify(userData));
        sessionStorage.setItem('user_authenticated', 'true');
        
        toast({
          title: 'Authentication Successful',
          description: `Welcome ${result.user.displayName || result.user.email}!`
        });
        
        // Redirect to Industry Pulse after brief delay
        setTimeout(() => {
          console.log('Redirecting to Industry Pulse...');
          window.location.href = '/industry-pulse';
        }, 1500);
      }
      
    } catch (error: any) {
      console.error('Authentication error:', error);
      
      let errorMessage = 'Authentication failed. Please try again.';
      
      if (error.code === 'auth/popup-blocked') {
        errorMessage = 'Popup was blocked by your browser. Please allow popups and try again.';
      } else if (error.code === 'auth/popup-closed-by-user') {
        // Try redirect authentication as automatic fallback
        console.log('Popup closed, attempting redirect authentication...');
        
        toast({
          title: 'Switching to redirect authentication',
          description: 'The popup was closed, redirecting to Google...',
          variant: 'default'
        });
        
        try {
          // Ensure we have a valid auth instance for redirect
          if (!auth) {
            console.error('Auth instance not available for redirect');
            errorMessage = 'Authentication service not properly initialized';
            return;
          }
          
          const { signInWithRedirect } = await import('firebase/auth');
          console.log('Attempting redirect authentication...');
          await signInWithRedirect(auth, provider);
          return; // Exit function as redirect will handle the rest
        } catch (redirectError: any) {
          console.error('Redirect authentication also failed:', redirectError);
          errorMessage = `Both popup and redirect failed. Error: ${redirectError.message || 'Unknown error'}`;
        }
      } else if (error.code === 'auth/unauthorized-domain') {
        errorMessage = 'This domain is not authorized for Google authentication.';
      } else if (error.message === 'Authentication timeout after 60 seconds') {
        errorMessage = 'Authentication took too long. Please try again.';
      }
      
      toast({
        title: 'Authentication Error',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      const { auth } = await import('@/lib/firebase');
      if (auth) {
        await auth.signOut();
      }
      
      setUser(null);
      sessionStorage.removeItem('firebase_user');
      sessionStorage.removeItem('user_authenticated');
      
      toast({
        title: 'Signed Out',
        description: 'You have been signed out successfully.'
      });
      
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  if (user) {
    return (
      <div className="space-y-4 p-4 bg-green-50 border border-green-200 rounded-lg">
        <div className="text-center">
          <p className="text-green-800 font-medium">
            Signed in as {user.displayName || user.email}
          </p>
          {user.photoURL && (
            <img 
              src={user.photoURL} 
              alt="Profile" 
              className="w-12 h-12 rounded-full mx-auto mt-2"
            />
          )}
        </div>
        <div className="flex gap-2 justify-center">
          <Button onClick={handleSignOut} variant="outline" size="sm">
            Sign Out
          </Button>
          <Button 
            onClick={() => window.location.href = '/industry-pulse'} 
            size="sm"
          >
            Go to Industry Pulse
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Button
        onClick={handleGoogleAuth}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white"
        size="lg"
      >
        {/* Google Icon */}
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5">
          <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
          <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
          <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
          <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
        </svg>
        
        {isLoading ? 'Signing in...' : 'Continue with Google'}
      </Button>
      
      <div className="text-xs text-gray-400 text-center">
        <p>Direct Firebase authentication</p>
        <p>Bypasses complex auth context for reliable sign-in</p>
      </div>
    </div>
  );
}