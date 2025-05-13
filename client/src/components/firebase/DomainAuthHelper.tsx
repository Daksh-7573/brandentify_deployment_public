import { useState, useEffect } from 'react';
import { AlertCircle, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { checkDomainAuthorization, getFirebaseSetupInstructions } from '@/lib/firebase-domain-helper';

/**
 * This component shows alerts when the current domain is not authorized in Firebase
 * It's designed to help developers and users troubleshoot Firebase authentication issues
 */
export function DomainAuthHelper() {
  const [domainInfo, setDomainInfo] = useState<ReturnType<typeof checkDomainAuthorization> | null>(null);
  const [setupInstructions, setSetupInstructions] = useState<string[]>([]);
  const [dismissed, setDismissed] = useState(false);
  
  useEffect(() => {
    // Check if we're already authenticated - if so, don't show warnings
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    
    // Only check domain authorization if we're not authenticated
    if (!isAuthenticated) {
      const info = checkDomainAuthorization();
      setDomainInfo(info);
      
      if (!info.isValid) {
        setSetupInstructions(getFirebaseSetupInstructions());
      }
    }
  }, []);
  
  // Don't render anything if:
  // - We don't have domain info yet
  // - The domain is valid (allowed)
  // - The user has dismissed the message
  if (!domainInfo || domainInfo.isValid || dismissed) {
    return null;
  }
  
  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md">
      <Alert className="bg-amber-50 border-amber-300 shadow-lg">
        <AlertTriangle className="h-4 w-4 text-amber-600" />
        <AlertTitle className="text-amber-900">Firebase Domain Configuration Required</AlertTitle>
        <AlertDescription className="text-amber-800 mt-2">
          <p className="mb-2">Your current domain <strong>"{domainInfo.currentDomain}"</strong> needs to be added to Firebase.</p>
          <p className="mb-2 text-sm">
            Having issues with Google login? If you're seeing redirect loops or login failures, this is likely the problem.
          </p>
          
          <div className="flex justify-end mt-4">
            <button 
              className="text-xs underline text-amber-600 hover:text-amber-800" 
              onClick={() => setDismissed(true)}
            >
              Dismiss
            </button>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
}