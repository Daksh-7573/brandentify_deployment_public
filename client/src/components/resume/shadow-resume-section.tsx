import React, { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';

import { 
  Zap,
  Download,
  Eye,
  Calendar,
  FileText,
  Pencil
} from 'lucide-react';

import { formatDistanceToNow } from 'date-fns';
import { UserData } from '@/types/user';
import { Resume, ResumeTheme } from '@/types/resume';

interface ShadowResumeProps {
  user: UserData | any; // Using any for demo purposes to handle potential null or partial data
  resume?: Resume;
  isCurrentUser: boolean;
  isOwner?: boolean;
}

export default function ShadowResumeSection({ user, resume, isCurrentUser, isOwner = true }: ShadowResumeProps) {
  const { toast } = useToast();
  const [resumeTheme, setResumeTheme] = useState<ResumeTheme>(
    (resume?.themeStyle as ResumeTheme) || 'professional'
  );
  const [isDownloadable, setIsDownloadable] = useState(resume?.isDownloadable || false);
  const [historyVersion, setHistoryVersion] = useState(100); // Percentage representing the latest version
  
  // Update resume mutation
  const updateResumeMutation = useMutation<any, Error, {themeStyle?: ResumeTheme, isDownloadable?: boolean}>({
    mutationFn: async (updates) => {
      if (!resume) return null;
      
      return await fetch(`/api/resumes/${resume.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      }).then(res => {
        if (!res.ok) throw new Error('Failed to update resume');
        return res.json();
      });
    },
    onSuccess: () => {
      toast({
        title: 'Resume Updated',
        description: 'Your resume settings have been updated.',
      });
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({
        queryKey: ['/api/users', user?.id, 'shadow-resume']
      });
    },
    onError: (error) => {
      console.error('Error updating resume:', error);
      toast({
        title: 'Update Failed',
        description: 'There was a problem updating your resume.',
        variant: 'destructive',
      });
    }
  });
  
  // Generate content mutation
  const generateContentMutation = useMutation<any, Error, {section: string, prompt: string}>({
    mutationFn: async ({section, prompt}) => {
      if (!resume) return null;
      
      return await fetch('/api/resume/generate-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resumeId: resume.id,
          userId: user.id,
          section,
          prompt
        }),
      }).then(res => {
        if (!res.ok) throw new Error('Failed to generate content');
        return res.json();
      });
    },
    onSuccess: (data) => {
      toast({
        title: 'Content Generated',
        description: `Musk has generated content for your resume.`,
      });
    },
    onError: (error) => {
      console.error('Error generating content:', error);
      toast({
        title: 'Generation Failed',
        description: 'There was a problem generating content.',
        variant: 'destructive',
      });
    }
  });

  // Mock resume history items (in a real app, these would come from the backend)
  const mockHistoryItems = [
    { date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), description: 'Added leadership skill from XYZ project', version: 90 },
    { date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10), description: 'Updated summary to highlight design skills', version: 70 },
    { date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20), description: 'Added certifications section with new AWS certificate', version: 50 },
    { date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30), description: 'Initial resume creation based on profile data', version: 30 },
  ];

  // Format options for themes that match portfolio layouts
  const themeOptions = [
    { value: 'professional', label: 'Professional' },
    { value: 'creative', label: 'Creative' },
    { value: 'minimal', label: 'Minimal' },
    { value: 'technical', label: 'Technical' },
    { value: 'executive', label: 'Executive' },
    { value: 'minimalist_pro', label: 'Minimalist Pro' },
    { value: 'timeline', label: 'Timeline Storyteller' },
    { value: 'visual_expert', label: 'Visual Expert' },
    { value: 'freelancer_hub', label: 'Freelancer Hub' },
    { value: 'scholar', label: 'Scholar' },
    { value: 'animated', label: 'Animated' },
    { value: 'dynamic_innovator', label: 'Dynamic Innovator' },
  ];

  // Effect to sync component state with server updates
  useEffect(() => {
    if (resume) {
      setResumeTheme((resume.themeStyle as ResumeTheme) || 'professional');
      setIsDownloadable(resume.isDownloadable || false);
    }
  }, [resume]);

  // Handle theme change
  const handleThemeChange = (value: string) => {
    setResumeTheme(value as ResumeTheme);
    
    if (resume) {
      updateResumeMutation.mutate({
        themeStyle: value as ResumeTheme
      });
    }
  };

  // Handle download permission change
  const handleDownloadableChange = (checked: boolean) => {
    setIsDownloadable(checked);
    
    if (resume) {
      updateResumeMutation.mutate({
        isDownloadable: checked
      });
    }
  };

  // Handle history slider change
  const handleHistoryChange = (value: number[]) => {
    setHistoryVersion(value[0]);
    // In a real app, you would load the appropriate version of the resume
  };

  // Handle download click
  const handleDownload = () => {
    if (resume && resume.fileData) {
      // Convert base64 to blob for download
      const byteCharacters = atob(resume.fileData);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });
      
      // Create a URL for the blob
      const url = URL.createObjectURL(blob);
      
      // Create a temporary anchor element to trigger download
      const a = document.createElement('a');
      a.href = url;
      a.download = resume.fileName || 'resume.pdf';
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
    } else {
      toast({
        title: 'No Resume Available',
        description: 'There is no resume content to download yet.',
        variant: 'destructive',
      });
    }
  };

  // Get the current history item based on slider value
  const getCurrentHistoryItem = () => {
    if (historyVersion >= 95) return { date: new Date(), description: 'Current version' };
    
    for (let i = 0; i < mockHistoryItems.length; i++) {
      if (mockHistoryItems[i].version <= historyVersion) {
        return mockHistoryItems[i];
      }
    }
    return mockHistoryItems[mockHistoryItems.length - 1];
  };

  const currentHistoryItem = getCurrentHistoryItem();

  // Get last updated time
  const getLastUpdateText = () => {
    if (!resume?.lastUpdatedByMusk) return 'Not yet updated by Musk';
    return formatDistanceToNow(new Date(resume.lastUpdatedByMusk), { addSuffix: true });
  };

  return (
    <Card className="w-full shadow-md">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Shadow Resume</CardTitle>
            <CardDescription>
              Your living CV, automatically maintained by Musk
            </CardDescription>
          </div>
          {resume?.lastUpdatedByMusk && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Zap className="h-3 w-3" />
              <span>Last Updated by Musk: {getLastUpdateText()}</span>
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {!resume && (
          <div className="flex flex-col items-center justify-center p-8 text-center border-2 border-dashed border-muted-foreground/20 rounded-md">
            <Zap className="h-10 w-10 text-primary/60 mb-3" />
            <h3 className="text-lg font-medium">Your Shadow Resume</h3>
            <p className="text-sm text-muted-foreground mt-1 mb-3">
              Musk will automatically create and maintain your resume as you grow professionally
            </p>
            <Button variant="outline" size="sm">
              Upload Resume to Get Started
            </Button>
          </div>
        )}

        {resume && (
          <>
            {/* Resume Preview */}
            <div className="aspect-[3/4] bg-card border rounded-lg flex items-center justify-center overflow-hidden">
              {resume?.fileData ? (
                <div className="w-full h-full relative">
                  <iframe 
                    src={`data:application/pdf;base64,${resume.fileData}`}
                    className="w-full h-full absolute top-0 left-0 border-0"
                    title="Resume Preview"
                  />
                </div>
              ) : (
                <div className="text-center p-6">
                  <p className="text-muted-foreground text-sm">Resume Preview</p>
                  <h2 className="text-xl font-bold mt-2">{user.name}</h2>
                  <p className="text-sm text-muted-foreground">{user.title}</p>
                  
                  {/* Fallback if no PDF data is available */}
                  <div className="w-3/4 mx-auto mt-6 h-64 bg-muted rounded opacity-30"></div>
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="flex flex-wrap gap-4 mt-4">
              <div className="flex-1 min-w-[200px]">
                <Label htmlFor="resume-theme">Resume Style</Label>
                <Select value={resumeTheme} onValueChange={handleThemeChange}>
                  <SelectTrigger id="resume-theme" className="w-full">
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    {themeOptions.map(theme => (
                      <SelectItem 
                        key={theme.value} 
                        value={theme.value}
                      >
                        {theme.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {isOwner && (
                <div className="flex-1 min-w-[200px]">
                  <div className="flex items-center space-x-2 h-full pt-6">
                    <Switch 
                      id="allow-download" 
                      checked={isDownloadable} 
                      onCheckedChange={handleDownloadableChange} 
                    />
                    <Label htmlFor="allow-download">Allow others to download</Label>
                  </div>
                </div>
              )}
            </div>

            {/* Resume History Slider */}
            {isOwner && (
              <div className="space-y-2 mt-4 pt-4 border-t">
                <div className="flex justify-between items-center">
                  <Label htmlFor="history-slider" className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>Resume History</span>
                  </Label>
                  <Badge variant="outline" className="text-xs">
                    {currentHistoryItem.description}
                  </Badge>
                </div>
                <Slider
                  id="history-slider"
                  defaultValue={[100]}
                  max={100}
                  step={1}
                  value={[historyVersion]}
                  onValueChange={handleHistoryChange}
                  className="w-full"
                />
              </div>
            )}
          </>
        )}
      </CardContent>

      {/* Always show the buttons for the resume */}
      <CardFooter className="flex justify-between border-t pt-4">
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-1"
            onClick={() => {
              console.log("View button clicked - resume data:", {
                hasData: !!resume,
                fileDataLength: resume?.fileData ? resume.fileData.length : 0,
                resumeId: resume?.id
              });
              
              // Open resume in a new tab if data is available
              if (resume?.fileData) {
                try {
                  // Create data URL and log information for debugging
                  const dataUrl = `data:application/pdf;base64,${resume.fileData}`;
                  console.log("Attempting to open PDF with data URL length:", dataUrl.length);
                  
                  // Create a temporary link and trigger click
                  const link = document.createElement('a');
                  link.href = dataUrl;
                  link.target = '_blank';
                  link.click();
                  
                  toast({
                    title: 'Opening Resume',
                    description: 'Your shadow resume should open in a new tab.',
                  });
                } catch (error) {
                  console.error("Error opening PDF:", error);
                  toast({
                    title: 'Error Opening Resume',
                    description: 'There was a problem displaying your resume. Please try again.',
                    variant: 'destructive',
                  });
                }
              } else {
                toast({
                  title: 'No Preview Available',
                  description: 'This resume has no content to preview yet.',
                  variant: 'destructive',
                });
              }
            }}
          >
            <Eye className="h-4 w-4" />
            <span>View</span>
          </Button>
          {isOwner && (
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-1"
              onClick={() => {
                // Navigate to edit page or open edit modal
                toast({
                  title: 'Edit Resume',
                  description: 'Resume editing is accessed through the Resume Writer tab.',
                });
              }}
            >
              <Pencil className="h-4 w-4" />
              <span>Edit</span>
            </Button>
          )}
        </div>
        <Button 
          variant="default" 
          size="sm" 
          className="gap-1"
          onClick={handleDownload}
          disabled={(!isOwner && !resume?.isDownloadable) || updateResumeMutation.isPending}
        >
          {updateResumeMutation.isPending ? (
            <span>Saving...</span>
          ) : (
            <>
              <Download className="h-4 w-4" />
              <span>Download</span>
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}