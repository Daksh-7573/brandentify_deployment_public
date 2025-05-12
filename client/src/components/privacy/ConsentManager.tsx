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
          // If the user is not logged in or no preferences are set yet, show the banner
          setShowBanner(true);
        }
      } catch (error) {
        console.error('Error fetching consent preferences:', error);
        setShowBanner(true);
      } finally {
        setLoading(false);
      }
    };
    
    fetchConsentPreferences();
  }, []);

  const savePreferences = async () => {
    setLoading(true);
    
    try {
      // Save each consent preference to the server
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
          throw new Error(`Failed to save ${category} consent preference`);
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
      toast({
        title: 'Error',
        description: 'Failed to save your preferences. Please try again.',
        variant: 'destructive',
      });
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

  const acceptAll = () => {
    setConsentPreferences({
      essential: true,
      functional: true,
      analytics: true,
      advertising: true,
      social: true
    });
    savePreferences();
  };

  const rejectNonEssential = () => {
    setConsentPreferences({
      essential: true,
      functional: false,
      analytics: false,
      advertising: false,
      social: false
    });
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
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label className="text-base">Analytics Cookies</Label>
                  <div className="text-sm text-muted-foreground">
                    Helps us understand how you use our website.
                  </div>
                </div>
                <Switch 
                  checked={consentPreferences.analytics}
                  onCheckedChange={() => handleToggle('analytics')}
                />
              </div>
              
              {/* Advertising Cookies */}
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label className="text-base">Advertising Cookies</Label>
                  <div className="text-sm text-muted-foreground">
                    Used to deliver relevant ads and marketing campaigns.
                  </div>
                </div>
                <Switch 
                  checked={consentPreferences.advertising}
                  onCheckedChange={() => handleToggle('advertising')}
                />
              </div>
              
              {/* Social Media Cookies */}
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label className="text-base">Social Media Cookies</Label>
                  <div className="text-sm text-muted-foreground">
                    Enables sharing content on social media and integrating social features.
                  </div>
                </div>
                <Switch 
                  checked={consentPreferences.social}
                  onCheckedChange={() => handleToggle('social')}
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