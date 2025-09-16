import React, { useState, useEffect } from 'react';
// Firebase imports removed - using custom OAuth only
// import { initializeApp } from 'firebase/app';
// import { getAuth, signInWithRedirect, GoogleAuthProvider, getRedirectResult, signOut } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { Loader2, ExternalLink, Check, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

/**
 * Replit Domain Login
 * 
 * A specialized Google login component specifically designed to work on Replit domains.
 * Uses an enhanced redirect flow with special parameters to improve compatibility.
 */
const ReplitDomainLogin: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [authInProgress, setAuthInProgress] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [redirectAttempted, setRedirectAttempted] = useState<boolean>(false);
  const { toast } = useToast();
  const [_, navigate] = useLocation();
  
  // Get hostname for display
  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
  
  // Firebase initialization removed - using custom OAuth only
  
  // Firebase removed - using custom OAuth only
  useEffect(() => {
    console.log("Custom OAuth initialization:", {
      environment: import.meta.env.MODE,
      hostname,
      authEndpoint: '/api/auth/oauth/google'
    });
    
    console.log("Using custom OAuth for Google authentication");
    
    // Check if we're returning from OAuth callback
    checkOAuthCallback();
  }, []);
  
  const checkOAuthCallback = async () => {
    try {
      setAuthInProgress(true);
      
      // Check if user is already authenticated via our custom OAuth
      const response = await fetch('/api/auth/me', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        
        toast({
          title: "Login Successful!",
          description: `Welcome back, ${userData.name || userData.email}`,
        });
        
        // Redirect to dashboard
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      }
    } catch (error: any) {
      console.error("OAuth callback error:", error);
      setError("Error processing authentication. Please try again.");
      
      toast({
        title: "Authentication Error",
        description: "Error processing authentication. Please try again.",
        variant: "destructive"
      });
    } finally {
      setAuthInProgress(false);
    }
  };
  
  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log("Starting custom OAuth Google sign-in...");
      setRedirectAttempted(true);
      
      // Use custom OAuth endpoint - this handles all domains properly
      window.location.href = '/api/auth/oauth/google';
      
    } catch (error: any) {
      console.error("Custom OAuth Sign In Error:", error);
      
      let errorMessage = "Failed to sign in with Google using custom OAuth";
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
      // Use custom OAuth logout endpoint
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
      
      if (response.ok) {
        setUser(null);
        toast({
          title: "Signed Out",
          description: "You have been successfully signed out."
        });
      } else {
        throw new Error('Logout failed');
      }
    } catch (error) {
      console.error("Sign out error:", error);
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  // Render OAuth setup information
  const renderSetupInstructions = () => (
    <div className="p-4 text-sm">
      <div className="mb-4 text-yellow-400 font-semibold">
        ✨ Custom OAuth Setup
      </div>
      <p className="mb-2 text-gray-300">Using unified custom OAuth for all domains:</p>
      <ol className="list-decimal pl-5 space-y-1 text-gray-400">
        <li><code className="bg-gray-800 px-1 rounded">{hostname}</code></li>
        <li><code className="bg-gray-800 px-1 rounded">*.replit.dev</code></li>
        <li><code className="bg-gray-800 px-1 rounded">*.replit.app</code></li>
        <li><code className="bg-gray-800 px-1 rounded">localhost</code></li>
      </ol>
      <div className="mt-3 text-xs text-gray-500">
        Custom OAuth handles all domain configurations automatically
      </div>
    </div>
  );
  
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
            <p className="text-gray-400 mt-1">Optimized for {hostname}</p>
          </div>
          
          {authInProgress && (
            <div className="space-y-4 text-center py-8">
              <div className="flex justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              </div>
              <p className="text-gray-300">Processing authentication...</p>
              <p className="text-gray-400 text-sm">You are being redirected back from Google.</p>
            </div>
          )}
          
          {!authInProgress && user ? (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-green-500/20 to-teal-500/20 text-white p-4 rounded-lg backdrop-blur-sm">
                <div className="flex items-center">
                  <Check className="text-green-500 h-5 w-5 mr-2" />
                  <div className="font-medium text-lg">Successfully Authenticated</div>
                </div>
                <div className="mt-3 text-sm text-gray-200">
                  <p><strong>Name:</strong> {user.displayName}</p>
                  <p><strong>Email:</strong> {user.email}</p>
                  {user.photoURL && (
                    <div className="mt-3 flex justify-center">
                      <img 
                        src={user.photoURL} 
                        alt="Profile" 
                        className="w-16 h-16 rounded-full border-2 border-white/20 object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>
              
              <Button 
                onClick={() => navigate('/industry-pulse')}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Go to Industry Pulse
              </Button>
              
              <Button 
                onClick={handleSignOut}
                variant="outline"
                className="w-full mt-2 bg-red-900/30 border-red-800/50 hover:bg-red-800/50 text-white"
              >
                Sign Out
              </Button>
            </div>
          ) : !authInProgress && (
            <div className="space-y-4">
              <Alert className="border-blue-800 bg-blue-900/20">
                <AlertTriangle className="h-4 w-4 text-blue-500" />
                <AlertTitle className="text-blue-400">Replit Domain Detected</AlertTitle>
                <AlertDescription className="text-blue-300 text-sm">
                  Using optimized redirect flow for Replit domains. No popup windows will be used.
                </AlertDescription>
              </Alert>
              
              {redirectAttempted && (
                <Alert className="border-yellow-800 bg-yellow-900/20">
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  <AlertTitle className="text-yellow-500">Redirect Attempted</AlertTitle>
                  <AlertDescription className="text-yellow-300 text-sm">
                    If you're seeing this, the redirect to Google may have failed. Try again or check domain settings.
                  </AlertDescription>
                </Alert>
              )}
              
              {error && (
                <div className="p-3 bg-red-900/30 rounded-md border border-red-800">
                  <p className="text-red-300 text-sm">{error}</p>
                </div>
              )}
              
              <Card className="border-gray-800 bg-black bg-opacity-40">
                <CardContent className="p-4">
                  {renderSetupInstructions()}
                </CardContent>
              </Card>
              
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
                {loading ? 'Connecting...' : 'Sign in with Google (Redirect)'}
              </Button>
              
              <div className="text-center mt-4">
                <a 
                  href="https://console.firebase.google.com/" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 text-sm flex items-center justify-center"
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Firebase Console
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReplitDomainLogin;