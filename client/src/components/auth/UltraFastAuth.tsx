import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

/**
 * Ultra-Fast Authentication Component
 * Optimized for maximum speed with minimal overhead
 */
export function UltraFastAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    
    try {
      console.log('⚡ Ultra-fast auth starting...');
      
      // Single dynamic import to reduce overhead
      const { initializeApp } = await import('firebase/app');
      const { getAuth, signInWithPopup, GoogleAuthProvider } = await import('firebase/auth');

      // Minimal Firebase config - only required fields
      const app = initializeApp({
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
        authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
        appId: import.meta.env.VITE_FIREBASE_APP_ID
      });

      const auth = getAuth(app);
      const provider = new GoogleAuthProvider();
      
      // Essential scopes only
      provider.addScope('email');
      provider.addScope('profile');
      provider.setCustomParameters({
        prompt: 'select_account',
        access_type: 'online'
      });

      console.log('🔄 Opening popup...');
      const result = await signInWithPopup(auth, provider);
      
      console.log('✅ Google success');
      
      // Streamlined user data
      const userData = {
        firebaseUid: result.user.uid,
        email: result.user.email!,
        name: result.user.displayName || 'User',
        photoURL: result.user.photoURL || '',
        googleId: result.user.uid,
        authProvider: 'google',
        emailVerified: result.user.emailVerified
      };

      console.log('⚡ Backend call...');
      
      // Single backend request
      const response = await fetch('/api/auth/google-signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });

      const data = await response.json();
      
      if (data.success) {
        console.log('✅ Success, redirecting...');
        
        // Store and redirect immediately
        sessionStorage.setItem('brandentifier_user', JSON.stringify(data.user));
        
        // No toast delay - direct redirect
        window.location.href = '/industry-pulse';
      } else {
        throw new Error(data.message || 'Auth failed');
      }
      
    } catch (error: any) {
      console.error('❌ Auth error:', error);
      
      toast({
        title: 'Authentication Error',
        description: 'Please try again',
        variant: 'destructive'
      });
      
      setIsLoading(false);
    }
  };

  const handleQuickAuth = async () => {
    setIsLoading(true);
    
    try {
      console.log('⚡ Quick test auth...');
      
      const userData = {
        firebaseUid: 'test-' + Date.now(),
        email: 'test@brandentifier.com',
        name: 'Test User',
        photoURL: '',
        googleId: 'test-' + Date.now(),
        authProvider: 'google',
        emailVerified: true
      };
      
      const response = await fetch('/api/auth/google-signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        sessionStorage.setItem('brandentifier_user', JSON.stringify(data.user));
        window.location.href = '/industry-pulse';
      } else {
        throw new Error(data.message);
      }
      
    } catch (error: any) {
      console.error('❌ Quick auth error:', error);
      toast({
        title: 'Authentication Failed',
        description: error.message,
        variant: 'destructive'
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Google Auth Button */}
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

      {/* Quick Test Button */}
      <Button 
        onClick={handleQuickAuth}
        disabled={isLoading}
        className="w-full bg-green-600 hover:bg-green-700 text-white"
        variant="outline"
      >
        {isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          'Quick Test Login'
        )}
      </Button>
    </div>
  );
}