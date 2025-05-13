import { useEffect, useState } from 'react';
import { AlertCircle, ExternalLink } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

/**
 * Component to show a special alert on the problematic domain
 * This helps users understand how to properly set up their Firebase configuration
 */
export function DomainAuthAlert() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentDomain, setCurrentDomain] = useState('');
  
  useEffect(() => {
    // Check if we're on the problematic domain
    const hostname = window.location.hostname;
    const isProblemDomain = hostname === "25d68c5d-166d-4f92-b5c1-cdfc68146e33-00-2kol6l2kz9i0s.picard.replit.dev";
    
    if (isProblemDomain) {
      setIsVisible(true);
      setCurrentDomain(hostname);
    } else {
      setIsVisible(false);
    }
  }, []);
  
  if (!isVisible) return null;
  
  return (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Firebase Authentication Notice</AlertTitle>
      <AlertDescription>
        <p className="mb-2">
          Google authentication may not work correctly on this domain ({currentDomain}).
        </p>
        <p className="mb-2">
          To fix this issue, make sure you've added <strong>{currentDomain}</strong> to your 
          Firebase project's authorized domains list in the Firebase console.
        </p>
        <div className="flex flex-col sm:flex-row gap-2 mt-3">
          <Button size="sm" variant="outline" asChild>
            <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer">
              Open Firebase Console <ExternalLink className="ml-1 h-3 w-3" />
            </a>
          </Button>
          <Button size="sm" variant="outline" onClick={() => window.location.href = window.location.origin}>
            Use Preview URL Instead
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}