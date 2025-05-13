import { useState } from "react";
import { Loader2, AlertTriangle, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function GoogleAuth() {
  const { signInWithGoogle, isLoading } = useAuth();
  const [showFirebaseHelp, setShowFirebaseHelp] = useState(false);
  const [copied, setCopied] = useState(false);
  const currentDomain = window.location.hostname;
  
  // List of domains to add to Firebase
  const domainsToAdd = [
    currentDomain,
    `${currentDomain}.replit.app`,
    "*.replit.dev",
    "*.replit.app"
  ];
  
  const handleSignIn = async () => {
    try {
      // Before sign-in, prepare to show domain helper if it fails
      setShowFirebaseHelp(true);
      await signInWithGoogle();
    } catch (error) {
      console.error("Google sign-in failed:", error);
      // Keep the helper showing if there was an error
      setShowFirebaseHelp(true);
    }
  };
  
  const copyInstructions = () => {
    const text = `Add these domains to Firebase Auth > Settings > Authorized domains:
${domainsToAdd.map((domain, index) => `${index + 1}. ${domain}`).join('\n')}`;
    
    navigator.clipboard.writeText(text)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      })
      .catch(err => {
        console.error('Failed to copy text: ', err);
      });
  };

  return (
    <div className="space-y-4">
      <Button
        variant="outline"
        onClick={handleSignIn}
        disabled={isLoading}
        className="w-full"
      >
        {isLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <svg
            className="mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 48 48"
          >
            <path
              fill="#FFC107"
              d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
            />
            <path
              fill="#FF3D00"
              d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
            />
            <path
              fill="#4CAF50"
              d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
            />
            <path
              fill="#1976D2"
              d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
            />
          </svg>
        )}
        Continue with Google
      </Button>
      
      {showFirebaseHelp && (
        <Alert variant="destructive" className="mt-4 border-red-500">
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle className="text-lg font-bold">Firebase Setup Required</AlertTitle>
          <AlertDescription className="mt-2">
            <p className="mb-2">
              This domain needs to be added to Firebase authorized domains. Add these domains
              to your Firebase console:
            </p>
            <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md my-2">
              <ul className="list-decimal pl-5 space-y-1">
                {domainsToAdd.map((domain, index) => (
                  <li key={index} className="font-mono text-sm">{domain}</li>
                ))}
              </ul>
            </div>
            <p className="text-sm mt-2">
              Go to Firebase Console → Authentication → Settings → Authorized domains → Add domain
            </p>
            <Button 
              onClick={copyInstructions}
              variant="outline" 
              size="sm"
              className="mt-3 text-xs"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-1" /> Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-1" /> Copy Instructions
                </>
              )}
            </Button>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}