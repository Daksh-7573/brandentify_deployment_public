import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useDevAuth } from '@/hooks/use-dev-auth';
import { useLocation } from 'wouter';
import { auth } from '@/lib/firebase';
import { getRedirectResult } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';

const DevLoginPage: React.FC = () => {
  const { isLoading, isAuthenticated, error, signInWithGoogle, signOut } = useDevAuth();
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const [redirectInProgress, setRedirectInProgress] = useState(false);
  const [debugInfo, setDebugInfo] = useState<Record<string, any>>({});
  
  // Check for redirect result on page load
  useEffect(() => {
    const checkRedirectResult = async () => {
      try {
        console.log("Checking for redirect result...");
        setRedirectInProgress(true);
        
        const result = await getRedirectResult(auth);
        
        if (result) {
          console.log("Redirect authentication successful!", result.user.displayName);
          
          toast({
            title: "Authentication Successful",
            description: `Welcome back, ${result.user.displayName}!`,
          });
          
          // Redirect to dashboard on successful login
          setTimeout(() => navigate('/industry-pulse'), 1000);
        } else {
          console.log("No redirect result found");
          const redirectAttempt = localStorage.getItem('dev_auth_redirect');
          if (redirectAttempt) {
            // Clean up
            localStorage.removeItem('dev_auth_redirect');
            const authTime = localStorage.getItem('dev_auth_time');
            const timeElapsed = authTime ? Date.now() - parseInt(authTime) : 0;
            
            if (timeElapsed < 10000) { // Less than 10 seconds
              toast({
                title: "Authentication Failed",
                description: "Google authentication was interrupted. Please try again.",
                variant: "destructive"
              });
            }
          }
        }
      } catch (error: any) {
        console.error("Error handling redirect:", error);
        toast({
          title: "Authentication Error",
          description: `Failed to complete authentication: ${error.message}`,
          variant: "destructive"
        });
      } finally {
        setRedirectInProgress(false);
      }
    };
    
    checkRedirectResult();
    
    // Collect debug info
    setDebugInfo({
      domain: window.location.host,
      protocol: window.location.protocol,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      isAuthenticated: auth.currentUser !== null,
      currentUser: auth.currentUser ? {
        displayName: auth.currentUser.displayName,
        email: auth.currentUser.email,
        uid: auth.currentUser.uid,
        providerId: auth.currentUser.providerData[0]?.providerId
      } : null
    });
  }, [navigate, toast]);
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black bg-opacity-90 p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Development Login</h1>
          <p className="text-gray-400 mb-8">Special authentication for development environment</p>
        </div>
        
        <Card className="w-full backdrop-blur-lg bg-black bg-opacity-40 border border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Google Authentication</CardTitle>
            <CardDescription className="text-gray-400">
              This specialized login uses redirect-based authentication which works better on Replit domains
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {isAuthenticated ? (
              <div className="py-4 text-center">
                <div className="bg-gradient-to-r from-green-500 to-teal-500 text-white py-2 px-4 rounded-md mb-4">
                  ✓ Authentication Successful
                </div>
                <p className="text-gray-300">
                  You are logged in as <span className="font-semibold">{auth.currentUser?.displayName}</span>
                </p>
              </div>
            ) : (
              <div className="py-4">
                <Button 
                  onClick={signInWithGoogle}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-2 flex items-center justify-center"
                  disabled={isLoading || redirectInProgress}
                >
                  {isLoading || redirectInProgress ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {redirectInProgress ? "Completing Authentication..." : "Starting Google Login..."}
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                      Continue with Google
                    </>
                  )}
                </Button>
                
                {error && (
                  <div className="mt-4 text-red-500 bg-red-900 bg-opacity-20 p-3 rounded-md text-sm">
                    {error}
                  </div>
                )}
              </div>
            )}
          </CardContent>
          
          <CardFooter className="flex flex-col">
            {isAuthenticated && (
              <Button 
                onClick={signOut}
                variant="outline" 
                className="w-full border-red-700 text-red-400 hover:bg-red-900 hover:bg-opacity-30"
              >
                Sign Out
              </Button>
            )}
            
            <div className="w-full mt-4">
              <Button
                onClick={() => navigate('/')}
                variant="ghost"
                className="w-full text-gray-400 hover:text-gray-200"
              >
                Back to Home
              </Button>
            </div>
            
            <div className="mt-6 text-xs text-gray-500 space-y-1">
              <p>Domain: {debugInfo.domain}</p>
              <p>Auth Status: {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}</p>
              {debugInfo.currentUser && (
                <p>User: {debugInfo.currentUser.displayName} ({debugInfo.currentUser.email})</p>
              )}
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default DevLoginPage;