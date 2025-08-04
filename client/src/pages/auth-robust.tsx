import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, LogIn, Chrome } from 'lucide-react';

export default function AuthRobust() {
  const [isLoading, setIsLoading] = useState(false);
  const [authMethod, setAuthMethod] = useState<'redirect' | 'popup'>('redirect');
  const [logs, setLogs] = useState<string[]>([]);
  const { toast } = useToast();

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
    console.log(message);
  };

  // Check for redirect result on page load
  useEffect(() => {
    const checkRedirectResult = async () => {
      try {
        addLog("Checking for authentication redirect result...");
        
        const { getRedirectResult } = await import('firebase/auth');
        const { auth } = await import('@/lib/firebase');
        
        const result = await getRedirectResult(auth);
        
        if (result && result.user) {
          addLog(`SUCCESS: Found redirect result for ${result.user.email}`);
          
          // Set success flags
          sessionStorage.setItem('authSuccess', 'true');
          sessionStorage.setItem('redirect_auth_success', JSON.stringify({
            email: result.user.email,
            uid: result.user.uid,
            timestamp: new Date().toISOString()
          }));
          
          toast({
            title: "Authentication Successful",
            description: `Welcome ${result.user.displayName || result.user.email}!`,
          });
          
          // Redirect to main app
          setTimeout(() => {
            window.location.href = '/industry-pulse';
          }, 1500);
          
        } else {
          addLog("No redirect result found");
          
          // Check if user is already authenticated
          if (auth.currentUser) {
            addLog(`User already authenticated: ${auth.currentUser.email}`);
            setTimeout(() => {
              window.location.href = '/industry-pulse';
            }, 1000);
          }
        }
      } catch (error: any) {
        addLog(`Error checking redirect result: ${error.message}`);
      }
    };

    // Check URL for authentication parameters
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('code') || urlParams.has('state') || sessionStorage.getItem('redirect_auth_attempt')) {
      checkRedirectResult();
    }
  }, []);

  const signInWithRedirect = async () => {
    setIsLoading(true);
    try {
      addLog("Starting Google redirect authentication...");
      
      const { signInWithRedirect } = await import('firebase/auth');
      const { auth, googleProvider } = await import('@/lib/firebase');
      
      // Set redirect attempt flags
      sessionStorage.setItem('redirect_auth_attempt', 'true');
      sessionStorage.setItem('redirect_auth_time', new Date().toISOString());
      
      addLog("Redirecting to Google for authentication...");
      await signInWithRedirect(auth, googleProvider);
      
    } catch (error: any) {
      addLog(`Redirect auth failed: ${error.message}`);
      
      toast({
        title: "Redirect Failed",
        description: "Trying popup authentication instead...",
      });
      
      // Fallback to popup
      setAuthMethod('popup');
      setTimeout(() => signInWithPopup(), 1000);
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithPopup = async () => {
    setIsLoading(true);
    try {
      addLog("Starting Google popup authentication...");
      
      const { signInWithPopup } = await import('firebase/auth');
      const { auth, googleProvider } = await import('@/lib/firebase');
      
      addLog("Opening Google authentication popup...");
      const result = await signInWithPopup(auth, googleProvider);
      
      if (result.user) {
        addLog(`SUCCESS: Popup authentication completed for ${result.user.email}`);
        
        // Set success flags
        sessionStorage.setItem('authSuccess', 'true');
        sessionStorage.setItem('popup_auth_success', JSON.stringify({
          email: result.user.email,
          uid: result.user.uid,
          timestamp: new Date().toISOString()
        }));
        
        toast({
          title: "Authentication Successful",
          description: `Welcome ${result.user.displayName || result.user.email}!`,
        });
        
        // Redirect to main app
        setTimeout(() => {
          window.location.href = '/industry-pulse';
        }, 1500);
      }
      
    } catch (error: any) {
      addLog(`Popup auth failed: ${error.message}`);
      
      let errorMessage = "Authentication failed. Please try again.";
      
      if (error.code === 'auth/popup-blocked') {
        errorMessage = "Popup was blocked. Please allow popups and try again.";
      } else if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = "Authentication was cancelled.";
      } else if (error.code === 'auth/unauthorized-domain') {
        errorMessage = "Domain not authorized. Please contact support.";
      }
      
      toast({
        title: "Authentication Error",
        description: errorMessage,
        variant: "destructive"
      });
      
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6">
        <Card className="backdrop-blur-lg bg-white/10 border-white/20">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-white">Authentication Test</CardTitle>
            <CardDescription className="text-gray-300">
              Enhanced authentication with multiple methods
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Button 
                onClick={signInWithRedirect}
                disabled={isLoading}
                className="w-full bg-red-600 hover:bg-red-700 text-white"
                size="lg"
              >
                {isLoading && authMethod === 'redirect' ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Chrome className="mr-2 h-4 w-4" />
                )}
                Sign in with Google (Redirect)
              </Button>
              
              <Button 
                onClick={signInWithPopup}
                disabled={isLoading}
                variant="outline"
                className="w-full border-white/20 text-white hover:bg-white/10"
                size="lg"
              >
                {isLoading && authMethod === 'popup' ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <LogIn className="mr-2 h-4 w-4" />
                )}
                Sign in with Google (Popup)
              </Button>
            </div>
            
            <div className="text-xs text-gray-400 text-center">
              Redirect method works better on Replit domains.<br/>
              Popup is a fallback option.
            </div>
          </CardContent>
        </Card>
        
        {logs.length > 0 && (
          <Card className="backdrop-blur-lg bg-black/30 border-white/20">
            <CardHeader>
              <CardTitle className="text-sm text-white">Authentication Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-black/50 rounded p-3 font-mono text-xs text-green-400 max-h-40 overflow-y-auto">
                {logs.map((log, index) => (
                  <div key={index} className="mb-1">{log}</div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}