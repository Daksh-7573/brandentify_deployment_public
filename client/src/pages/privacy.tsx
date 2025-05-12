import React, { useState, useEffect } from 'react';
import DataRequestForm from '@/components/privacy/data-request-form';
import { useAuth } from '@/hooks/use-auth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { InfoIcon, Download, UserRoundX, AlertCircle } from 'lucide-react';
import DashboardLayout from '@/components/layout/dashboard-layout';

// Data request status
enum DataRequestStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  REJECTED = 'rejected'
}

// Data request type
enum DataRequestType {
  ACCESS = 'access',
  DELETION = 'deletion',
  CORRECTION = 'correction',
  RESTRICTION = 'restriction',
  PORTABILITY = 'portability',
  OBJECTION = 'objection'
}

// Data request interface
interface DataRequest {
  id: string;
  userId: string;
  type: DataRequestType;
  description?: string;
  status: DataRequestStatus;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

const PrivacyPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('data-control');
  const [dataRequests, setDataRequests] = useState<DataRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDataRequests = async () => {
    if (!user?.uid) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/privacy/data-requests', {
        headers: {
          'user-id': user.uid
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch data requests');
      }
      
      const data = await response.json();
      setDataRequests(data);
    } catch (error) {
      console.error('Error fetching data requests:', error);
      setError('Failed to load your data requests. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.uid) {
      fetchDataRequests();
    }
  }, [user?.uid]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusBadgeClass = (status: DataRequestStatus) => {
    switch (status) {
      case DataRequestStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800';
      case DataRequestStatus.PROCESSING:
        return 'bg-blue-100 text-blue-800';
      case DataRequestStatus.COMPLETED:
        return 'bg-green-100 text-green-800';
      case DataRequestStatus.REJECTED:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDownloadData = async () => {
    if (!user?.uid) return;
    
    try {
      const response = await fetch('/api/privacy/my-data', {
        headers: {
          'user-id': user.uid
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to download data');
      }
      
      const data = await response.json();
      
      // Create a downloadable file
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'my-personal-data.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading data:', error);
      setError('Failed to download your data. Please try again later.');
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Privacy & Data Control</h1>
          <p className="text-muted-foreground">
            Manage your privacy settings and control your personal data.
          </p>
        </div>
        
        {!user && (
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Authentication Required</AlertTitle>
            <AlertDescription>
              Please sign in to access your privacy settings and data control options.
            </AlertDescription>
          </Alert>
        )}
        
        <Tabs defaultValue="data-control" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="data-control">Data Control</TabsTrigger>
            <TabsTrigger value="cookie-preferences">Cookie Preferences</TabsTrigger>
            <TabsTrigger value="request-history">Request History</TabsTrigger>
            <TabsTrigger value="privacy-policies">Privacy Policies</TabsTrigger>
          </TabsList>
          
          <TabsContent value="data-control">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Download className="mr-2 h-5 w-5" />
                    Download Your Data
                  </CardTitle>
                  <CardDescription>
                    Get a copy of all your personal data that we store.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-4">
                    This includes your profile information, activity data, and preferences.
                    The data will be provided in JSON format.
                  </p>
                  <Button 
                    onClick={handleDownloadData}
                    disabled={!user}
                  >
                    Download My Data
                  </Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <UserRoundX className="mr-2 h-5 w-5" />
                    Delete Your Account
                  </CardTitle>
                  <CardDescription>
                    Permanently delete your account and all associated data.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Warning</AlertTitle>
                    <AlertDescription>
                      This action cannot be undone. All your data will be permanently deleted.
                    </AlertDescription>
                  </Alert>
                  <Button 
                    variant="destructive"
                    disabled={!user}
                  >
                    Request Account Deletion
                  </Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Submit a Data Request</CardTitle>
                  <CardDescription>
                    Request access, correction, deletion, or other actions regarding your personal data.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <DataRequestForm 
                    userId={user?.uid || ''} 
                    onRequestSubmitted={fetchDataRequests}
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="cookie-preferences">
            <Card>
              <CardHeader>
                <CardTitle>Cookie Preferences</CardTitle>
                <CardDescription>
                  Control which types of cookies we can use when you visit our platform.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Essential Cookies</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      These cookies are necessary for the website to function and cannot be switched off.
                      They are usually only set in response to actions made by you which amount to a request
                      for services, such as setting your privacy preferences, logging in or filling in forms.
                    </p>
                    <div className="bg-muted p-3 rounded-md">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Always Active</span>
                        <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Enabled</span>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2">Functional Cookies</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      These cookies enable the website to provide enhanced functionality and personalization.
                      They may be set by us or by third party providers whose services we have added to our pages.
                    </p>
                    <div className="flex justify-end">
                      <Button variant="outline" size="sm">Manage Preferences</Button>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2">Analytics Cookies</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      These cookies help us understand how visitors interact with our website.
                      They help us measure and improve the performance of our site.
                    </p>
                    <div className="flex justify-end">
                      <Button variant="outline" size="sm">Manage Preferences</Button>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2">Marketing Cookies</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      These cookies may be set through our site by our advertising partners.
                      They may be used by those companies to build a profile of your interests and
                      show you relevant advertisements on other sites.
                    </p>
                    <div className="flex justify-end">
                      <Button variant="outline" size="sm">Manage Preferences</Button>
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button variant="outline">Reject All</Button>
                    <Button>Accept All</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="request-history">
            <Card>
              <CardHeader>
                <CardTitle>Data Request History</CardTitle>
                <CardDescription>
                  View the status and history of your data-related requests.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="py-4 text-center">Loading your request history...</div>
                ) : error ? (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                ) : dataRequests.length === 0 ? (
                  <div className="py-4 text-center text-muted-foreground">
                    You haven't made any data requests yet.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b">
                          <th className="py-3 px-4 text-left">Request Type</th>
                          <th className="py-3 px-4 text-left">Date Submitted</th>
                          <th className="py-3 px-4 text-left">Status</th>
                          <th className="py-3 px-4 text-left">Last Updated</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dataRequests.map((request) => (
                          <tr key={request.id} className="border-b hover:bg-muted/50">
                            <td className="py-3 px-4 capitalize">
                              {request.type.replace('_', ' ')}
                            </td>
                            <td className="py-3 px-4">
                              {formatDate(request.createdAt.toString())}
                            </td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadgeClass(request.status)}`}>
                                {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              {formatDate(request.updatedAt.toString())}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                <div className="mt-4">
                  <Button variant="outline" onClick={fetchDataRequests} disabled={isLoading}>
                    Refresh
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="privacy-policies">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <InfoIcon className="mr-2 h-5 w-5" />
                    Privacy Policy
                  </CardTitle>
                  <CardDescription>
                    Last updated: {new Date().toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-4">
                    Our Privacy Policy describes how we collect, use, process, and disclose your information.
                  </p>
                  <Button variant="outline" onClick={() => window.open('/privacy-policy', '_blank')}>
                    View Privacy Policy
                  </Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <InfoIcon className="mr-2 h-5 w-5" />
                    Cookie Policy
                  </CardTitle>
                  <CardDescription>
                    Last updated: {new Date().toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-4">
                    Our Cookie Policy explains how we use cookies and similar technologies.
                  </p>
                  <Button variant="outline" onClick={() => window.open('/cookie-policy', '_blank')}>
                    View Cookie Policy
                  </Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <InfoIcon className="mr-2 h-5 w-5" />
                    Data Deletion Policy
                  </CardTitle>
                  <CardDescription>
                    Last updated: {new Date().toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-4">
                    Our Data Deletion Policy outlines how you can request deletion of your data.
                  </p>
                  <Button variant="outline" disabled>
                    View Data Deletion Policy
                  </Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <InfoIcon className="mr-2 h-5 w-5" />
                    IT Rules 2021 Compliance (India)
                  </CardTitle>
                  <CardDescription>
                    Last updated: {new Date().toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-4">
                    Details about our compliance with the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021.
                  </p>
                  <Button variant="outline" disabled>
                    View IT Rules Compliance
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default PrivacyPage;