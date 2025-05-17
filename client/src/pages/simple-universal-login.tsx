import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

/**
 * Simple Universal Login Page - Works on all Replit domains
 * 
 * This login page uses local storage for authentication to ensure
 * it works on all Replit domains without external dependencies.
 */
const SimpleUniversalLoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [_, navigate] = useLocation();
  const { toast } = useToast();

  // Handle demo login without making API calls
  const handleDemoLogin = () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Create a mock user object
      const demoUser = {
        id: 1,
        username: 'demo-user',
        email: 'demo@brandentifier.com',
        name: 'Demo User',
        photoURL: null,
        title: 'Professional',
        lastLogin: new Date().toISOString()
      };
      
      // Store in local storage
      localStorage.setItem('user_session', JSON.stringify(demoUser));
      
      setSuccess(`Logged in as: Demo User`);
      toast({
        title: "Login Successful",
        description: `Logged in as: Demo User`,
      });
      
      // Redirect to dashboard after a brief delay
      setTimeout(() => navigate('/dashboard'), 1000);
    } catch (err: any) {
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

  // Handle custom login
  const handleCustomLogin = () => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!email) {
        throw new Error("Email is required");
      }
      
      const displayName = name || 'User';
      
      // Create a user object with the provided details
      const customUser = {
        id: Date.now(), // Use timestamp as a unique ID
        username: email.split('@')[0],
        email,
        name: displayName,
        photoURL: null,
        title: 'Professional',
        lastLogin: new Date().toISOString()
      };
      
      // Store in local storage
      localStorage.setItem('user_session', JSON.stringify(customUser));
      
      setSuccess(`Logged in as: ${displayName}`);
      toast({
        title: "Login Successful",
        description: `Logged in as: ${displayName}`,
      });
      
      // Redirect to dashboard after a brief delay
      setTimeout(() => navigate('/dashboard'), 1000);
    } catch (err: any) {
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

  // Check if a user is stored in local storage
  const userData = localStorage.getItem('user_session');
  const isAuthenticated = !!userData;
  const user = userData ? JSON.parse(userData) : null;

  const handleLogout = () => {
    localStorage.removeItem('user_session');
    window.location.reload();
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
            <CardTitle className="text-white">Universal Login</CardTitle>
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
                
                <Button 
                  onClick={handleLogout}
                  variant="outline"
                  className="w-full mt-3 bg-red-900 bg-opacity-30 hover:bg-red-900 hover:bg-opacity-50 text-white"
                >
                  Sign Out
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
                  onClick={handleCustomLogin}
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
                  onClick={handleDemoLogin}
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
              <p>Works on all domains with local storage</p>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default SimpleUniversalLoginPage;