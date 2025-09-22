import React, { useState, useEffect } from 'react';
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

/**
 * Universal Google Auth Page
 * 
 * A specialized solution for Google authentication that works across all domains.
 * This component uses multiple authentication strategies to ensure Google auth works
 * consistently across Replit domains and preview pages.
 */
const UniversalGoogleAuthPage: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [authMode, setAuthMode] = useState<'popup' | 'iframe' | 'direct'>('popup');
  const { toast } = useToast();
  const [_, navigate] = useLocation();
  
  // Initialize Firebase
  const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  };
  
  const app = initializeApp(firebaseConfig, 'universal-auth-instance');
  const auth = getAuth(app);
  
  // Check if user is already logged in
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
        console.log("User already signed in:", user.displayName || user.email);
      }
    });
    
    // Auto-select best auth method based on domain
    const domain = window.location.hostname;
    if (domain.includes('replit.dev') || domain.includes('replit.app')) {
      // For Replit domains, try popup first
      setAuthMode('popup');
    } else {
      // For preview pages, direct popup works best
      setAuthMode('direct');
    }
    
    return () => unsubscribe();
  }, [auth]);
  
  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Setup Google provider
      const provider = new GoogleAuthProvider();
      provider.addScope('https://www.googleapis.com/auth/userinfo.email');
      provider.addScope('https://www.googleapis.com/auth/userinfo.profile');
      
      // Use selected auth strategy
      if (authMode === 'popup') {
        // Standard popup method
        const result = await signInWithPopup(auth, provider);
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const user = result.user;
        setUser(user);
        
        toast({
          title: "Login Successful",
          description: `Logged in as ${user.displayName || user.email}`,
        });
      } else if (authMode === 'iframe') {
        // This is a custom iframe method that can help bypass some restrictions
        // Create a hidden iframe that loads the Google auth page
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        document.body.appendChild(iframe);
        
        // Create a message listener to receive the auth result
        window.addEventListener('message', async (event) => {
          if (event.data && event.data.type === 'googleAuthResult') {
            if (event.data.success) {
              // Process successful auth
              const user = event.data.user;
              setUser(user);
              toast({
                title: "Login Successful",
                description: `Logged in as ${user.displayName || user.email}`,
              });
            } else {
              // Handle error
              setError(event.data.error || 'Authentication failed');
              toast({
                title: "Authentication Error",
                description: event.data.error || 'Authentication failed',
                variant: "destructive"
              });
            }
            setLoading(false);
            document.body.removeChild(iframe);
          }
        });
        
        // Load the auth page in the iframe
        iframe.src = '/auth-iframe.html';
      } else {
        // Direct popup with environment-specific settings
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({
          prompt: 'select_account',
          // Add any additional custom parameters needed for the specific environment
        });
        
        const result = await signInWithPopup(auth, provider);
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const user = result.user;
        setUser(user);
        
        toast({
          title: "Login Successful",
          description: `Logged in as ${user.displayName || user.email}`,
        });
      }
      
      // Redirect to dashboard after successful login with any method
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
      
    } catch (error: any) {
      console.error("Google Sign In Error:", error);
      
      let errorMessage = "Failed to sign in with Google";
      
      // Handle specific error codes
      if (error.code === 'auth/popup-blocked') {
        errorMessage = "Popup was blocked by your browser. Please allow popups for this site.";
      } else if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = "Login popup was closed before authentication could complete.";
      } else if (error.code === 'auth/cancelled-popup-request') {
        errorMessage = "The authentication popup request was cancelled.";
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = "Network error occurred. Please check your internet connection.";
      } else if (error.message && error.message.includes('domain')) {
        errorMessage = "Google auth is rejecting this domain. Try a different authentication method.";
      }
      
      setError(errorMessage);
      
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
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-cover bg-center"
         style={{
           backgroundImage: 'url("/attached_assets/interior-background-of-a-cozy-dark-living-room-ai-generated-photo.jpg")',
           backgroundColor: 'rgba(0, 0, 0, 0.7)',
           backgroundBlendMode: 'overlay'
         }}>
      <div className="max-w-md w-full rounded-xl overflow-hidden backdrop-blur-lg bg-black bg-opacity-40 border border-gray-800"
           style={{boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'}}>
        <div className="p-8">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-white">Universal Google Login</h2>
            <p className="text-gray-400 mt-1">Works on all domains</p>
          </div>
          
          {user ? (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-green-500/20 to-teal-500/20 text-white p-4 rounded-lg backdrop-blur-sm">
                <div className="font-medium text-lg">✓ Signed in with Google</div>
                <div className="mt-2 text-sm text-gray-200">
                  <p><strong>Name:</strong> {user.displayName}</p>
                  <p><strong>Email:</strong> {user.email}</p>
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
              <Tabs defaultValue={authMode} onValueChange={(value) => setAuthMode(value as any)}>
                <TabsList className="grid grid-cols-3">
                  <TabsTrigger value="popup">Popup</TabsTrigger>
                  <TabsTrigger value="iframe">Iframe</TabsTrigger>
                  <TabsTrigger value="direct">Direct</TabsTrigger>
                </TabsList>
                
                <TabsContent value="popup" className="mt-4">
                  <Card className="bg-black bg-opacity-40 border-gray-800">
                    <CardHeader className="p-4">
                      <CardTitle className="text-white text-lg">Popup Method</CardTitle>
                      <CardDescription className="text-gray-400">Best for most environments</CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <p className="text-gray-300 mb-4 text-sm">
                        Standard popup authentication that works on most domains.
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="iframe" className="mt-4">
                  <Card className="bg-black bg-opacity-40 border-gray-800">
                    <CardHeader className="p-4">
                      <CardTitle className="text-white text-lg">Iframe Method</CardTitle>
                      <CardDescription className="text-gray-400">For challenging environments</CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <p className="text-gray-300 mb-4 text-sm">
                        Uses an iframe to handle authentication, avoiding some domain restrictions.
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="direct" className="mt-4">
                  <Card className="bg-black bg-opacity-40 border-gray-800">
                    <CardHeader className="p-4">
                      <CardTitle className="text-white text-lg">Direct Method</CardTitle>
                      <CardDescription className="text-gray-400">For preview pages</CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <p className="text-gray-300 mb-4 text-sm">
                        Direct popup with customized parameters, works best on preview pages.
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
              
              <p className="text-gray-300 mb-4 text-sm">
                Selected method: <span className="font-semibold">{authMode === 'popup' ? 'Popup' : authMode === 'iframe' ? 'Iframe' : 'Direct'}</span>
              </p>
              
              <Button 
                onClick={handleGoogleSignIn}
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
                {loading ? 'Connecting...' : `Sign in with Google (${authMode})`}
              </Button>
              
              {error && (
                <div className="mt-4 p-3 bg-red-900 bg-opacity-30 rounded-md border border-red-800">
                  <p className="text-red-300 text-sm">{error}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-6 text-center text-gray-500 text-sm max-w-lg">
        <p>Important setup instructions:</p>
        <p className="mt-1">Make sure to add all Replit domains to your Firebase authorized domains list</p>
        <p className="mt-1">For complete domain setup, include *.replit.dev and *.replit.app in your authorized domains</p>
      </div>
    </div>
  );
};

export default UniversalGoogleAuthPage;