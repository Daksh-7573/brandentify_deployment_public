import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithRedirect, 
  GoogleAuthProvider, 
  getRedirectResult,
  signOut
} from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { Loader2, Info, Check, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

/**
 * Replit Redirect Auth
 * 
 * A specialized Google authentication component for Replit domains
 * that ONLY uses the redirect method (no popups) and has simplified UI
 * to minimize potential errors
 */
const ReplitRedirectAuth: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [redirectState, setRedirectState] = useState<'pending' | 'processing' | 'success' | 'error'>('pending');
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const [_, navigate] = useLocation();
  
  // Get hostname for configuration
  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
  
  // Initialize Firebase with minimal config
  const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  };
  
  const app = initializeApp(firebaseConfig, 'replit-redirect-auth');
  const auth = getAuth(app);
  
  // Check for redirect result on mount
  useEffect(() => {
    console.log("Replit Redirect Auth initialized");
    console.log("Current hostname:", hostname);
    
    // Check for redirect results immediately
    checkForRedirectResult();
    
    // Set up auth state listener
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        console.log("User already authenticated:", user.displayName || user.email);
        setUser(user);
      }
    });
    
    return () => unsubscribe();
  }, []);
  
  const checkForRedirectResult = async () => {
    try {
      console.log("Checking for redirect result...");
      setRedirectState('processing');
      
      const result = await getRedirectResult(auth);
      
      if (result) {
        // User just got redirected back from Google
        const user = result.user;
        setUser(user);
        setRedirectState('success');
        
        console.log("Successfully authenticated after redirect", user);
        
        toast({
          title: "Authentication Successful",
          description: `Logged in as ${user.displayName || user.email}`,
        });
        
        // Redirect to dashboard after success
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      } else {
        // No redirect result, back to pending
        setRedirectState('pending');
      }
    } catch (error: any) {
      console.error("Redirect result error:", error);
      setRedirectState('error');
      
      let errorMessage = "Failed to process authentication redirect";
      
      if (error.code === 'auth/unauthorized-domain') {
        errorMessage = `Domain not authorized in Firebase: ${hostname}`;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      
      toast({
        title: "Authentication Error",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };
  
  const startGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("Starting Google redirect authentication flow...");
      
      // Configure provider with minimal settings
      const provider = new GoogleAuthProvider();
      
      // Add specific scopes
      provider.addScope('email');
      provider.addScope('profile');
      
      // Set custom parameters that help with Replit domains
      provider.setCustomParameters({
        // Force account selection to avoid session issues
        prompt: 'select_account',
        // Include previously granted scopes
        include_granted_scopes: 'true'
      });
      
      // Use sign in with redirect - no popups
      await signInWithRedirect(auth, provider);
      
      // Control leaves this page for Google login
      console.log("Redirect initiated to Google");
    } catch (error: any) {
      console.error("Google Sign In Error:", error);
      setLoading(false);
      
      let errorMessage = "Failed to start authentication";
      
      if (error.code === 'auth/unauthorized-domain') {
        errorMessage = `This domain (${hostname}) is not authorized in Firebase.`;
      } else if (error.code === 'auth/operation-not-allowed') {
        errorMessage = "Google sign-in is not enabled for this project.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      
      toast({
        title: "Authentication Error",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };
  
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setRedirectState('pending');
      
      toast({
        title: "Signed Out",
        description: "You have been successfully signed out."
      });
    } catch (error) {
      console.error("Sign out error:", error);
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  // Render loading state during redirect processing
  if (redirectState === 'processing') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-cover bg-center"
           style={{
             backgroundImage: 'url("/attached_assets/interior-background-of-a-cozy-dark-living-room-ai-generated-photo.jpg")',
             backgroundColor: 'rgba(0, 0, 0, 0.7)',
             backgroundBlendMode: 'overlay'
           }}>
        <div className="max-w-md w-full rounded-xl overflow-hidden backdrop-blur-lg bg-black bg-opacity-40 border border-gray-800 p-8">
          <div className="flex flex-col items-center justify-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
            <h2 className="text-2xl font-bold text-white">Processing Authentication</h2>
            <p className="text-gray-400 text-center">Please wait while we complete your Google sign-in...</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-cover bg-center"
         style={{
           backgroundImage: 'url("/attached_assets/interior-background-of-a-cozy-dark-living-room-ai-generated-photo.jpg")',
           backgroundColor: 'rgba(0, 0, 0, 0.7)',
           backgroundBlendMode: 'overlay'
         }}>
      <div className="max-w-md w-full rounded-xl overflow-hidden backdrop-blur-lg bg-black bg-opacity-40 border border-gray-800 p-8">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-white">Replit Redirect Auth</h2>
          <p className="text-gray-400 mt-1">Simplified Google Authentication</p>
        </div>
        
        {user ? (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-green-500/20 to-teal-500/20 text-white p-4 rounded-lg backdrop-blur-sm">
              <div className="flex items-center">
                <Check className="text-green-500 h-5 w-5 mr-2" />
                <div className="font-medium text-lg">Authentication Success</div>
              </div>
              <div className="mt-3 text-sm text-gray-200">
                <p><strong>Name:</strong> {user.displayName}</p>
                <p><strong>Email:</strong> {user.email}</p>
                {user.photoURL && (
                  <div className="mt-3 flex justify-center">
                    <img 
                      src={user.photoURL} 
                      alt="Profile" 
                      className="w-16 h-16 rounded-full border-2 border-white/20 object-cover"
                    />
                  </div>
                )}
              </div>
            </div>
            
            <Button 
              onClick={() => navigate('/dashboard')}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Go to Dashboard
            </Button>
            
            <Button 
              onClick={handleSignOut}
              variant="outline"
              className="w-full mt-2 bg-red-900/30 border-red-800/50 hover:bg-red-800/50 text-white"
            >
              Sign Out
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <Alert className="border-blue-800 bg-blue-900/20">
              <Info className="h-4 w-4 text-blue-500" />
              <AlertTitle className="text-blue-400">Redirect Authentication</AlertTitle>
              <AlertDescription className="text-blue-300 text-sm">
                This method uses only redirects (no popups) and works reliably on Replit domains.
              </AlertDescription>
            </Alert>
            
            {redirectState === 'error' && error && (
              <Alert className="border-red-800 bg-red-900/20">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <AlertTitle className="text-red-400">Authentication Error</AlertTitle>
                <AlertDescription className="text-red-300 text-sm">
                  {error}
                </AlertDescription>
              </Alert>
            )}
            
            <div className="p-4 bg-black/30 border border-gray-800 rounded-md">
              <p className="text-yellow-400 font-medium mb-2">Important Setup</p>
              <p className="text-gray-400 text-sm mb-2">Add these domains to Firebase Auth Console:</p>
              <ul className="list-disc list-inside text-gray-500 text-xs space-y-1">
                <li>{hostname}</li>
                <li>*.replit.dev</li>
                <li>*.replit.app</li>
              </ul>
            </div>
            
            <Button 
              onClick={startGoogleSignIn}
              className="w-full bg-white hover:bg-gray-100 text-gray-800 flex items-center justify-center"
              disabled={loading}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              {loading ? 'Redirecting...' : 'Sign in with Google (Redirect Only)'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReplitRedirectAuth;