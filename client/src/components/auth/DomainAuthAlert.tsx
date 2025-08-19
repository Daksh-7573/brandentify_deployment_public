import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DomainAuthAlert() {
  const currentDomain = window.location.hostname;
  
  const openFirebaseConsole = () => {
    window.open('https://console.firebase.google.com/', '_blank');
  };

  return (
    <Alert className="mb-6 border-orange-500/50 bg-orange-500/10">
      <AlertTriangle className="h-4 w-4 text-orange-500" />
      <AlertTitle className="text-orange-500 font-semibold">
        Firebase Domain Authorization Required
      </AlertTitle>
      <AlertDescription className="text-orange-200 space-y-3">
        <p>
          To enable Google authentication, add this domain to your Firebase project's authorized domains:
        </p>
        <div className="bg-black/30 p-3 rounded font-mono text-sm text-white">
          {currentDomain}
        </div>
        <div className="space-y-2 text-sm">
          <p><strong>Quick Setup Steps:</strong></p>
          <ol className="list-decimal list-inside space-y-1 text-orange-100">
            <li>Open Firebase Console (button below)</li>
            <li>Select project: "brandentifier-app"</li>
            <li>Go to: Authentication → Settings → Authorized domains</li>
            <li>Click "Add domain" and paste the domain above</li>
            <li>Also add: *.replit.dev and *.replit.app</li>
          </ol>
        </div>
        <Button 
          onClick={openFirebaseConsole}
          size="sm"
          className="bg-orange-600 hover:bg-orange-700"
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          Open Firebase Console
        </Button>
      </AlertDescription>
    </Alert>
  );
}