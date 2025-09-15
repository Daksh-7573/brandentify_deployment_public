import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

/**
 * Unified Google Authentication Button
 * Uses shared Firebase instance with domain-aware auth strategy
 */
export function GoogleAuthButton() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    console.log('🚀 Starting Google authentication...');

    try {
      // Use shared Firebase instances from firebase.ts for consistency
      const firebaseModule = await import('@/lib/firebase');
      const { auth, googleProvider }: { auth: any; googleProvider: any } = firebaseModule;
      
      if (!auth || !googleProvider) {
        throw new Error('Firebase authentication is not initialized. Please check your configuration.');
      }
      
      // Type assertion for TypeScript
      const firebaseAuth = auth as any;
      const firebaseProvider = googleProvider as any;
      
      // Check current domain to determine auth strategy
      const currentDomain = window.location.hostname;
      const isReplitPreview = currentDomain.includes('replit.dev') || 
                             currentDomain === 'localhost' || 
                             currentDomain === '127.0.0.1';
      const isPublishedDomain = currentDomain.includes('replit.app') || 
                               currentDomain === 'brandentifier.com' || 
                               currentDomain === 'www.brandentifier.com';
      
      console.log('🔥 Auth strategy determination:', {
        currentDomain,
        isReplitPreview,
        isPublishedDomain,
        strategy: isReplitPreview ? 'popup' : 'redirect'
      });

      // Store return URL for after authentication
      sessionStorage.setItem('auth_return_url', '/industry-pulse');
      sessionStorage.setItem('auth_timestamp', new Date().toISOString());
      sessionStorage.setItem('auth_attempt_domain', currentDomain);

      let result;
      
      if (isReplitPreview) {
        // Use popup for preview domains (works better in development)
        toast({
          title: 'Opening Google Sign-In',
          description: 'A popup window will open for authentication...',
        });
        
        const { signInWithPopup } = await import('firebase/auth');
        console.log('🚀 Using popup authentication for preview domain');
        result = await signInWithPopup(firebaseAuth, firebaseProvider);
      } else {
        // Use redirect for published domains (more reliable for production)
        toast({
          title: 'Redirecting to Google',
          description: 'You will be redirected to complete authentication...',
        });
        
        const { signInWithRedirect } = await import('firebase/auth');
        console.log('🚀 Using redirect authentication for published domain');
        await signInWithRedirect(firebaseAuth, firebaseProvider);
        return; // Exit here - redirect will handle the rest
      }
      
      console.log('✅ Google authentication successful:', result.user.email);
      console.log('🔥 Authentication completed via popup flow');
      
      // Firebase auth state will automatically trigger onAuthStateChanged in auth context
      // Auth context will handle user creation/update via its existing flow
      console.log('🎉 Authentication successful - Firebase auth state will handle user creation');
      
      toast({
        title: 'Authentication Successful!',
        description: 'Completing your sign-in...',
        variant: 'default'
      });
      
      // Let auth context handle the rest via onAuthStateChanged
      // No manual navigation needed - auth context will redirect appropriately
      setIsLoading(false);
      
    } catch (error: any) {
      console.error('Google authentication error:', error);
      
      let errorMessage = 'Authentication failed. Please try again.';
      
      if (error.code === 'auth/unauthorized-domain') {
        errorMessage = 'This domain is not authorized for Google authentication. Please contact support.';
      } else if (error.message.includes('Firebase configuration')) {
        errorMessage = 'Firebase is not properly configured. Please contact support.';
      } else if (error.code === 'auth/popup-blocked') {
        errorMessage = 'Popup was blocked. Please allow popups and try again.';
      } else if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Authentication cancelled. Please try again.';
      } else if (error.code === 'auth/cancelled-popup-request') {
        errorMessage = 'Another sign-in popup is already open. Please try again.';
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