import React, { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';

// UI Components
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Video } from 'lucide-react';

// Internal components and utilities
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/context/auth-context';
import IndustryCombobox from '@/components/shared/industry-combobox';

// Project Schema
export const projectSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().nullable(),
  category: z.string().nullable(),
  industry: z.string().nullable(),
  startDate: z.string().min(1, "Start date is required"),
  projectUrl: z.string().nullable(),
  mediaUrls: z.array(z.string()).nullable(),
});

export type ProjectFormValues = z.infer<typeof projectSchema>;

export interface Project {
  id: number;
  title: string;
  description: string | null;
  category: string | null;
  industry: string | null;
  startDate: string;
  projectUrl: string | null;
  thumbnailUrl: string | null;
  mediaUrls: string[] | null;
  userId: number;
}

interface ProjectFormProps {
  onSuccess?: (project: Project) => void;
  onCancel?: () => void;
  existingProject?: Project | null;
  closeModal?: () => void; // Optional function to close parent modal
}

interface MediaErrors {
  images?: string;
  video?: string;
}

export default function ProjectForm({ 
  onSuccess, 
  onCancel, 
  existingProject,
  closeModal
}: ProjectFormProps) {
  const { user, isDemoMode } = useAuth();
  const userId = isDemoMode ? 1 : (user?.id || user?.uid || 0);
  const { toast } = useToast();
  
  // Media state
  const [activeTab, setActiveTab] = useState<string>('details');
  const [projectImages, setProjectImages] = useState<File[]>([]);
  const [projectVideo, setProjectVideo] = useState<File | null>(null);
  const [mediaErrors, setMediaErrors] = useState<MediaErrors | null>(null);
  const [featuredImageIndex, setFeaturedImageIndex] = useState<number>(0);
  
  // Refs for file inputs
  const videoInputRef = useRef<HTMLInputElement>(null);
  const multipleImagesInputRef = useRef<HTMLInputElement>(null);
  
  // Form setup
  const projectForm = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: existingProject?.title || '',
      description: existingProject?.description || null,
      category: existingProject?.category || null,
      industry: existingProject?.industry || null,
      startDate: existingProject?.startDate || format(new Date(), 'yyyy-MM-dd'),
      projectUrl: existingProject?.projectUrl || null,
      mediaUrls: existingProject?.mediaUrls || null,
    },
  });

  // Reset form when existingProject changes
  useEffect(() => {
    projectForm.reset({
      title: existingProject?.title || '',
      description: existingProject?.description || null,
      category: existingProject?.category || null,
      industry: existingProject?.industry || null,
      startDate: existingProject?.startDate || format(new Date(), 'yyyy-MM-dd'),
      projectUrl: existingProject?.projectUrl || null,
      mediaUrls: existingProject?.mediaUrls || null,
    });
    
    // Reset all file state
    setProjectImages([]);
    setProjectVideo(null);
    setMediaErrors(null);
    setFeaturedImageIndex(0);
    
    // Reset all file input elements
    if (videoInputRef.current) {
      videoInputRef.current.value = '';
    }
    if (multipleImagesInputRef.current) {
      multipleImagesInputRef.current.value = '';
    }
  }, [existingProject]);
  
  // Function to handle choosing featured image from new or existing images
  const handleSelectFeaturedImage = (index: number) => {
    setFeaturedImageIndex(index);
  };
  
  // Get existing featured image URL if an existing image is selected
  const getExistingFeaturedImageUrl = (): string | null => {
    if (featuredImageIndex >= 1000) {
      // If it's an existing image (indices 1000+), return its URL
      const existingIndex = featuredImageIndex - 1000;
      if (existingMedia && existingMedia[existingIndex]) {
        return existingMedia[existingIndex];
      }
    }
    return null;
  };
  
  const onSubmit = async (values: ProjectFormValues) => {
    if (!userId) return;
    
    // Validate media files
    let validationFailed = false;
    const newMediaErrors: MediaErrors = {};
    
    // Validate project images (max 10)
    if (projectImages.length > 10) {
      newMediaErrors.images = "Maximum 10 images allowed";
      validationFailed = true;
    }
    
    // Validate video file size for 150 seconds max
    if (projectVideo && projectVideo.size > 6 * 1024 * 1024) {
      newMediaErrors.video = "Video exceeds maximum size (max ~150 seconds)";
      validationFailed = true;
    }
    
    if (validationFailed) {
      setMediaErrors(newMediaErrors);
      toast({
        title: "Validation Error",
        description: "Please fix the errors with your media files.",
        variant: "destructive"
      });
      return;
    }
    
    // Clear any previous errors
    setMediaErrors(null);
    
    try {
      let response;
      let projectData: Project;
      
      if (existingProject) {
        // Update existing project
        response = await apiRequest({
          method: 'PUT', 
          url: `/api/projects/${existingProject.id}`, 
          data: values
        });
        projectData = await response.json();
        
        // Handle additional media uploads (project images and video)
        if (projectImages.length > 0 || projectVideo) {
          const mediaFormData = new FormData();
          
          // Add project images
          projectImages.forEach((file, index) => {
            mediaFormData.append(`projectImage_${index}`, file);
          });
          
          // Add project video
          if (projectVideo) {
            mediaFormData.append('projectVideo', projectVideo);
          }
          
          mediaFormData.append('projectId', projectData.id.toString());
          mediaFormData.append('imageCount', projectImages.length.toString());
          mediaFormData.append('featuredImageIndex', featuredImageIndex.toString());
          
          // Add existing featured image URL if an existing image is selected as featured
          const existingFeaturedImageUrl = getExistingFeaturedImageUrl();
          if (existingFeaturedImageUrl) {
            mediaFormData.append('existingFeaturedImageUrl', existingFeaturedImageUrl);
          }
          
          // Use fetch directly for media uploads
          const mediaUploadResponse = await fetch('/api/projects/upload-media', {
            method: 'POST',
            body: mediaFormData,
          });
          
          if (mediaUploadResponse.ok) {
            const mediaUploadResult = await mediaUploadResponse.json();
            // Update the media URLs
            if (mediaUploadResult.mediaUrls) {
              projectData.mediaUrls = mediaUploadResult.mediaUrls;
            }
            // Update the thumbnail URL if one was set
            if (mediaUploadResult.thumbnailUrl) {
              projectData.thumbnailUrl = mediaUploadResult.thumbnailUrl;
            }
          } else {
            console.error("Media upload failed:", await mediaUploadResponse.text());
            toast({
              title: "Warning",
              description: "Project updated but media upload failed. You can edit the project to try again.",
              variant: "destructive"
            });
          }
        }
        
        toast({
          title: "Project updated",
          description: "Your project has been updated successfully",
        });
      } else {
        // Create new project
        const newProjectData = {
          ...values,
          userId,
        };
        
        // First create the project
        response = await apiRequest({
          method: 'POST', 
          url: '/api/projects', 
          data: newProjectData
        });
        projectData = await response.json();
        
        // Handle additional media uploads (project images and video)
        if (projectImages.length > 0 || projectVideo) {
          const mediaFormData = new FormData();
          
          // Add project images
          projectImages.forEach((file, index) => {
            mediaFormData.append(`projectImage_${index}`, file);
          });
          
          // Add project video
          if (projectVideo) {
            mediaFormData.append('projectVideo', projectVideo);
          }
          
          mediaFormData.append('projectId', projectData.id.toString());
          mediaFormData.append('imageCount', projectImages.length.toString());
          mediaFormData.append('featuredImageIndex', featuredImageIndex.toString());
          
          // Add existing featured image URL if an existing image is selected as featured
          const existingFeaturedImageUrl = getExistingFeaturedImageUrl();
          if (existingFeaturedImageUrl) {
            mediaFormData.append('existingFeaturedImageUrl', existingFeaturedImageUrl);
          }
          
          // Use fetch directly for media uploads
          const mediaUploadResponse = await fetch('/api/projects/upload-media', {
            method: 'POST',
            body: mediaFormData,
          });
          
          if (mediaUploadResponse.ok) {
            const mediaUploadResult = await mediaUploadResponse.json();
            // Update the media URLs
            if (mediaUploadResult.mediaUrls) {
              projectData.mediaUrls = mediaUploadResult.mediaUrls;
            }
            // Update the thumbnail URL if one was set
            if (mediaUploadResult.thumbnailUrl) {
              projectData.thumbnailUrl = mediaUploadResult.thumbnailUrl;
            }
          } else {
            console.error("Media upload failed:", await mediaUploadResponse.text());
            toast({
              title: "Warning",
              description: "Project created but media upload failed. You can edit the project to try again.",
              variant: "destructive"
            });
          }
        }
        
        toast({
          title: "Project created",
          description: "Your project has been created successfully",
        });
      }
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/projects`] });
      
      // Reset form
      projectForm.reset();
      setProjectImages([]);
      setProjectVideo(null);
      setMediaErrors(null);
      setFeaturedImageIndex(0);
      
      // Reset all file input elements
      if (videoInputRef.current) {
        videoInputRef.current.value = '';
      }
      if (multipleImagesInputRef.current) {
        multipleImagesInputRef.current.value = '';
      }
      
      if (closeModal) {
        closeModal();
      }
      
      if (onSuccess) {
        onSuccess(projectData);
      }
    } catch (error) {
      console.error("Error submitting project:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save project",
        variant: "destructive"
      });
    }
  };

  // Handle image file selection
  const handleImagesSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const filesArray = Array.from(event.target.files);
      setProjectImages(prev => [...prev, ...filesArray]);
      setMediaErrors(prev => ({ ...prev, images: undefined }));
    }
  };
  
  // Handle video file selection
  const handleVideoSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setProjectVideo(event.target.files[0]);
      setMediaErrors(prev => ({ ...prev, video: undefined }));
    }
  };
  
  // Remove project image
  const removeProjectImage = (index: number) => {
    setProjectImages(prev => prev.filter((_, i) => i !== index));
    if (featuredImageIndex === index) {
      setFeaturedImageIndex(0);
    } else if (featuredImageIndex > index) {
      setFeaturedImageIndex(featuredImageIndex - 1);
    }
  };
  
  // Remove project video
  const removeProjectVideo = () => {
    setProjectVideo(null);
    if (videoInputRef.current) {
      videoInputRef.current.value = '';
    }
  };
  
  // Existing media from the project
  const existingMedia = existingProject?.mediaUrls || [];
  
  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="details">Project Details</TabsTrigger>
          <TabsTrigger value="media">Media & Attachments</TabsTrigger>
        </TabsList>
        
        <Form {...projectForm}>
          <form onSubmit={projectForm.handleSubmit(onSubmit)} className="space-y-6">
            <TabsContent value="details" className="space-y-6">
              <FormField
                control={projectForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Project title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={projectForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your project"
                        className="min-h-[120px]"
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={projectForm.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Web Development" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={projectForm.control}
                  name="industry"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Industry</FormLabel>
                      <FormControl>
                        <IndustryCombobox
                          value={field.value || ''}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={projectForm.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={projectForm.control}
                  name="projectUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project URL</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="https://example.com" 
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="media" className="space-y-6">
              {/* Project Images Section */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label className="text-base">Project Images</Label>
                  <div className="text-sm text-muted-foreground">Max 10 images</div>
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex flex-col gap-2">
                    <Input
                      ref={multipleImagesInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImagesSelected}
                    />
                    {mediaErrors?.images && (
                      <p className="text-sm text-destructive">{mediaErrors.images}</p>
                    )}
                  </div>
                  
                  {/* Selected images preview */}
                  {projectImages.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-sm font-medium">New Images:</div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {projectImages.map((file, index) => (
                          <div key={`new-${index}`} className="relative group">
                            <div className={`border rounded-md overflow-hidden aspect-square ${featuredImageIndex === index ? 'ring-2 ring-primary' : ''}`}>
                              <img
                                src={URL.createObjectURL(file)}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity">
                              <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => removeProjectImage(index)}
                              >
                                ✕
                              </Button>
                              <Button
                                type="button"
                                variant="secondary"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleSelectFeaturedImage(index)}
                              >
                                ★
                              </Button>
                            </div>
                            {featuredImageIndex === index && (
                              <div className="absolute top-1 right-1 bg-primary text-primary-foreground rounded-full p-1">
                                ★
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Existing images preview */}
                  {existingMedia.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Existing Media:</div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {existingMedia.map((url, index) => {
                          // Calculate the effective index for existing images by adding 1000
                          // This ensures existing media indices don't conflict with new uploads
                          const existingMediaIndex = index + 1000;
                          const isExistingFeatured = featuredImageIndex === existingMediaIndex;
                          
                          return (
                            <div key={`existing-${index}`} className="relative group">
                              {url.endsWith('.mp4') || url.endsWith('.webm') || url.endsWith('.mov') ? (
                                <div className="border rounded-md overflow-hidden aspect-square flex items-center justify-center bg-muted">
                                  <Video className="h-8 w-8 opacity-50" />
                                </div>
                              ) : (
                                <div className={`border rounded-md overflow-hidden aspect-square ${isExistingFeatured ? 'ring-2 ring-primary' : ''}`}>
                                  <img
                                    src={url}
                                    alt={`Media ${index + 1}`}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              )}
                              
                              {/* Only show controls for images (not videos) */}
                              {!url.endsWith('.mp4') && !url.endsWith('.webm') && !url.endsWith('.mov') && (
                                <>
                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                    <Button
                                      type="button"
                                      variant="secondary"
                                      size="icon"
                                      className="h-8 w-8"
                                      onClick={() => handleSelectFeaturedImage(existingMediaIndex)}
                                    >
                                      ★
                                    </Button>
                                  </div>
                                  {isExistingFeatured && (
                                    <div className="absolute top-1 right-1 bg-primary text-primary-foreground rounded-full p-1">
                                      ★
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Project Video Section */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label className="text-base">Project Video</Label>
                  <div className="text-sm text-muted-foreground">Optional (~2.5 min max)</div>
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex flex-col gap-2">
                    <Input
                      ref={videoInputRef}
                      type="file"
                      accept="video/*"
                      onChange={handleVideoSelected}
                    />
                    {mediaErrors?.video && (
                      <p className="text-sm text-destructive">{mediaErrors.video}</p>
                    )}
                  </div>
                  
                  {/* Selected video preview */}
                  {projectVideo && (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="text-sm font-medium">Selected Video:</div>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={removeProjectVideo}
                        >
                          Remove
                        </Button>
                      </div>
                      <div className="border rounded-md p-2 flex items-center gap-2 bg-muted">
                        <Video className="h-5 w-5" />
                        <span className="text-sm truncate">{projectVideo.name}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
            
            <div className="flex justify-end gap-2">
              {onCancel && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={onCancel}
                >
                  Cancel
                </Button>
              )}
              <Button type="submit">
                {existingProject ? "Update Project" : "Create Project"}
              </Button>
            </div>
          </form>
        </Form>
      </Tabs>
    </div>
  );
}

// Import Label for the Label component
const Label = FormLabel;