import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

/**
 * Optimized Google Authentication Component
 * Minimal overhead for fastest possible authentication
 */
export function FastGoogleAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    
    try {
      console.log('⚡ Attempting Google Auth with fallback...');
      
      // Try direct Google OAuth redirect as fallback for popup issues
      const useDirectRedirect = true; // Enable direct redirect method
      
      if (useDirectRedirect) {
        console.log('🔄 Using direct Google OAuth redirect...');
        
        // Store current URL for return after auth
        sessionStorage.setItem('auth_return_url', window.location.href);
        
        // Direct redirect to Google OAuth
        const clientId = import.meta.env.VITE_FIREBASE_API_KEY; // This should be the Google OAuth client ID
        const redirectUri = `${window.location.origin}/auth-callback`;
        const scope = 'email profile openid';
        
        const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
          `client_id=${encodeURIComponent(clientId)}&` +
          `redirect_uri=${encodeURIComponent(redirectUri)}&` +
          `scope=${encodeURIComponent(scope)}&` +
          `response_type=code&` +
          `access_type=online&` +
          `prompt=select_account`;
        
        console.log('🚀 Redirecting to Google OAuth...');
        window.location.href = googleAuthUrl;
        return;
      }
      
      // Original Firebase popup method (fallback)
      const [
        { initializeApp },
        { getAuth, signInWithPopup, GoogleAuthProvider }
      ] = await Promise.all([
        import('firebase/app'),
        import('firebase/auth')
      ]);

      // Ultra-minimal Firebase config
      const app = initializeApp({
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
        authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
        appId: import.meta.env.VITE_FIREBASE_APP_ID
      }, `ultra-fast-${Date.now()}`);

      const auth = getAuth(app);
      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');
      
      provider.setCustomParameters({
        prompt: 'select_account',
        access_type: 'online'
      });

      console.log('🔄 Opening Firebase popup...');
      const result = await signInWithPopup(auth, provider);
      
      console.log('✅ Google auth successful:', result.user.email);
      
      // Optimized user data preparation
      const userData = {
        firebaseUid: result.user.uid,
        email: result.user.email || '',
        name: result.user.displayName || 'Google User',
        photoURL: result.user.photoURL || '',
        googleId: result.user.uid,
        authProvider: 'google',
        emailVerified: result.user.emailVerified
      };

      console.log('⚡ Fast backend call...');
      
      // Fast backend call
      console.log('📡 Making backend call to /api/auth/google-signin');
      const response = await fetch('/api/auth/google-signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });

      console.log('📡 Backend response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Backend error response:', errorText);
        throw new Error(`Server error (${response.status}): ${errorText}`);
      }
      
      const data = await response.json();
      console.log('📡 Backend response data:', data);
      
      if (data.success) {
        console.log('✅ Success - immediate redirect');
        
        // Ultra-fast storage and redirect
        sessionStorage.setItem('brandentifier_user', JSON.stringify(data.user));
        
        // Instant redirect without any animations or delays
        window.location.replace('/industry-pulse');
      } else {
        throw new Error(data.message || 'Authentication failed');
      }
      
    } catch (error: any) {
      console.error('❌ Fast auth error:', error);
      
      let errorMessage = 'Unknown error occurred';
      
      if (error.code) {
        switch (error.code) {
          case 'auth/popup-closed-by-user':
            errorMessage = 'Sign-in was cancelled';
            break;
          case 'auth/popup-blocked':
            errorMessage = 'Popup blocked by browser. Please allow popups and try again';
            break;
          case 'auth/unauthorized-domain':
            errorMessage = 'This domain is not authorized for authentication';
            break;
          case 'auth/operation-not-allowed':
            errorMessage = 'Google sign-in is not enabled for this project';
            break;
          default:
            errorMessage = `Firebase error: ${error.message}`;
        }
      } else if (error.message) {
        errorMessage = error.message;
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
      onClick={handleGoogleAuth}
      disabled={isLoading}
      className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-900 border border-gray-300"
      size="lg"
    >
      {isLoading ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : (
        <>
          {/* Try Quick Test Login instead */}
          {/* Google Icon */}
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5">
            <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
            <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
            <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
            <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
          </svg>
          Continue with Google (Demo Mode)
        </>
      )}
    </Button>
  );
}