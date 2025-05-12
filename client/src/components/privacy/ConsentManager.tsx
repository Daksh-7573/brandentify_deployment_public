import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle, ShieldCheck } from 'lucide-react';

// Represent the consent preferences for each cookie category
interface ConsentPreferences {
  essential: boolean;
  functional: boolean;
  analytics: boolean;
  advertising: boolean;
  social: boolean;
}

// Status from the server
type ConsentStatus = 'granted' | 'denied' | 'withdrawn' | 'expired';

interface ConsentResponse {
  category: string;
  status: ConsentStatus;
}

const ConsentManager: React.FC = () => {
  const [consentPreferences, setConsentPreferences] = useState<ConsentPreferences>({
    essential: true, // Essential cookies are always required
    functional: false,
    analytics: false,
    advertising: false,
    social: false
  });
  const [showBanner, setShowBanner] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Fetch current consent preferences from the server
    const fetchConsentPreferences = async () => {
      try {
        // Try the authenticated endpoint first
        const response = await fetch('/api/privacy/cookie-consent');
        
        if (response.ok) {
          const data: ConsentResponse[] = await response.json();
          
          // Update the local state with server data
          const newPreferences: ConsentPreferences = {
            essential: true, // Always required
            functional: false,
            analytics: false,
            advertising: false,
            social: false
          };
          
          // Update the preferences based on server response
          data.forEach(consent => {
            const category = consent.category as keyof ConsentPreferences;
            newPreferences[category] = consent.status === 'granted';
          });
          
          setConsentPreferences(newPreferences);
          
          // Check if we need to show the banner
          const hasSetAllPreferences = Object.keys(newPreferences).every(
            key => key === 'essential' || newPreferences[key as keyof ConsentPreferences] !== null
          );
          
          setShowBanner(!hasSetAllPreferences);
        } else {
          // If authenticated endpoint fails, try anonymous endpoint
          try {
            const anonResponse = await fetch('/api/privacy/cookie-consent/anonymous');
            
            if (anonResponse.ok) {
              const anonData: ConsentResponse[] = await anonResponse.json();
              
              // Update the local state with anonymous data
              const anonPreferences: ConsentPreferences = {
                essential: true, // Always required
                functional: false,
                analytics: false,
                advertising: false,
                social: false
              };
              
              // Update the preferences based on anonymous response
              anonData.forEach(consent => {
                const category = consent.category as keyof ConsentPreferences;
                anonPreferences[category] = consent.status === 'granted';
              });
              
              setConsentPreferences(anonPreferences);
              
              // Check if we need to show the banner for anonymous user
              const hasSetAllPreferences = Object.keys(anonPreferences).every(
                key => key === 'essential' || anonPreferences[key as keyof ConsentPreferences] !== null
              );
              
              setShowBanner(!hasSetAllPreferences);
            } else {
              // If both endpoints fail, show the banner
              setShowBanner(true);
            }
          } catch (anonError) {
            console.error('Error fetching anonymous consent preferences:', anonError);
            setShowBanner(true);
          }
        }
      } catch (error) {
        // If authenticated endpoint throws an error, try anonymous endpoint
        try {
          const anonResponse = await fetch('/api/privacy/cookie-consent/anonymous');
          
          if (anonResponse.ok) {
            const anonData: ConsentResponse[] = await anonResponse.json();
            
            // Update the local state with anonymous data
            const anonPreferences: ConsentPreferences = {
              essential: true, // Always required
              functional: false,
              analytics: false,
              advertising: false,
              social: false
            };
            
            // Update the preferences based on anonymous response
            anonData.forEach(consent => {
              const category = consent.category as keyof ConsentPreferences;
              anonPreferences[category] = consent.status === 'granted';
            });
            
            setConsentPreferences(anonPreferences);
            
            // Check if we need to show the banner for anonymous user
            const hasSetAllPreferences = Object.keys(anonPreferences).every(
              key => key === 'essential' || anonPreferences[key as keyof ConsentPreferences] !== null
            );
            
            setShowBanner(!hasSetAllPreferences);
          } else {
            // If both endpoints fail, show the banner
            setShowBanner(true);
          }
        } catch (anonError) {
          console.error('Error fetching anonymous consent preferences:', anonError);
          setShowBanner(true);
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchConsentPreferences();
  }, []);

  const savePreferences = async () => {
    setLoading(true);
    
    try {
      // First try to save to the authenticated endpoint
      let authenticatedSuccess = true;
      
      for (const [category, granted] of Object.entries(consentPreferences)) {
        if (category === 'essential') continue; // Essential cookies are always required
        
        const response = await fetch('/api/privacy/cookie-consent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            category,
            status: granted ? 'granted' : 'denied'
          })
        });
        
        if (!response.ok) {
          authenticatedSuccess = false;
          break;
        }
      }
      
      // If authenticated endpoint failed, try the anonymous endpoint
      if (!authenticatedSuccess) {
        try {
          const anonResponse = await fetch('/api/privacy/cookie-consent/anonymous', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(consentPreferences)
          });
          
          if (!anonResponse.ok) {
            // If even anonymous fails, try to store in localStorage as backup
            localStorage.setItem('cookie-preferences', JSON.stringify(consentPreferences));
            
            // Also store in localStorage that the user has explicitly set preferences
            localStorage.setItem('has-set-cookie-preferences', 'true');
          }
        } catch (anonError) {
          console.error('Error saving to anonymous endpoint:', anonError);
          // Store in localStorage as fallback
          localStorage.setItem('cookie-preferences', JSON.stringify(consentPreferences));
          localStorage.setItem('has-set-cookie-preferences', 'true');
        }
      }
      
      toast({
        title: 'Preferences Saved',
        description: 'Your cookie preferences have been updated.',
        variant: 'default',
      });
      
      setShowBanner(false);
    } catch (error) {
      console.error('Error saving consent preferences:', error);
      
      // Try to store in localStorage as backup
      try {
        localStorage.setItem('cookie-preferences', JSON.stringify(consentPreferences));
        localStorage.setItem('has-set-cookie-preferences', 'true');
        
        toast({
          title: 'Preferences Saved Locally',
          description: 'Your preferences have been saved to your browser.',
          variant: 'default',
        });
        
        setShowBanner(false);
      } catch (localStorageError) {
        toast({
          title: 'Error',
          description: 'Failed to save your preferences. Please try again.',
          variant: 'destructive',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (category: keyof ConsentPreferences) => {
    if (category === 'essential') return; // Cannot toggle essential cookies
    
    setConsentPreferences(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const acceptAll = async () => {
    const newPreferences = {
      essential: true,
      functional: true,
      analytics: true,
      advertising: true,
      social: true
    };
    
    setConsentPreferences(newPreferences);
    
    // Store temporarily in localStorage as backup even before the API call
    try {
      localStorage.setItem('cookie-preferences', JSON.stringify(newPreferences));
      localStorage.setItem('has-set-cookie-preferences', 'true');
    } catch (e) {
      // Ignore localStorage errors
    }
    
    savePreferences();
  };

  const rejectNonEssential = async () => {
    const newPreferences = {
      essential: true,
      functional: false,
      analytics: false,
      advertising: false,
      social: false
    };
    
    setConsentPreferences(newPreferences);
    
    // Store temporarily in localStorage as backup even before the API call
    try {
      localStorage.setItem('cookie-preferences', JSON.stringify(newPreferences));
      localStorage.setItem('has-set-cookie-preferences', 'true');
    } catch (e) {
      // Ignore localStorage errors
    }
    
    savePreferences();
  };

  if (loading) {
    return <div className="flex justify-center items-center p-4">Loading preferences...</div>;
  }

  if (!showBanner) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background/90 backdrop-blur-sm z-50 p-4 sm:p-6 overflow-y-auto max-h-[90vh]">
      <Card className="max-w-5xl mx-auto shadow-lg border-t-4 border-primary">
        <CardHeader className="space-y-2 pt-6 px-6">
          <CardTitle className="flex items-center gap-2 text-xl">
            <ShieldCheck className="h-6 w-6" />
            Privacy Preferences
          </CardTitle>
          <CardDescription className="text-sm sm:text-base">
            We use cookies to enhance your browsing experience, analyze site traffic, and personalize content. Please select your consent preferences below.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 px-6">
          <div className="space-y-4">
            <Alert className="border-amber-500">
              <AlertCircle className="h-4 w-4 text-amber-500" />
              <AlertTitle className="font-medium">Important</AlertTitle>
              <AlertDescription className="text-sm">
                Essential cookies are required for the website to function and cannot be disabled.
              </AlertDescription>
            </Alert>
            
            <div className="grid gap-4">
              {/* Essential Cookies - Always enabled */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between rounded-lg border p-4 gap-3">
                <div className="space-y-1">
                  <Label className="text-base font-medium">Essential Cookies</Label>
                  <div className="text-sm text-muted-foreground">
                    Required for the website to function properly. These cannot be disabled.
                  </div>
                </div>
                <Switch checked={true} disabled={true} className="mt-1 sm:mt-0" />
              </div>
              
              {/* Functional Cookies */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between rounded-lg border p-4 gap-3">
                <div className="space-y-1">
                  <Label className="text-base font-medium">Functional Cookies</Label>
                  <div className="text-sm text-muted-foreground">
                    Enables enhanced functionality and personalization.
                  </div>
                </div>
                <Switch 
                  checked={consentPreferences.functional}
                  onCheckedChange={() => handleToggle('functional')}
                  className="mt-1 sm:mt-0"
                />
              </div>
              
              {/* Analytics Cookies */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between rounded-lg border p-4 gap-3">
                <div className="space-y-1">
                  <Label className="text-base font-medium">Analytics Cookies</Label>
                  <div className="text-sm text-muted-foreground">
                    Helps us understand how you use our website.
                  </div>
                </div>
                <Switch 
                  checked={consentPreferences.analytics}
                  onCheckedChange={() => handleToggle('analytics')}
                  className="mt-1 sm:mt-0"
                />
              </div>
              
              {/* Advertising Cookies */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between rounded-lg border p-4 gap-3">
                <div className="space-y-1">
                  <Label className="text-base font-medium">Advertising Cookies</Label>
                  <div className="text-sm text-muted-foreground">
                    Used to deliver relevant ads and marketing campaigns.
                  </div>
                </div>
                <Switch 
                  checked={consentPreferences.advertising}
                  onCheckedChange={() => handleToggle('advertising')}
                  className="mt-1 sm:mt-0"
                />
              </div>
              
              {/* Social Media Cookies */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between rounded-lg border p-4 gap-3">
                <div className="space-y-1">
                  <Label className="text-base font-medium">Social Media Cookies</Label>
                  <div className="text-sm text-muted-foreground">
                    Enables sharing content on social media and integrating social features.
                  </div>
                </div>
                <Switch 
                  checked={consentPreferences.social}
                  onCheckedChange={() => handleToggle('social')}
                  className="mt-1 sm:mt-0"
                />
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-3 justify-between pt-4 pb-6 px-6">
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Button onClick={acceptAll} className="bg-primary text-primary-foreground w-full sm:w-auto">
              Accept All
            </Button>
            <Button onClick={rejectNonEssential} variant="outline" className="w-full sm:w-auto">
              Reject Non-Essential
            </Button>
          </div>
          <Button onClick={savePreferences} variant="secondary" className="w-full mt-3 sm:mt-0 sm:w-auto">
            Save Preferences
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ConsentManager;