import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

/**
 * Easy Login Page - Ultra Simplified Authentication
 * 
 * This component provides a streamlined login experience that works
 * on all domains by using local storage for authentication state.
 */
const EasyLoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  
  // Check if user is already logged in
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  
  useEffect(() => {
    // Check local storage for user data
    const storedUser = localStorage.getItem('user_data');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setIsLoggedIn(true);
        setUserData(parsedUser);
      } catch (err) {
        console.error('Failed to parse stored user data', err);
        localStorage.removeItem('user_data');
      }
    }
  }, []);
  
  const handleLogin = (useDemo: boolean = false) => {
    try {
      setIsLoading(true);
      
      // Use demo values or form values
      const userEmail = useDemo ? 'demo@brandentifier.com' : email;
      const userName = useDemo ? 'Demo User' : name || 'User';
      
      if (!useDemo && !email) {
        toast({
          title: "Email Required",
          description: "Please enter your email to continue",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }
      
      // Create user object
      const user = {
        id: Date.now(),
        email: userEmail,
        name: userName,
        role: 'user',
        createdAt: new Date().toISOString()
      };
      
      // Store in local storage
      localStorage.setItem('user_data', JSON.stringify(user));
      
      // Update state
      setIsLoggedIn(true);
      setUserData(user);
      
      toast({
        title: "Login Successful",
        description: `Welcome, ${userName}!`
      });
      
      // Wait briefly, then redirect
      setTimeout(() => {
        navigate('/dashboard');
      }, 800);
    } catch (err: any) {
      toast({
        title: "Login Failed",
        description: err.message || "Something went wrong",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleLogout = () => {
    localStorage.removeItem('user_data');
    setIsLoggedIn(false);
    setUserData(null);
    toast({
      title: "Logged Out",
      description: "You have been logged out successfully"
    });
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
            <h2 className="text-3xl font-bold text-white">Brandentifier</h2>
            <p className="text-gray-400 mt-1">Ultra-Simple Login (Works Everywhere)</p>
          </div>
          
          {isLoggedIn ? (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-green-500/20 to-teal-500/20 text-white p-4 rounded-lg backdrop-blur-sm">
                <div className="font-medium text-lg">✓ Logged in successfully</div>
                <div className="mt-1 text-sm text-gray-200">
                  <p><strong>Name:</strong> {userData?.name}</p>
                  <p><strong>Email:</strong> {userData?.email}</p>
                </div>
              </div>
              
              <Button 
                onClick={() => navigate('/dashboard')}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Go to Dashboard
              </Button>
              
              <Button 
                onClick={handleLogout}
                variant="outline"
                className="w-full mt-2 bg-red-900/30 border-red-800/50 hover:bg-red-800/50 text-white"
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
                  className="bg-gray-900/90 border-gray-700 text-white"
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
                  className="bg-gray-900/90 border-gray-700 text-white"
                />
              </div>
              
              <Button 
                onClick={() => handleLogin(false)}
                className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700"
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign in with Email'}
              </Button>
              
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-700"></span>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-2 text-gray-400 bg-black bg-opacity-70">Or use this option</span>
                </div>
              </div>
              
              <Button 
                onClick={() => handleLogin(true)}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
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
        </div>
      </div>
      
      <div className="mt-6 text-center text-gray-500 text-sm">
        <p>Built with the Neo-Glass UI design system</p>
        <p className="mt-1">Works on all domains via local storage 🚀</p>
      </div>
    </div>
  );
};

export default EasyLoginPage;