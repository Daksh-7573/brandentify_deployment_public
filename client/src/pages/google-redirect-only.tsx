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
import { Loader2, AlertTriangle } from 'lucide-react';

/**
 * Google Redirect Only Login
 * 
 * An ultra simplified Google authentication component that uses ONLY redirect method.
 * Built specifically to solve authentication issues on Replit domains.
 */
const GoogleRedirectOnly: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [checking, setChecking] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const [_, navigate] = useLocation();
  
  // Current hostname
  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
  
  // Initialize Firebase (one-time)
  const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  };
  
  // Initialize with a unique name to avoid conflicts with other instances
  const app = initializeApp(firebaseConfig, 'redirect-only-instance');
  const auth = getAuth(app);
  
  // Check for existing auth and redirect results on load
  useEffect(() => {
    console.log("Google Redirect Only Auth initialized");
    console.log("Current domain:", hostname);
    
    // Check for existing login and redirect results
    const checkAuth = async () => {
      try {
        setChecking(true);
        
        // Check for redirect result first (high priority)
        console.log("Checking for redirect result...");
        const result = await getRedirectResult(auth);
        
        if (result) {
          // User just got redirected back from Google
          console.log("Redirect result found!");
          const user = result.user;
          setUser(user);
          
          toast({
            title: "Login Successful",
            description: `Welcome back, ${user.displayName || user.email}!`,
          });
          
          setTimeout(() => navigate('/dashboard'), 1000);
        } 
        
        // Also check for existing authenticated user
        const currentUser = auth.currentUser;
        if (currentUser && !user) {
          console.log("Already logged in user detected");
          setUser(currentUser);
        }
      } catch (error: any) {
        console.error("Authentication error:", error);
        
        let errorMessage = "Authentication failed";
        if (error.code === 'auth/unauthorized-domain') {
          errorMessage = `This domain (${hostname}) is not authorized in Firebase.`;
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        setError(errorMessage);
        
        toast({
          title: "Authentication Error",
          description: errorMessage,
          variant: "destructive"
        });
      } finally {
        setChecking(false);
      }
    };
    
    // Run the auth check
    checkAuth();
    
    // Set up auth state listener
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        console.log("Auth state changed: User signed in");
        setUser(user);
      } else {
        console.log("Auth state changed: No user");
      }
    });
    
    return () => unsubscribe();
  }, []);
  
  // Start Google redirect flow
  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Create Google provider with minimal settings
      const provider = new GoogleAuthProvider();
      
      // Add scopes
      provider.addScope('profile');
      provider.addScope('email');
      
      // Always select account to avoid session issues
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      
      console.log("Starting Google redirect flow...");
      
      // Start redirect flow
      await signInWithRedirect(auth, provider);
      
      // Note: Page will redirect to Google
    } catch (error: any) {
      console.error("Google Sign In Error:", error);
      setLoading(false);
      
      let errorMessage = "Failed to start sign in";
      if (error.code === 'auth/unauthorized-domain') {
        errorMessage = `This domain (${hostname}) is not authorized in Firebase. Add it to your Firebase project's authorized domains.`;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      
      toast({
        title: "Sign In Error",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };
  
  // Sign out user
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setUser(null);
      
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
  
  // Loading state while checking auth
  if (checking) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-cover bg-center"
           style={{
             backgroundImage: 'url("/attached_assets/interior-background-of-a-cozy-dark-living-room-ai-generated-photo.jpg")',
             backgroundColor: 'rgba(0, 0, 0, 0.7)',
             backgroundBlendMode: 'overlay'
           }}>
        <div className="w-full max-w-md rounded-xl overflow-hidden backdrop-blur-lg bg-black bg-opacity-40 border border-gray-800 p-8">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
            <h2 className="text-2xl font-bold text-white">Checking Authentication</h2>
            <p className="text-gray-400 text-center">Verifying your login status...</p>
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
      <div className="w-full max-w-md rounded-xl overflow-hidden backdrop-blur-lg bg-black bg-opacity-40 border border-gray-800 p-8">
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-white">Google Login</h2>
          <p className="text-gray-400 mt-1">Redirect Method Only</p>
        </div>
        
        {/* Main Content */}
        {user ? (
          <div className="space-y-6">
            {/* User Profile */}
            <div className="bg-gradient-to-r from-blue-800/30 to-purple-800/30 rounded-lg p-4">
              <div className="flex flex-col items-center">
                {user.photoURL && (
                  <img 
                    src={user.photoURL} 
                    alt="Profile" 
                    className="w-20 h-20 rounded-full border-2 border-white/30 mb-4"
                  />
                )}
                <h3 className="font-bold text-xl text-white">{user.displayName}</h3>
                <p className="text-gray-300">{user.email}</p>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="space-y-3">
              <Button 
                onClick={() => navigate('/dashboard')} 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                Go to Dashboard
              </Button>
              
              <Button 
                onClick={handleSignOut}
                className="w-full bg-red-900/30 hover:bg-red-800/50 text-white border border-red-800/30"
              >
                Sign Out
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Domain Info */}
            <div className="bg-blue-900/20 border border-blue-800/30 rounded-lg p-4">
              <p className="text-blue-300 text-sm">
                Using redirect login (no popups) on:<br/>
                <span className="font-mono bg-blue-950/50 px-2 py-1 rounded text-xs">{hostname}</span>
              </p>
            </div>
            
            {/* Error Message */}
            {error && (
              <div className="bg-red-900/20 border border-red-800/30 rounded-lg p-4 flex">
                <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mr-2" />
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}
            
            {/* Setup Instructions */}
            <div className="bg-gray-900/30 border border-gray-800 rounded-lg p-4">
              <p className="text-yellow-400 text-sm font-semibold mb-2">Important Setup</p>
              <p className="text-gray-400 text-xs mb-2">Add these domains to Firebase:</p>
              <code className="block text-xs text-gray-500 bg-black/20 p-2 rounded overflow-x-auto whitespace-pre">
{hostname}
*.replit.dev
*.replit.app
              </code>
            </div>
            
            {/* Auth Button */}
            <Button 
              onClick={handleGoogleSignIn}
              className="w-full bg-white text-gray-800 hover:bg-gray-100 flex items-center justify-center"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Redirecting...
                </>
              ) : (
                <>
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
                  Sign in with Google
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GoogleRedirectOnly;