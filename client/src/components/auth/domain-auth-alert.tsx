import { useEffect, useState } from 'react';
import { AlertCircle, ExternalLink } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';

/**
 * Improved DomainAuthAlert component that handles authentication for all domains
 * While still providing special behavior for the /auth URL when needed
 */
export function DomainAuthAlert() {
  const [_, setLocation] = useLocation();
  const [showAlert, setShowAlert] = useState(false);
  
  useEffect(() => {
    // Check if we're on the problematic /auth URL
    const isAuthSpecificURL = window.location.pathname === '/auth';
    const hostname = window.location.hostname;
    
    // Only show alert on the specific /auth URL
    setShowAlert(isAuthSpecificURL);
    
    // Log diagnostic information
    if (isAuthSpecificURL) {
      console.log(`Auth alert: on /auth URL at domain ${hostname}`);
    }
  }, []);
  
  if (!showAlert) return null;
  
  return (
    <Alert className="mb-4 bg-blue-50 border-blue-200">
      <AlertCircle className="h-4 w-4 text-blue-600" />
      <AlertTitle className="text-blue-700">Authentication Notice</AlertTitle>
      <AlertDescription className="text-blue-600">
        <p className="mb-2">
          For the best authentication experience, please use our main login page:
        </p>
        <Button 
          variant="outline" 
          className="mt-1 w-full border-blue-300 text-blue-700 hover:bg-blue-100"
          onClick={() => setLocation('/')}
        >
          Go to Main Login Page
        </Button>
      </AlertDescription>
    </Alert>
  );
}