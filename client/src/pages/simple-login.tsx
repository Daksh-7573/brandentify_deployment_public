import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { 
  getAuth, 
  signInWithPopup, 
  signInWithEmailAndPassword,
  GoogleAuthProvider, 
  getRedirectResult 
} from 'firebase/auth';
import { app as firebaseApp } from '../lib/firebase';
import { useLocation } from 'wouter';
import { Input } from '@/components/ui/input';

// Initialize Firebase Auth directly
const auth = getAuth(firebaseApp);

const SimpleLoginPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginMethod, setLoginMethod] = useState<'google' | 'email'>('google');
  const [_, navigate] = useLocation();
  const { toast } = useToast();

  // Check for current auth state on mount
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        console.log("User is already signed in:", user.displayName);
        setMessage(`Already signed in as ${user.displayName || user.email}`);
      } else {
        console.log("No user is signed in");
      }
    });
    
    return () => unsubscribe();
  }, []);

  const startGoogleLogin = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setMessage("Starting Google authentication via popup...");
      
      console.log("🚀 Starting Google authentication via popup...");
      
      // Create a fresh provider with required scopes
      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');
      
      // Force selection even if already logged in
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      
      // Using popup instead of redirect to avoid cross-domain issues
      const result = await signInWithPopup(auth, provider);
      
      console.log("✅ Authentication successful!", result.user.displayName);
      setMessage(`Successfully authenticated as ${result.user.displayName || result.user.email}`);
      
      toast({
        title: "Authentication Successful",
        description: `Welcome, ${result.user.displayName || result.user.email}!`,
      });
      
      // Navigate to home on success
      setTimeout(() => navigate('/'), 1500);
    } catch (err: any) {
      console.error("Error with Google sign-in:", err);
      
      // Handle specific popup blocked error
      if (err.code === 'auth/popup-blocked') {
        setError("Popup was blocked. Please allow popups for this site or try the email login option.");
      } else {
        setError(`Authentication error: ${err.message}`);
      }
      
      setMessage(null);
      setIsLoading(false);
      
      toast({
        title: "Authentication Error",
        description: err.message,
        variant: "destructive"
      });
    }
  };
  
  const startEmailLogin = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setMessage("Logging in with email...");
      
      if (!email || !password) {
        throw new Error("Email and password are required");
      }
      
      const result = await signInWithEmailAndPassword(auth, email, password);
      
      console.log("✅ Email authentication successful!");
      setMessage(`Successfully logged in as ${result.user.email}`);
      
      toast({
        title: "Login Successful",
        description: `Welcome back, ${result.user.email}!`,
      });
      
      // Navigate to home on success
      setTimeout(() => navigate('/'), 1500);
    } catch (err: any) {
      console.error("Error with email sign-in:", err);
      setError(`Login error: ${err.message}`);
      setMessage(null);
      setIsLoading(false);
      
      toast({
        title: "Login Error",
        description: err.message,
        variant: "destructive"
      });
    }
  };

  const signOut = async () => {
    try {
      await auth.signOut();
      toast({
        title: "Signed Out",
        description: "You have been signed out successfully."
      });
      setMessage("Signed out successfully");
    } catch (err: any) {
      toast({
        title: "Error",
        description: `Failed to sign out: ${err.message}`,
        variant: "destructive"
      });
    }
  };

  const toggleLoginMethod = () => {
    setLoginMethod(loginMethod === 'google' ? 'email' : 'google');
    setError(null);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black bg-opacity-90 p-4" 
         style={{
           backgroundImage: 'url("/attached_assets/interior-background-of-a-cozy-dark-living-room-ai-generated-photo.jpg")',
           backgroundSize: 'cover',
           backgroundPosition: 'center'
         }}>
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Brandentifier Login</h1>
          <p className="text-gray-300 mb-8">Access your professional profile</p>
        </div>
        
        <Card className="w-full backdrop-blur-lg bg-black bg-opacity-40 border border-gray-800 neo-glass">
          <CardHeader>
            <CardTitle className="text-white">Authentication</CardTitle>
            <CardDescription className="text-gray-300">
              {loginMethod === 'google' 
                ? 'Sign in with your Google account' 
                : 'Sign in with your email and password'}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {isLoading && (
              <div className="py-2 text-center mb-4">
                <div className="animate-pulse bg-blue-900 bg-opacity-30 p-3 rounded-md">
                  <p className="text-blue-400">Processing authentication...</p>
                </div>
              </div>
            )}
            
            {auth.currentUser ? (
              <div className="py-4 text-center">
                <div className="bg-gradient-to-r from-green-500 to-teal-500 text-white py-3 px-4 rounded-md mb-4 backdrop-blur-sm">
                  <div className="font-medium">✓ Authenticated Successfully</div>
                  <div className="mt-2 text-sm text-gray-100">{auth.currentUser.displayName || auth.currentUser.email}</div>
                </div>
                <Button 
                  onClick={signOut}
                  variant="outline" 
                  className="w-full mt-4 border-red-700 text-red-400 hover:bg-red-900 hover:bg-opacity-30"
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="py-4">
                {loginMethod === 'google' ? (
                  <Button 
                    onClick={startGoogleLogin}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-2 flex items-center justify-center"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Connecting to Google...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        </svg>
                        Login with Google
                      </>
                    )}
                  </Button>
                ) : (
                  <form onSubmit={(e) => { e.preventDefault(); startEmailLogin(); }} className="space-y-4">
                    <div>
                      <Input
                        type="email"
                        placeholder="Email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="bg-gray-900 border-gray-700 text-white"
                        required
                      />
                    </div>
                    <div>
                      <Input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="bg-gray-900 border-gray-700 text-white"
                        required
                      />
                    </div>
                    <Button 
                      type="submit"
                      className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Signing in...
                        </>
                      ) : "Sign in with Email"}
                    </Button>
                  </form>
                )}
                
                <div className="mt-6 text-center">
                  <button 
                    onClick={toggleLoginMethod}
                    className="text-blue-400 hover:text-blue-300 text-sm"
                  >
                    {loginMethod === 'google' 
                      ? 'Use email and password instead' 
                      : 'Use Google authentication instead'}
                  </button>
                </div>
                
                {error && (
                  <div className="mt-4 text-red-400 bg-red-900 bg-opacity-20 p-3 rounded-md text-sm border border-red-800">
                    {error}
                  </div>
                )}
                
                {message && (
                  <div className="mt-4 text-blue-300 bg-blue-900 bg-opacity-20 p-3 rounded-md text-sm border border-blue-800">
                    {message}
                  </div>
                )}
              </div>
            )}
          </CardContent>
          
          <CardFooter className="flex flex-col">
            <div className="w-full mt-4">
              <Button
                onClick={() => navigate('/')}
                variant="ghost"
                className="w-full text-gray-400 hover:text-gray-200"
              >
                Back to Home
              </Button>
            </div>
            
            <div className="mt-6 text-xs text-gray-500">
              <p>Domain: {window.location.hostname}</p>
              <p>Auth Status: {auth.currentUser ? 'Authenticated' : 'Not Authenticated'}</p>
              {auth.currentUser && (
                <p>User: {auth.currentUser.displayName || 'No Display Name'} ({auth.currentUser.email})</p>
              )}
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default SimpleLoginPage;