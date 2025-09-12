import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useShadowResume } from '@/hooks/use-shadow-resume';
import { Resume } from '@/types/resume';

import Header from "@/components/layout/header";
import { NeoGlassLayout, NeoGlassSection } from "@/components/layout/neo-glass-layout";
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import ShadowResumeSection from '@/components/resume/shadow-resume-section';
import MuskResumeWriter from '@/components/resume/musk-resume-writer';
import ResumeEditor from '@/pages/resume-editor';
import backgroundImage from "@assets/Brandentifier Landing_1751376023002.png";

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
  

  // Create shadow resume mutation
  const createResumeMutation = useMutation<any, Error, void>({
    mutationFn: async () => {
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
      createResumeMutation.mutate();
    }
  }, [user?.id, userData, resumeData?.resume, isResumeLoading, createResumeMutation.isPending]);
  
  // Fix data contract: combine resume and form data properly
  const resume = resumeData?.resume ? {
    ...resumeData.resume,
    form: resumeData.form // Include form data in resume object
  } : null;
  

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
    <div 
      className="flex h-screen flex-col responsive-background"
      style={{ 
        backgroundImage: `url(${backgroundImage})`
      }}
    >
      {/* Glass UI overlay to maintain design consistency - Modal Screen Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900/80 via-black/70 to-gray-800/80 backdrop-blur-sm"></div>
      
      <div className="relative z-10 flex h-screen flex-col">
        <Header />
        <div className="flex flex-1 overflow-hidden">
          {/* Main content area */}
          <div className="flex-1 overflow-auto">
            <NeoGlassLayout>
              <div className="space-y-6">
                
                {/* Header Section */}
                <NeoGlassSection className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <h1 className="text-3xl font-bold text-white">Resume & CV</h1>
                      <p className="text-white/70 mt-2">View and manage your professional resume</p>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleUploadResume} className="gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20">
                        <Upload className="h-4 w-4" />
                        <span>Upload Resume</span>
                      </Button>
                    </div>
                  </div>
                </NeoGlassSection>

                {/* Tabs Section */}
                <NeoGlassSection>
                  <Tabs defaultValue="shadow-resume" value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <div className="px-6 pt-4">
                      <TabsList className="mb-6 dark-tabs-list">
                        <TabsTrigger value="shadow-resume" className="dark-tabs-trigger">
                          <Zap className="h-4 w-4 mr-2" />
                          Shadow Resume
                        </TabsTrigger>
                        <TabsTrigger value="resume-writer" className="dark-tabs-trigger">
                          <FileText className="h-4 w-4 mr-2" />
                          Resume Writer
                        </TabsTrigger>
                        <TabsTrigger value="resume-editor" className="dark-tabs-trigger">
                          <Edit2 className="h-4 w-4 mr-2" />
                          Resume Editor
                        </TabsTrigger>
                      </TabsList>
                    </div>

                    <TabsContent value="shadow-resume" className="p-6 space-y-6">
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
                          <NeoGlassSection className="p-10">
                            <div className="flex flex-col items-center justify-center text-center">
                              <Zap className="h-16 w-16 mb-4 text-blue-400 animate-pulse" />
                              <div className="space-y-4">
                                <h3 className="text-2xl font-bold mb-2 text-white">Generating Your Resume</h3>
                                <div className="flex items-center justify-center">
                                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                                </div>
                                <p className="text-white/70">
                                  Auto-generating your professional resume based on your profile...
                                </p>
                              </div>
                            </div>
                          </NeoGlassSection>
                        ) : isResumeLoading ? (
                          <NeoGlassSection className="p-10">
                            <div className="flex flex-col items-center justify-center text-center">
                              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
                              <h3 className="text-xl font-semibold text-white">Loading Resume...</h3>
                            </div>
                          </NeoGlassSection>
                        ) : (
                          <NeoGlassSection className="p-10">
                            <div className="flex flex-col items-center justify-center text-center">
                              <FileText className="h-16 w-16 mb-4 text-white/60" />
                              <div className="space-y-4">
                                <h3 className="text-2xl font-bold mb-2 text-white">Resume Will Auto-Generate</h3>
                                <p className="text-white/70 mb-4">
                                  Complete your profile and your resume will be automatically generated.
                                </p>
                              </div>
                            </div>
                          </NeoGlassSection>
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="resume-writer" className="p-6 space-y-6">
                      <div className="grid grid-cols-1 gap-6">
                        <MuskResumeWriter onGenerate={handleGeneratedContent} />
                      </div>
                    </TabsContent>

                    <TabsContent value="resume-editor" className="p-6 space-y-6">
                      {userData ? (
                        <ResumeEditor />
                      ) : null}
                    </TabsContent>
                  </Tabs>
                </NeoGlassSection>

              </div>
            </NeoGlassLayout>
          </div>
        </div>
      </div>
    </div>
  );
}