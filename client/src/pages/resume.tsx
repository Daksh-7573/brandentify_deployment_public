import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

import { PageLayout } from '@/components/layout/page-layout';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import MuskResumeWriter from '@/components/resume/musk-resume-writer';
import { SafeResumeEditor } from '@/components/resume/safe-resume-editor';

import { Upload, FileText, Edit2, Zap, AlertCircle, Eye, Download } from 'lucide-react';

export default function ResumePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('resume-editor');

  // Fetch user data
  const { data: userData } = useQuery({
    queryKey: ['/api/users', user?.id],
    enabled: !!user?.id,
  });

  // Fetch shadow resume for the user (if it exists)
  const { data: resumeData, isLoading: isResumeLoading, refetch: refetchResume } = useQuery<{resume: any}>({
    queryKey: ['/api/users', user?.id, 'shadow-resume'],
    enabled: !!user?.id
  });

  // Handle resume upload
  const handleUploadResume = () => {
    // This would open a file picker in a real app
    toast({
      title: 'Upload Resume',
      description: 'Resume upload functionality will be implemented soon.',
    });
  };

  // Handle generated content from MuskResumeWriter
  const handleGeneratedContent = (section: string, content: string) => {
    toast({
      title: `${section.charAt(0).toUpperCase() + section.slice(1)} Updated`,
      description: 'Your resume has been updated with the new content.',
    });
    // In a real app, this would update the resume in the database
  };
  
  // Create shadow resume mutation
  const createShadowResumeMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("User ID is required");
      
      const response = await fetch(`/api/users/${user.id}/create-shadow-resume`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create shadow resume: ${response.status} ${errorText}`);
      }
      
      const data = await response.json();
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Shadow Resume Created",
        description: "Your Shadow Resume has been created successfully.",
      });
      // Refresh the resume data
      refetchResume();
    },
    onError: (error: any) => {
      toast({
        title: "Error Creating Shadow Resume",
        description: error.message || "Failed to create Shadow Resume. Please try again.",
        variant: "destructive",
      });
    }
  });

  return (
    <PageLayout
      title="Resume & CV"
      description="View and manage your professional resume. Changes made in the Resume Editor will automatically update your Shadow Resume."
      actions={
        <Button onClick={handleUploadResume} className="gap-2">
          <Upload className="h-4 w-4" />
          <span>Upload Resume</span>
        </Button>
      }
    >
      <Tabs defaultValue="resume-editor" value={activeTab} onValueChange={setActiveTab} className="mt-6">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="shadow-resume" className="gap-2">
            <Zap className="h-4 w-4" />
            <span>Shadow Resume</span>
          </TabsTrigger>
          <TabsTrigger value="resume-writer" className="gap-2">
            <FileText className="h-4 w-4" />
            <span>Resume Writer</span>
          </TabsTrigger>
          <TabsTrigger value="resume-editor" className="gap-2">
            <Edit2 className="h-4 w-4" />
            <span>Resume Editor</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="shadow-resume" className="space-y-6">
          <Card className="w-full shadow-md">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Shadow Resume</CardTitle>
                  <CardDescription>
                    View your finalized resume automatically updated from the Resume Editor
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {isResumeLoading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-3"></div>
                    <p className="text-sm text-muted-foreground">Loading your resume...</p>
                  </div>
                </div>
              ) : resumeData?.resume ? (
                <div className="space-y-4">
                  <div className="border rounded-md p-4 bg-card">
                    <div className="text-center mb-4">
                      <h3 className="text-lg font-bold">Your Resume</h3>
                      <p className="text-sm text-muted-foreground">
                        This is the final version of your resume saved from the Resume Editor.
                      </p>
                    </div>
                    
                    {/* Display resume preview */}
                    <div className="aspect-[3/4] bg-white rounded-lg border shadow-sm overflow-hidden relative">
                      {resumeData.resume?.fileData ? (
                        <>
                          <object
                            data={`data:application/pdf;base64,${String(resumeData.resume.fileData)}`}
                            type="application/pdf"
                            className="w-full h-full"
                          >
                            <div className="w-full h-full flex flex-col items-center justify-center p-4">
                              <p className="text-sm text-center mb-4">
                                Unable to display PDF directly. Please download to view.
                              </p>
                              <Button 
                                variant="default" 
                                onClick={() => {
                                  if (resumeData?.resume?.fileData) {
                                    const link = document.createElement('a');
                                    link.href = `data:application/pdf;base64,${String(resumeData.resume.fileData)}`;
                                    link.download = resumeData.resume.fileName || 'resume.pdf';
                                    document.body.appendChild(link);
                                    link.click();
                                    document.body.removeChild(link);
                                    
                                    toast({
                                      title: "Resume Downloaded",
                                      description: "Your resume has been downloaded successfully.",
                                    });
                                  }
                                }}
                              >
                                <Download className="h-4 w-4 mr-2" />
                                Download Resume
                              </Button>
                            </div>
                          </object>
                          <div className="absolute bottom-2 right-2">
                            <Button
                              size="sm"
                              variant="secondary"
                              className="opacity-70 hover:opacity-100"
                              onClick={() => {
                                if (resumeData?.resume?.fileData) {
                                  const link = document.createElement('a');
                                  link.href = `data:application/pdf;base64,${String(resumeData.resume.fileData)}`;
                                  link.download = resumeData.resume.fileName || 'resume.pdf';
                                  document.body.appendChild(link);
                                  link.click();
                                  document.body.removeChild(link);
                                  
                                  toast({
                                    title: "Resume Downloaded",
                                    description: "Your resume has been downloaded successfully.",
                                  });
                                }
                              }}
                            >
                              <Download className="h-3 w-3 mr-1" />
                              Download
                            </Button>
                          </div>
                        </>
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <p className="text-muted-foreground">Resume preview not available</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex justify-center gap-4 mt-4">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setActiveTab('resume-editor')}
                      >
                        <Edit2 className="h-4 w-4 mr-1" />
                        Edit Resume
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          if (resumeData?.resume?.fileData) {
                            // Create anchor element and trigger download
                            const link = document.createElement('a');
                            link.href = `data:application/pdf;base64,${String(resumeData.resume.fileData)}`;
                            link.download = resumeData.resume.fileName || 'resume.pdf';
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                            
                            toast({
                              title: "Resume Downloaded",
                              description: "Your resume has been downloaded successfully.",
                            });
                          }
                        }}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Full Resume
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-8 text-center">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Resume Found</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    You haven't created a shadow resume yet. Create one now or use the Resume Editor.
                  </p>
                  <div className="flex gap-3">
                    <Button 
                      variant="default" 
                      size="sm"
                      onClick={() => createShadowResumeMutation.mutate()}
                      disabled={createShadowResumeMutation.isPending}
                    >
                      {createShadowResumeMutation.isPending ? (
                        <>
                          <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                          Creating...
                        </>
                      ) : (
                        <>
                          <Zap className="h-4 w-4 mr-1" />
                          Create Shadow Resume
                        </>
                      )}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setActiveTab('resume-editor')}
                    >
                      <Edit2 className="h-4 w-4 mr-1" />
                      Go to Editor
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resume-writer" className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <MuskResumeWriter onGenerate={handleGeneratedContent} />
          </div>
        </TabsContent>

        <TabsContent value="resume-editor" className="space-y-6">
          {userData ? (
            <React.Suspense fallback={
              <div className="flex items-center justify-center p-8">
                <p>Loading editor...</p>
              </div>
            }>
              <SafeResumeEditor />
            </React.Suspense>
          ) : (
            <div className="flex items-center justify-center p-8">
              <p>Loading editor...</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </PageLayout>
  );
}