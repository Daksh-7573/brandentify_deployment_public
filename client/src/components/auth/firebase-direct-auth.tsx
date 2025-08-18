import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

/**
 * Direct Firebase Authentication
 * Most basic implementation to test Firebase auth without any dependencies
 */
export function FirebaseDirectAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleDirectAuth = async () => {
    setIsLoading(true);
    console.log('='.repeat(50));
    console.log('STARTING DIRECT FIREBASE AUTHENTICATION');
    console.log('='.repeat(50));

    try {
      // Step 1: Load Firebase dynamically
      console.log('Step 1: Loading Firebase modules...');
      const firebaseApp = await import('firebase/app');
      const firebaseAuth = await import('firebase/auth');
      
      console.log('✅ Firebase modules loaded');

      // Step 2: Configuration
      const config = {
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
        authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
        storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.appspot.com`,
        appId: import.meta.env.VITE_FIREBASE_APP_ID
      };

      console.log('Step 2: Configuration check...');
      console.log('- API Key present:', !!config.apiKey);
      console.log('- Project ID:', config.projectId);
      console.log('- Auth Domain:', config.authDomain);

      if (!config.apiKey || !config.projectId || !config.appId) {
        throw new Error('Missing Firebase configuration');
      }

      console.log('✅ Configuration valid');

      // Step 3: Initialize Firebase
      console.log('Step 3: Initializing Firebase...');
      
      let app;
      try {
        // Try to initialize new app
        app = firebaseApp.initializeApp(config, `auth-${Date.now()}`);
        console.log('✅ New Firebase app initialized');
      } catch (error: any) {
        if (error.code === 'app/duplicate-app') {
          console.log('Using existing Firebase app');
          const existingApps = firebaseApp.getApps();
          app = existingApps[0];
        } else {
          throw error;
        }
      }

      // Step 4: Initialize Auth
      console.log('Step 4: Initializing Auth...');
      const auth = firebaseAuth.getAuth(app);
      
      if (!auth) {
        throw new Error('Failed to get auth instance');
      }
      
      console.log('✅ Auth instance created');
      
      // Step 5: Create Provider
      console.log('Step 5: Creating Google provider...');
      const provider = new firebaseAuth.GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      
      console.log('✅ Google provider configured');

      // Step 6: Authentication
      console.log('Step 6: Starting authentication...');
      console.log('Opening Google sign-in popup...');
      
      const result = await firebaseAuth.signInWithPopup(auth, provider);

      if (!result || !result.user) {
        throw new Error('No user returned from authentication');
      }

      console.log('🎉 AUTHENTICATION SUCCESSFUL!');
      console.log('- User ID:', result.user.uid);
      console.log('- Email:', result.user.email);
      console.log('- Name:', result.user.displayName);

      // Step 7: Store user data
      const userData = {
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
        photoURL: result.user.photoURL,
        authenticated: true,
        timestamp: new Date().toISOString()
      };

      // Store in multiple places for reliability
      sessionStorage.setItem('firebase_user', JSON.stringify(userData));
      sessionStorage.setItem('user_authenticated', 'true');
      localStorage.setItem('last_auth_success', new Date().toISOString());

      console.log('✅ User data stored');

      // Success feedback
      toast({
        title: 'Login Successful!',
        description: `Welcome, ${result.user.displayName || result.user.email}!`,
      });

      // Step 8: Redirect to Industry Pulse
      console.log('Step 8: Redirecting to Industry Pulse...');
      
      setTimeout(() => {
        window.location.href = '/industry-pulse';
      }, 1500);

    } catch (error: any) {
      console.error('❌ AUTHENTICATION FAILED');
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      console.error('Full error:', error);

      let userMessage = 'Authentication failed. Please try again.';

      switch (error.code) {
        case 'auth/popup-blocked':
          userMessage = 'Popup blocked. Please allow popups and try again.';
          break;
        case 'auth/popup-closed-by-user':
          userMessage = 'Sign-in popup was closed. Please try again.';
          break;
        case 'auth/unauthorized-domain':
          userMessage = 'This domain is not authorized for Google sign-in.';
          break;
        case 'auth/network-request-failed':
          userMessage = 'Network error. Please check your connection.';
          break;
        default:
          if (error.message.includes('Firebase configuration')) {
            userMessage = 'Authentication setup error. Please contact support.';
          }
      }

      toast({
        title: 'Authentication Error',
        description: userMessage,
        variant: 'destructive',
      });

    } finally {
      setIsLoading(false);
      console.log('='.repeat(50));
      console.log('AUTHENTICATION PROCESS COMPLETED');
      console.log('='.repeat(50));
    }
  };

  return (
    <div className="space-y-4">
      <Button
        onClick={handleDirectAuth}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-3 bg-red-600 hover:bg-red-700 text-white"
        size="lg"
      >
        {/* Google Icon SVG */}
        <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
          <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
          <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
          <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
          <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
        </svg>
        
        {isLoading ? 'Signing in...' : 'Direct Google Sign-In (Testing)'}
      </Button>
      
      <div className="text-xs text-gray-400 text-center">
        <p>Direct Firebase authentication with detailed logging</p>
        <p>Check browser console for step-by-step authentication process</p>
      </div>
    </div>
  );
}