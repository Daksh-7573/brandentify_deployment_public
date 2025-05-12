import React, { useState } from 'react';
import { Link } from 'wouter';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { CookieConsentProvider, useCookieConsent } from '@/hooks/use-cookie-consent';
import { ArrowLeft, Download, Shield, Globe, Trash2, Mail, Bell } from 'lucide-react';

// Main privacy settings page
const PrivacySettings: React.FC = () => {
  return (
    <CookieConsentProvider>
      <div className="container max-w-6xl mx-auto py-8 px-4">
        <div className="flex items-center mb-6">
          <Link href="/">
            <Button variant="ghost" className="mr-2">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Privacy & Data Settings</h1>
        </div>

        <Tabs defaultValue="cookies" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="cookies">Cookie Settings</TabsTrigger>
            <TabsTrigger value="data">Data Management</TabsTrigger>
            <TabsTrigger value="region">Data Residency</TabsTrigger>
            <TabsTrigger value="communications">Communications</TabsTrigger>
          </TabsList>

          <TabsContent value="cookies">
            <div className="max-h-[70vh] overflow-y-auto">
              <CookieSettingsTab />
            </div>
          </TabsContent>

          <TabsContent value="data">
            <div className="max-h-[70vh] overflow-y-auto">
              <DataManagementTab />
            </div>
          </TabsContent>

          <TabsContent value="region">
            <div className="max-h-[70vh] overflow-y-auto">
              <DataResidencyTab />
            </div>
          </TabsContent>

          <TabsContent value="communications">
            <div className="max-h-[70vh] overflow-y-auto">
              <CommunicationsTab />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </CookieConsentProvider>
  );
};

// Cookie settings tab
const CookieSettingsTab: React.FC = () => {
  const { 
    preferences, 
    updatePreference, 
    savePreferences, 
    acceptAll, 
    rejectNonEssential,
    loading
  } = useCookieConsent();
  const { toast } = useToast();

  const handleSave = async () => {
    try {
      await savePreferences();
      toast({
        title: "Cookie preferences saved",
        description: "Your cookie consent preferences have been updated.",
      });
    } catch (error) {
      // Also save to localStorage as a fallback
      localStorage.setItem('cookiePreferences', JSON.stringify(preferences));
      toast({
        title: "Cookie preferences saved locally",
        description: "Your preferences are saved on this device.",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Shield className="h-5 w-5 mr-2" />
          Cookie Consent Preferences
        </CardTitle>
        <CardDescription>
          Manage how cookies are used across our platform
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Added max-h-[60vh] to create a scrollable container with a maximum height */}
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
          {/* Essential Cookies */}
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label className="text-base">Essential Cookies</Label>
              <div className="text-sm text-muted-foreground">
                Required for the website to function properly. These cannot be disabled.
              </div>
            </div>
            <Switch checked={true} disabled={true} />
          </div>
          
          {/* Functional Cookies */}
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label className="text-base">Functional Cookies</Label>
              <div className="text-sm text-muted-foreground">
                Enables enhanced functionality and personalization.
              </div>
            </div>
            <Switch 
              checked={preferences.functional}
              onCheckedChange={(checked) => updatePreference('functional', checked)}
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
              checked={preferences.analytics}
              onCheckedChange={(checked) => updatePreference('analytics', checked)}
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
              checked={preferences.advertising}
              onCheckedChange={(checked) => updatePreference('advertising', checked)}
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
              checked={preferences.social}
              onCheckedChange={(checked) => updatePreference('social', checked)}
            />
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="space-x-2">
          <Button variant="outline" onClick={acceptAll} disabled={loading}>
            Accept All
          </Button>
          <Button variant="outline" onClick={rejectNonEssential} disabled={loading}>
            Reject Non-Essential
          </Button>
        </div>
        <Button onClick={handleSave} disabled={loading}>
          {loading ? 'Saving...' : 'Save Preferences'}
        </Button>
      </CardFooter>
    </Card>
  );
};

// Data management tab
const DataManagementTab: React.FC = () => {
  const [exportLoading, setExportLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { toast } = useToast();

  const handleDataExport = async () => {
    setExportLoading(true);
    try {
      const response = await fetch('/api/privacy/data-export', {
        method: 'POST',
      });
      
      if (response.ok) {
        toast({
          title: "Data Export Requested",
          description: "We'll send you an email with your data export when it's ready.",
        });
      } else {
        throw new Error('Failed to request data export');
      }
    } catch (error) {
      toast({
        title: "Request Failed",
        description: "We couldn't process your data export request. Please try again later.",
        variant: "destructive",
      });
      console.error('Data export error:', error);
    } finally {
      setExportLoading(false);
    }
  };

  const handleDataDeletion = async () => {
    setDeleteLoading(true);
    try {
      const response = await fetch('/api/privacy/data-deletion', {
        method: 'POST',
      });
      
      if (response.ok) {
        toast({
          title: "Data Deletion Requested",
          description: "We've received your request to delete your data. You'll receive a confirmation email.",
        });
      } else {
        throw new Error('Failed to request data deletion');
      }
    } catch (error) {
      toast({
        title: "Request Failed",
        description: "We couldn't process your data deletion request. Please try again later.",
        variant: "destructive",
      });
      console.error('Data deletion error:', error);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Download className="h-5 w-5 mr-2" />
          Your Data
        </CardTitle>
        <CardDescription>
          Download or delete your personal data
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Added max-h-[60vh] to create a scrollable container with a maximum height */}
        <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
          <div>
            <h3 className="text-lg font-medium mb-2">Export Your Data</h3>
            <p className="text-sm text-muted-foreground mb-4">
              You can request a copy of all the personal data we store about you. We'll send you an email with a download link when it's ready.
            </p>
            <Button 
              onClick={handleDataExport} 
              disabled={exportLoading}
              className="w-full sm:w-auto"
            >
              {exportLoading ? 'Processing...' : 'Request Data Export'}
            </Button>
          </div>
          
          <Separator />
          
          <div>
            <h3 className="text-lg font-medium mb-2 text-destructive">Delete Your Data</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Request permanent deletion of all your personal data. This action cannot be undone. Your account will be deactivated and all your data will be permanently deleted.
            </p>
            <Button 
              variant="destructive" 
              onClick={handleDataDeletion} 
              disabled={deleteLoading}
              className="w-full sm:w-auto"
            >
              {deleteLoading ? 'Processing...' : 'Request Account Deletion'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Data residency tab
const DataResidencyTab: React.FC = () => {
  const [region, setRegion] = useState<string>('global');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSaveRegion = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/privacy/data-residency', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ region }),
      });
      
      if (response.ok) {
        toast({
          title: "Data Residency Updated",
          description: `Your data will now be stored in the ${region === 'in' ? 'India' : 'Global'} region.`,
        });
      } else {
        throw new Error('Failed to update data residency preference');
      }
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "We couldn't update your data residency preference. Please try again later.",
        variant: "destructive",
      });
      console.error('Data residency error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Globe className="h-5 w-5 mr-2" />
          Data Residency
        </CardTitle>
        <CardDescription>
          Choose where your data is stored and processed
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Added max-h-[60vh] to create a scrollable container with a maximum height */}
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
          <div className="space-y-2">
            <Label htmlFor="region">Storage Region</Label>
            <Select value={region} onValueChange={setRegion}>
              <SelectTrigger id="region" className="w-full sm:w-[300px]">
                <SelectValue placeholder="Select a region" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="global">Global (Default)</SelectItem>
                <SelectItem value="in">India</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground mt-2">
              {region === 'in' 
                ? 'Your data will be stored on servers located in India in compliance with Indian IT Rules 2021.' 
                : 'Your data will be stored globally for optimal performance.'}
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSaveRegion} disabled={loading}>
          {loading ? 'Saving...' : 'Save Preference'}
        </Button>
      </CardFooter>
    </Card>
  );
};

