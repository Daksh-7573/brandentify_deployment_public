import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { app as firebaseApp } from '../lib/firebase';
import { useLocation } from 'wouter';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Initialize Firebase Auth directly
const auth = getAuth(firebaseApp);

// Default development credentials
const DEFAULT_EMAIL = 'demo@example.com';
const DEFAULT_PASSWORD = 'demo123456';

const DevAuthUtilityPage: React.FC = () => {
  const [email, setEmail] = useState(DEFAULT_EMAIL);
  const [password, setPassword] = useState(DEFAULT_PASSWORD);
  const [displayName, setDisplayName] = useState('Demo User');
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
      }
    });
    
    return () => unsubscribe();
  }, []);

  const createUser = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update profile with display name
      if (userCredential.user) {
        // Firebase 9+ uses a different API to update profiles
        await updateProfile(userCredential.user, {
          displayName: displayName
        });
        
        setSuccess(`Created user: ${email} with display name: ${displayName}`);
        toast({
          title: "User Created",
          description: `Successfully created user: ${email}`,
        });
      }
    } catch (err: any) {
      console.error("Error creating user:", err);
      setError(`Failed to create user: ${err.message}`);
      
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loginUser = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);
      
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

  const logoutUser = async () => {
    try {
      await auth.signOut();
      setSuccess("Logged out successfully");
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
      <div className="max-w-lg w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Development Authentication Utility</h1>
          <p className="text-gray-300 mb-8">Create and login users for testing on Replit environment</p>
        </div>
        
        <Card className="w-full backdrop-blur-lg bg-black bg-opacity-40 border border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Developer Auth Utility</CardTitle>
            <CardDescription className="text-gray-300">
              This utility is only meant for development and testing
            </CardDescription>
            
            {auth.currentUser && (
              <div className="mt-4 p-3 bg-green-900 bg-opacity-30 rounded-md border border-green-800">
                <p className="text-green-300 text-sm">
                  Currently logged in as: <span className="font-semibold">{auth.currentUser.email}</span>
                </p>
                {auth.currentUser.displayName && (
                  <p className="text-green-300 text-sm mt-1">
                    Display name: <span className="font-semibold">{auth.currentUser.displayName}</span>
                  </p>
                )}
              </div>
            )}
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="email" className="text-gray-300">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="demo@example.com"
                className="bg-gray-900 border-gray-700 text-white"
              />
            </div>
            
            <div className="space-y-3">
              <Label htmlFor="password" className="text-gray-300">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password (min 6 characters)"
                className="bg-gray-900 border-gray-700 text-white"
              />
            </div>
            
            <div className="space-y-3">
              <Label htmlFor="displayName" className="text-gray-300">Display Name</Label>
              <Input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Display Name"
                className="bg-gray-900 border-gray-700 text-white"
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <Button
                onClick={createUser}
                className="bg-purple-600 hover:bg-purple-700 text-white"
                disabled={isLoading}
                size="lg"
              >
                {isLoading ? 'Creating...' : 'Create User'}
              </Button>
              
              <Button
                onClick={loginUser}
                className="bg-blue-600 hover:bg-blue-700 text-white"
                disabled={isLoading}
                size="lg"
              >
                {isLoading ? 'Logging in...' : 'Login'}
              </Button>
              
              {auth.currentUser && (
                <Button
                  onClick={logoutUser}
                  variant="outline"
                  className="border-red-700 text-red-400 hover:bg-red-900 hover:bg-opacity-30"
                  size="lg"
                >
                  Logout
                </Button>
              )}
            </div>
            
            {error && (
              <div className="mt-4 p-3 bg-red-900 bg-opacity-30 rounded-md border border-red-800">
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}
            
            {success && (
              <div className="mt-4 p-3 bg-green-900 bg-opacity-30 rounded-md border border-green-800">
                <p className="text-green-300 text-sm">{success}</p>
              </div>
            )}
          </CardContent>
          
          <CardFooter>
            <div className="w-full">
              <Button
                onClick={() => navigate('/')}
                variant="ghost"
                className="w-full text-gray-400 hover:text-gray-200"
              >
                Back to Home
              </Button>
            </div>
          </CardFooter>
        </Card>
        
        <div className="text-center text-sm text-gray-400 mt-8">
          <p>Use these credentials for testing purposes only</p>
          <p className="mt-1">Development domain: {window.location.hostname}</p>
        </div>
      </div>
    </div>
  );
};

export default DevAuthUtilityPage;