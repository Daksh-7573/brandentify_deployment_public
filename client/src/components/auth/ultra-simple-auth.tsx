import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

/**
 * Ultra Simple Firebase Authentication
 * Direct implementation without any complex dependencies
 */
export function UltraSimpleAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    console.log('🚀 Starting ultra-simple Google authentication...');

    try {
      // Check environment variables
      const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
      const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
      const appId = import.meta.env.VITE_FIREBASE_APP_ID;

      if (!apiKey || !projectId || !appId) {
        throw new Error('Missing Firebase configuration. Please check environment variables.');
      }

      console.log('Firebase config check passed');

      // For direct OAuth, we need to use Firebase's Web Client ID
      // Let's extract it from Firebase config or use Firebase redirect instead
      console.log('Using Firebase redirect for more reliable authentication');
      
      // Import Firebase modules
      const { initializeApp } = await import('firebase/app');
      const { getAuth, signInWithRedirect, GoogleAuthProvider } = await import('firebase/auth');
      
      const firebaseConfig = {
        apiKey: apiKey,
        authDomain: `${projectId}.firebaseapp.com`,
        projectId: projectId,
        storageBucket: `${projectId}.appspot.com`,
        appId: appId
      };
      
      const app = initializeApp(firebaseConfig, `ultra-simple-${Date.now()}`);
      const auth = getAuth(app);
      const provider = new GoogleAuthProvider();
      
      provider.addScope('email');
      provider.addScope('profile');
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      
      console.log('Starting Firebase redirect authentication...');
      await signInWithRedirect(auth, provider);
      return; // Function will exit here as redirect takes over

      toast({
        title: 'Redirecting to Google',
        description: 'You will be redirected to complete authentication...',
      });

      // Store current location for return
      sessionStorage.setItem('auth_return_url', '/industry-pulse');

    } catch (error: any) {
      console.error('Authentication error:', error);
      
      toast({
        title: 'Authentication Error',
        description: error.message || 'Unable to start authentication. Please try again.',
        variant: 'destructive'
      });
      
      setIsLoading(false);
    }
  };

  const handleFirebaseRedirect = async () => {
    setIsLoading(true);
    console.log('🔄 Using Firebase redirect authentication...');

    try {
      // Import Firebase dynamically
      const [
        { initializeApp },
        { getAuth, signInWithRedirect, GoogleAuthProvider }
      ] = await Promise.all([
        import('firebase/app'),
        import('firebase/auth')
      ]);

      // Firebase configuration
      const firebaseConfig = {
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
        authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
        storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.appspot.com`,
        appId: import.meta.env.VITE_FIREBASE_APP_ID
      };

      console.log('Initializing Firebase for redirect...');

      // Initialize with unique name
      const app = initializeApp(firebaseConfig, `redirect-${Date.now()}`);
      const auth = getAuth(app);
      const provider = new GoogleAuthProvider();
      
      provider.addScope('email');
      provider.addScope('profile');

      toast({
        title: 'Redirecting to Google',
        description: 'You will be redirected to complete sign-in...',
      });

      console.log('Starting Firebase redirect...');
      await signInWithRedirect(auth, provider);
      
    } catch (error: any) {
      console.error('Firebase redirect error:', error);
      
      toast({
        title: 'Redirect Authentication Failed',
        description: error.message || 'Unable to redirect to Google. Please try again.',
        variant: 'destructive'
      });
      
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold text-white mb-2">Choose Authentication Method</h3>
        <p className="text-sm text-gray-300">Select the most reliable option for your browser</p>
      </div>

      {/* Firebase Redirect - Most Reliable */}
      <Button
        onClick={handleFirebaseRedirect}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white"
        size="lg"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5">
          <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
          <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
          <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
          <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
        </svg>
        {isLoading ? 'Redirecting...' : 'Continue with Google (Redirect)'}
      </Button>

      {/* Direct OAuth - Alternative */}
      <Button
        onClick={handleGoogleLogin}
        disabled={isLoading}
        variant="outline"
        className="w-full flex items-center justify-center gap-3 border-gray-600 hover:bg-gray-800 text-white"
        size="lg"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5">
          <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
          <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
          <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
          <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
        </svg>
        {isLoading ? 'Starting...' : 'Direct OAuth (Alternative)'}
      </Button>

      <div className="text-xs text-gray-400 text-center space-y-1">
        <p className="text-green-400">✓ Redirect method is most reliable</p>
        <p>No popups, no blocking issues</p>
        <p>Works on all browsers and devices</p>
      </div>
    </div>
  );
}