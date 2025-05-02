import React, { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import { 
  Zap,
  Download,
  Eye,
  FileText,
  Edit2,
  Save,
  X
} from 'lucide-react';

import { formatDistanceToNow } from 'date-fns';
import { UserData } from '@/types/user';
import { Resume } from '@/types/resume';
import { WorkExperience, Education } from '@/types/profile';

interface ShadowResumeProps {
  user: UserData | any; // Using any for demo purposes to handle potential null or partial data
  resume?: Resume;
  isCurrentUser: boolean;
  isOwner?: boolean;
  onTabChange?: (tab: string) => void; // Add prop for tab change
}

export default function ShadowResumeSection({ user, resume, isCurrentUser, isOwner = true, onTabChange }: ShadowResumeProps) {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  // Add state for publish/unpublish and downloadable features
  const [isPublished, setIsPublished] = useState(resume?.visibility === 'public');
  const [isDownloadable, setIsDownloadable] = useState(resume?.isDownloadable || false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Add edit states for all editable fields
  const [editValues, setEditValues] = useState({
    name: user?.name || '',
    title: user?.title || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
    location: user?.location || '',
    aboutMe: user?.aboutMe || '',
  });
  
  // We should use the resume form data instead of directly fetching from profile
  // This ensures the Shadow Resume shows what's in the Resume Editor, not the profile
  
  // ENHANCED DEBUGGING AND METADATA PARSING
  
  // Function to help with debugging objects
  const safeStringify = (obj: any) => {
    try {
      return JSON.stringify(obj).substring(0, 100) + (JSON.stringify(obj).length > 100 ? '...' : '');
    } catch (e) {
      return 'Error stringifying object';
    }
  };
  
  // Enhanced logging about the resume object itself
  console.log('ShadowResumeSection - Initial Resume Object:', {
    resumeExists: !!resume,
    resumeId: resume?.id,
    hasFormDirectly: !!resume?.form,
    hasMetadata: !!resume?.metadata,
    metadataType: resume?.metadata ? typeof resume.metadata : 'N/A',
    metadataLength: resume?.metadata ? 
      (typeof resume.metadata === 'string' ? 
        resume.metadata.length : 
        safeStringify(resume.metadata).length) 
      : 0,
    metadataPreview: resume?.metadata ? 
      (typeof resume.metadata === 'string' ? 
        resume.metadata.substring(0, 50) + '...' : 
        safeStringify(resume.metadata)) 
      : 'No metadata'
  });
  
  // Extract data from resume form if available - with enhanced parsing
  // First try to use the form data directly from resume.form
  let formData = resume?.form || null;
  
  // If no form data is available but we have metadata, try to parse it
  // with comprehensive error handling and debugging
  if (!formData && resume?.metadata) {
    console.log('Attempting to parse form data from metadata');
    
    try {
      // Handle both string and object metadata
      if (typeof resume.metadata === 'string') {
        formData = JSON.parse(resume.metadata);
        console.log('Successfully parsed string metadata into formData');
      } else if (typeof resume.metadata === 'object') {
        // Already an object, just use it directly
        formData = resume.metadata;
        console.log('Metadata is already an object, using directly as formData');
      }
    } catch (e) {
      console.error('Failed to parse metadata as JSON:', e);
      
      // Attempt to fix common JSON parsing issues
      if (typeof resume.metadata === 'string') {
        try {
          // Try to clean the string and parse again
          const cleanedMetadata = resume.metadata
            .replace(/\\"/g, '"')
            .replace(/^"/, '')
            .replace(/"$/, '');
          
          console.log('Attempting to parse cleaned metadata:', cleanedMetadata.substring(0, 50) + '...');
          formData = JSON.parse(cleanedMetadata);
          console.log('Successfully parsed cleaned metadata');
        } catch (cleanErr) {
          console.error('Failed to parse cleaned metadata:', cleanErr);
        }
      }
    }
  }
  
  // Advanced logging to trace data flow
  console.log('ShadowResumeSection - Resume Form Data Results:', {
    hasFormData: !!formData,
    formDataKeys: formData ? Object.keys(formData) : [],
    formDataType: formData ? typeof formData : 'null',
    hasPersonalInfo: formData?.personalInfo ? 'yes' : 'no',
    hasExperiences: formData?.experiences ? 'yes' : 'no',
    resumeId: resume?.id,
    formDataPreview: formData ? safeStringify(formData) : 'No form data'
  });
  
  // DO NOT fetch or use profile data at all
  // Shadow Resume ONLY shows data from Resume Editor with no fallbacks
  
  // No longer fetch profile data - using empty arrays as defaults
  const workExperiences: WorkExperience[] = [];
  const education: Education[] = [];
  const skills: any[] = [];
  const projects: any[] = [];
  
  // ONLY use form data - NO FALLBACK to profile data
  // Shadow Resume should exclusively use data from the Resume Editor
  // Handle both old and new form data structures
  const effectiveExperiences = 
    formData?.experiences?.experiences || // New nested structure
    formData?.experiences || // Simple array structure
    []; // Default empty
    
  const effectiveEducation = 
    formData?.education?.educations || // New nested structure
    formData?.education || // Simple array structure
    []; // Default empty
    
  const effectiveSkills = 
    formData?.skills?.skills || // New nested structure
    formData?.skills || // Simple array structure
    []; // Default empty
    
  const effectiveProjects = 
    formData?.projects?.projects || // New nested structure
    formData?.projects || // Simple array structure
    []; // Default empty
    
  console.log('Effective data check:', {
    expCount: effectiveExperiences.length,
    eduCount: effectiveEducation.length,
    skillCount: effectiveSkills.length,
    projCount: effectiveProjects.length
  });
  
  // ONLY use personal info from form data, never fallback to profile
  const effectivePersonalInfo = formData?.personalInfo || {
    fullName: '',
    title: '',
    email: '',
    phone: '',
    location: '',
    summary: '',
  };
  
  // Update resume settings mutation
  const updateResumeMutation = useMutation<any, Error, {isDownloadable?: boolean, visibility?: string}>({
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
    onSuccess: (data) => {
      // Update local state based on response
      if (data && data.visibility) {
        setIsPublished(data.visibility === 'public');
      }
      if (data && data.hasOwnProperty('isDownloadable')) {
        setIsDownloadable(data.isDownloadable);
      }
      
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
  
  // User update mutation for resume edits
  const updateUserMutation = useMutation<any, Error, typeof editValues>({
    mutationFn: async (updates) => {
      if (!user?.id) return null;
      
      return await fetch(`/api/users/${user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      }).then(res => {
        if (!res.ok) throw new Error('Failed to update user data');
        return res.json();
      });
    },
    onSuccess: () => {
      // Turn off editing mode
      setIsEditing(false);
      
      toast({
        title: 'Resume Updated',
        description: 'Your resume content has been updated successfully.',
      });
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({
        queryKey: ['/api/users', user?.id]
      });
    },
    onError: (error) => {
      console.error('Error updating user data:', error);
      toast({
        title: 'Update Failed',
        description: 'There was a problem updating your resume content.',
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

  // Fixed theme for professional resume display
  const fixedTheme = { 
    color: '#2563eb', 
    accent: '#dbeafe', 
    fontClass: 'font-serif' 
  };

  // Effect to sync component state with server updates
  useEffect(() => {
    if (resume) {
      setIsDownloadable(resume.isDownloadable || false);
      setIsPublished(resume.visibility === 'public');
    }
  }, [resume]);
  
  // Effect to reset edit values when editing is cancelled or user data changes
  useEffect(() => {
    if (user) {
      setEditValues({
        name: user.name || '',
        title: user.title || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        location: user.location || '',
        aboutMe: user.aboutMe || '',
      });
    }
  }, [user, isEditing]);

  // All download and view functionality has been removed as requested

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
          <div className="flex items-center gap-2">
            {resume?.lastUpdatedByMusk && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Zap className="h-3 w-3" />
                <span>Last Updated by Musk: {getLastUpdateText()}</span>
              </Badge>
            )}
            {isOwner && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white shadow-sm border-gray-200"
                  onClick={() => {
                    // Show a toast notification that the resume editor is being opened
                    toast({
                      title: "Opening Resume Editor",
                      description: "Opening the Resume Editor where you can make changes.",
                    });
                    
                    // Simply go to the resume editor - with the new flow, changes from resume editor
                    // will be saved to both resume and profile
                    if (resume?.id) {
                      // No need to refresh from profile anymore since data now flows in the opposite direction
                      // Just navigate to the resume editor with the current data
                      if (onTabChange) {
                        onTabChange('resume-editor');
                      } else {
                        // Fallback to direct DOM manipulation
                        const element = document.querySelector('[value="resume-editor"]');
                        if (element instanceof HTMLElement) {
                          element.click();
                        }
                      }
                      
                      // Provide instructions to the user about the new flow
                      toast({
                        title: "Resume Editor Instructions",
                        description: "Make changes in the Resume Editor and click Save to update both your profile and resume.",
                        duration: 5000, // Show for 5 seconds
                      });
                    } else {
                      // Fallback when no resume ID is available
                      if (onTabChange) {
                        onTabChange('resume-editor');
                      } else {
                        // Fallback to direct DOM manipulation
                        const element = document.querySelector('[value="resume-editor"]');
                        if (element instanceof HTMLElement) {
                          element.click();
                        }
                      }
                    }
                  }}
                >
                  <Edit2 className="h-4 w-4 mr-1" />
                  <span>Edit in Resume Editor</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {!resume && (
          <div className="flex flex-col items-center justify-center p-8 text-center border-2 border-dashed border-muted-foreground/20 rounded-md">
            <Zap className="h-10 w-10 text-primary/60 mb-3" />
            <h3 className="text-lg font-medium">Your Shadow Resume</h3>
            <p className="text-sm text-muted-foreground mt-1 mb-3">
              Complete your profile to generate your Shadow Resume. Add your work experiences, skills, and projects to qualify.
            </p>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                // Show toast with guidance
                toast({
                  title: "Complete Your Profile",
                  description: "Add at least one work experience, skill, and project to generate your Shadow Resume.",
                  variant: "default",
                });
              }}
            >
              How to Get Started
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
                  <div className={`w-full h-full relative bg-white shadow-lg rounded overflow-hidden ${fixedTheme.fontClass}`} style={{borderTop: `4px solid ${fixedTheme.color}`}}>
                    {/* Document header */}
                    <div className="absolute top-0 left-0 right-0 h-8 bg-gray-100 border-b flex items-center justify-between px-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                        <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                        <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                      </div>
                      <div className="text-xs text-gray-500">
                        {resume.fileName || `Resume_Professional.pdf`}
                      </div>
                    </div>
                    
                    {/* Resume content - comprehensive data from the user profile */}
                    <div className="pt-10 px-6 pb-16 text-xs overflow-y-auto max-h-full">
                      {/* Header Section */}
                      <div className="border-b pb-3 mb-4" style={{borderColor: fixedTheme.accent}}>
                        {isEditing ? (
                          <div className="space-y-2">
                            <input 
                              type="text" 
                              className="text-xl font-bold w-full bg-transparent border-b focus:outline-none"
                              style={{color: fixedTheme.color}}
                              value={editValues.name}
                              onChange={(e) => setEditValues({...editValues, name: e.target.value})}
                            />
                            <input 
                              type="text" 
                              className="text-sm text-gray-600 w-full bg-transparent border-b focus:outline-none" 
                              placeholder="Professional Title"
                              value={editValues.title}
                              onChange={(e) => setEditValues({...editValues, title: e.target.value})}
                            />
                            <div className="flex flex-wrap gap-2 mt-1 text-xs">
                              <input 
                                type="email" 
                                className="text-gray-500 bg-transparent border-b focus:outline-none" 
                                placeholder="Email"
                                value={editValues.email}
                                onChange={(e) => setEditValues({...editValues, email: e.target.value})}
                              />
                              <input 
                                type="text" 
                                className="text-gray-500 bg-transparent border-b focus:outline-none" 
                                placeholder="Phone Number"
                                value={editValues.phoneNumber}
                                onChange={(e) => setEditValues({...editValues, phoneNumber: e.target.value})}
                              />
                              <input 
                                type="text" 
                                className="text-gray-500 bg-transparent border-b focus:outline-none" 
                                placeholder="Location"
                                value={editValues.location}
                                onChange={(e) => setEditValues({...editValues, location: e.target.value})}
                              />
                            </div>
                          </div>
                        ) : (
                          <>
                            <h2 className="text-xl font-bold" style={{color: fixedTheme.color}}>
                              {effectivePersonalInfo.fullName || 'Professional Name'}
                            </h2>
                            <p className="text-sm text-gray-600">
                              {effectivePersonalInfo.title || 'Professional Title'}
                            </p>
                            <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-gray-500">
                              <span>{effectivePersonalInfo.email || 'Email'}</span>
                              {effectivePersonalInfo.phone && (
                                <>
                                  <span>•</span>
                                  <span>{effectivePersonalInfo.phone}</span>
                                </>
                              )}
                              {effectivePersonalInfo.location && (
                                <>
                                  <span>•</span>
                                  <span>{effectivePersonalInfo.location}</span>
                                </>
                              )}
                            </div>
                            {/* Industry info section completely removed */}
                          </>
                        )}
                      </div>
                      
                      {/* About section - comprehensive profile */}
                      <div className="mb-4 pb-3 border-b border-gray-100">
                        <h3 className="text-sm font-bold mb-2 uppercase" style={{color: fixedTheme.color}}>Professional Summary</h3>
                        {isEditing ? (
                          <textarea 
                            className="text-xs text-gray-700 leading-relaxed w-full bg-transparent border rounded min-h-[60px] p-1 focus:outline-none"
                            value={editValues.aboutMe}
                            onChange={(e) => setEditValues({...editValues, aboutMe: e.target.value})}
                            placeholder="Write a professional summary here..."
                          />
                        ) : (
                          <p className="text-xs text-gray-700 leading-relaxed">
                            {/* ONLY use form data - no fallback to profile data */}
                            {effectivePersonalInfo.summary || 'Professional summary will appear here. Edit in Resume Editor.'}
                          </p>
                        )}
                      </div>
                      
                      {/* Work Experience - uses form data if available, otherwise profile data */}
                      <div className="mb-4 pb-3 border-b border-gray-100">
                        <h3 className="text-sm font-bold mb-2 uppercase" style={{color: fixedTheme.color}}>Professional Experience</h3>
                        
                        {/* Use the combined effective data with proper prioritization */}
                        {effectiveExperiences && effectiveExperiences.length > 0 ? (
                          <div className="space-y-3 mt-2">
                            {effectiveExperiences.map((experience: any, index: number) => (
                              <div key={index} className="pb-2">
                                <div className="font-semibold">{experience.title || experience.position}</div>
                                <div className="text-gray-600 flex justify-between">
                                  <span>{experience.company}{experience.industry ? `, ${experience.industry}` : ''}</span>
                                  <span>
                                    {experience.startDate ? new Date(experience.startDate).getFullYear() : ''} - 
                                    {experience.endDate ? new Date(experience.endDate).getFullYear() : 'Present'}
                                  </span>
                                </div>
                                <ul className="list-disc ml-4 mt-1 text-gray-700 space-y-0.5">
                                  {experience.responsibilities && Array.isArray(experience.responsibilities) ? 
                                    experience.responsibilities.map((responsibility: string, i: number) => (
                                      <li key={i}>{responsibility}</li>
                                    )) : 
                                    experience.description ? <li>{experience.description}</li> :
                                    <li>Contributed to company projects and goals</li>
                                  }
                                </ul>
                              </div>
                            ))}
                          </div>
                        ) : (
                          // Empty state when no experiences are available
                          <div className="text-gray-500 italic mt-1">
                            No work experience added yet. Add work experience in your profile.
                          </div>
                        )}
                      </div>
                      
                      {/* Education Section */}
                      <div className="mb-4 pb-3 border-b border-gray-100">
                        <h3 className="text-sm font-bold mb-2 uppercase" style={{color: fixedTheme.color}}>Education</h3>
                        
                        {/* Use the combined effective data with proper prioritization */}
                        {effectiveEducation && effectiveEducation.length > 0 ? (
                          <div className="space-y-3 mt-2">
                            {effectiveEducation.map((edu: any, index: number) => (
                              <div key={index} className="pb-2">
                                <div className="font-semibold">
                                  {edu.degree}{edu.fieldOfStudy ? `, ${edu.fieldOfStudy}` : ''}
                                </div>
                                <div className="text-gray-600 flex justify-between">
                                  <span>{edu.institution}</span>
                                  <span>
                                    {edu.startDate ? new Date(edu.startDate).getFullYear() : ''} - 
                                    {edu.endDate ? new Date(edu.endDate).getFullYear() : 'Present'}
                                  </span>
                                </div>
                                
                                {/* Additional education details */}
                                <div className="mt-1 text-xs text-gray-600">
                                  {edu.location && (
                                    <div className="mt-0.5">
                                      <span className="font-medium">Location:</span> {edu.location}
                                    </div>
                                  )}
                                  {edu.industry && (
                                    <div className="mt-0.5">
                                      <span className="font-medium">Industry:</span> {edu.industry}
                                      {edu.domain && <span> • {edu.domain}</span>}
                                    </div>
                                  )}
                                  
                                  {/* Skills acquired section */}
                                  {edu.skillsAcquired && Array.isArray(edu.skillsAcquired) && edu.skillsAcquired.length > 0 && (
                                    <div className="mt-1">
                                      <span className="font-medium">Skills:</span>{' '}
                                      {edu.skillsAcquired.join(', ')}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          // Empty state when no educations are available
                          <div className="text-gray-500 italic mt-1">
                            No education added yet. Add education in your profile.
                          </div>
                        )}
                      </div>
                      
                      {/* Skills Section */}
                      <div className="mb-4 pb-3 border-b border-gray-100">
                        <h3 className="text-sm font-bold mb-2 uppercase" style={{color: fixedTheme.color}}>Skills</h3>
                        
                        {/* Use the combined effective data with proper prioritization */}
                        {effectiveSkills && effectiveSkills.length > 0 ? (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {effectiveSkills.map((skill: any, index: number) => (
                              <span key={index} className="inline-block px-2 py-0.5 rounded-full bg-gray-100 text-gray-800 text-xs">
                                {skill.name || skill}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <div className="text-gray-500 italic mt-1">
                            No skills added yet. Add skills in your profile.
                          </div>
                        )}
                      </div>
                      
                      {/* Projects Section */}
                      <div className="mb-4 pb-3">
                        <h3 className="text-sm font-bold mb-2 uppercase" style={{color: fixedTheme.color}}>Projects</h3>
                        
                        {/* Use the combined effective data with proper prioritization */}
                        {effectiveProjects && effectiveProjects.length > 0 ? (
                          <div className="space-y-3 mt-2">
                            {effectiveProjects.map((project: any, index: number) => (
                              <div key={index} className="pb-2">
                                <div className="font-semibold">{project.title}</div>
                                <div className="text-gray-600 mt-0.5 text-xs">
                                  {project.description && project.description.substring(0, 120)}
                                  {project.description && project.description.length > 120 ? '...' : ''}
                                </div>
                                {project.technologies && Array.isArray(project.technologies) && project.technologies.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {project.technologies.map((tech: string, i: number) => (
                                      <span key={i} className="inline-block px-1.5 py-0.5 rounded-sm bg-gray-100 text-gray-700 text-xs">
                                        {tech}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-gray-500 italic mt-1">
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
                  
                  {/* Action buttons removed as requested */}
                </div>
              ) : (
                <div className="text-center p-6">
                  <p className="text-muted-foreground text-sm">Resume Preview</p>
                  <h2 className="text-xl font-bold mt-2">Resume Preview</h2>
                  <p className="text-sm text-muted-foreground">Resume data will appear here</p>
                  
                  {/* Fallback if no PDF data is available */}
                  <div className="w-3/4 mx-auto mt-6 h-64 bg-muted rounded opacity-30"></div>
                </div>
              )}
            </div>

            {/* Download controls removed as requested */}
          </>
        )}
      </CardContent>

      {/* Resume action buttons */}
      {resume && (
        <CardFooter className="flex justify-between gap-2 border-t pt-4">
          {isOwner && (
            <>
              {/* Publish/Unpublish button */}
              <Button
                variant={isPublished ? "default" : "outline"}
                size="sm"
                className="flex-1"
                onClick={() => {
                  updateResumeMutation.mutate({
                    visibility: isPublished ? 'private' : 'public'
                  });
                }}
                disabled={updateResumeMutation.isPending}
              >
                <Eye className="h-4 w-4 mr-1" />
                {isPublished ? 'Unpublish Resume' : 'Publish Resume'}
              </Button>
              
              {/* Download button */}
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => {
                  if (!resume?.id) {
                    toast({
                      title: "No Resume Found",
                      description: "Please create a resume first.",
                      variant: "destructive",
                    });
                    return;
                  }
                  
                  // Generate and download the resume
                  window.open(`/api/resumes/${resume.id}/download`, '_blank');
                  
                  toast({
                    title: "Resume Downloaded",
                    description: "Your resume has been downloaded.",
                  });
                }}
              >
                <Download className="h-4 w-4 mr-1" />
                Download Resume
              </Button>
            </>
          )}
        </CardFooter>
      )}
    </Card>
  );
}