import React, { useState, useEffect } from 'react';
import { getAuth, signInWithPopup, signInWithRedirect, GoogleAuthProvider, getRedirectResult, signOut } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info, Check, X, Loader2 } from 'lucide-react';

/**
 * Cross-Domain Google Authentication
 * 
 * A specialized Google authentication solution that works across all domains:
 * - Preview pages
 * - Replit.dev domains
 * - Replit.app domains
 * - Custom domains
 * 
 * This component automatically detects the best authentication method based on domain
 * and provides fallback mechanisms if the primary method fails.
 */
const CrossDomainGoogleAuth: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [authMode, setAuthMode] = useState<'popup' | 'redirect'>('popup');
  const [isReplitDomain, setIsReplitDomain] = useState<boolean>(false);
  const [status, setStatus] = useState<'idle' | 'authenticating' | 'success' | 'error'>('idle');
  const { toast } = useToast();
  const [_, navigate] = useLocation();
  
  // Initialize Firebase with an instance name to avoid conflicts
  const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  };
  
  const app = initializeApp(firebaseConfig, 'cross-domain-auth-instance');
  const auth = getAuth(app);
  
  // Detect domain type and set the best auth method
  useEffect(() => {
    const hostname = window.location.hostname;
    const isReplit = hostname.includes('replit.dev') || hostname.includes('replit.app');
    setIsReplitDomain(isReplit);
    
    // On Replit domains, try redirect method as it's generally more reliable
    // On other domains, popup is generally better for user experience
    setAuthMode(isReplit ? 'redirect' : 'popup');
    
    // Check for redirect results on page load
    checkRedirectResult();
    
    // Set up auth state listener
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
        setStatus('success');
        console.log("User signed in:", user.displayName || user.email);
      }
    });
    
    return () => unsubscribe();
  }, [auth]);
  
  // Check for redirect results from previous auth attempts
  const checkRedirectResult = async () => {
    try {
      const result = await getRedirectResult(auth);
      if (result) {
        // User just got redirected back from auth provider
        const user = result.user;
        setUser(user);
        setStatus('success');
        
        toast({
          title: "Login Successful",
          description: `Logged in as ${user.displayName || user.email}`,
        });
      }
    } catch (error: any) {
      console.error("Redirect result error:", error);
      
      if (error.code === 'auth/operation-not-allowed') {
        setError("Google authentication is not enabled for this project. Please contact the administrator.");
      } else {
        setError("Failed to complete authentication after redirect. Please try again or use a different method.");
      }
      
      setStatus('error');
    }
  };
  
  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    setStatus('authenticating');
    
    try {
      // Create Google provider with custom parameters
      const provider = new GoogleAuthProvider();
      provider.addScope('https://www.googleapis.com/auth/userinfo.email');
      provider.addScope('https://www.googleapis.com/auth/userinfo.profile');
      
      // Add additional parameters to improve success rate
      provider.setCustomParameters({
        // Force account selection even if the user is already signed in
        prompt: 'select_account',
        // Explicitly set host domain to replit.com to work around domain restrictions
        hd: 'replit.com',
        // Include other parameters that can help with troubleshooting
        include_granted_scopes: 'true',
      });
      
      if (authMode === 'popup') {
        // Popup method
        const result = await signInWithPopup(auth, provider);
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const user = result.user;
        
        setUser(user);
        setStatus('success');
        
        toast({
          title: "Login Successful",
          description: `Logged in as ${user.displayName || user.email}`,
        });
        
        // Redirect to dashboard after successful login after short delay
        setTimeout(() => {
          navigate('/dashboard');
        }, 1000);
      } else {
        // Redirect method
        await signInWithRedirect(auth, provider);
        // Control will leave this page and return after redirect
      }
    } catch (error: any) {
      console.error("Google Sign In Error:", error);
      
      let errorMessage = "Failed to sign in with Google";
      
      // Handle specific error codes
      if (error.code === 'auth/popup-blocked') {
        errorMessage = "Popup was blocked by your browser. Please allow popups for this site or try the Redirect Method.";
      } else if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = "Login popup was closed before authentication could complete.";
      } else if (error.code === 'auth/cancelled-popup-request') {
        errorMessage = "The authentication popup request was cancelled.";
      } else if (error.code === 'auth/operation-not-allowed') {
        errorMessage = "Google authentication is not enabled for this Firebase project.";
      } else if (error.code === 'auth/unauthorized-domain') {
        errorMessage = "This domain is not authorized for OAuth operations. Try adding it to your Firebase authorized domains.";
      } else if (error.message && error.message.includes('domain')) {
        errorMessage = "Google auth rejected this domain. Please try the Redirect method or use a different authentication method.";
      }
      
      setError(errorMessage);
      setStatus('error');
      
      toast({
        title: "Authentication Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setStatus('idle');
      
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out."
      });
    } catch (error) {
      console.error("Sign out error:", error);
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  // Helper to render status indicators
  const renderStatusIndicator = () => {
    switch (status) {
      case 'authenticating':
        return (
          <div className="flex items-center text-yellow-500 p-3 bg-yellow-950/30 rounded-md">
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            <span>Authenticating with Google...</span>
          </div>
        );
      case 'success':
        return (
          <div className="flex items-center text-green-500 p-3 bg-green-950/30 rounded-md">
            <Check className="h-5 w-5 mr-2" />
            <span>Successfully authenticated</span>
          </div>
        );
      case 'error':
        return (
          <div className="flex items-center text-red-500 p-3 bg-red-950/30 rounded-md">
            <X className="h-5 w-5 mr-2" />
            <span>Authentication failed</span>
          </div>
        );
      default:
        return null;
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-cover bg-center"
         style={{
           backgroundImage: 'url("/attached_assets/interior-background-of-a-cozy-dark-living-room-ai-generated-photo.jpg")',
           backgroundColor: 'rgba(0, 0, 0, 0.7)',
           backgroundBlendMode: 'overlay'
         }}>
      <div className="max-w-lg w-full rounded-xl overflow-hidden backdrop-blur-lg bg-black bg-opacity-40 border border-gray-800"
           style={{boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'}}>
        <div className="p-8">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-white">Cross-Domain Google Auth</h2>
            <p className="text-gray-400 mt-1">Works on all domains</p>
          </div>
          
          {user ? (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-green-500/20 to-teal-500/20 text-white p-4 rounded-lg backdrop-blur-sm">
                <div className="font-medium text-lg">✓ Signed in with Google</div>
                <div className="mt-2 text-sm text-gray-200">
                  <p><strong>Name:</strong> {user.displayName}</p>
                  <p><strong>Email:</strong> {user.email}</p>
                  {user.photoURL && (
                    <div className="mt-2">
                      <img 
                        src={user.photoURL} 
                        alt="Profile" 
                        className="w-12 h-12 rounded-full border-2 border-white/20"
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
              <Alert className="border-blue-800 bg-blue-950/30">
                <Info className="h-4 w-4 text-blue-500" />
                <AlertTitle className="text-blue-400">Domain Detection</AlertTitle>
                <AlertDescription className="text-blue-300 text-sm">
                  {isReplitDomain ? 
                    "Replit domain detected! Using optimized authentication." :
                    "Standard domain detected. Default authentication should work well."}
                </AlertDescription>
              </Alert>
              
              <Tabs defaultValue={authMode} onValueChange={(value) => setAuthMode(value as any)}>
                <TabsList className="grid grid-cols-2 bg-gray-900/70">
                  <TabsTrigger value="popup">Popup Method</TabsTrigger>
                  <TabsTrigger value="redirect">Redirect Method</TabsTrigger>
                </TabsList>
                
                <TabsContent value="popup" className="mt-4">
                  <div className="border border-gray-800 bg-black/20 p-4 rounded-md">
                    <p className="text-gray-300 mb-4 text-sm">
                      Opens a popup window for authentication. Best for standard domains and better user experience as you stay on the same page.
                    </p>
                  </div>
                </TabsContent>
                
                <TabsContent value="redirect" className="mt-4">
                  <div className="border border-gray-800 bg-black/20 p-4 rounded-md">
                    <p className="text-gray-300 mb-4 text-sm">
                      Redirects to Google for authentication and then back to this page. Recommended for Replit domains where popups may be blocked or restricted.
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
              
              {renderStatusIndicator()}
              
              {error && (
                <div className="mt-4 p-3 bg-red-900/30 rounded-md border border-red-800">
                  <p className="text-red-300 text-sm">{error}</p>
                </div>
              )}
              
              <Button 
                onClick={handleGoogleSignIn}
                className="w-full bg-white hover:bg-gray-100 text-gray-800 flex items-center justify-center mt-4"
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
                {loading ? 'Connecting...' : `Sign in with Google (${authMode === 'popup' ? 'Popup' : 'Redirect'})`}
              </Button>
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-6 text-center text-gray-500 text-sm max-w-md">
        <p>For complete domain setup, add these domains to Firebase:</p>
        <p className="mt-1">{window.location.hostname}</p>
        <p className="mt-1">*.replit.dev, *.replit.app</p>
        <p className="mt-3">Current method: <span className="font-semibold">{authMode === 'popup' ? 'Popup' : 'Redirect'}</span></p>
      </div>
    </div>
  );
};

export default CrossDomainGoogleAuth;