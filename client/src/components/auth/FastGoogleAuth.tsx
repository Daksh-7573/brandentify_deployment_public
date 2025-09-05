import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { shouldUseRedirectAuth, isReplitDomain } from '@/utils/auth-popup-fix';

/**
 * Google Authentication Component - Fixed with Redirect Support
 */
export function FastGoogleAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Function to process auth result
  const processAuthResult = async (result: any) => {
    try {
      // Prepare user data for backend
      const userData = {
        firebaseUid: result.user.uid,
        email: result.user.email || '',
        name: result.user.displayName || 'Google User',
        photoURL: result.user.photoURL || '',
        googleId: result.user.uid,
        authProvider: 'google',
        emailVerified: result.user.emailVerified || false
      };

      console.log('📡 Sending to backend:', {
        email: userData.email,
        name: userData.name,
        authProvider: userData.authProvider
      });
      
      // Send to backend with longer timeout to handle slow responses
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
      
      const response = await fetch('/api/auth/google-signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Backend error:', response.status, errorText);
        throw new Error(`Backend error: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Backend response:', data);
      
      if (data.success && data.user) {
        console.log('✅ Authentication successful - storing user data');
        
        // Store user data in session storage
        sessionStorage.setItem('brandentifier_user', JSON.stringify(data.user));
        
        // Force immediate redirect
        console.log('✅ Redirecting to dashboard...');
        window.location.href = '/dashboard';
      } else {
        throw new Error(data.message || 'Authentication failed - no user data');
      }
    } catch (error) {
      console.error('❌ Processing auth result failed:', error);
      setIsLoading(false);
      throw error;
    }
  };

  // Check for redirect results when component mounts
  useEffect(() => {
    const checkRedirectResult = async () => {
      try {
        const redirectSource = localStorage.getItem('auth_redirect_source');
        const redirectAttempt = localStorage.getItem('auth_redirect_attempt');
        
        if (redirectSource === 'FastGoogleAuth' && redirectAttempt) {
          console.log('🔍 Checking for redirect result from FastGoogleAuth...');
          setIsLoading(true);
          
          const { getRedirectResult } = await import('firebase/auth');
          const firebaseModule = await import('@/lib/firebase');
          const auth: any = firebaseModule.auth;
          
          const result = await getRedirectResult(auth);
          
          if (result && result.user) {
            console.log('🎉 Redirect authentication successful!');
            
            // Clear redirect tracking
            localStorage.removeItem('auth_redirect_source');
            localStorage.removeItem('auth_redirect_attempt');
            
            // Process the result
            await processAuthResult(result);
          } else {
            console.log('🔍 No redirect result found');
            setIsLoading(false);
          }
        }
      } catch (error) {
        console.error('❌ Redirect result error:', error);
        setIsLoading(false);
      }
    };
    
    checkRedirectResult();
  }, []); // Empty dependency array to run only once

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    
    try {
      console.log('🔄 Starting Google authentication...');
      
      // Check domain and determine auth method
      const useRedirect = shouldUseRedirectAuth();
      console.log('🔍 Auth environment:', {
        domain: window.location.hostname,
        isReplitDomain: isReplitDomain(),
        useRedirect: useRedirect
      });
      
      // Import Firebase auth modules based on method
      const { GoogleAuthProvider } = await import('firebase/auth');
      const firebaseModule = await import('@/lib/firebase');
      const auth: any = firebaseModule.auth;
      
      if (!auth) {
        throw new Error('Firebase auth not initialized');
      }

      console.log('🔧 Firebase auth instance ready');

      // Create Google provider with proper configuration
      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');
      
      // Set custom parameters for consistent behavior
      provider.setCustomParameters({
        prompt: 'select_account',
        access_type: 'online'
      });

      let result;
      
      if (useRedirect) {
        console.log('🔄 Using redirect authentication for Replit domain');
        const { signInWithRedirect } = await import('firebase/auth');
        
        // Set a flag to track redirect attempt
        localStorage.setItem('auth_redirect_attempt', Date.now().toString());
        localStorage.setItem('auth_redirect_source', 'FastGoogleAuth');
        
        toast({
          title: "Redirecting to Google",
          description: "You will be redirected to complete sign-in...",
          variant: "default",
        });
        
        // Start redirect authentication
        await signInWithRedirect(auth, provider);
        // Note: This will redirect the page, so code after this won't execute
        return;
      } else {
        console.log('🔄 Using popup authentication');
        const { signInWithPopup } = await import('firebase/auth');
        
        // Sign in with popup
        result = await signInWithPopup(auth, provider);
        
        console.log('✅ Google popup completed successfully!');
        console.log('✅ Google auth result:', {
          email: result.user.email,
          name: result.user.displayName,
          uid: result.user.uid
        });
        
        // Process the authentication result
        await processAuthResult(result);
      }
      
    } catch (error: any) {
      console.error('❌ Google authentication error:', error);
      
      // Handle specific Firebase auth errors
      if (error.code === 'auth/popup-closed-by-user') {
        console.log('ℹ️ User closed popup');
        setIsLoading(false);
        return;
      }
      
      if (error.code === 'auth/cancelled-popup-request') {
        console.log('ℹ️ Popup cancelled');
        setIsLoading(false);
        return;
      }
      
      // Handle timeout errors
      if (error.name === 'AbortError') {
        console.error('❌ Backend request timed out');
        toast({
          title: 'Request Timeout',
          description: 'The authentication request took too long. Please try again.',
          variant: 'destructive'
        });
        setIsLoading(false);
        return;
      }
      
      // Handle other errors
      let errorMessage = 'Authentication failed. Please try again.';
      
      if (error.code === 'auth/popup-blocked') {
        errorMessage = 'Popup was blocked. Please allow popups and try again.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your connection.';
      } else if (error.code === 'auth/unauthorized-domain') {
        errorMessage = 'This domain is not authorized for Google sign-in.';
      } else if (error.message && !error.message.includes('cancelled')) {
        errorMessage = error.message;
      }
      
      console.error('❌ Showing error to user:', errorMessage);
      
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