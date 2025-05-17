import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';

/**
 * Replit Domain Login
 * 
 * A specialized login solution that works on Replit domains without any external
 * authentication providers. This acts as a direct fallback when Google authentication
 * refuses to connect on Replit domains.
 */
const ReplitDomainLogin: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const { toast } = useToast();
  const [_, navigate] = useLocation();

  // Check if already authenticated from localStorage on initial load
  useEffect(() => {
    const userData = localStorage.getItem('user_data');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        if (user && user.id) {
          setIsAuthenticated(true);
        }
      } catch (e) {
        console.error("Error parsing user data from localStorage:", e);
        localStorage.removeItem('user_data');
      }
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // First try direct API route
      const response = await fetch('/api/auth/direct-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        // If direct login fails, try demo login
        const demoResponse = await fetch('/api/auth/demo-login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });

        if (!demoResponse.ok) {
          throw new Error('Invalid credentials');
        }

        const data = await demoResponse.json();
        // Store in localStorage for persistence
        localStorage.setItem('user_data', JSON.stringify(data.user));
        localStorage.setItem('auth_token', data.token);
        setIsAuthenticated(true);
        
        toast({
          title: "Login Successful",
          description: "You've been logged in successfully using demo credentials."
        });
        
        setTimeout(() => {
          navigate('/dashboard');
        }, 1000);
      } else {
        const data = await response.json();
        // Store in localStorage for persistence
        localStorage.setItem('user_data', JSON.stringify(data.user));
        localStorage.setItem('auth_token', data.token);
        setIsAuthenticated(true);
        
        toast({
          title: "Login Successful",
          description: "You've been logged in successfully."
        });
        
        setTimeout(() => {
          navigate('/dashboard');
        }, 1000);
      }
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || "Failed to login. Please try again.");
      
      toast({
        title: "Login Failed",
        description: err.message || "Failed to login. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user_data');
    localStorage.removeItem('auth_token');
    setIsAuthenticated(false);
    
    toast({
      title: "Logged Out",
      description: "You've been logged out successfully."
    });
  };

  const handleDemoLogin = async () => {
    setEmail('demo@example.com');
    setPassword('demo123');
    
    setLoading(true);
    setError(null);
    
    try {
      // Try demo login
      const response = await fetch('/api/auth/demo-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'demo@example.com' })
      });

      if (!response.ok) {
        throw new Error('Demo login failed');
      }

      const data = await response.json();
      // Store in localStorage for persistence
      localStorage.setItem('user_data', JSON.stringify(data.user));
      localStorage.setItem('auth_token', data.token);
      setIsAuthenticated(true);
      
      toast({
        title: "Demo Login Successful",
        description: "You've been logged in with the demo account."
      });
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } catch (err: any) {
      console.error("Demo login error:", err);
      setError(err.message || "Failed to login with demo account.");
      
      toast({
        title: "Demo Login Failed",
        description: err.message || "Failed to login with demo account.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
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
            <h2 className="text-3xl font-bold text-white">Replit Domain Login</h2>
            <p className="text-gray-400 mt-1">Optimized for Replit domains</p>
          </div>
          
          {isAuthenticated ? (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-green-500/20 to-teal-500/20 text-white p-4 rounded-lg backdrop-blur-sm">
                <div className="font-medium text-lg">✓ Successfully Logged In</div>
                <div className="mt-2 text-sm text-gray-200">
                  <p>You are now authenticated on this Replit domain.</p>
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
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label htmlFor="email" className="text-gray-200">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="bg-gray-900/80 border-gray-700 text-white"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="password" className="text-gray-200">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="bg-gray-900/80 border-gray-700 text-white"
                    required
                  />
                </div>
                
                {error && (
                  <div className="p-3 bg-red-900/30 rounded-md border border-red-800">
                    <p className="text-red-300 text-sm">{error}</p>
                  </div>
                )}
                
                <Button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={loading}
                >
                  {loading ? 'Logging in...' : 'Login'}
                </Button>
              </form>
              
              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-700"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-black bg-opacity-50 px-2 text-sm text-gray-400">Or</span>
                </div>
              </div>
              
              <Button 
                onClick={handleDemoLogin}
                className="w-full bg-purple-700 hover:bg-purple-800"
                disabled={loading}
              >
                {loading ? 'Connecting...' : 'Use Demo Account'}
              </Button>
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-6 text-center text-gray-500 text-sm max-w-lg">
        <p>This login method is specifically optimized for Replit domains where Google authentication may not work due to security restrictions.</p>
      </div>
    </div>
  );
};

export default ReplitDomainLogin;