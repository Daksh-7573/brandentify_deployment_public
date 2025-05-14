import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { toast } from "@/hooks/use-toast";
import { AlertTriangle, CheckCircle, Cloud, Database, Globe, Key, Lock, Mail, Save, Server, Settings, Shield, Trash2, Upload, Users } from "lucide-react";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";

interface GeneralSettings {
  siteName: string;
  siteDescription: string;
  supportEmail: string;
  timezone: string;
  language: string;
  dateFormat: string;
  maintenanceMode: boolean;
}

interface SecuritySettings {
  passwordPolicy: string;
  sessionTimeout: number;
  twoFactorAuth: boolean;
  userLockout: boolean;
  lockoutThreshold: number;
  showErrorDetails: boolean;
}

interface EmailSettings {
  smtpServer: string;
  smtpPort: string;
  smtpUsername: string;
  smtpPassword: string;
  fromEmail: string;
  replyToEmail: string;
  enableSsl: boolean;
  enableSmtpAuth: boolean;
}

interface ApiSettings {
  enableApiAccess: boolean;
  rateLimitPerMinute: number;
  requireApiKey: boolean;
  allowCors: boolean;
  allowedOrigins: string;
}

export default function SettingsPage() {
  // State for all setting sections
  const [generalSettings, setGeneralSettings] = useState<GeneralSettings>({
    siteName: "Brandentifier",
    siteDescription: "Professional networking and AI-powered career platform",
    supportEmail: "support@brandentifier.com",
    timezone: "America/New_York",
    language: "en-US",
    dateFormat: "MM/DD/YYYY",
    maintenanceMode: false
  });
  
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    passwordPolicy: "minimum-8-mixed",
    sessionTimeout: 30,
    twoFactorAuth: true,
    userLockout: true,
    lockoutThreshold: 5,
    showErrorDetails: false
  });
  
  const [emailSettings, setEmailSettings] = useState<EmailSettings>({
    smtpServer: "smtp.example.com",
    smtpPort: "587",
    smtpUsername: "notifications@brandentifier.com",
    smtpPassword: "••••••••••",
    fromEmail: "notifications@brandentifier.com",
    replyToEmail: "no-reply@brandentifier.com",
    enableSsl: true,
    enableSmtpAuth: true
  });
  
  const [apiSettings, setApiSettings] = useState<ApiSettings>({
    enableApiAccess: true,
    rateLimitPerMinute: 60,
    requireApiKey: true,
    allowCors: true,
    allowedOrigins: "https://*.brandentifier.com, https://partner.example.com"
  });
  
  // Event handlers for settings changes
  const handleGeneralChange = (field: keyof GeneralSettings, value: string | boolean) => {
    setGeneralSettings(prev => ({ ...prev, [field]: value }));
  };
  
  const handleSecurityChange = (field: keyof SecuritySettings, value: string | number | boolean) => {
    setSecuritySettings(prev => ({ ...prev, [field]: value }));
  };
  
  const handleEmailChange = (field: keyof EmailSettings, value: string | boolean) => {
    setEmailSettings(prev => ({ ...prev, [field]: value }));
  };
  
  const handleApiChange = (field: keyof ApiSettings, value: string | number | boolean) => {
    setApiSettings(prev => ({ ...prev, [field]: value }));
  };
  
  // Handler for saving settings
  const saveSettings = () => {
    // In a real app, this would send data to the backend
    toast({
      title: "Settings Saved",
      description: "Your changes have been saved successfully.",
      variant: "default",
    });
  };
  
  // Handler for test email
  const sendTestEmail = () => {
    toast({
      title: "Test Email Sent",
      description: "A test email has been dispatched to your configured address.",
      variant: "default",
    });
  };
  
  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Platform Settings</h1>
            <p className="text-muted-foreground">Configure system-wide settings and preferences</p>
          </div>
          <Button onClick={saveSettings} className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            Save All Changes
          </Button>
        </div>
        
        <Tabs defaultValue="general" className="space-y-4">
          <TabsList className="grid sm:grid-cols-4 grid-cols-2 w-full">
            <TabsTrigger value="general" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span>General</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span>Security</span>
            </TabsTrigger>
            <TabsTrigger value="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <span>Email</span>
            </TabsTrigger>
            <TabsTrigger value="api" className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              <span>API & Integration</span>
            </TabsTrigger>
          </TabsList>
          
          {/* General Settings Tab */}
          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>Basic platform configuration options</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="siteName">Site Name</Label>
                    <Input 
                      id="siteName" 
                      value={generalSettings.siteName}
                      onChange={(e) => handleGeneralChange('siteName', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="supportEmail">Support Email</Label>
                    <Input 
                      id="supportEmail" 
                      type="email"
                      value={generalSettings.supportEmail}
                      onChange={(e) => handleGeneralChange('supportEmail', e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="siteDescription">Site Description</Label>
                  <Textarea 
                    id="siteDescription" 
                    value={generalSettings.siteDescription}
                    onChange={(e) => handleGeneralChange('siteDescription', e.target.value)}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select 
                      value={generalSettings.timezone}
                      onValueChange={(value) => handleGeneralChange('timezone', value)}
                    >
                      <SelectTrigger id="timezone">
                        <SelectValue placeholder="Select timezone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                        <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                        <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                        <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                        <SelectItem value="Europe/London">London (GMT)</SelectItem>
                        <SelectItem value="Asia/Tokyo">Tokyo (JST)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="language">Default Language</Label>
                    <Select 
                      value={generalSettings.language}
                      onValueChange={(value) => handleGeneralChange('language', value)}
                    >
                      <SelectTrigger id="language">
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en-US">English (US)</SelectItem>
                        <SelectItem value="en-GB">English (UK)</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="de">German</SelectItem>
                        <SelectItem value="ja">Japanese</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="dateFormat">Date Format</Label>
                    <Select 
                      value={generalSettings.dateFormat}
                      onValueChange={(value) => handleGeneralChange('dateFormat', value)}
                    >
                      <SelectTrigger id="dateFormat">
                        <SelectValue placeholder="Select format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                        <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                        <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                        <SelectItem value="MMMM D, YYYY">MMMM D, YYYY</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between space-x-2">
                  <div className="space-y-0.5">
                    <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable to temporarily block access to the site for maintenance
                    </p>
                  </div>
                  <Switch
                    id="maintenanceMode"
                    checked={generalSettings.maintenanceMode}
                    onCheckedChange={(checked) => handleGeneralChange('maintenanceMode', checked)}
                  />
                </div>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="flex items-center gap-2">
                      <Trash2 className="h-4 w-4" />
                      Reset to Default Settings
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action will reset all general settings to their default values. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction>Reset Settings</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Button variant="outline">Cancel</Button>
                <Button onClick={saveSettings}>Save Changes</Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Security Settings Tab */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>Configure security and privacy settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="passwordPolicy">Password Policy</Label>
                  <Select 
                    value={securitySettings.passwordPolicy}
                    onValueChange={(value) => handleSecurityChange('passwordPolicy', value)}
                  >
                    <SelectTrigger id="passwordPolicy">
                      <SelectValue placeholder="Select password policy" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="minimum-8">Minimum 8 characters</SelectItem>
                      <SelectItem value="minimum-8-mixed">Minimum 8 characters with mixed case</SelectItem>
                      <SelectItem value="minimum-10-complex">Minimum 10 characters with numbers and symbols</SelectItem>
                      <SelectItem value="minimum-12-complex">Minimum 12 characters with numbers and symbols</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                    <span className="text-sm text-muted-foreground">{securitySettings.sessionTimeout} minutes</span>
                  </div>
                  <Slider
                    id="sessionTimeout"
                    min={5}
                    max={120}
                    step={5}
                    value={[securitySettings.sessionTimeout]}
                    onValueChange={(value) => handleSecurityChange('sessionTimeout', value[0])}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between space-x-2">
                  <div className="space-y-0.5">
                    <Label htmlFor="twoFactorAuth">Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">
                      Require two-factor authentication for administrator accounts
                    </p>
                  </div>
                  <Switch
                    id="twoFactorAuth"
                    checked={securitySettings.twoFactorAuth}
                    onCheckedChange={(checked) => handleSecurityChange('twoFactorAuth', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between space-x-2">
                  <div className="space-y-0.5">
                    <Label htmlFor="userLockout">Account Lockout</Label>
                    <p className="text-sm text-muted-foreground">
                      Lock accounts after multiple failed login attempts
                    </p>
                  </div>
                  <Switch
                    id="userLockout"
                    checked={securitySettings.userLockout}
                    onCheckedChange={(checked) => handleSecurityChange('userLockout', checked)}
                  />
                </div>
                
                {securitySettings.userLockout && (
                  <div className="space-y-2 pl-6 border-l-2 border-primary/20">
                    <div className="flex justify-between">
                      <Label htmlFor="lockoutThreshold">Lockout After Failed Attempts</Label>
                      <span className="text-sm text-muted-foreground">{securitySettings.lockoutThreshold} attempts</span>
                    </div>
                    <Slider
                      id="lockoutThreshold"
                      min={3}
                      max={10}
                      step={1}
                      value={[securitySettings.lockoutThreshold]}
                      onValueChange={(value) => handleSecurityChange('lockoutThreshold', value[0])}
                    />
                  </div>
                )}
                
                <Separator />
                
                <div className="flex items-center justify-between space-x-2">
                  <div className="space-y-0.5">
                    <Label htmlFor="showErrorDetails" className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-amber-500" />
                      Show Detailed Error Messages
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Show detailed error information on public-facing pages (not recommended for production)
                    </p>
                  </div>
                  <Switch
                    id="showErrorDetails"
                    checked={securitySettings.showErrorDetails}
                    onCheckedChange={(checked) => handleSecurityChange('showErrorDetails', checked)}
                  />
                </div>
                
                <div className="mt-6 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 rounded-md p-4">
                  <div className="flex gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-amber-800 dark:text-amber-400">Security Recommendation</h4>
                      <p className="text-sm text-amber-800/90 dark:text-amber-400/90 mt-1">
                        Regular security audits are recommended. The last security audit was performed 47 days ago.
                      </p>
                      <Button size="sm" variant="outline" className="mt-2">Schedule Security Audit</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Button variant="outline">Cancel</Button>
                <Button onClick={saveSettings}>Save Changes</Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Email Settings Tab */}
          <TabsContent value="email">
            <Card>
              <CardHeader>
                <CardTitle>Email Configuration</CardTitle>
                <CardDescription>Configure email server settings and templates</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="smtpServer">SMTP Server</Label>
                    <Input 
                      id="smtpServer" 
                      value={emailSettings.smtpServer}
                      onChange={(e) => handleEmailChange('smtpServer', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="smtpPort">SMTP Port</Label>
                    <Input 
                      id="smtpPort" 
                      value={emailSettings.smtpPort}
                      onChange={(e) => handleEmailChange('smtpPort', e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="smtpUsername">SMTP Username</Label>
                    <Input 
                      id="smtpUsername" 
                      value={emailSettings.smtpUsername}
                      onChange={(e) => handleEmailChange('smtpUsername', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="smtpPassword">SMTP Password</Label>
                    <Input 
                      id="smtpPassword" 
                      type="password"
                      value={emailSettings.smtpPassword}
                      onChange={(e) => handleEmailChange('smtpPassword', e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="fromEmail">From Email Address</Label>
                    <Input 
                      id="fromEmail" 
                      type="email"
                      value={emailSettings.fromEmail}
                      onChange={(e) => handleEmailChange('fromEmail', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="replyToEmail">Reply-To Email Address</Label>
                    <Input 
                      id="replyToEmail" 
                      type="email"
                      value={emailSettings.replyToEmail}
                      onChange={(e) => handleEmailChange('replyToEmail', e.target.value)}
                    />
                  </div>
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between space-x-2">
                  <div className="space-y-0.5">
                    <Label htmlFor="enableSsl">Enable SSL/TLS</Label>
                    <p className="text-sm text-muted-foreground">
                      Use secure connection for sending emails
                    </p>
                  </div>
                  <Switch
                    id="enableSsl"
                    checked={emailSettings.enableSsl}
                    onCheckedChange={(checked) => handleEmailChange('enableSsl', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between space-x-2">
                  <div className="space-y-0.5">
                    <Label htmlFor="enableSmtpAuth">SMTP Authentication</Label>
                    <p className="text-sm text-muted-foreground">
                      Use username and password authentication for SMTP server
                    </p>
                  </div>
                  <Switch
                    id="enableSmtpAuth"
                    checked={emailSettings.enableSmtpAuth}
                    onCheckedChange={(checked) => handleEmailChange('enableSmtpAuth', checked)}
                  />
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-md font-medium mb-4">Email Templates</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <Card className="overflow-hidden">
                      <CardHeader className="p-4">
                        <CardTitle className="text-sm font-medium">Welcome Email</CardTitle>
                      </CardHeader>
                      <CardContent className="p-0">
                        <div className="h-32 bg-muted flex items-center justify-center px-4">
                          <p className="text-xs text-muted-foreground text-center">
                            Template preview would appear here
                          </p>
                        </div>
                      </CardContent>
                      <CardFooter className="p-2 bg-muted">
                        <Button size="sm" variant="ghost" className="w-full">Edit Template</Button>
                      </CardFooter>
                    </Card>
                    
                    <Card className="overflow-hidden">
                      <CardHeader className="p-4">
                        <CardTitle className="text-sm font-medium">Password Reset</CardTitle>
                      </CardHeader>
                      <CardContent className="p-0">
                        <div className="h-32 bg-muted flex items-center justify-center px-4">
                          <p className="text-xs text-muted-foreground text-center">
                            Template preview would appear here
                          </p>
                        </div>
                      </CardContent>
                      <CardFooter className="p-2 bg-muted">
                        <Button size="sm" variant="ghost" className="w-full">Edit Template</Button>
                      </CardFooter>
                    </Card>
                    
                    <Card className="overflow-hidden">
                      <CardHeader className="p-4">
                        <CardTitle className="text-sm font-medium">Notifications</CardTitle>
                      </CardHeader>
                      <CardContent className="p-0">
                        <div className="h-32 bg-muted flex items-center justify-center px-4">
                          <p className="text-xs text-muted-foreground text-center">
                            Template preview would appear here
                          </p>
                        </div>
                      </CardContent>
                      <CardFooter className="p-2 bg-muted">
                        <Button size="sm" variant="ghost" className="w-full">Edit Template</Button>
                      </CardFooter>
                    </Card>
                  </div>
                </div>
                
                <div className="flex justify-start gap-3 pt-2">
                  <Button 
                    variant="outline" 
                    className="flex items-center gap-2"
                    onClick={sendTestEmail}
                  >
                    <Mail className="h-4 w-4" />
                    Send Test Email
                  </Button>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Button variant="outline">Cancel</Button>
                <Button onClick={saveSettings}>Save Changes</Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* API Settings Tab */}
          <TabsContent value="api">
            <Card>
              <CardHeader>
                <CardTitle>API & Integration Settings</CardTitle>
                <CardDescription>Configure API access and third-party integrations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between space-x-2">
                  <div className="space-y-0.5">
                    <Label htmlFor="enableApiAccess">Enable API Access</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow external applications to access the platform's API
                    </p>
                  </div>
                  <Switch
                    id="enableApiAccess"
                    checked={apiSettings.enableApiAccess}
                    onCheckedChange={(checked) => handleApiChange('enableApiAccess', checked)}
                  />
                </div>
                
                {apiSettings.enableApiAccess && (
                  <>
                    <div className="space-y-2 pl-6 border-l-2 border-primary/20">
                      <div className="flex justify-between">
                        <Label htmlFor="rateLimitPerMinute">Rate Limit (requests per minute)</Label>
                        <span className="text-sm text-muted-foreground">{apiSettings.rateLimitPerMinute} req/min</span>
                      </div>
                      <Slider
                        id="rateLimitPerMinute"
                        min={10}
                        max={500}
                        step={10}
                        value={[apiSettings.rateLimitPerMinute]}
                        onValueChange={(value) => handleApiChange('rateLimitPerMinute', value[0])}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between space-x-2 pl-6 border-l-2 border-primary/20">
                      <div className="space-y-0.5">
                        <Label htmlFor="requireApiKey">Require API Key</Label>
                        <p className="text-sm text-muted-foreground">
                          Require authentication via API key for all requests
                        </p>
                      </div>
                      <Switch
                        id="requireApiKey"
                        checked={apiSettings.requireApiKey}
                        onCheckedChange={(checked) => handleApiChange('requireApiKey', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between space-x-2 pl-6 border-l-2 border-primary/20">
                      <div className="space-y-0.5">
                        <Label htmlFor="allowCors">Allow CORS</Label>
                        <p className="text-sm text-muted-foreground">
                          Enable Cross-Origin Resource Sharing for the API
                        </p>
                      </div>
                      <Switch
                        id="allowCors"
                        checked={apiSettings.allowCors}
                        onCheckedChange={(checked) => handleApiChange('allowCors', checked)}
                      />
                    </div>
                    
                    {apiSettings.allowCors && (
                      <div className="space-y-2 pl-6 border-l-2 border-primary/20">
                        <Label htmlFor="allowedOrigins">Allowed Origins (comma-separated)</Label>
                        <Input 
                          id="allowedOrigins" 
                          value={apiSettings.allowedOrigins}
                          onChange={(e) => handleApiChange('allowedOrigins', e.target.value)}
                          placeholder="https://example.com, https://app.example.com"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Use wildcards like https://*.example.com or * for all origins (not recommended)
                        </p>
                      </div>
                    )}
                    
                    <div className="pl-6 border-l-2 border-primary/20">
                      <Card className="bg-muted/50">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium">API Keys</CardTitle>
                        </CardHeader>
                        <CardContent className="pb-2">
                          <div className="flex items-center justify-between border-b dark:border-gray-700 py-2">
                            <div>
                              <p className="text-sm font-medium">Main Production Key</p>
                              <p className="text-xs text-muted-foreground">Created: 2025-01-15</p>
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline">Reveal</Button>
                              <Button size="sm" variant="outline">Regenerate</Button>
                            </div>
                          </div>
                          <div className="flex items-center justify-between border-b dark:border-gray-700 py-2">
                            <div>
                              <p className="text-sm font-medium">Testing Key</p>
                              <p className="text-xs text-muted-foreground">Created: 2025-02-10</p>
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline">Reveal</Button>
                              <Button size="sm" variant="outline">Regenerate</Button>
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter className="pt-2">
                          <Button size="sm" variant="outline" className="w-full">
                            Generate New API Key
                          </Button>
                        </CardFooter>
                      </Card>
                    </div>
                  </>
                )}
                
                <Separator />
                
                <div>
                  <h3 className="text-md font-medium mb-4">Connected Services</h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="flex items-center justify-between p-4 border rounded-md">
                      <div className="flex items-center space-x-4">
                        <Cloud className="h-8 w-8 text-blue-500" />
                        <div>
                          <p className="font-medium">Cloud Storage Integration</p>
                          <p className="text-sm text-muted-foreground">AWS S3 for file storage</p>
                        </div>
                      </div>
                      <Badge>Connected</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 border rounded-md">
                      <div className="flex items-center space-x-4">
                        <Database className="h-8 w-8 text-amber-500" />
                        <div>
                          <p className="font-medium">Analytics Integration</p>
                          <p className="text-sm text-muted-foreground">Connected to Google Analytics</p>
                        </div>
                      </div>
                      <Badge>Connected</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 border rounded-md bg-muted/50">
                      <div className="flex items-center space-x-4">
                        <Server className="h-8 w-8 text-gray-400" />
                        <div>
                          <p className="font-medium">CDN Integration</p>
                          <p className="text-sm text-muted-foreground">Not configured</p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">Connect</Button>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 border rounded-md bg-muted/50">
                      <div className="flex items-center space-x-4">
                        <Globe className="h-8 w-8 text-gray-400" />
                        <div>
                          <p className="font-medium">Social Media Integration</p>
                          <p className="text-sm text-muted-foreground">Not configured</p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">Connect</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Button variant="outline">Cancel</Button>
                <Button onClick={saveSettings}>Save Changes</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}