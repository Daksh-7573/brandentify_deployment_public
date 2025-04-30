import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Resume } from '@/types/resume';

import { PageLayout } from '@/components/layout/page-layout';
import { PageHeader } from '@/components/ui/page-header';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import ShadowResumeSection from '@/components/resume/shadow-resume-section';
import MuskResumeWriter from '@/components/resume/musk-resume-writer';

import { Zap, Upload, FileText, Eye } from 'lucide-react';

export default function ResumePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('shadow-resume');

  // Fetch user data
  const { data: userData, isLoading: isUserLoading } = useQuery({
    queryKey: ['/api/users', user?.id],
    enabled: !!user?.id,
  });
  
  // Fetch shadow resume for the user (if it exists)
  const { data: resumeData, isLoading: isResumeLoading, refetch: refetchResume } = useQuery<{resume: any}>({
    queryKey: ['/api/users', user?.id, 'shadow-resume'],
    enabled: !!user?.id,
    refetchOnMount: true,
    refetchOnWindowFocus: true
  });
  
  // Log data for debugging
  useEffect(() => {
    if (resumeData) {
      console.log('Shadow resume data loaded:', resumeData);
      console.log('Resume exists?', !!resumeData.resume);
    }
  }, [resumeData]);

  // State for managing resume creation process
  const [isCreationRequested, setIsCreationRequested] = useState(false);
  const [resumeReadyForViewing, setResumeReadyForViewing] = useState(false);
  
  // Auto-create shadow resume if one doesn't exist
  useEffect(() => {
    if (resumeData && !resumeData.resume && !isCreationRequested && !createResumeMutation.isPending) {
      console.log('No shadow resume found, auto-creating one...');
      createResumeMutation.mutate();
    }
    
    // If resume exists in data but still showing generating state, update the state
    if (resumeData && resumeData.resume && !resumeReadyForViewing) {
      console.log('Resume found in data, updating UI state...');
      setResumeReadyForViewing(true);
    }
  }, [resumeData]);

  // Create shadow resume mutation
  const createResumeMutation = useMutation<any, Error, void>({
    mutationFn: async () => {
      setIsCreationRequested(true);
      return await fetch(`/api/users/${user?.id}/create-shadow-resume`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user?.id }),
      }).then(res => {
        if (!res.ok) throw new Error('Failed to create shadow resume');
        return res.json();
      });
    },
    onSuccess: (data) => {
      console.log('Resume created successfully:', data);
      // Simulate Musk's processing time (in a real app, this would be actual processing)
      setTimeout(() => {
        // Set resume as ready and show notification
        setResumeReadyForViewing(true);
        toast({
          title: 'Shadow Resume Ready!',
          description: 'Musk has analyzed your profile and created a resume tailored to your career journey.',
          duration: 5000,
        });
        // Invalidate queries to refresh data
        queryClient.invalidateQueries({
          queryKey: ['/api/users', user?.id, 'shadow-resume']
        });
      }, 3000); // Simulate 3 seconds of Musk processing time
    },
    onError: (error: any) => {
      setIsCreationRequested(false);
      console.error('Error creating shadow resume:', error);
      toast({
        title: 'Failed to Create Resume',
        description: 'There was a problem creating your shadow resume.',
        variant: 'destructive',
      });
    }
  });

  // Use real resume data if available, otherwise use fallback data for UI development
  const resume = resumeData?.resume || {
    id: 0,
    userId: user?.id || 0,
    fileName: `${user?.name?.replace(/\s+/g, '') || 'User'}_Resume.pdf`,
    fileData: '',
    score: 0,
    uploadedAt: new Date(),
    isShadowResume: true,
    themeStyle: 'professional' as const,
    isDownloadable: false,
    lastUpdatedByMusk: new Date(),
    visibility: 'private' as const,
  };

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
      description="View and manage your professional resume"
      actions={
        <Button onClick={handleUploadResume} className="gap-2">
          <Upload className="h-4 w-4" />
          <span>Upload Resume</span>
        </Button>
      }
    >

      <Tabs defaultValue="shadow-resume" value={activeTab} onValueChange={setActiveTab} className="mt-6">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="shadow-resume" className="gap-2">
            <Zap className="h-4 w-4" />
            <span>Shadow Resume</span>
          </TabsTrigger>
          <TabsTrigger value="resume-writer" className="gap-2">
            <FileText className="h-4 w-4" />
            <span>Resume Writer</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="shadow-resume" className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            {console.log('Render condition check:', {
              hasResumeData: !!resumeData,
              hasResumeObject: resumeData && !!resumeData.resume,
              resumeDataKeys: resumeData ? Object.keys(resumeData) : [],
              resumeReadyState: resumeReadyForViewing
            })}
            {resumeData && resumeData.resume ? (
              <ShadowResumeSection 
                user={userData || user} 
                resume={resume}
                isCurrentUser={true}
                isOwner={true}
              />
            ) : (
              <div className="flex flex-col items-center justify-center p-10 border rounded-lg bg-card">
                <Zap className={`h-16 w-16 mb-4 ${isCreationRequested ? 'text-primary animate-pulse' : 'text-primary'}`} />
                
                <div className="space-y-4 text-center">
                  <h3 className="text-2xl font-bold mb-2">{resumeReadyForViewing ? 'Your Shadow Resume is Ready!' : 'Generating Your Shadow Resume'}</h3>
                  
                  {resumeReadyForViewing ? (
                    <>
                      <p className="text-center text-muted-foreground mb-6">
                        Musk has analyzed your profile and created a tailored resume for you.
                        Click below to view your new Shadow Resume.
                      </p>
                      <Button 
                        onClick={() => {
                          // Force refetch the resume data
                          refetchResume().then(() => {
                            toast({
                              title: 'Shadow Resume Updated',
                              description: 'Your shadow resume has been refreshed with the latest data.',
                            });
                          });
                        }}
                        className="gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        <span>View Your Shadow Resume</span>
                      </Button>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                      </div>
                      <p className="text-muted-foreground">
                        Musk is analyzing your professional profile and automatically creating your Shadow Resume...
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Your resume will be continuously updated as your career evolves.
                      </p>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="resume-writer" className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <MuskResumeWriter onGenerate={handleGeneratedContent} />
          </div>
        </TabsContent>
      </Tabs>
    </PageLayout>
  );
}