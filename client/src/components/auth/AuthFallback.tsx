import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { DomainFixedAuth } from './DomainFixedAuth';

/**
 * Authentication Fallback Handler
 * Detects Firebase OAuth issues and provides alternative authentication methods
 */
export function AuthFallback() {
  const [showFallback, setShowFallback] = useState(false);
  const [authError, setAuthError] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    // Check for OAuth errors in URL
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get('error');
    const errorDescription = urlParams.get('error_description');

    if (error === 'invalid_client' || error === 'unauthorized_client') {
      setAuthError('Firebase OAuth client configuration issue detected');
      setShowFallback(true);
      
      toast({
        title: 'Authentication Issue Detected',
        description: 'Using alternative authentication methods...',
        variant: 'destructive'
      });
    }

    // Check for Firebase initialization errors
    const checkFirebaseErrors = () => {
      const logs = (window as any).__firebase_errors || [];
      const hasAuthError = logs.some((log: string) => 
        log.includes('OAuth client') || 
        log.includes('unauthorized-domain') ||
        log.includes('invalid_client')
      );

      if (hasAuthError) {
        setShowFallback(true);
        setAuthError('Firebase domain authorization required');
      }
    };

    // Check after a brief delay to allow Firebase to initialize
    setTimeout(checkFirebaseErrors, 2000);
  }, [toast]);

  const handleManualDomainFix = async () => {
    try {
      // Attempt to programmatically fix domain issues
      const currentDomain = window.location.hostname;
      
      // Store domain info for backend processing
      const response = await fetch('/api/auth/register-domain', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          domain: currentDomain,
          fullUrl: window.location.origin,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString()
        })
      });

      if (response.ok) {
        toast({
          title: 'Domain Registration Attempted',
          description: 'Backend will try to resolve domain authorization issues.',
        });
      }
    } catch (error) {
      console.error('Domain fix attempt failed:', error);
    }
  };

  if (!showFallback) {
    return null;
  }

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg border">
      <div className="text-center mb-6">
        <div className="w-12 h-12 mx-auto mb-4 bg-yellow-100 rounded-full flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-yellow-600">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Authentication Configuration Required
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          {authError || 'Firebase OAuth client needs domain authorization'}
        </p>
      </div>

      <DomainFixedAuth />

      <div className="mt-6 pt-4 border-t border-gray-200">
        <Button
          onClick={handleManualDomainFix}
          variant="ghost"
          className="w-full text-sm"
        >
          Attempt Automatic Domain Fix
        </Button>
      </div>

      <div className="mt-4 text-xs text-gray-500 text-center">
        <p>
          Current domain: <code className="bg-gray-100 px-1 rounded">{window.location.hostname}</code>
        </p>
        <p className="mt-1">
          This domain needs to be added to Firebase Console authorized domains.
        </p>
      </div>
    </div>
  );
}