import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { app as firebaseApp } from '../lib/firebase';
import { useLocation } from 'wouter';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Initialize Firebase Auth directly
const auth = getAuth(firebaseApp);
const googleProvider = new GoogleAuthProvider();

// Force explicit Google selection with popup mode
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

const FixedLoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [_, navigate] = useLocation();
  const { toast } = useToast();

  // Keep track of current auth state
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        console.log("Current user:", user.displayName || user.email);
        setSuccess(`Logged in as: ${user.displayName || user.email}`);
      } else {
        console.log("No user is signed in");
      }
    });
    
    return () => unsubscribe();
  }, []);

  const loginEmail = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      setSuccess(`Logged in as: ${userCredential.user.email}`);
      toast({
        title: "Login Successful",
        description: `Logged in as: ${userCredential.user.email}`,
      });
      
      // Redirect to dashboard after a brief delay
      setTimeout(() => navigate('/dashboard'), 1000);
    } catch (err: any) {
      console.error("Error logging in:", err);
      setError(`Failed to log in: ${err.message}`);
      
      toast({
        title: "Login Error",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createAccount = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!email || !password) {
        throw new Error("Email and password are required");
      }
      
      if (password.length < 6) {
        throw new Error("Password must be at least 6 characters");
      }
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      setSuccess(`Account created: ${userCredential.user.email}`);
      toast({
        title: "Account Created",
        description: `Account created for: ${userCredential.user.email}`,
      });
      
      // Auto login
      setTimeout(() => navigate('/dashboard'), 1000);
    } catch (err: any) {
      console.error("Error creating account:", err);
      setError(`Failed to create account: ${err.message}`);
      
      toast({
        title: "Registration Error",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loginGoogle = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Use popup method which works better on Replit domains
      const result = await signInWithPopup(auth, googleProvider);
      
      setSuccess(`Logged in with Google as: ${result.user.displayName || result.user.email}`);
      toast({
        title: "Google Login Successful",
        description: `Logged in as: ${result.user.displayName || result.user.email}`,
      });
      
      // Redirect to dashboard after a brief delay
      setTimeout(() => navigate('/dashboard'), 1000);
    } catch (err: any) {
      console.error("Error logging in with Google:", err);
      
      // Special handling for popup blocked errors
      if (err.code === 'auth/popup-blocked') {
        setError("Popup was blocked. Please allow popups for this site and try again.");
      } else {
        setError(`Google login failed: ${err.message}`);
      }
      
      toast({
        title: "Google Login Error",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const logoutUser = async () => {
    try {
      await auth.signOut();
      setSuccess("Logged out successfully");
      setError(null);
      toast({
        title: "Logged Out",
        description: "You have been logged out successfully",
      });
    } catch (err: any) {
      setError(`Failed to log out: ${err.message}`);
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive"
      });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black bg-opacity-80 p-4" 
         style={{
           backgroundImage: 'url("/attached_assets/interior-background-of-a-cozy-dark-living-room-ai-generated-photo.jpg")',
           backgroundSize: 'cover',
           backgroundPosition: 'center'
         }}>
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Brandentifier</h1>
          <p className="text-gray-300 mb-8">Access your professional profile</p>
        </div>
        
        <Card className="w-full backdrop-blur-lg bg-black bg-opacity-40 border border-gray-800 neo-glass">
          <CardHeader>
            <CardTitle className="text-white">Authentication</CardTitle>
            <CardDescription className="text-gray-300">
              Sign in to access your account
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
                  onClick={() => navigate('/dashboard')}
                  className="w-full bg-blue-600 hover:bg-blue-700 mt-3"
                >
                  Go to Dashboard
                </Button>
                
                <Button 
                  onClick={logoutUser}
                  variant="outline"
                  className="w-full mt-2 border-red-700 text-red-400 hover:bg-red-900 hover:bg-opacity-30"
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <Tabs defaultValue="email" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-gray-900 bg-opacity-70">
                  <TabsTrigger value="email" className="text-white">Email</TabsTrigger>
                  <TabsTrigger value="register" className="text-white">Register</TabsTrigger>
                </TabsList>
                
                <TabsContent value="email" className="mt-4 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-300">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="bg-gray-900 border-gray-700 text-white"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-gray-300">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="bg-gray-900 border-gray-700 text-white"
                    />
                  </div>
                  
                  <Button 
                    onClick={loginEmail}
                    className="w-full mt-4 bg-blue-600 hover:bg-blue-700"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Signing in...' : 'Sign in with Email'}
                  </Button>
                  
                  <div className="relative my-5">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-gray-700"></span>
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="px-2 text-gray-400 bg-black bg-opacity-70">Or continue with</span>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={loginGoogle}
                    variant="outline"
                    className="w-full bg-white hover:bg-gray-100 text-gray-900 font-medium"
                    disabled={isLoading}
                  >
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"
                      />
                    </svg>
                    Sign in with Google
                  </Button>
                </TabsContent>
                
                <TabsContent value="register" className="mt-4 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-email" className="text-gray-300">Email</Label>
                    <Input
                      id="register-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="bg-gray-900 border-gray-700 text-white"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="register-password" className="text-gray-300">Password (min 6 characters)</Label>
                    <Input
                      id="register-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="bg-gray-900 border-gray-700 text-white"
                    />
                  </div>
                  
                  <Button 
                    onClick={createAccount}
                    className="w-full mt-4 bg-green-600 hover:bg-green-700"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Creating Account...' : 'Create Account'}
                  </Button>
                  
                  <div className="relative my-5">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-gray-700"></span>
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="px-2 text-gray-400 bg-black bg-opacity-70">Or register with</span>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={loginGoogle}
                    variant="outline"
                    className="w-full bg-white hover:bg-gray-100 text-gray-900 font-medium"
                    disabled={isLoading}
                  >
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"
                      />
                    </svg>
                    Register with Google
                  </Button>
                </TabsContent>
              </Tabs>
            )}
            
            {error && (
              <div className="mt-4 p-3 bg-red-900 bg-opacity-30 rounded-md border border-red-800">
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}
            
            {success && !auth.currentUser && (
              <div className="mt-4 p-3 bg-green-900 bg-opacity-30 rounded-md border border-green-800">
                <p className="text-green-300 text-sm">{success}</p>
              </div>
            )}
          </CardContent>
          
          <CardFooter>
            <div className="w-full text-center text-sm text-gray-500">
              <p>Protected by Firebase Authentication</p>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default FixedLoginPage;