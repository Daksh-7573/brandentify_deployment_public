import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

import { PageLayout } from '@/components/layout/page-layout';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import MuskResumeWriter from '@/components/resume/musk-resume-writer';
import ResumeEditor from '@/pages/resume-editor';

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
  const { data: resumeData } = useQuery<{resume: any}>({
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
              {resumeData?.resume ? (
                <div className="space-y-4">
                  <div className="border rounded-md p-4 bg-card">
                    <div className="text-center mb-4">
                      <h3 className="text-lg font-bold">Your Resume</h3>
                      <p className="text-sm text-muted-foreground">
                        This is the final version of your resume saved from the Resume Editor.
                      </p>
                    </div>
                    
                    {/* Display resume preview */}
                    <div className="aspect-[3/4] bg-white rounded-lg border shadow-sm overflow-hidden">
                      {resumeData.resume && resumeData.resume.fileData ? (
                        <div className="w-full h-full flex flex-col items-center justify-center p-4">
                          <p className="text-sm text-center mb-4">
                            Your resume is ready to view or download
                          </p>
                          <Button 
                            variant="default" 
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
                            <Download className="h-4 w-4 mr-2" />
                            Download Resume
                          </Button>
                        </div>
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
                    You haven't created a resume yet. Use the Resume Editor to create and save your resume.
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setActiveTab('resume-editor')}
                  >
                    Go to Resume Editor
                  </Button>
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
            <ResumeEditor />
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