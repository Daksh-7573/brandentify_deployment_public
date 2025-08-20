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
    // Clear any existing auth state first
    sessionStorage.clear();
    console.log('🧹 Cleared all session storage before Google auth');
    
    setIsLoading(true);
    
    try {
      console.log('🔄 Starting Google authentication...');
      
      // Import Firebase auth with better error handling
      const { signInWithPopup, GoogleAuthProvider } = await import('firebase/auth');
      const { auth } = await import('@/lib/firebase');
      
      if (!auth) {
        throw new Error('Firebase auth not initialized');
      }
      
      console.log('🔧 Auth instance ready:', !!auth);

      // Create a fresh Google provider for this session
      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');
      
      // Force account picker and ensure fresh login
      provider.setCustomParameters({
        prompt: 'select_account',
        access_type: 'online'
      });

      console.log('🔄 Opening Google sign-in popup...');
      console.log('🔄 Provider configured with scopes:', provider.getCustomParameters());
      
      // Add comprehensive popup monitoring
      console.log('⏱️ Starting popup process with timeout monitoring...');
      
      const popupPromise = signInWithPopup(auth, provider);
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          console.error('⏰ Popup timed out after 25 seconds');
          reject(new Error('Authentication popup timed out. Please try again.'));
        }, 25000);
      });
      
      // Monitor popup state
      console.log('👀 Monitoring popup completion...');
      const result = await Promise.race([popupPromise, timeoutPromise]) as any;
      
      console.log('🎉 Popup completed successfully!');
      
      console.log('✅ Google auth successful:', result.user.email);
      console.log('✅ User object received:', {
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
        emailVerified: result.user.emailVerified,
        photoURL: result.user.photoURL
      });
      console.log('📋 Firebase user properties:', Object.keys(result.user));
      
      // Prepare user data with proper validation
      const userData = {
        firebaseUid: result.user.uid || '',
        email: result.user.email || '',
        name: result.user.displayName || 'Google User',
        photoURL: result.user.photoURL || '',
        googleId: result.user.uid || '',
        authProvider: 'google' as const,
        emailVerified: result.user.emailVerified || false
      };
      
      // Validate required fields before sending
      if (!userData.firebaseUid || !userData.email || !userData.googleId) {
        throw new Error('Missing required Google account information. Please try again.');
      }

      console.log('📡 Sending user data to backend...');
      console.log('User data being sent:', {
        email: userData.email,
        name: userData.name,
        firebaseUid: userData.firebaseUid
      });
      
      // Send to backend authentication endpoint with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      try {
        const response = await fetch('/api/auth/google-signin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userData),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        console.log('Backend response status:', response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Backend error response:', errorText);
          throw new Error(`Backend error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        console.log('Backend response data:', data);
        
        if (data.success && data.user) {
          console.log('✅ Authentication successful!');
          console.log('✅ User data from backend:', data.user);
          
          // Store user data and force page reload for clean state
          sessionStorage.setItem('brandentifier_user', JSON.stringify(data.user));
          console.log('✅ User data stored in session');
          console.log('✅ Stored user data:', {
            id: data.user.id,
            email: data.user.email,
            name: data.user.name
          });
          
          // Force a complete page reload to ensure clean auth state
          console.log('🔄 Forcing page reload to ensure clean authentication...');
          window.location.href = '/dashboard';
        } else {
          console.error('❌ Backend response invalid:', data);
          console.error('❌ Expected: {success: true, user: {...}}');
          console.error('❌ Received:', {
            success: data.success,
            hasUser: !!data.user,
            userKeys: data.user ? Object.keys(data.user) : 'no user',
            message: data.message
          });
          throw new Error(data.message || 'Authentication failed: Invalid response from server');
        }
      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        console.error('🚨 Backend request failed:', {
          name: fetchError.name,
          message: fetchError.message,
          isTimeout: fetchError.name === 'AbortError'
        });
        
        if (fetchError.name === 'AbortError') {
          throw new Error('Backend request timed out. Please check your connection and try again.');
        }
        throw fetchError;
      }
      
    } catch (error: any) {
      console.error('❌ Google authentication error:', error);
      console.error('❌ Full error details:', {
        code: error.code,
        message: error.message,
        name: error.name,
        stack: error.stack?.substring(0, 200) + '...' // Truncated stack
      });
      
      // Check for popup closure by user
      if (error.code === 'auth/popup-closed-by-user') {
        console.log('ℹ️ User manually closed the popup');
        setIsLoading(false);
        return;
      }
      
      if (error.code === 'auth/cancelled-popup-request') {
        console.log('ℹ️ Popup request was cancelled (another popup may be open)');
        setIsLoading(false);
        return;
      }
      
      let errorMessage = 'Authentication failed. Please try again.';
      
      if (error.code === 'auth/popup-blocked') {
        errorMessage = 'Popup was blocked. Please allow popups for this site and try again.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your internet connection.';
      } else if (error.code === 'auth/unauthorized-domain') {
        errorMessage = 'This domain is not authorized for Google sign-in. Please contact support.';
      } else if (error.code === 'auth/operation-not-allowed') {
        errorMessage = 'Google sign-in is not enabled. Please contact support.';
      } else if (error.message?.includes('timeout')) {
        errorMessage = 'Authentication timed out. Please try again.';
      } else if (error.message && !error.message.includes('cancelled')) {
        errorMessage = error.message;
      }
      
      console.log('🚨 Showing error to user:', errorMessage);
      
      toast({
        title: 'Authentication Error',
        description: errorMessage,
        variant: 'destructive'
      });
      
      console.log('❌ Setting isLoading to false due to error');
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