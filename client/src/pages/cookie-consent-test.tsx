import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { useCookieConsent } from '@/hooks/use-cookie-consent';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

const CookieConsentTest: React.FC = () => {
  const { 
    preferences, 
    hasConsented, 
    updatePreference, 
    acceptAll,
    rejectNonEssential,
    savePreferences,
    loading,
    error 
  } = useCookieConsent();
  
  const [localStorageContent, setLocalStorageContent] = useState<string>('');
  const [apiResponse, setApiResponse] = useState<{ authenticated: string, anonymous: string }>({
    authenticated: '',
    anonymous: ''
  });
  
  // Load localStorage content
  useEffect(() => {
    const checkLocalStorage = () => {
      try {
        const cookiePrefs = localStorage.getItem('cookie-preferences');
        const hasSetPrefs = localStorage.getItem('has-set-cookie-preferences');
        setLocalStorageContent(
          `cookie-preferences: ${cookiePrefs || 'not set'}\n` +
          `has-set-cookie-preferences: ${hasSetPrefs || 'not set'}`
        );
      } catch (e) {
        setLocalStorageContent('Error accessing localStorage');
      }
    };
    
    checkLocalStorage();
    // Set up interval to check localStorage regularly
    const interval = setInterval(checkLocalStorage, 2000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Check API endpoints
  const checkApiEndpoints = async () => {
    try {
      // Try authenticated endpoint
      const authResp = await fetch('/api/privacy/cookie-consent');
      const authText = authResp.ok 
        ? JSON.stringify(await authResp.json(), null, 2) 
        : `Status: ${authResp.status} - ${authResp.statusText}`;
      
      // Try anonymous endpoint
      const anonResp = await fetch('/api/privacy/cookie-consent/anonymous');
      const anonText = anonResp.ok 
        ? JSON.stringify(await anonResp.json(), null, 2) 
        : `Status: ${anonResp.status} - ${anonResp.statusText}`;
      
      setApiResponse({
        authenticated: authText,
        anonymous: anonText
      });
    } catch (error) {
      console.error('Error checking endpoints:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      setApiResponse({
        authenticated: `Error: ${errorMessage}`,
        anonymous: `Error: ${errorMessage}`
      });
    }
  };
  
  // Toggle a preference and update UI
  const togglePreference = (category: string) => {
    if (category === 'essential') return; // Can't toggle essential
    updatePreference(category as any, !preferences[category as keyof typeof preferences]);
  };
  
  return (
    <div className="container py-8">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Cookie Consent Test Page</CardTitle>
          <CardDescription>
            Test the cookie consent functionality for both authenticated and anonymous users
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-2">Current Consent Status</h3>
            <p className="mb-2">
              Has explicitly set preferences: {' '}
              <Badge variant={hasConsented ? "default" : "outline"}>
                {hasConsented ? 'Yes' : 'No'}
              </Badge>
            </p>
            <div className="grid gap-2">
              {Object.entries(preferences).map(([category, granted]) => (
                <div 
                  key={category} 
                  className="flex items-center justify-between p-2 rounded border"
                  onClick={() => togglePreference(category)}
                >
                  <div>
                    <span className="font-medium">{category}</span>
                  </div>
                  <Badge variant={granted ? "default" : "outline"}>
                    {granted ? 'Granted' : 'Denied'}
                  </Badge>
                </div>
              ))}
            </div>
            
            {error && (
              <p className="text-destructive mt-2">{error}</p>
            )}
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">LocalStorage</h3>
            <ScrollArea className="h-[100px] w-full rounded-md border p-2">
              <pre className="text-xs whitespace-pre-wrap">{localStorageContent}</pre>
            </ScrollArea>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">API Responses</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-1">Authenticated Endpoint</h4>
                <ScrollArea className="h-[200px] w-full rounded-md border p-2">
                  <pre className="text-xs whitespace-pre-wrap">{apiResponse.authenticated}</pre>
                </ScrollArea>
              </div>
              <div>
                <h4 className="font-medium mb-1">Anonymous Endpoint</h4>
                <ScrollArea className="h-[200px] w-full rounded-md border p-2">
                  <pre className="text-xs whitespace-pre-wrap">{apiResponse.anonymous}</pre>
                </ScrollArea>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-wrap gap-2">
          <Button onClick={acceptAll} className="w-full sm:w-auto">
            Accept All
          </Button>
          <Button onClick={rejectNonEssential} variant="outline" className="w-full sm:w-auto">
            Reject Non-Essential
          </Button>
          <Button onClick={savePreferences} variant="secondary" className="w-full sm:w-auto">
            Save Preferences
          </Button>
          <Button onClick={checkApiEndpoints} variant="outline" className="w-full sm:w-auto">
            Check API Endpoints
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default CookieConsentTest;