// Communications preferences tab
const CommunicationsTab: React.FC = () => {
  const [preferences, setPreferences] = useState({
    marketing: false,
    product: true,
    security: true,
    newsletterFrequency: 'weekly',
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleToggle = (key: string) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev],
    }));
  };

  const handleFrequencyChange = (value: string) => {
    setPreferences(prev => ({
      ...prev,
      newsletterFrequency: value,
    }));
  };

  const handleSavePreferences = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/privacy/communication-preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preferences),
      });
      
      if (response.ok) {
        toast({
          title: "Communication Preferences Saved",
          description: "Your communication preferences have been updated.",
        });
      } else {
        throw new Error('Failed to update communication preferences');
      }
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "We couldn't update your communication preferences. Please try again later.",
        variant: "destructive",
      });
      console.error('Communication preferences error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Mail className="h-5 w-5 mr-2" />
          Communication Preferences
        </CardTitle>
        <CardDescription>
          Manage how and when we contact you
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label className="text-base">Marketing Communications</Label>
              <div className="text-sm text-muted-foreground">
                Receive promotions, offers, and marketing materials
              </div>
            </div>
            <Switch 
              checked={preferences.marketing}
              onCheckedChange={() => handleToggle('marketing')}
            />
          </div>
          
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label className="text-base">Product Updates</Label>
              <div className="text-sm text-muted-foreground">
                Notifications about new features and platform changes
              </div>
            </div>
            <Switch 
              checked={preferences.product}
              onCheckedChange={() => handleToggle('product')}
            />
          </div>
          
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label className="text-base">Security Alerts</Label>
              <div className="text-sm text-muted-foreground">
                Critical security notifications and account alerts
              </div>
            </div>
            <Switch 
              checked={preferences.security}
              onCheckedChange={() => handleToggle('security')}
            />
          </div>
          
          <div className="space-y-2 rounded-lg border p-4">
            <Label htmlFor="frequency">Newsletter Frequency</Label>
            <Select value={preferences.newsletterFrequency} onValueChange={handleFrequencyChange}>
              <SelectTrigger id="frequency" className="w-full sm:w-[300px]">
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="never">Never</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground mt-2">
              How often you'd like to receive our newsletter with industry insights and career tips
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSavePreferences} disabled={loading}>
          {loading ? 'Saving...' : 'Save Preferences'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PrivacySettings;