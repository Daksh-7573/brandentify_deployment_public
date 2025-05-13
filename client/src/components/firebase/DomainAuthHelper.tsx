import React, { useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Copy as CopyIcon, AlertCircle as AlertCircleIcon, CheckCircle as CheckCircleIcon } from "lucide-react";

/**
 * Component to help users add the current domain to Firebase authorized domains
 * This appears when the auth/unauthorized-domain error is encountered
 */
export const DomainAuthHelper: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const currentDomain = window.location.hostname;
  
  // List of domains that need to be added to Firebase auth
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
      <AlertCircleIcon className="h-5 w-5" />
      <AlertTitle className="text-lg font-bold">Firebase Authorization Required</AlertTitle>
      <AlertDescription className="mt-2">
        <p className="mb-2">
          This domain is not authorized for Firebase authentication. You need to add the following domains
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
              <CheckCircleIcon className="h-4 w-4 mr-1" /> Copied!
            </>
          ) : (
            <>
              <CopyIcon className="h-4 w-4 mr-1" /> Copy Instructions
            </>
          )}
        </Button>
      </AlertDescription>
    </Alert>
  );
};

export default DomainAuthHelper;