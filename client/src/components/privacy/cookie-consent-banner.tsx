import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { X } from "lucide-react";

// Cookie consent preferences
interface CookieConsent {
  essential: boolean; // Always true, can't be disabled
  functional: boolean;
  analytics: boolean;
  advertising: boolean;
  social_media: boolean;
  lastUpdated: Date;
}

const DEFAULT_CONSENT: CookieConsent = {
  essential: true, // Cannot be disabled
  functional: false,
  analytics: false,
  advertising: false,
  social_media: false,
  lastUpdated: new Date()
};

const CookieConsentBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [consent, setConsent] = useState<CookieConsent>(DEFAULT_CONSENT);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Check if user has already set cookie preferences
    const savedConsent = localStorage.getItem('cookie-consent');
    
    if (!savedConsent) {
      // Show banner if no consent is saved
      setIsVisible(true);
    } else {
      try {
        setConsent(JSON.parse(savedConsent));
      } catch (error) {
        console.error('Error parsing saved cookie consent:', error);
        setIsVisible(true);
      }
    }
  }, []);

  const handleAcceptAll = () => {
    const newConsent: CookieConsent = {
      essential: true,
      functional: true,
      analytics: true,
      advertising: true,
      social_media: true,
      lastUpdated: new Date()
    };
    
    saveConsent(newConsent);
  };

  const handleAcceptEssential = () => {
    saveConsent(DEFAULT_CONSENT);
  };

  const handleSavePreferences = () => {
    saveConsent(consent);
  };

  const saveConsent = (consentData: CookieConsent) => {
    // Save to localStorage
    localStorage.setItem('cookie-consent', JSON.stringify(consentData));
    
    // Send to server
    fetch('/api/privacy/cookie-consent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(consentData),
    }).catch(error => {
      console.error('Error saving cookie consent:', error);
    });
    
    setConsent(consentData);
    setIsVisible(false);
    setShowDetails(false);
  };

  const handleChange = (category: keyof Omit<CookieConsent, 'lastUpdated' | 'essential'>, checked: boolean) => {
    setConsent(prev => ({
      ...prev,
      [category]: checked
    }));
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-background/90 backdrop-blur-sm border-t shadow-lg">
      <div className="max-w-7xl mx-auto">
        {!showDetails ? (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex-1">
              <p className="text-sm">
                We use cookies to enhance your experience. By continuing to visit this site you agree to our use of cookies.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowDetails(true)}>
                Cookie Settings
              </Button>
              <Button variant="outline" size="sm" onClick={handleAcceptEssential}>
                Essential Only
              </Button>
              <Button variant="default" size="sm" onClick={handleAcceptAll}>
                Accept All
              </Button>
            </div>
          </div>
        ) : (
          <Card className="p-4">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold">Cookie Preferences</h3>
                <p className="text-sm text-muted-foreground">
                  Select which cookies you want to accept
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setShowDetails(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-4 mb-4">
              <div className="flex items-start space-x-2">
                <Checkbox id="essential" checked disabled />
                <div className="grid gap-1.5 leading-none">
                  <Label htmlFor="essential" className="font-medium">
                    Essential Cookies <span className="text-xs text-muted-foreground">(Always On)</span>
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    These cookies are necessary for the website to function and cannot be switched off.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-2">
                <Checkbox 
                  id="functional" 
                  checked={consent.functional}
                  onCheckedChange={(checked) => handleChange('functional', checked === true)}
                />
                <div className="grid gap-1.5 leading-none">
                  <Label htmlFor="functional" className="font-medium">
                    Functional Cookies
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    These cookies enable personalized features and functionality.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-2">
                <Checkbox 
                  id="analytics" 
                  checked={consent.analytics}
                  onCheckedChange={(checked) => handleChange('analytics', checked === true)}
                />
                <div className="grid gap-1.5 leading-none">
                  <Label htmlFor="analytics" className="font-medium">
                    Analytics Cookies
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    These cookies help us improve our website by collecting anonymous information.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-2">
                <Checkbox 
                  id="advertising" 
                  checked={consent.advertising}
                  onCheckedChange={(checked) => handleChange('advertising', checked === true)}
                />
                <div className="grid gap-1.5 leading-none">
                  <Label htmlFor="advertising" className="font-medium">
                    Advertising Cookies
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    These cookies are used to show you relevant advertisements.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-2">
                <Checkbox 
                  id="social_media" 
                  checked={consent.social_media}
                  onCheckedChange={(checked) => handleChange('social_media', checked === true)}
                />
                <div className="grid gap-1.5 leading-none">
                  <Label htmlFor="social_media" className="font-medium">
                    Social Media Cookies
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    These cookies enable integration with social media platforms.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowDetails(false)}>
                Cancel
              </Button>
              <Button variant="default" size="sm" onClick={handleSavePreferences}>
                Save Preferences
              </Button>
            </div>
          </Card>
        )}
        
        <div className="mt-2 text-xs text-center text-muted-foreground">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="link" size="sm" className="p-0 h-auto text-xs underline">
                Privacy Policy
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Privacy Policy</DialogTitle>
                <DialogDescription>
                  Last updated: {new Date().toLocaleDateString()}
                </DialogDescription>
              </DialogHeader>
              <div className="text-sm">
                <p>
                  This Privacy Policy describes how we collect, use, process, and disclose your information,
                  including personal information, in conjunction with your access to and use of our platform.
                </p>
                
                <h3 className="text-base font-medium mt-4">1. Information We Collect</h3>
                <h4 className="text-sm font-medium mt-2">1.1 Information You Provide</h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Account information (name, email, etc.)</li>
                  <li>Profile information</li>
                  <li>Content you share</li>
                  <li>Communications with us</li>
                </ul>
                
                <h4 className="text-sm font-medium mt-2">1.2 Information We Automatically Collect</h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Usage information</li>
                  <li>Log data</li>
                  <li>Device information</li>
                  <li>Cookies and similar technologies</li>
                </ul>
                
                <h3 className="text-base font-medium mt-4">2. How We Use Your Information</h3>
                <p>We use the information we collect for the following purposes:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Provide and improve our services</li>
                  <li>Communicate with you</li>
                  <li>Personalize your experience</li>
                  <li>Ensure safety and security</li>
                </ul>
                
                <h3 className="text-base font-medium mt-4">3. Your Rights</h3>
                <p>
                  Depending on your location, you may have certain rights regarding your personal data:
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Access, correct, or delete your personal data</li>
                  <li>Object to processing of your data</li>
                  <li>Data portability</li>
                  <li>Withdraw consent</li>
                </ul>
                
                <h3 className="text-base font-medium mt-4">4. Data Storage and Security</h3>
                <p>
                  We implement appropriate security measures to protect your personal data.
                </p>
                
                <h3 className="text-base font-medium mt-4">5. International Data Transfers</h3>
                <p>
                  Your information may be transferred to different countries. We ensure appropriate safeguards.
                </p>
                
                <h3 className="text-base font-medium mt-4">6. Contact Us</h3>
                <p>
                  If you have any questions about this Privacy Policy, please contact us.
                </p>
              </div>
              <DialogFooter>
                <Button>I Understand</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          {' | '}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="link" size="sm" className="p-0 h-auto text-xs underline">
                Cookie Policy
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Cookie Policy</DialogTitle>
                <DialogDescription>
                  Last updated: {new Date().toLocaleDateString()}
                </DialogDescription>
              </DialogHeader>
              <div className="text-sm">
                <p>
                  This Cookie Policy explains how we use cookies and similar technologies.
                </p>
                
                <h3 className="text-base font-medium mt-4">1. What Are Cookies</h3>
                <p>
                  Cookies are small text files stored on your device by websites you visit.
                </p>
                
                <h3 className="text-base font-medium mt-4">2. Types of Cookies We Use</h3>
                
                <h4 className="text-sm font-medium mt-2">2.1 Essential Cookies</h4>
                <p>Required for core functionality. Cannot be disabled.</p>
                
                <h4 className="text-sm font-medium mt-2">2.2 Functional Cookies</h4>
                <p>Enable enhanced functionality and personalization.</p>
                
                <h4 className="text-sm font-medium mt-2">2.3 Analytics Cookies</h4>
                <p>Help us understand how visitors interact with our platform.</p>
                
                <h4 className="text-sm font-medium mt-2">2.4 Advertising Cookies</h4>
                <p>Used to deliver relevant ads and marketing communications.</p>
                
                <h4 className="text-sm font-medium mt-2">2.5 Social Media Cookies</h4>
                <p>Enable integration with social media platforms.</p>
                
                <h3 className="text-base font-medium mt-4">3. Your Cookie Choices</h3>
                <p>
                  You can manage your cookie preferences through our platform's consent manager.
                </p>
                
                <h3 className="text-base font-medium mt-4">4. Contact Us</h3>
                <p>
                  If you have any questions about our Cookie Policy, please contact us.
                </p>
              </div>
              <DialogFooter>
                <Button>I Understand</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
};

export default CookieConsentBanner;