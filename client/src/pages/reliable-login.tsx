import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/use-auth';
import { apiRequest } from '@/lib/queryClient';

/**
 * Reliable Login Page - Works on all Replit domains
 * 
 * This login page bypasses external OAuth providers and uses a direct
 * API call to the backend for authentication. This ensures it works
 * on all Replit domains regardless of cross-domain restrictions.
 */
const ReliableLoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const { user, signInWithEmail, isAuthenticated } = useAuth();

  // Check if user is already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log("User already authenticated, redirecting to dashboard");
      setSuccess(`Already logged in as: ${user.name || user.email}`);
      setTimeout(() => navigate('/dashboard'), 1000);
    }
  }, [isAuthenticated, user, navigate]);

  const handleLoginDirectly = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!email) {
        throw new Error("Email is required");
      }
      
      // Use demo credentials if no name provided
      const displayName = name || 'Demo User';
      
      // Direct backend call to create/login a user
      const response = await fetch('/api/auth/demo-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          name: displayName,
        }),
      });
      
      const result = await response.json();
      
      if (!result || !result.success) {
        throw new Error(result?.message || "Login failed");
      }
      
      // Call the auth context method to set up user session
      // Create a compatible user object with all required properties
      const authUser = {
        id: result.user.id,
        username: result.user.username,
        email: result.user.email,
        name: result.user.name || null,
        title: result.user.title || null,
        aboutMe: null,
        location: result.user.location || null,
        password: null,
        phoneNumber: null,
        photoURL: null,
        isVerified: true,
        googleId: null,
        facebookId: null,
        twitterId: null,
        appleId: null,
        githubId: null,
        linkedinId: null,
        lastLogin: new Date(),
        createdAt: null
      };
      
      signInWithEmail(authUser);
      
      setSuccess(`Logged in as: ${displayName}`);
      toast({
        title: "Login Successful",
        description: `Logged in as: ${displayName}`,
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

  const handleDemoUser = async () => {
    setEmail("demo@brandentifier.com");
    setName("Demo User");
    
    setTimeout(() => handleLoginDirectly(), 500);
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
            <CardTitle className="text-white">Reliable Login</CardTitle>
            <CardDescription className="text-gray-300">
              Sign in to access your account (works on all domains)
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
            
            {isAuthenticated ? (
              <div className="py-4 text-center">
                <div className="bg-gradient-to-r from-green-500 to-teal-500 text-white py-3 px-4 rounded-md mb-4 backdrop-blur-sm">
                  <div className="font-medium">✓ Authenticated Successfully</div>
                  <div className="mt-2 text-sm text-gray-100">{user?.name || user?.email}</div>
                </div>
                
                <Button 
                  onClick={() => navigate('/dashboard')}
                  className="w-full bg-blue-600 hover:bg-blue-700 mt-3"
                >
                  Go to Dashboard
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
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
                  <Label htmlFor="name" className="text-gray-300">Name (optional)</Label>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your Name"
                    className="bg-gray-900 border-gray-700 text-white"
                  />
                </div>
                
                <Button 
                  onClick={handleLoginDirectly}
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
                    <span className="px-2 text-gray-400 bg-black bg-opacity-70">Or try a quick option</span>
                  </div>
                </div>
                
                <Button 
                  onClick={handleDemoUser}
                  variant="outline"
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 text-white"
                  disabled={isLoading}
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Use Demo Account
                </Button>
              </div>
            )}
            
            {error && (
              <div className="mt-4 p-3 bg-red-900 bg-opacity-30 rounded-md border border-red-800">
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}
            
            {success && !isAuthenticated && (
              <div className="mt-4 p-3 bg-green-900 bg-opacity-30 rounded-md border border-green-800">
                <p className="text-green-300 text-sm">{success}</p>
              </div>
            )}
          </CardContent>
          
          <CardFooter>
            <div className="w-full text-center text-sm text-gray-500">
              <p>Works on all domains - no external redirects</p>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default ReliableLoginPage;