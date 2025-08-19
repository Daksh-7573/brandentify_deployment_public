import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';

/**
 * Handles Google authentication redirect results
 * This component checks for Firebase auth redirect results on page load
 */
export function AuthRedirectHandler() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  useEffect(() => {
    const handleAuthRedirect = async () => {
      // Check if we're expecting an auth redirect
      const authInProgress = sessionStorage.getItem('auth_in_progress');
      const authProvider = sessionStorage.getItem('auth_provider');
      
      if (!authInProgress || authProvider !== 'google') {
        return;
      }

      console.log('Checking for Google auth redirect result...');

      try {
        // Dynamic Firebase imports
        const [
          { initializeApp },
          { getAuth, getRedirectResult, GoogleAuthProvider }
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

        // Initialize Firebase
        const app = initializeApp(firebaseConfig, 'brandentifier-auth-redirect');
        const auth = getAuth(app);

        // Get redirect result
        const result = await getRedirectResult(auth);

        if (result) {
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

          // Call backend to create/get user
          const response = await fetch('/api/auth/google-signin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
          });

          const data = await response.json();
          
          if (data.success) {
            console.log('User created/logged in successfully');
            
            // Trigger auth success event
            const authEvent = new CustomEvent('googleAuthSuccess', { 
              detail: { user: data.user }
            });
            window.dispatchEvent(authEvent);
            
            // Clean up session storage
            sessionStorage.removeItem('auth_in_progress');
            sessionStorage.removeItem('auth_provider');
            
            // Navigate to intended page
            const returnUrl = sessionStorage.getItem('auth_return_url') || '/industry-pulse';
            const prePath = sessionStorage.getItem('pre_auth_path');
            sessionStorage.removeItem('auth_return_url');
            sessionStorage.removeItem('pre_auth_path');
            
            toast({
              title: 'Welcome!',
              description: `Successfully signed in as ${userData.email}`,
            });
            
            // Navigate to the intended destination
            setTimeout(() => {
              setLocation(returnUrl);
            }, 1000);
            
          } else {
            throw new Error(data.message || 'Authentication failed');
          }
          
        } else {
          console.log('No redirect result found - user may have cancelled auth');
          // Clean up session storage
          sessionStorage.removeItem('auth_in_progress');
          sessionStorage.removeItem('auth_provider');
        }
        
      } catch (error: any) {
        console.error('Auth redirect error:', error);
        
        // Clean up session storage
        sessionStorage.removeItem('auth_in_progress');
        sessionStorage.removeItem('auth_provider');
        
        let errorMessage = 'Authentication failed. Please try again.';
        
        if (error.code === 'auth/unauthorized-domain') {
          errorMessage = 'Domain not authorized. Please add this domain to Firebase Auth > Settings > Authorized domains: ' + window.location.hostname;
        } else if (error.message.includes('Firebase configuration')) {
          errorMessage = 'Firebase is not properly configured. Please contact support.';
        }
        
        toast({
          title: 'Authentication Error',
          description: errorMessage,
          variant: 'destructive'
        });
      }
    };

    // Run on component mount
    handleAuthRedirect();
  }, [toast, setLocation]);

  return null; // This component doesn't render anything
}