import { useState, useEffect } from "react";
import { Copy, Check, AlertTriangle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from "@/components/ui/card";
import { checkFirebaseConfig } from "@/utils/auth-diagnostics";

/**
 * Enhanced helper component that shows detailed instructions for adding domains to Firebase
 * when authentication fails due to domain issues
 */
export function DomainAuthHelper() {
  const [copied, setCopied] = useState(false);
  const [configCheck, setConfigCheck] = useState<{
    projectIdExists: boolean;
    apiKeyLength: number;
    appIdLength: number;
  } | null>(null);
  const [configIssues, setConfigIssues] = useState<string[]>([]);
  
  const currentDomain = window.location.hostname;
  
  // List of domains to add to Firebase (matches the list in firebase.ts)
  const domainsToAdd = [
    currentDomain,
    // Handle Replit deployment domains
    `${currentDomain.replace(/\./g, "-")}.replit.app`,
    // Include standard Firebase and development domains
    "localhost",
    "127.0.0.1",
    "*.replit.dev",
    "*.replit.app"
  ];
  
  // Check Firebase configuration on mount
  useEffect(() => {
    const result = checkFirebaseConfig();
    console.log("Firebase config check:", result);
    
    // Update our local state for display
    setConfigCheck({
      projectIdExists: result.configDetails.projectIdExists,
      apiKeyLength: result.configDetails.apiKeyLength,
      appIdLength: result.configDetails.appIdLength,
    });
    
    // Set the configuration issues for display
    setConfigIssues(result.issues);
  }, []);
  
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
    <Card className="mt-6 border-red-300 shadow-md">
      <CardHeader className="bg-red-50 dark:bg-red-950/30">
        <div className="flex items-start gap-2">
          <AlertTriangle className="h-5 w-5 text-red-600 mt-1" />
          <div>
            <CardTitle className="text-lg font-bold text-red-700">Firebase Authentication Error</CardTitle>
            <CardDescription className="text-red-600">
              This domain is not authorized in your Firebase project configuration
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Config Check Results */}
          {configCheck && (
            <div className="mb-6 bg-amber-50 p-3 rounded-md border border-amber-200">
              <h4 className="font-semibold text-amber-800 mb-2 flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2 text-amber-600" />
                Firebase Configuration Check
              </h4>
              <ul className="space-y-1 text-sm">
                <li className="flex items-center">
                  <span className={configCheck.projectIdExists ? "text-green-600" : "text-red-600"}>
                    {configCheck.projectIdExists ? "✓" : "✗"} Project ID: {configCheck.projectIdExists ? "Found" : "Missing"}
                  </span>
                </li>
                <li className="flex items-center">
                  <span className={configCheck.apiKeyLength > 30 ? "text-green-600" : "text-red-600"}>
                    {configCheck.apiKeyLength > 30 ? "✓" : "✗"} API Key: {configCheck.apiKeyLength > 0 ? "Length: " + configCheck.apiKeyLength : "Missing"}
                  </span>
                </li>
                <li className="flex items-center">
                  <span className={configCheck.appIdLength > 20 ? "text-green-600" : "text-red-600"}>
                    {configCheck.appIdLength > 20 ? "✓" : "✗"} App ID: {configCheck.appIdLength > 0 ? "Length: " + configCheck.appIdLength : "Missing"}
                  </span>
                </li>
              </ul>
              
              {/* Show any additional configuration issues */}
              {configIssues.length > 0 && (
                <div className="mt-3 border-t border-amber-200 pt-3">
                  <h5 className="font-semibold text-amber-800 mb-1">Configuration Issues:</h5>
                  <ul className="list-disc pl-5 space-y-1 text-xs text-amber-800">
                    {configIssues.map((issue, index) => (
                      <li key={index}>{issue}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        
          <h3 className="font-semibold text-lg">To fix this issue:</h3>
          
          <div className="space-y-2">
            <p className="mb-2">
              Add these domains to your Firebase authorized domains list:
            </p>
            <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-md my-2 border border-gray-200 dark:border-gray-800">
              <ul className="list-decimal pl-5 space-y-1">
                {domainsToAdd.map((domain, index) => (
                  <li key={index} className="font-mono text-sm select-all">{domain}</li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-md space-y-2 border border-blue-200 dark:border-blue-900">
            <h4 className="font-semibold text-blue-800 dark:text-blue-400">Step-by-step instructions:</h4>
            <ol className="list-decimal pl-5 space-y-2 text-sm">
              <li>Go to the <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Firebase Console</a></li>
              <li>Select your project</li>
              <li>In the left sidebar, click on <strong className="font-semibold">Authentication</strong></li>
              <li>Click on the <strong className="font-semibold">Settings</strong> tab</li>
              <li>Scroll down to <strong className="font-semibold">Authorized domains</strong></li>
              <li>Click <strong className="font-semibold">Add domain</strong> and add each domain from the list above</li>
              <li>After adding all domains, return to this page and try signing in again</li>
            </ol>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between border-t pt-4">
        <Button 
          onClick={copyInstructions}
          variant="secondary" 
          className="text-sm"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 mr-1" /> Copied!
            </>
          ) : (
            <>
              <Copy className="h-4 w-4 mr-1" /> Copy Domains
            </>
          )}
        </Button>
        
        <Button
          variant="default"
          className="text-sm"
          onClick={() => window.open("https://console.firebase.google.com/", "_blank")}
        >
          <ExternalLink className="h-4 w-4 mr-1" /> Open Firebase Console
        </Button>
      </CardFooter>
    </Card>
  );
}