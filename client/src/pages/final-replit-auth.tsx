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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, AlertTriangle, LogOut, LogIn } from 'lucide-react';

/**
 * Final Replit Authentication Solution
 * 
 * An ultra-simplified Google authentication component that:
 * 1. Uses only redirect method (no popups)
 * 2. Handles authentication specifically for Replit domains
 * 3. Shows detailed diagnostics
 */
const FinalReplitAuth: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [initComplete, setInitComplete] = useState<boolean>(false);
  const [domainInfo, setDomainInfo] = useState<any>({});
  const [diagnostics, setDiagnostics] = useState<any>({
    checkingRedirect: false,
    redirectChecked: false,
    redirectResult: null,
    error: null,
    steps: []
  });
  
  const { toast } = useToast();
  const [_, navigate] = useLocation();
  
  // Initialize Firebase with unique app name to avoid conflicts
  const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  };
  
  const app = initializeApp(firebaseConfig, 'final-replit-auth');
  const auth = getAuth(app);
  
  // Get domain information
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setDomainInfo({
        hostname: window.location.hostname,
        origin: window.location.origin,
        href: window.location.href,
        pathname: window.location.pathname
      });
    }
  }, []);
  
  // Handle authentication flow
  useEffect(() => {
    const addStep = (step: string) => {
      setDiagnostics(prev => ({
        ...prev,
        steps: [...prev.steps, { time: new Date().toISOString(), message: step }]
      }));
      console.log(step);
    };
    
    const handleErrors = (error: any, context: string) => {
      console.error(`Error during ${context}:`, error);
      
      // Format error message
      let errorMessage = `${context} failed`;
      if (error.code === 'auth/unauthorized-domain') {
        errorMessage = `This domain (${domainInfo.hostname}) is not authorized in Firebase.`;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setDiagnostics(prev => ({
        ...prev,
        error: { context, message: errorMessage, raw: error }
      }));
      
      toast({
        title: "Authentication Error",
        description: errorMessage,
        variant: "destructive"
      });
    };

    const checkAuth = async () => {
      try {
        addStep("Starting authentication check");
        
        // First priority: check for redirect result
        addStep("Checking for redirect result");
        setDiagnostics(prev => ({ ...prev, checkingRedirect: true }));
        
        const result = await getRedirectResult(auth);
        setDiagnostics(prev => ({ 
          ...prev, 
          redirectChecked: true,
          redirectResult: result ? 'success' : 'no-result'
        }));
        
        if (result) {
          addStep("Redirect result found - user just completed Google auth");
          const user = result.user;
          setUser(user);
          
          toast({
            title: "Login Successful",
            description: `Welcome, ${user.displayName || user.email}!`,
          });
        } else {
          addStep("No redirect result found - checking for existing session");
          
          // Check for existing auth state
          const currentUser = auth.currentUser;
          if (currentUser) {
            addStep("User already logged in");
            setUser(currentUser);
          } else {
            addStep("No authenticated user found");
          }
        }
      } catch (error: any) {
        handleErrors(error, "Authentication check");
      } finally {
        setInitComplete(true);
      }
    };
    
    // Start auth check
    checkAuth();
    
    // Set up auth state listener for changes
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        addStep(`Auth state changed: user signed in (${user.email})`);
        setUser(user);
      } else {
        addStep("Auth state changed: no user");
        setUser(null);
      }
    });
    
    return () => unsubscribe();
  }, [auth, toast, domainInfo.hostname]);
  
  // Handle sign in
  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setDiagnostics(prev => ({ ...prev, error: null }));
      
      // Create Google provider with explicit settings
      const provider = new GoogleAuthProvider();
      
      // Add scopes
      provider.addScope('email');
      provider.addScope('profile');
      
      // Force account selection to avoid session issues
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      
      console.log("Starting Google redirect flow...");
      
      // Start redirect flow (page will navigate away to Google)
      await signInWithRedirect(auth, provider);
      
    } catch (error: any) {
      console.error("Sign In Error:", error);
      setLoading(false);
      
      let errorMessage = "Failed to start sign in";
      if (error.code === 'auth/unauthorized-domain') {
        errorMessage = `This domain (${domainInfo.hostname}) is not authorized in Firebase. Add it to your Firebase project's authorized domains.`;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setDiagnostics(prev => ({
        ...prev,
        error: { context: "Sign in", message: errorMessage, raw: error }
      }));
      
      toast({
        title: "Sign In Error",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };
  
  // Handle sign out
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setUser(null);
      
      toast({
        title: "Signed Out",
        description: "You have been successfully signed out."
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  // When still initializing
  if (!initComplete) {
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
            <h2 className="text-2xl font-bold text-white">Initializing Authentication</h2>
            <p className="text-gray-400 text-center">Verifying authentication state...</p>
            
            {diagnostics.checkingRedirect && (
              <div className="bg-blue-900/20 rounded-lg p-3 w-full">
                <p className="text-blue-400 text-sm">Checking for redirect result...</p>
              </div>
            )}
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
      
      {/* Main Auth Card */}
      <div className="w-full max-w-lg rounded-xl overflow-hidden backdrop-blur-lg bg-black bg-opacity-40 border border-gray-800 p-8 mb-6">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-white">Google Authentication</h2>
          <p className="text-gray-400 mt-2">Final Replit Domain Solution</p>
        </div>
        
        {user ? (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-800/30 to-purple-800/30 rounded-lg p-6">
              <div className="flex flex-col items-center">
                {user.photoURL && (
                  <img 
                    src={user.photoURL} 
                    alt={user.displayName || "Profile"} 
                    className="w-24 h-24 rounded-full border-2 border-white/30 mb-3"
                  />
                )}
                <h3 className="font-bold text-xl text-white">{user.displayName}</h3>
                <p className="text-gray-300">{user.email}</p>
                
                <div className="mt-4 pt-4 border-t border-gray-600/30 w-full">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Provider:</span>
                    <span className="text-blue-300">
                      {user.providerData[0]?.providerId || "Unknown"}
                    </span>
                  </div>
                  
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-gray-400">User ID:</span>
                    <span className="text-blue-300 font-mono text-xs">
                      {user.uid.substring(0, 10)}...
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button 
                onClick={() => navigate('/dashboard')} 
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Go to Dashboard
              </Button>
              
              <Button 
                onClick={handleSignOut}
                className="bg-red-900/30 hover:bg-red-800/50 text-white border border-red-800/30"
                variant="outline"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-900/20 to-indigo-900/20 rounded-lg p-4">
              <h3 className="text-xl font-semibold text-white mb-2">Not Signed In</h3>
              <p className="text-gray-400">Sign in with your Google account to continue.</p>
            </div>
            
            {diagnostics.error && (
              <div className="bg-red-900/20 border border-red-800/30 rounded-lg p-4 flex">
                <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mr-2 mt-0.5" />
                <div>
                  <p className="text-red-300 font-medium">{diagnostics.error.context} Error</p>
                  <p className="text-red-300/80 text-sm mt-1">{diagnostics.error.message}</p>
                </div>
              </div>
            )}
            
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
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign in with Google
                </>
              )}
            </Button>
          </div>
        )}
      </div>
      
      {/* Domain & Diagnostics */}
      <div className="w-full max-w-lg space-y-4">
        {/* Domain Info */}
        <Card className="bg-black/40 backdrop-blur-md border-gray-800 overflow-hidden">
          <CardHeader className="bg-gray-900/40 pb-2">
            <CardTitle className="text-lg text-blue-400">Domain Information</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-gray-400">Domain:</div>
              <div className="text-blue-300 font-mono text-xs overflow-hidden overflow-ellipsis">
                {domainInfo.hostname || 'Unknown'}
              </div>
              
              <div className="text-gray-400">Full URL:</div>
              <div className="text-blue-300 font-mono text-xs overflow-hidden overflow-ellipsis">
                {domainInfo.href || 'Unknown'}
              </div>
            </div>
            
            <div className="mt-3 pt-3 border-t border-gray-800">
              <div className="text-xs text-yellow-400 mb-2">Add these domains to Firebase:</div>
              <ol className="list-decimal list-inside space-y-1">
                <li className="text-gray-300 text-xs font-mono">{domainInfo.hostname}</li>
                <li className="text-gray-300 text-xs font-mono">*.replit.dev</li>
                <li className="text-gray-300 text-xs font-mono">*.replit.app</li>
              </ol>
            </div>
          </CardContent>
        </Card>
        
        {/* Auth Diagnostics */}
        <Card className="bg-black/40 backdrop-blur-md border-gray-800 overflow-hidden">
          <CardHeader className="bg-gray-900/40 pb-2">
            <CardTitle className="text-lg text-blue-400">Authentication Diagnostics</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Redirect Check:</span>
                <span className={`font-medium ${diagnostics.redirectChecked ? 'text-green-400' : 'text-yellow-400'}`}>
                  {diagnostics.redirectChecked ? 'Completed' : 'Pending'}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-400">Redirect Result:</span>
                <span className={`font-medium ${
                  diagnostics.redirectResult === 'success' ? 'text-green-400' : 
                  diagnostics.redirectResult === 'no-result' ? 'text-blue-400' : 
                  'text-gray-500'
                }`}>
                  {diagnostics.redirectResult === 'success' ? 'Success' : 
                   diagnostics.redirectResult === 'no-result' ? 'No Result' : 
                   'Unknown'}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-400">Auth Status:</span>
                <span className={`font-medium ${user ? 'text-green-400' : 'text-orange-400'}`}>
                  {user ? 'Authenticated' : 'Not Authenticated'}
                </span>
              </div>
            </div>
            
            {diagnostics.steps.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-800">
                <div className="text-xs text-gray-400 mb-2">Auth Process Steps:</div>
                <div className="bg-gray-900/40 rounded p-2 max-h-24 overflow-y-auto">
                  {diagnostics.steps.slice(-5).map((step, index) => (
                    <div key={index} className="text-xs mb-1">
                      <span className="text-gray-500">{new Date(step.time).toLocaleTimeString()}</span>
                      <span className="text-gray-300 ml-2">{step.message}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FinalReplitAuth;