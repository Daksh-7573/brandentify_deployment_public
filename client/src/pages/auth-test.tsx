import { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, AlertTriangle, Check, Info } from 'lucide-react';
import { checkDomainAuthorization, getFirebaseSetupInstructions } from '@/lib/firebase-domain-helper';

/**
 * A standalone test page for Firebase Google authentication
 * This is completely isolated from the rest of the app to debug authentication issues
 */
export default function FirebaseAuthTest() {
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [authInitialized, setAuthInitialized] = useState(false);
  const [configDetails, setConfigDetails] = useState<any>({ checked: false });
  
  // Initialize Firebase in isolation within this component
  useEffect(() => {
    try {
      // Check if Firebase config exists
      const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
      const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
      const appId = import.meta.env.VITE_FIREBASE_APP_ID;
      
      setConfigDetails({
        checked: true,
        apiKey: !!apiKey,
        apiKeyLength: apiKey?.length || 0,
        projectId: !!projectId,
        projectIdValue: projectId,
        appId: !!appId,
        appIdLength: appId?.length || 0,
        timestamp: new Date().toISOString()
      });
      
      if (!apiKey || !projectId || !appId) {
        setError('Missing Firebase configuration. Check your environment variables.');
        return;
      }
      
      // Create Firebase config
      const firebaseConfig = {
        apiKey,
        authDomain: `${projectId}.firebaseapp.com`,
        projectId,
        storageBucket: `${projectId}.appspot.com`,
        messagingSenderId: "330211556822", // Default value
        appId,
      };
      
      // Initialize Firebase
      const app = initializeApp(firebaseConfig);
      const auth = getAuth(app);
      
      // Set up auth state listener
      const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        if (firebaseUser) {
          console.log('[Auth Test] User signed in:', firebaseUser);
          setUser(firebaseUser);
        } else {
          console.log('[Auth Test] User signed out');
          setUser(null);
        }
        setAuthInitialized(true);
      });
      
      return () => unsubscribe();
    } catch (error) {
      console.error('[Auth Test] Error initializing Firebase:', error);
      setError('Failed to initialize Firebase: ' + (error as any).message);
      setAuthInitialized(true);
    }
  }, []);
  
  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Re-check Firebase config directly
      const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
      const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
      const appId = import.meta.env.VITE_FIREBASE_APP_ID;
      
      if (!apiKey || !projectId || !appId) {
        setError('Missing Firebase configuration. Check environment variables.');
        return;
      }
      
      // Create Firebase config
      const firebaseConfig = {
        apiKey,
        authDomain: `${projectId}.firebaseapp.com`,
        projectId,
        storageBucket: `${projectId}.appspot.com`,
        messagingSenderId: "330211556822", // Default value
        appId,
      };
      
      // Initialize Firebase (even if already done)
      const app = initializeApp(firebaseConfig, 'auth-test-instance');
      const auth = getAuth(app);
      
      // Create Google provider
      const googleProvider = new GoogleAuthProvider();
      googleProvider.setCustomParameters({
        prompt: 'select_account'
      });
      
      // Run popup authentication
      console.log('[Auth Test] Starting Google sign-in popup');
      const result = await signInWithPopup(auth, googleProvider);
      
      // Success!
      console.log('[Auth Test] Sign-in successful:', result.user);
      setUser(result.user);
    } catch (error: any) {
      console.error('[Auth Test] Sign-in error:', error);
      
      // Format error message
      let errorMessage = 'Authentication failed';
      
      if (error.code === 'auth/unauthorized-domain') {
        errorMessage = 'This domain is not authorized in your Firebase project. Add it to the authorized domains list in the Firebase console.';
      } else if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Sign-in popup was closed before completing authentication.';
      } else if (error.code === 'auth/popup-blocked') {
        errorMessage = 'Sign-in popup was blocked by your browser. Please allow popups for this site.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your internet connection.';
      } else {
        errorMessage = `Authentication error: ${error.message || error.code || 'Unknown error'}`;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSignOut = async () => {
    try {
      setLoading(true);
      const auth = getAuth();
      await auth.signOut();
      setUser(null);
    } catch (error) {
      console.error('[Auth Test] Sign-out error:', error);
      setError('Error signing out: ' + (error as any).message);
    } finally {
      setLoading(false);
    }
  };
  
  // Get domain authorization details for clearer guidance
  const domainAuth = checkDomainAuthorization();
  const setupInstructions = getFirebaseSetupInstructions();
  
  return (
    <div className="container max-w-2xl py-8">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Firebase Authentication Test</CardTitle>
          <CardDescription>
            This page tests Google authentication directly, isolated from the main app.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Configuration Status */}
          {configDetails.checked && (
            <div className="p-4 bg-gray-50 rounded-md border text-sm space-y-2">
              <h3 className="font-semibold">Firebase Configuration Status:</h3>
              <div className="grid grid-cols-2 gap-2">
                <div>API Key:</div>
                <div className={configDetails.apiKey ? "text-green-600" : "text-red-600"}>
                  {configDetails.apiKey ? "Present" : "Missing"} 
                  {configDetails.apiKeyLength > 0 && ` (${configDetails.apiKeyLength} chars)`}
                </div>
                
                <div>Project ID:</div>
                <div className={configDetails.projectId ? "text-green-600" : "text-red-600"}>
                  {configDetails.projectId ? configDetails.projectIdValue : "Missing"}
                </div>
                
                <div>App ID:</div>
                <div className={configDetails.appId ? "text-green-600" : "text-red-600"}>
                  {configDetails.appId ? "Present" : "Missing"}
                  {configDetails.appIdLength > 0 && ` (${configDetails.appIdLength} chars)`}
                </div>
                
                <div>Auth Domain:</div>
                <div>{configDetails.projectId ? `${configDetails.projectIdValue}.firebaseapp.com` : "N/A"}</div>
                
                <div>Current Domain:</div>
                <div>{window.location.hostname}</div>
                
                <div>Domain Valid:</div>
                <div className={domainAuth.isValid ? "text-green-600" : "text-red-600"}>
                  {domainAuth.isValid ? "Yes" : "No - Needs Authorization"} 
                </div>
              </div>
            </div>
          )}
          
          {/* Domain Authorization Instructions */}
          {!domainAuth.isValid && (
            <Alert variant="warning" className="bg-amber-50 border-amber-200">
              <Info className="h-4 w-4 text-amber-600" />
              <AlertTitle className="text-amber-800">Domain Authorization Required</AlertTitle>
              <AlertDescription className="text-amber-700 mt-2">
                <p className="mb-2">Your current domain <strong>"{domainAuth.currentDomain}"</strong> needs to be added to the authorized domains list in your Firebase project.</p>
                <div className="mt-4 space-y-1 text-sm">
                  <p className="font-semibold">Follow these steps to fix it:</p>
                  {setupInstructions.map((instruction, idx) => (
                    <div key={idx} className="ml-1">
                      {instruction}
                    </div>
                  ))}
                </div>
              </AlertDescription>
            </Alert>
          )}
          
          {/* Loading State */}
          {!authInitialized && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              <span className="ml-2 text-gray-500">Initializing Firebase...</span>
            </div>
          )}
          
          {/* Error Message */}
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Authentication Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {/* User Info */}
          {user && (
            <div className="bg-green-50 p-4 rounded-md border border-green-200">
              <div className="flex items-start space-x-2">
                <Check className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-green-800">Successfully Authenticated</h3>
                  <div className="mt-2 text-sm grid grid-cols-3 gap-2">
                    <div className="font-medium">Name:</div>
                    <div className="col-span-2">{user.displayName || "N/A"}</div>
                    
                    <div className="font-medium">Email:</div>
                    <div className="col-span-2">{user.email || "N/A"}</div>
                    
                    <div className="font-medium">User ID:</div>
                    <div className="col-span-2">{user.uid}</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-center">
          {!user ? (
            <Button 
              onClick={handleGoogleSignIn} 
              disabled={loading || !authInitialized || !configDetails.apiKey}
            >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Sign in with Google (Test)
            </Button>
          ) : (
            <Button 
              onClick={handleSignOut} 
              variant="outline" 
              disabled={loading}
            >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Sign Out
            </Button>
          )}
        </CardFooter>
      </Card>
      
      <div className="mt-6 text-center">
        <a 
          href="/"
          className="text-sm text-blue-600 hover:underline"
        >
          Return to Main App
        </a>
      </div>
    </div>
  );
}