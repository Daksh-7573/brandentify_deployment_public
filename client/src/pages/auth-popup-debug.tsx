import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { getAuth, onAuthStateChanged, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { initializeApp, FirebaseApp } from 'firebase/app';
import { AlertCircle, Check, Info, X } from 'lucide-react';
import { logOAuthFlowDetails, logDetailedAuthError } from '@/utils/auth-error-logger';
import { useAuth } from '@/hooks/use-auth';

/**
 * Authentication Popup Debug Page
 * 
 * This page provides an alternative authentication method using popup
 * instead of redirect. This can be useful when the redirect method is
 * not working due to Google refusing connections from certain domains.
 */
export default function AuthPopupDebugPage() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [userInfo, setUserInfo] = useState<any>(null);
  
  // Get the auth context
  const { user, isAuthenticated } = useAuth();
  
  // Initialize Firebase
  useEffect(() => {
    // If already authenticated, show the user info
    if (isAuthenticated && user) {
      setUserInfo(user);
      setSuccess(true);
    }
  }, [isAuthenticated, user]);
  
  // Handle sign in with popup
  const handleSignInWithPopup = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      // Get Firebase config
      const firebaseConfig = {
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
        authDomain: import.meta.env.VITE_FIREBASE_PROJECT_ID ? 
          `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com` : 
          window.location.hostname,
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
        storageBucket: import.meta.env.VITE_FIREBASE_PROJECT_ID ? 
          `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.appspot.com` : 
          undefined,
        messagingSenderId: "330211556822",
        appId: import.meta.env.VITE_FIREBASE_APP_ID,
      };
      
      // Initialize a separate Firebase app instance for popup auth
      const app = initializeApp(firebaseConfig, 'popup-auth-instance');
      const auth = getAuth(app);
      
      // Configure Google provider
      const googleProvider = new GoogleAuthProvider();
      googleProvider.setCustomParameters({
        prompt: 'select_account'
      });
      
      // Add scopes to ensure we get profile info
      googleProvider.addScope('email');
      googleProvider.addScope('profile');
      
      console.log("Attempting popup auth with Google...");
      
      // Attempt to sign in with popup
      const result = await signInWithPopup(auth, googleProvider);
      
      if (result && result.user) {
        console.log("Popup auth successful", result.user);
        setSuccess(true);
        setUserInfo({
          uid: result.user.uid,
          email: result.user.email,
          displayName: result.user.displayName,
          photoURL: result.user.photoURL
        });
        
        // Set localStorage to enable popup auth in the main flow
        localStorage.setItem('use_popup_auth', 'true');
        
        // Reload the page to reflect the change
        setTimeout(() => {
          window.location.href = '/';
        }, 3000);
      }
    } catch (error: any) {
      console.error("Error signing in with popup:", error);
      setError(error.message || "Failed to sign in with popup");
      logDetailedAuthError(error, 'popup-debug');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDisablePopupAuth = () => {
    localStorage.removeItem('use_popup_auth');
    alert('Popup authentication has been disabled. The app will now use redirect authentication again.');
    
    // Reload the page to reflect the change
    window.location.reload();
  };
  
  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Firebase Popup Authentication Debug</h1>
      
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Authentication Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {success && (
        <Alert className="mb-4 bg-green-50 dark:bg-green-900/20 border-green-500">
          <Check className="h-4 w-4 text-green-500" />
          <AlertTitle>Authentication Successful</AlertTitle>
          <AlertDescription>
            Popup authentication successful. Popup auth has been enabled for subsequent logins.
          </AlertDescription>
        </Alert>
      )}
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Popup Authentication</CardTitle>
          <CardDescription>
            Use this method when Google refuses connections from the current domain
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm mb-4">
            This page attempts authentication using popup instead of redirect.
            If successful, the app will use popup authentication for all future login attempts.
          </p>
          
          {userInfo && (
            <div className="mb-4 p-4 bg-gray-50 rounded-md">
              <p className="text-sm font-medium">User Details:</p>
              <pre className="text-xs mt-2 overflow-auto p-2 bg-gray-100 rounded">
                {JSON.stringify(userInfo, null, 2)}
              </pre>
            </div>
          )}
          
          <Alert className="mt-4">
            <Info className="h-4 w-4" />
            <AlertTitle>How Popup Authentication Works</AlertTitle>
            <AlertDescription>
              Instead of redirecting to Google's authentication page, this method opens a popup window.
              This can bypass issues with redirect authentication on problematic domains.
            </AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button 
            onClick={handleSignInWithPopup}
            disabled={isLoading || success}
            className="flex-1"
          >
            {isLoading ? "Authenticating..." : "Sign In with Google Popup"}
          </Button>
          
          {localStorage.getItem('use_popup_auth') === 'true' && (
            <Button 
              variant="outline"
              onClick={handleDisablePopupAuth}
              className="flex-1"
            >
              Disable Popup Authentication
            </Button>
          )}
        </CardFooter>
      </Card>
      
      <div className="text-center">
        <a href="/auth-debug" className="text-blue-500 hover:underline">
          Go to Authentication Debug Page
        </a>
      </div>
    </div>
  );
}