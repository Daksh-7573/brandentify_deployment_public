import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

/**
 * Simplified Google Authentication Component
 */
export function FastGoogleAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    
    try {
      console.log('🔄 Starting Google authentication...');
      
      // Dynamic imports for Firebase
      const { signInWithPopup, GoogleAuthProvider } = await import('firebase/auth');
      const { auth } = await import('@/lib/firebase');
      
      if (!auth) {
        throw new Error('Firebase auth not initialized');
      }

      // Create Google provider
      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');
      provider.setCustomParameters({
        prompt: 'select_account',
        access_type: 'online'
      });

      console.log('🔄 Opening Google sign-in popup...');
      
      // Sign in with popup
      const result = await signInWithPopup(auth, provider);
      
      console.log('✅ Google auth successful:', result.user.email);
      
      // Prepare user data for backend
      const userData = {
        firebaseUid: result.user.uid,
        email: result.user.email || '',
        name: result.user.displayName || 'Google User',
        photoURL: result.user.photoURL || '',
        googleId: result.user.uid,
        authProvider: 'google' as const,
        emailVerified: result.user.emailVerified || false
      };

      console.log('📡 Sending user data to backend...');
      
      // Send to backend
      const response = await fetch('/api/auth/google-signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Backend error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      
      if (data.success && data.user) {
        console.log('✅ Authentication successful!');
        
        // Store user data
        sessionStorage.setItem('brandentifier_user', JSON.stringify(data.user));
        
        // Redirect to dashboard
        window.location.href = '/dashboard';
      } else {
        throw new Error(data.message || 'Authentication failed');
      }
      
    } catch (error: any) {
      console.error('❌ Google authentication error:', error);
      
      // Handle user cancellation quietly
      if (error.code === 'auth/popup-closed-by-user' || 
          error.code === 'auth/cancelled-popup-request') {
        setIsLoading(false);
        return;
      }
      
      // Show error for other cases
      let errorMessage = 'Authentication failed. Please try again.';
      
      if (error.code === 'auth/popup-blocked') {
        errorMessage = 'Popup was blocked. Please allow popups and try again.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your connection.';
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