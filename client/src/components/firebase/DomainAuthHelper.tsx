import { useState } from "react";
import { Copy, Check, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

/**
 * Helper component that shows instructions for adding domains to Firebase
 * when authentication fails due to domain issues
 */
export function DomainAuthHelper() {
  const [copied, setCopied] = useState(false);
  const currentDomain = window.location.hostname;
  
  // List of domains to add to Firebase
  const domainsToAdd = [
    currentDomain,
    `${currentDomain}.replit.app`,
    "*.replit.dev",
    "*.replit.app"
  ];
  
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
  );
}