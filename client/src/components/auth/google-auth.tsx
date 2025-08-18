import { useState, useEffect } from "react";
import { AlertTriangle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { GoogleLoginButton } from "@/components/auth/google-login-button";
import { DomainAuthAlert } from "@/components/auth/domain-auth-alert";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { checkFirebaseConfig } from "@/utils/auth-diagnostics";
import { SimpleFirebaseAuth } from "@/components/auth/simple-firebase-auth";
import { FirebaseDirectAuth } from "@/components/auth/firebase-direct-auth";
import { RedirectOnlyAuth } from "@/components/auth/redirect-only-auth";
import { FirebaseConfigTest } from "@/components/auth/firebase-config-test";

/**
 * Google Authentication component with enhanced error handling
 * Uses our optimized GoogleLoginButton for authentication
 */
export function GoogleAuth() {
  const { isLoading } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [configIssues, setConfigIssues] = useState<string[]>([]);
  
  // Check Firebase configuration on component mount
  useEffect(() => {
    const config = checkFirebaseConfig();
    // Log issues but don't block sign-in attempts
    if (!config.isConfigured) {
      console.warn("Firebase configuration issues detected:", config);
      setConfigIssues(config.issues);
    }
  }, []);

  return (
    <div className="space-y-4">
      {/* Domain auth alert removed per user request */}
      {/* <DomainAuthAlert /> */}
      
      {/* Show error message if any */}
      {errorMessage && (
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Authentication Error</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}
      
      {/* Primary: Redirect-only authentication (most reliable) */}
      <RedirectOnlyAuth />
      
      {/* Secondary: Direct Firebase auth with popup */}
      <div className="mt-4 pt-4 border-t border-gray-600">
        <p className="text-xs text-gray-400 text-center mb-3">
          Alternative: Direct Firebase authentication (popup)
        </p>
        <FirebaseDirectAuth />
      </div>
      
      {/* Third: Simplified Firebase auth */}
      <div className="mt-4 pt-4 border-t border-gray-600">
        <p className="text-xs text-gray-400 text-center mb-3">
          Alternative: Simplified Firebase authentication
        </p>
        <SimpleFirebaseAuth />
      </div>
      
      {/* Configuration Test */}
      <div className="mt-4 pt-4 border-t border-gray-600">
        <p className="text-xs text-gray-400 text-center mb-3">
          Troubleshooting: Test Firebase configuration
        </p>
        <FirebaseConfigTest />
      </div>
      
      {/* Fallback: Complex auth system */}
      <div className="mt-4 pt-4 border-t border-gray-600">
        <p className="text-xs text-gray-400 text-center mb-3">
          Last resort: Complex auth system
        </p>
        <GoogleLoginButton 
          variant="outline"
          fullWidth={true}
          text="Try Complex Auth"
          data-testid="google-auth-button"
        />
      </div>
      
      <div className="text-xs text-gray-400 text-center space-y-1">
        <p>Uses popup authentication for faster login</p>
        <p>If popup is blocked, we'll offer redirect backup</p>
      </div>
      
      {/* Diagnostic info to help with debugging */}
      <div className="text-xs text-gray-500 mt-1 text-center">
        {navigator.onLine ? (
          <span className="text-green-600">✓ Connected to Internet</span>
        ) : (
          <span className="text-red-600">✗ No Internet Connection</span>
        )}
        {' • '}
        <span className="font-mono">{window.location.hostname}</span>
      </div>
      
      {/* Link to Firebase console for debugging */}
      {configIssues.length === 0 && (
        <div className="text-center mt-2">
          <Button
            variant="link"
            className="text-xs text-blue-600 h-auto p-0"
            onClick={() => window.open('https://console.firebase.google.com/project/_/authentication/providers', '_blank')}
          >
            <ExternalLink className="h-3 w-3 mr-1" />
            Open Firebase Authentication Settings
          </Button>
        </div>
      )}
    </div>
  );
}