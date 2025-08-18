import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

/**
 * Clean Google Authentication Button
 * Simple, reliable Firebase Google authentication with redirect flow
 */
export function GoogleAuthButton() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    console.log('Starting Google authentication...');

    try {
      // Check Firebase environment variables
      const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
      const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
      const appId = import.meta.env.VITE_FIREBASE_APP_ID;

      if (!apiKey || !projectId || !appId) {
        throw new Error('Firebase configuration is missing. Please check environment variables.');
      }

      // Dynamic Firebase imports for optimal loading
      const [
        { initializeApp },
        { getAuth, signInWithRedirect, GoogleAuthProvider }
      ] = await Promise.all([
        import('firebase/app'),
        import('firebase/auth')
      ]);

      // Firebase configuration
      const firebaseConfig = {
        apiKey,
        authDomain: `${projectId}.firebaseapp.com`,
        projectId,
        storageBucket: `${projectId}.appspot.com`,
        appId
      };

      // Initialize Firebase - use consistent app name
      const app = initializeApp(firebaseConfig, 'brandentifier-auth-main');
      const auth = getAuth(app);
      
      // Configure Google Provider
      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');
      provider.setCustomParameters({
        prompt: 'select_account'
      });

      // Store return URL for after authentication
      sessionStorage.setItem('auth_return_url', '/industry-pulse');
      sessionStorage.setItem('auth_timestamp', new Date().toISOString());
      sessionStorage.setItem('auth_initiated', 'true');

      toast({
        title: 'Redirecting to Google',
        description: 'You will be redirected to complete authentication...',
      });

      console.log('Initiating Google redirect...');
      
      // Use popup flow to avoid X-Frame-Options issues
      const { signInWithPopup } = await import('firebase/auth');
      
      console.log('Opening Google popup...');
      const result = await signInWithPopup(auth, provider);
      
      console.log('✅ Google authentication successful:', result.user.email);
      
      // Create Brandentifier account
      const userData = {
        firebaseUid: result.user.uid,
        email: result.user.email || '',
        name: result.user.displayName || 'Google User',
        photoURL: result.user.photoURL || '',
        googleId: result.user.uid,
        authProvider: 'google',
        emailVerified: result.user.emailVerified
      };

      console.log('Sending user data to backend:', userData.email);

      // Call backend to create/get user (backend handles existing accounts)
      const response = await fetch('/api/auth/google-signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });

      const data = await response.json();
      
      if (data.success) {
        // Navigate to auth success page with user data
        window.location.href = '/auth-success?user=' + encodeURIComponent(JSON.stringify(data.user));
      } else {
        throw new Error(data.message || 'Authentication failed');
      }
      
    } catch (error: any) {
      console.error('Google authentication error:', error);
      
      let errorMessage = 'Authentication failed. Please try again.';
      
      if (error.code === 'auth/unauthorized-domain') {
        errorMessage = 'This domain is not authorized for Google authentication. Please contact support.';
      } else if (error.message.includes('Firebase configuration')) {
        errorMessage = 'Firebase is not properly configured. Please contact support.';
      }
      
      toast({
        title: 'Authentication Error',
        description: errorMessage,
        variant: 'destructive'
      });
      
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleGoogleSignIn}
      disabled={isLoading}
      className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-900 border border-gray-300"
      size="lg"
    >
      {isLoading ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : (
        <>
          {/* Google Icon */}
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5">
            <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
            <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
            <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
            <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
          </svg>
          Continue with Google
        </>
      )}
    </Button>
  );
}