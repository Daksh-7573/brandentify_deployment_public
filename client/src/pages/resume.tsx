import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

import { PageLayout } from '@/components/layout/page-layout';
import { PageHeader } from '@/components/ui/page-header';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import ShadowResumeSection from '@/components/resume/shadow-resume-section';
import MuskResumeWriter from '@/components/resume/musk-resume-writer';

import { Zap, Upload, FileText } from 'lucide-react';

export default function ResumePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('shadow-resume');

  // Fetch user data
  const { data: userData, isLoading: isUserLoading } = useQuery({
    queryKey: ['/api/users', user?.id],
    enabled: !!user?.id,
  });

  // Mock resume data (in a real app, this would come from the API)
  const mockResume = {
    id: 1,
    userId: user?.id || 0,
    fileName: `${user?.name?.replace(/\s+/g, '')}_Resume_2025.pdf`,
    fileData: '',  // Base64 data would be here
    score: 85,
    uploadedAt: new Date(),
    isShadowResume: true,
    themeStyle: 'professional' as const,
    isDownloadable: false,
    lastUpdatedByMusk: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
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
            <ShadowResumeSection 
              user={userData || user} 
              resume={mockResume}
              isCurrentUser={true}
            />
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