/**
 * Resume & CV Page
 * Displays user resume and allows editing
 */

import React, { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useResume } from '@/hooks/use-resume';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, FileText, DownloadCloud, RefreshCw, PenSquare, Eye } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function ResumeCV() {
  const { user } = useAuth();
  const userId = user?.id;
  const { resumeStatus, isLoading, isGenerating, generateResume } = useResume(userId);
  const [activeTab, setActiveTab] = useState('view');

  // Check if resume exists
  const hasResume = resumeStatus?.hasGeneratedResume && resumeStatus?.resumeUrl;
  
  // Format the resume generation date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Unknown date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Generate a new resume
  const handleGenerateResume = () => {
    generateResume();
  };
  
  // View the generated resume
  const handleViewResume = () => {
    if (hasResume && resumeStatus?.resumeUrl) {
      window.open(resumeStatus.resumeUrl, '_blank');
    }
  };
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Resume & CV</h1>
        <p className="text-gray-600">Manage your professional resume generated from your portfolio data</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Sidebar */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Resume Status</CardTitle>
              <CardDescription>
                Your auto-generated resume based on your profile information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-500">Status</div>
                  <div className="flex items-center">
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin text-muted-foreground" />
                    ) : hasResume ? (
                      <FileText className="h-4 w-4 mr-2 text-green-500" />
                    ) : (
                      <DownloadCloud className="h-4 w-4 mr-2 text-amber-500" />
                    )}
                    <span className={hasResume ? 'text-green-700' : 'text-amber-700'}>
                      {hasResume ? 'Resume generated' : 'No resume generated yet'}
                    </span>
                  </div>
                </div>
                
                {hasResume && resumeStatus?.resumeGeneratedAt && (
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-500">Last Updated</div>
                    <div>{formatDate(resumeStatus.resumeGeneratedAt)}</div>
                  </div>
                )}
                
                <Separator className="my-4" />
                
                <div className="space-y-4">
                  <Button 
                    onClick={handleGenerateResume} 
                    disabled={isLoading || isGenerating}
                    className="w-full"
                  >
                    {isLoading || isGenerating ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : hasResume ? (
                      <RefreshCw className="mr-2 h-4 w-4" />
                    ) : (
                      <DownloadCloud className="mr-2 h-4 w-4" />
                    )}
                    {hasResume ? 'Regenerate Resume' : 'Generate Resume'}
                  </Button>
                  
                  {hasResume && (
                    <Button 
                      variant="outline" 
                      onClick={handleViewResume} 
                      className="w-full"
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      View Resume
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Main Content */}
        <div className="md:col-span-2">
          {!hasResume ? (
            <Card>
              <CardHeader>
                <CardTitle>Generate Your Resume</CardTitle>
                <CardDescription>
                  We can automatically generate a professional resume from your profile information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Alert className="mb-6">
                  <AlertDescription>
                    You haven't generated a resume yet. Click the button below to create one based on 
                    your profile information, including work experiences, skills, education, and projects.
                  </AlertDescription>
                </Alert>
                
                <Button onClick={handleGenerateResume} disabled={isLoading || isGenerating}>
                  {isLoading || isGenerating ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <DownloadCloud className="mr-2 h-4 w-4" />
                  )}
                  Generate Resume Now
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Your Resume</CardTitle>
                <CardDescription>
                  View and manage your generated resume
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="view" className="w-full" 
                  value={activeTab} 
                  onValueChange={setActiveTab}
                >
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="view">View Resume</TabsTrigger>
                    <TabsTrigger value="edit">Edit Resume</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="view" className="min-h-[400px]">
                    <div className="bg-gray-100 rounded-md p-4 text-center min-h-[400px] flex flex-col items-center justify-center">
                      <FileText size={48} className="text-gray-400 mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Your Resume is Ready</h3>
                      <p className="text-gray-600 mb-6 max-w-md">
                        Your resume has been generated successfully based on your profile information.
                      </p>
                      <Button 
                        onClick={handleViewResume} 
                        className="min-w-[200px]"
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View Resume in Browser
                      </Button>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="edit" className="min-h-[400px]">
                    <div className="bg-gray-100 rounded-md p-4 text-center min-h-[400px] flex flex-col items-center justify-center">
                      <PenSquare size={48} className="text-gray-400 mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Customize Your Resume</h3>
                      <p className="text-gray-600 mb-6 max-w-md">
                        To edit your resume, update your profile information including work experiences, 
                        education, skills, and projects. Then regenerate your resume.
                      </p>
                      <div className="space-y-3">
                        <Button 
                          onClick={handleGenerateResume} 
                          disabled={isLoading || isGenerating}
                          className="min-w-[200px]"
                        >
                          {isLoading || isGenerating ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <RefreshCw className="mr-2 h-4 w-4" />
                          )}
                          Regenerate Resume
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}