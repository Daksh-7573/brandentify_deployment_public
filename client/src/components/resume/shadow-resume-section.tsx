import React, { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
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

import { formatDistanceToNow, format } from 'date-fns';
import { UserData } from '@/types/user';
import { Resume, ResumeTheme } from '@/types/resume';
import { WorkExperience, Education } from '@/types/profile';

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
  
  // Fetch work experiences for the user
  const { data: workExperiences = [] } = useQuery<WorkExperience[]>({
    queryKey: ['/api/users', user?.id, 'experiences'],
    enabled: !!user?.id,
  });
  
  // Fetch education data for the user
  const { data: education = [] } = useQuery<Education[]>({
    queryKey: ['/api/users', user?.id, 'education'],
    enabled: !!user?.id,
  });
  
  // Fetch user skills 
  const { data: skills = [] } = useQuery<any[]>({
    queryKey: ['/api/users', user?.id, 'skills'],
    enabled: !!user?.id,
  });
  
  // Fetch user projects
  const { data: projects = [] } = useQuery<any[]>({
    queryKey: ['/api/users', user?.id, 'projects'],
    enabled: !!user?.id,
  });
  
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
                <div className="w-full h-full flex flex-col items-center justify-center p-6 relative">
                  {/* Actual resume preview with PDF appearance */}
                  <div className="w-full h-full relative bg-white shadow-lg rounded overflow-hidden">
                    {/* Document header */}
                    <div className="absolute top-0 left-0 right-0 h-8 bg-gray-100 border-b flex items-center justify-between px-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                        <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                        <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                      </div>
                      <div className="text-xs text-gray-500">{resume.fileName || 'resume.pdf'}</div>
                    </div>
                    
                    {/* Resume content - comprehensive data from the user profile */}
                    <div className="pt-10 px-6 pb-16 text-xs overflow-y-auto max-h-full">
                      {/* Header Section */}
                      <div className="border-b border-gray-200 pb-3 mb-3">
                        <h2 className="text-xl font-bold">{user.name}</h2>
                        <p className="text-sm text-gray-600">{user.title || 'Professional'}</p>
                        <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-gray-500">
                          <span>{user.email}</span>
                          {user.phoneNumber && (
                            <>
                              <span>•</span>
                              <span>{user.phoneNumber}</span>
                            </>
                          )}
                          {user.location && (
                            <>
                              <span>•</span>
                              <span>{user.location}</span>
                            </>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-gray-500">
                          {user.industry && <span>{user.industry}</span>}
                          {user.domain && (
                            <>
                              <span>•</span>
                              <span>{user.domain}</span>
                            </>
                          )}
                          {user.lookingFor && (
                            <>
                              <span>•</span>
                              <span>Seeking: {user.lookingFor.replace(/_/g, ' ')}</span>
                            </>
                          )}
                        </div>
                      </div>
                      
                      {/* About section - comprehensive profile */}
                      <div className="mb-3">
                        <h3 className="text-sm font-bold mb-1.5 uppercase text-gray-700">Professional Summary</h3>
                        <p className="text-xs text-gray-700 leading-relaxed">
                          {user.aboutMe || 'Experienced professional with expertise in ' + (user.industry || 'their field') + ' seeking opportunities in ' + (user.domain || 'the industry')}
                        </p>
                      </div>
                      
                      {/* Work Experience - uses real data from experiences */}
                      <div className="mb-3">
                        <h3 className="text-sm font-bold mb-1.5 uppercase text-gray-700">Professional Experience</h3>
                        
                        {workExperiences && workExperiences.length > 0 ? (
                          workExperiences.map((experience, index) => (
                            <div key={index} className="mb-2">
                              <div className="font-semibold">{experience.title}</div>
                              <div className="text-gray-600 flex justify-between">
                                <span>{experience.company}{experience.industry ? `, ${experience.industry}` : ''}</span>
                                <span>
                                  {new Date(experience.startDate).getFullYear()} - 
                                  {experience.endDate ? new Date(experience.endDate).getFullYear() : 'Present'}
                                </span>
                              </div>
                              <ul className="list-disc ml-4 mt-1 text-gray-700 space-y-0.5">
                                {experience.keyResponsibilities && Array.isArray(experience.keyResponsibilities) ? 
                                  experience.keyResponsibilities.map((responsibility, i) => (
                                    <li key={i}>{responsibility}</li>
                                  )) : 
                                  <li>Contributed to company projects and goals</li>
                                }
                              </ul>
                            </div>
                          ))
                        ) : (
                          <div className="text-gray-500 italic">
                            No work experience added yet. Add work experience in your profile.
                          </div>
                        )}
                      </div>
                      
                      {/* Education Section */}
                      <div className="mb-3">
                        <h3 className="text-sm font-bold mb-1.5 uppercase text-gray-700">Education</h3>
                        
                        {education && education.length > 0 ? (
                          education.map((edu, index) => (
                            <div key={index} className="mb-2">
                              <div className="font-semibold">
                                {edu.degree}{edu.fieldOfStudy ? `, ${edu.fieldOfStudy}` : ''}
                              </div>
                              <div className="text-gray-600 flex justify-between">
                                <span>{edu.institution}</span>
                                <span>
                                  {new Date(edu.startDate).getFullYear()} - 
                                  {edu.endDate ? new Date(edu.endDate).getFullYear() : 'Present'}
                                </span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-gray-500 italic">
                            No education added yet. Add education in your profile.
                          </div>
                        )}
                      </div>
                      
                      {/* Skills section - highlighted and comprehensive */}
                      <div className="mb-4 bg-gray-50 p-2 rounded-sm border-l-2 border-primary">
                        <h3 className="text-sm font-bold mb-2 uppercase text-gray-700">Key Skills & Competencies</h3>
                        
                        {/* Real user skills data */}
                        {skills && skills.length > 0 ? (
                          <div className="mb-2">
                            <h4 className="text-xs font-semibold mb-1 text-gray-600">Primary Skills</h4>
                            <div className="flex flex-wrap gap-1.5 mb-2">
                              {skills.map((skill, i) => (
                                <div key={i} className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded">
                                  {skill.name}
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="mb-2">
                            <h4 className="text-xs font-semibold mb-1 text-gray-600">Technical Skills</h4>
                            <div className="flex flex-wrap gap-1.5 mb-2">
                              {/* Default skills from user profile if no specific skills are added */}
                              {user.domain && (
                                <div className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded">
                                  {user.domain}
                                </div>
                              )}
                              {user.industry && (
                                <div className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded">
                                  {user.industry}
                                </div>
                              )}
                              <div className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded">
                                {user.title || 'Professional'}
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {/* Domain Skills - use real data */}
                        <div>
                          <h4 className="text-xs font-semibold mb-1 text-gray-600">Domain Expertise</h4>
                          <div className="flex flex-wrap gap-1.5">
                            {user?.whatIOffer ? 
                              user.whatIOffer.split(',').slice(0, 8).map((skill, i) => (
                                <div key={i} className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded">
                                  {skill.trim()}
                                </div>
                              )) : 
                              user.domain ? (
                                <div className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded">
                                  {user.domain}
                                </div>
                              ) : (
                                <div className="text-gray-500 italic text-xs">
                                  No domain expertise added yet
                                </div>
                              )
                            }
                          </div>
                        </div>
                      </div>
                      
                      {/* Projects/Achievements Section */}
                      <div className="mb-3">
                        <h3 className="text-sm font-bold mb-1.5 uppercase text-gray-700">Projects & Achievements</h3>
                        
                        {projects && projects.length > 0 ? (
                          <ul className="list-disc ml-4 mt-1 text-gray-700 space-y-0.5">
                            {projects.slice(0, 5).map((project, i) => (
                              <li key={i}>
                                <span className="font-medium">{project.title}</span>
                                {project.description && (
                                  <span> - {project.description.length > 80 ? 
                                    project.description.substring(0, 80) + '...' : 
                                    project.description}
                                  </span>
                                )}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <div className="text-gray-500 italic">
                            No projects added yet. Add projects in your profile.
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Document footer */}
                    <div className="absolute bottom-0 left-0 right-0 h-6 bg-gray-100 border-t flex items-center justify-center">
                      <div className="text-xs text-gray-500">Generated by Musk AI</div>
                    </div>
                  </div>
                  
                  {/* Action buttons directly below the preview */}
                  <div className="absolute inset-x-0 bottom-4 flex justify-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-white shadow-sm border-gray-200"
                      onClick={() => handleDownload()}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      <span>Download</span>
                    </Button>
                    
                    <Button
                      variant="default"
                      size="sm"
                      className="bg-primary text-white shadow-sm"
                      onClick={() => {
                        if (!resume?.fileData) {
                          toast({
                            title: 'No Resume Available',
                            description: 'There is no resume to view yet.',
                            variant: 'destructive',
                          });
                          return;
                        }
                        
                        // Direct download approach - most reliable across browsers
                        try {
                          // Create a temporary anchor and trigger direct download
                          const link = document.createElement('a');
                          
                          // Use the download attribute to give the file a name
                          link.download = resume.fileName || 'resume.pdf';
                          
                          // Convert base64 to blob
                          const byteCharacters = atob(resume.fileData);
                          const byteNumbers = new Array(byteCharacters.length);
                          for (let i = 0; i < byteCharacters.length; i++) {
                            byteNumbers[i] = byteCharacters.charCodeAt(i);
                          }
                          const byteArray = new Uint8Array(byteNumbers);
                          const blob = new Blob([byteArray], { type: 'application/pdf' });
                          
                          // Create a blob URL
                          const url = URL.createObjectURL(blob);
                          
                          // Set href to blob URL
                          link.href = url;
                          
                          // Set target to _blank to try to open in a new tab
                          link.target = '_blank';
                          
                          // Append to body
                          document.body.appendChild(link);
                          
                          // Trigger click
                          link.click();
                          
                          // Clean up
                          setTimeout(() => {
                            document.body.removeChild(link);
                            URL.revokeObjectURL(url);
                          }, 100);
                          
                          // Notify user
                          toast({
                            title: 'Opening Resume',
                            description: 'Your resume PDF has been downloaded for viewing.',
                          });
                        } catch (error) {
                          console.error("Error processing PDF:", error);
                          toast({
                            title: 'Error',
                            description: 'Could not process the PDF file. Please try again.',
                            variant: 'destructive',
                          });
                        }
                      }}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      <span>View PDF</span>
                    </Button>
                  </div>
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
              
              // Download and view approach - reliable across all browsers
              if (resume?.fileData) {
                try {
                  // Create a temporary anchor and trigger download that opens automatically
                  const link = document.createElement('a');
                  
                  // Convert base64 to blob
                  const byteCharacters = atob(resume.fileData);
                  const byteNumbers = new Array(byteCharacters.length);
                  for (let i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                  }
                  const byteArray = new Uint8Array(byteNumbers);
                  const blob = new Blob([byteArray], { type: 'application/pdf' });
                  
                  // Create a blob URL
                  const url = URL.createObjectURL(blob);
                  
                  // Set href to blob URL
                  link.href = url;
                  link.target = '_blank';
                  
                  // Append to body
                  document.body.appendChild(link);
                  
                  // Trigger click
                  link.click();
                  
                  // Clean up
                  setTimeout(() => {
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                  }, 100);
                  
                  toast({
                    title: 'Opening Resume',
                    description: 'Your resume is being opened for viewing.',
                  });
                } catch (error) {
                  console.error("Error viewing PDF:", error);
                  toast({
                    title: 'Error Opening Resume',
                    description: 'There was a problem opening your resume. Please try again.',
                    variant: 'destructive',
                  });
                }
              } else {
                toast({
                  title: 'No Resume Available',
                  description: 'There is no resume content to view yet.',
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
                // Redirect to the Resume Writer tab
                const tabElement = document.querySelector('[data-value="resume-writer"]');
                if (tabElement) {
                  (tabElement as HTMLElement).click();
                } else {
                  toast({
                    title: 'Edit Resume',
                    description: 'Resume editing is accessed through the Resume Writer tab.',
                  });
                }
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