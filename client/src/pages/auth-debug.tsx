import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { getAuth, onAuthStateChanged, signInWithRedirect, GoogleAuthProvider } from 'firebase/auth';
import { initializeApp, FirebaseApp } from 'firebase/app';
import { AlertCircle, Check, Info, X } from 'lucide-react';
import { logOAuthFlowDetails, logDetailedAuthError } from '@/utils/auth-error-logger';
import { useAuth } from '@/hooks/use-auth';

// Define types for our state
interface FirebaseState {
  appInitialized: boolean;
  authInitialized: boolean;
  providerConfigured: boolean;
  signInAttempted: boolean;
  signInSuccessful: boolean | null;
  error: string | null;
  user: any | null;
  redirectUrl: string | null;
}

/**
 * Authentication Debug Page
 * 
 * This page provides comprehensive debugging for Firebase authentication issues.
 * It displays detailed information about the current authentication state,
 * configuration, and provides tools to diagnose authentication problems.
 */
export default function AuthDebugPage() {
  // State for Firebase components
  const [state, setState] = useState<FirebaseState>({
    appInitialized: false,
    authInitialized: false,
    providerConfigured: false,
    signInAttempted: false,
    signInSuccessful: null,
    error: null,
    user: null,
    redirectUrl: null
  });

  // State for environment variables
  const [envVars, setEnvVars] = useState({
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY?.substring(0, 5) + '...',
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID?.substring(0, 5) + '...',
  });

  // State for domain information
  const [domainInfo, setDomainInfo] = useState({
    hostname: window.location.hostname,
    origin: window.location.origin,
    href: window.location.href,
    isDevelopment: false,
    isProblemDomain: false
  });

  // Initialize Firebase debug info on mount
  useEffect(() => {
    // Log OAuth flow details
    logOAuthFlowDetails();
    
    // Update domain info
    const hostname = window.location.hostname;
    const isDevelopment = hostname === 'localhost' || hostname.includes('replit');
    const isProblemDomain = hostname === '25d68c5d-166d-4f92-b5c1-cdfc68146e33-00-2kol6l2kz9i0s.picard.replit.dev';
    
    setDomainInfo({
      hostname,
      origin: window.location.origin,
      href: window.location.href,
      isDevelopment,
      isProblemDomain
    });
    
    // Try to initialize Firebase manually for testing
    try {
      // Get Firebase config from environment variables
      const firebaseConfig = {
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
        authDomain: import.meta.env.VITE_FIREBASE_PROJECT_ID ? 
          `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com` : 
          hostname,
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
        storageBucket: import.meta.env.VITE_FIREBASE_PROJECT_ID ? 
          `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.appspot.com` : 
          undefined,
        messagingSenderId: "330211556822",
        appId: import.meta.env.VITE_FIREBASE_APP_ID,
      };
      
      // Initialize Firebase app
      const app = initializeApp(firebaseConfig, 'debug-instance');
      setState(prev => ({ ...prev, appInitialized: true }));
      
      // Initialize Firebase Auth
      const auth = getAuth(app);
      setState(prev => ({ ...prev, authInitialized: true }));
      
      // Set up auth state change listener
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        console.log("Auth state changed:", user ? "User signed in" : "User signed out");
        setState(prev => ({ ...prev, user }));
      });
      
      // Configure Google Auth Provider
      const googleProvider = new GoogleAuthProvider();
      
      // Set custom parameters based on domain
      if (isProblemDomain) {
        const redirectUrl = `${window.location.origin}/auth-callback`;
        googleProvider.setCustomParameters({
          prompt: 'select_account',
          redirect_uri: redirectUrl
        });
        setState(prev => ({ ...prev, redirectUrl }));
      } else {
        googleProvider.setCustomParameters({
          prompt: 'select_account'
        });
      }
      
      setState(prev => ({ ...prev, providerConfigured: true }));
      
      // Return cleanup function
      return () => unsubscribe();
    } catch (error: any) {
      console.error("Error during debug initialization:", error);
      setState(prev => ({ 
        ...prev, 
        error: `Initialization error: ${error.message}` 
      }));
      logDetailedAuthError(error, 'auth-debug-initialization');
    }
  }, []);

  // Get the authentication context
  const auth = useAuth();
  
  // Handle sign in with Google
  const handleSignInWithGoogle = async () => {
    try {
      setState(prev => ({ ...prev, signInAttempted: true, error: null }));
      
      // Store debug information
      localStorage.setItem('auth_debug_attempt_time', new Date().toISOString());
      localStorage.setItem('auth_debug_source', 'auth-debug-page');
      
      console.log("Initiating debug sign-in with Google redirect...");
      
      // Use the main authentication method from auth context
      await auth.signInWithGoogle();
      
      setState(prev => ({ ...prev, signInSuccessful: true }));
    } catch (error: any) {
      console.error("Error during debug sign in:", error);
      setState(prev => ({ 
        ...prev, 
        signInSuccessful: false,
        error: `Sign-in error: ${error.message}` 
      }));
      logDetailedAuthError(error, 'auth-debug-signin');
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Firebase Authentication Debug</h1>
      
      {/* Show any errors */}
      {state.error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Authentication Error</AlertTitle>
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}
      
      {/* Domain Information */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Domain Information</CardTitle>
          <CardDescription>Current domain and environment details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium">Hostname:</p>
              <p className="text-sm">{domainInfo.hostname}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Origin:</p>
              <p className="text-sm">{domainInfo.origin}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Full URL:</p>
              <p className="text-sm break-all">{domainInfo.href}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Environment:</p>
              <p className="text-sm">{domainInfo.isDevelopment ? 'Development' : 'Production'}</p>
            </div>
          </div>
          
          {domainInfo.isProblemDomain && (
            <Alert className="mt-4">
              <Info className="h-4 w-4" />
              <AlertTitle>Problematic Domain Detected</AlertTitle>
              <AlertDescription>
                This is the known problematic domain that requires special configuration.
                The sign-in button below uses special configuration for this domain.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
      
      {/* Firebase Configuration */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Firebase Configuration</CardTitle>
          <CardDescription>Environment variables and setup status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium">API Key:</p>
              <p className="text-sm">{envVars.apiKey ? envVars.apiKey : 'Missing'}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Project ID:</p>
              <p className="text-sm">{envVars.projectId || 'Missing'}</p>
            </div>
            <div>
              <p className="text-sm font-medium">App ID:</p>
              <p className="text-sm">{envVars.appId ? envVars.appId : 'Missing'}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Auth Domain:</p>
              <p className="text-sm">
                {envVars.projectId ? `${envVars.projectId}.firebaseapp.com` : domainInfo.hostname}
              </p>
            </div>
          </div>
          
          <div className="mt-4 space-y-2">
            <div className="flex items-center">
              {state.appInitialized ? 
                <Check className="h-4 w-4 text-green-500 mr-2" /> : 
                <X className="h-4 w-4 text-red-500 mr-2" />}
              <p className="text-sm">Firebase App Initialized</p>
            </div>
            <div className="flex items-center">
              {state.authInitialized ? 
                <Check className="h-4 w-4 text-green-500 mr-2" /> : 
                <X className="h-4 w-4 text-red-500 mr-2" />}
              <p className="text-sm">Firebase Auth Initialized</p>
            </div>
            <div className="flex items-center">
              {state.providerConfigured ? 
                <Check className="h-4 w-4 text-green-500 mr-2" /> : 
                <X className="h-4 w-4 text-red-500 mr-2" />}
              <p className="text-sm">Google Provider Configured</p>
            </div>
          </div>
          
          {domainInfo.isProblemDomain && state.redirectUrl && (
            <Alert className="mt-4">
              <Info className="h-4 w-4" />
              <AlertTitle>Custom Redirect URL</AlertTitle>
              <AlertDescription>
                Using custom redirect URL for problematic domain: <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">{state.redirectUrl}</code>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
      
      {/* Authentication Status */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Authentication Status</CardTitle>
          <CardDescription>Current user and sign-in state</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <p className="text-sm font-medium">User Signed In:</p>
            <p className="text-sm">{state.user ? 'Yes' : 'No'}</p>
            
            {state.user && (
              <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
                <p className="text-sm font-medium">User Details:</p>
                <pre className="text-xs mt-2 overflow-auto p-2 bg-gray-100 dark:bg-gray-900 rounded">
                  {JSON.stringify({
                    uid: state.user.uid,
                    email: state.user.email,
                    displayName: state.user.displayName,
                    photoURL: state.user.photoURL,
                    emailVerified: state.user.emailVerified
                  }, null, 2)}
                </pre>
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center">
              {state.signInAttempted ? 
                <Check className="h-4 w-4 text-green-500 mr-2" /> : 
                <Info className="h-4 w-4 text-blue-500 mr-2" />}
              <p className="text-sm">Sign-in Attempted</p>
            </div>
            {state.signInAttempted && (
              <div className="flex items-center">
                {state.signInSuccessful === true ? 
                  <Check className="h-4 w-4 text-green-500 mr-2" /> : 
                  state.signInSuccessful === false ?
                    <X className="h-4 w-4 text-red-500 mr-2" /> :
                    <Info className="h-4 w-4 text-blue-500 mr-2" />}
                <p className="text-sm">Sign-in Successful</p>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={handleSignInWithGoogle}
            disabled={state.signInAttempted && state.signInSuccessful === null}
          >
            {state.signInAttempted && state.signInSuccessful === null
              ? "Sign-in in progress..."
              : "Test Sign In with Google"}
          </Button>
        </CardFooter>
      </Card>
      
      {/* Debugging Tools */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Debugging Instructions</CardTitle>
          <CardDescription>Steps to fix common Firebase authentication issues</CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2">
            <li className="text-sm">Make sure all domains are added in Firebase Console &gt; Authentication &gt; Settings &gt; Authorized Domains</li>
            <li className="text-sm">Verify that the Firebase environment variables are set correctly</li>
            <li className="text-sm">Check the browser console for detailed error messages</li>
            <li className="text-sm">Try clearing browser cache and cookies</li>
            <li className="text-sm">If on a problematic domain, try using a different domain or localhost</li>
          </ol>
          
          <Alert className="mt-4">
            <Info className="h-4 w-4" />
            <AlertTitle>Console Log Instructions</AlertTitle>
            <AlertDescription>
              Open your browser console (F12 or Command+Option+I) to see detailed debugging information about the authentication process.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}