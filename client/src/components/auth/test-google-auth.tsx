import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon, AlertTriangle } from "lucide-react";

/**
 * Test component for Google Authentication
 * 
 * This component provides a clean environment to test Google authentication
 * with detailed diagnostics to help troubleshoot any issues.
 */
export function TestGoogleAuth() {
  const { signInWithGoogle, user, isAuthenticated, signOut } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [diagnosticInfo, setDiagnosticInfo] = useState<any>(null);
  
  // Try to authenticate with Google
  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log("Testing Google authentication...");
      
      // Capture environment information for diagnostics
      const envInfo = {
        userAgent: navigator.userAgent,
        hostname: window.location.hostname,
        protocol: window.location.protocol,
        hasLocalStorage: typeof localStorage !== 'undefined',
        hasSessionStorage: typeof sessionStorage !== 'undefined'
      };
      setDiagnosticInfo(envInfo);
      
      // Attempt to sign in with Google
      await signInWithGoogle();
      console.log("Google authentication successful");
    } catch (err: any) {
      console.error("Google auth test failed:", err);
      setError(err?.message || "Authentication failed");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Sign out to reset the state
  const handleSignOut = async () => {
    try {
      setIsLoading(true);
      await signOut();
      setDiagnosticInfo(null);
    } catch (err: any) {
      setError(err?.message || "Sign out failed");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="p-4 max-w-lg mx-auto mt-10">
      <Card>
        <CardHeader>
          <CardTitle>Google Authentication Test</CardTitle>
          <CardDescription>Test Google sign-in with enhanced diagnostics</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Authentication Status */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium mb-2">Authentication Status:</h3>
            <div className="flex items-center text-sm">
              <div className={`w-3 h-3 rounded-full mr-2 ${isAuthenticated ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span>{isAuthenticated ? 'Authenticated' : 'Not Authenticated'}</span>
            </div>
            
            {isAuthenticated && user && (
              <div className="mt-4 space-y-2 text-sm">
                <p><strong>Name:</strong> {user.name || 'Not available'}</p>
                <p><strong>Email:</strong> {user.email || 'Not available'}</p>
                <p><strong>UID:</strong> {user.uid || 'Not available'}</p>
                <p><strong>ID:</strong> {user.id || 'Not available'}</p>
                {user.photoURL && (
                  <img 
                    src={user.photoURL} 
                    alt="Profile" 
                    className="w-10 h-10 rounded-full" 
                  />
                )}
              </div>
            )}
          </div>
          
          {/* Error Messages */}
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Authentication Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {/* Diagnostic Information */}
          {diagnosticInfo && (
            <Alert>
              <InfoIcon className="h-4 w-4" />
              <AlertTitle>Diagnostic Information</AlertTitle>
              <AlertDescription>
                <pre className="text-xs mt-2 whitespace-pre-wrap">
                  {JSON.stringify(diagnosticInfo, null, 2)}
                </pre>
              </AlertDescription>
            </Alert>
          )}
          
          {/* Action Buttons */}
          <div className="flex space-x-4">
            {!isAuthenticated ? (
              <Button 
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? "Authenticating..." : "Test Google Sign-In"}
              </Button>
            ) : (
              <Button 
                onClick={handleSignOut}
                disabled={isLoading}
                variant="outline"
                className="w-full"
              >
                {isLoading ? "Signing Out..." : "Sign Out"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}