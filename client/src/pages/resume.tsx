import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useShadowResume } from '@/hooks/use-shadow-resume';
import { Resume } from '@/types/resume';

import { PageLayout } from '@/components/layout/page-layout';
import { PageHeader } from '@/components/ui/page-header';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import ShadowResumeSection from '@/components/resume/shadow-resume-section';
import MuskResumeWriter from '@/components/resume/musk-resume-writer';
import ResumeEditor from '@/pages/resume-editor';

import { Zap, Upload, FileText, Eye, Edit2 } from 'lucide-react';

export default function ResumePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState('shadow-resume');

  // Fetch user data  
  const { data: userData, isLoading: isUserLoading } = useQuery({
    queryKey: ['/api/users', user?.id],
    enabled: !!user?.id,
  });
  
  // Use the proper shadow resume hook
  const { data: resumeData, isLoading: isResumeLoading, error: resumeError } = useShadowResume(user?.id);
  
  // Log data for debugging
  useEffect(() => {
    console.log('Shadow resume data loaded:', {
      hasData: !!resumeData,
      hasResume: !!resumeData?.resume,
      hasForm: !!resumeData?.form,
      resumeId: resumeData?.resume?.id
    });
  }, [resumeData]);

  // Create shadow resume mutation
  const createResumeMutation = useMutation<any, Error, void>({
    mutationFn: async () => {
      console.log('Auto-creating shadow resume for user:', user?.id);
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
      console.log('Resume auto-generated successfully:', data);
      toast({
        title: 'Resume Generated!',
        description: 'Your professional resume has been created automatically.',
        duration: 3000,
      });
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({
        queryKey: ['/api/users', user?.id, 'shadow-resume']
      });
    },
    onError: (error: any) => {
      console.error('Error auto-generating shadow resume:', error);
      toast({
        title: 'Resume Generation Failed',
        description: 'Unable to auto-generate resume. Please try again.',
        variant: 'destructive',
      });
    }
  });

  // Auto-generate resume if none exists and user profile is available
  useEffect(() => {
    if (user?.id && userData && !resumeData?.resume && !isResumeLoading && !createResumeMutation.isPending) {
      console.log('Auto-generating resume for user with complete profile...');
      createResumeMutation.mutate();
    }
  }, [user?.id, userData, resumeData?.resume, isResumeLoading, createResumeMutation.isPending]);
  
  // Fix data contract: combine resume and form data properly
  const resume = resumeData?.resume ? {
    ...resumeData.resume,
    form: resumeData.form // Include form data in resume object
  } : null;
  
  // Log current resume state for debugging
  useEffect(() => {
    console.log('Resume state:', {
      hasResumeData: !!resumeData?.resume,
      hasFormData: !!resumeData?.form,
      isLoading: isResumeLoading
    });
  }, [resumeData, isResumeLoading]);

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
        <div className="flex gap-2">
          <Button onClick={handleUploadResume} className="gap-2">
            <Upload className="h-4 w-4" />
            <span>Upload Resume</span>
          </Button>
          {/* "Drop & Define" button removed per request */}
        </div>
      }
    >

      <Tabs defaultValue="shadow-resume" value={activeTab} onValueChange={setActiveTab} className="mt-6">
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
          <div className="grid grid-cols-1 gap-6">
            {resume ? (
              <ShadowResumeSection 
                user={userData || user} 
                resume={resume}
                isCurrentUser={true}
                isOwner={true}
                onTabChange={setActiveTab}
              />
            ) : createResumeMutation.isPending ? (
              <div className="flex flex-col items-center justify-center p-10 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-b from-gray-800/30 to-gray-900/20 backdrop-blur-sm border border-white/10">
                <Zap className={`h-16 w-16 mb-4 text-blue-400 animate-pulse`} />
                <div className="space-y-4 text-center">
                  <h3 className="text-2xl font-bold mb-2 text-white">Generating Your Resume</h3>
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                  </div>
                  <p className="text-white/70">
                    Auto-generating your professional resume based on your profile...
                  </p>
                </div>
              </div>
            ) : isResumeLoading ? (
              <div className="flex flex-col items-center justify-center p-10 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-b from-gray-800/30 to-gray-900/20 backdrop-blur-sm border border-white/10">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
                <h3 className="text-xl font-semibold text-white">Loading Resume...</h3>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-10 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-b from-gray-800/30 to-gray-900/20 backdrop-blur-sm border border-white/10">
                <FileText className="h-16 w-16 mb-4 text-white/60" />
                <div className="space-y-4 text-center">
                  <h3 className="text-2xl font-bold mb-2 text-white">Resume Will Auto-Generate</h3>
                  <p className="text-center text-white/70 mb-4">
                    Complete your profile and your resume will be automatically generated.
                  </p>
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

        <TabsContent value="resume-editor" className="space-y-6">
          {userData ? (
            <ResumeEditor />
          ) : null}
        </TabsContent>
      </Tabs>
    </PageLayout>
  );
}