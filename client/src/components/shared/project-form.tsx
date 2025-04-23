import { useState, useRef, useEffect } from "react";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Video, Image } from "lucide-react";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { IndustryCombobox } from "@/components/ui/industry-combobox";

// Define schema
const projectSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  description: z.string().nullable().optional(),
  category: z.string().nullable().optional(),
  industry: z.string().nullable().optional(),
  startDate: z.string().min(1, { message: "Start date is required" }),
  projectUrl: z.string().url().nullable().optional().or(z.literal('')),
  mediaUrls: z.array(z.string()).nullable().optional(),
});

// Define types
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

export default function ProjectForm({ 
  onSuccess, 
  onCancel, 
  existingProject = null,
  closeModal
}: ProjectFormProps) {
  const { user, isDemoMode } = useAuth();
  const userId = isDemoMode ? 1 : (user?.id || user?.uid || 0);
  const { toast } = useToast();
  
  // Media state
  const [activeTab, setActiveTab] = useState<string>('details');
  const [projectImages, setProjectImages] = useState<File[]>([]);
  const [projectVideo, setProjectVideo] = useState<File | null>(null);
  const [mediaErrors, setMediaErrors] = useState<{images?: string, video?: string} | null>(null);
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
  
  // Function to handle choosing featured image from existing images
  const handleSelectFeaturedImage = (index: number) => {
    setFeaturedImageIndex(index);
  };
  
  const onSubmit = async (values: ProjectFormValues) => {
    if (!userId) return;
    
    // Validate media files
    let validationFailed = false;
    const newMediaErrors: {images?: string, video?: string} = {};
    
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
        
        // If we have a thumbnail file, upload it
        if (thumbnailFile) {
          try {
            console.log("Uploading thumbnail for existing project ID:", projectData.id);
            const formData = new FormData();
            formData.append('thumbnail', thumbnailFile);
            formData.append('projectId', projectData.id.toString());
            
            // Use fetch directly as apiRequest doesn't handle FormData
            const uploadResponse = await fetch('/api/projects/upload-thumbnail', {
              method: 'POST',
              body: formData,
            });
            
            if (!uploadResponse.ok) {
              const errorText = await uploadResponse.text();
              console.error("Thumbnail upload failed:", errorText);
              throw new Error(`Failed to upload thumbnail: ${errorText}`);
            }
            
            const uploadResult = await uploadResponse.json();
            console.log("Thumbnail upload successful:", uploadResult);
            
            // Log detailed information about the response
            console.log("Thumbnail upload details:", {
              thumbnailUrl: uploadResult.thumbnailUrl,
              thumbnailFile: uploadResult.thumbnailFile,
              fullResponse: uploadResult
            });
            
            // Update the thumbnail URL and file path in projectData
            projectData.thumbnailUrl = uploadResult.thumbnailUrl;
            // Using type assertion to handle the thumbnailFile property
            (projectData as any).thumbnailFile = uploadResult.thumbnailFile;
            
            // Also update in the database to ensure persistence
            try {
              const patchData = { 
                thumbnailUrl: uploadResult.thumbnailUrl,
                thumbnailFile: uploadResult.thumbnailFile
              };
              
              console.log(`Updating project ${projectData.id} with thumbnail data:`, patchData);
              
              // Make sure we have valid data to update
              if (!patchData.thumbnailUrl && !patchData.thumbnailFile) {
                console.warn("Both thumbnailUrl and thumbnailFile are empty or null, skipping database update");
              } else {
                const patchResponse = await apiRequest({
                  method: 'PATCH',
                  url: `/api/projects/${projectData.id}/thumbnail`,
                  data: patchData
                });
                
                const patchResult = await patchResponse.json();
                console.log("Project thumbnail database update result:", patchResult);
                
                // Verify the update was successful by checking the response
                if (patchResult && (patchResult.thumbnailUrl || patchResult.thumbnailFile)) {
                  console.log("Thumbnail update confirmed in database");
                } else {
                  console.warn("Thumbnail update may not have been successful");
                }
              }
            } catch (thumbnailUpdateError) {
              console.error("Error updating thumbnail in database:", thumbnailUpdateError);
            }
          } catch (error) {
            console.error("Error during thumbnail upload:", error);
            toast({
              title: "Warning",
              description: "Project updated but thumbnail upload failed. You can edit the project to try again.",
              variant: "destructive"
            });
          }
        }
        
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
        
        // If we have a thumbnail file, upload it
        try {
          console.log("Uploading thumbnail for new project ID:", projectData.id);
          const formData = new FormData();
          formData.append('thumbnail', thumbnailFile!);
          formData.append('projectId', projectData.id.toString());
          
          // Use fetch directly as apiRequest doesn't handle FormData
          const uploadResponse = await fetch('/api/projects/upload-thumbnail', {
            method: 'POST',
            body: formData,
          });
          
          if (!uploadResponse.ok) {
            const errorText = await uploadResponse.text();
            console.error("Thumbnail upload failed:", errorText);
            throw new Error(`Failed to upload thumbnail: ${errorText}`);
          }
          
          const uploadResult = await uploadResponse.json();
          console.log("Thumbnail upload successful:", uploadResult);
          
          // Log detailed information about the response
          console.log("Thumbnail upload details:", {
            thumbnailUrl: uploadResult.thumbnailUrl,
            thumbnailFile: uploadResult.thumbnailFile,
            fullResponse: uploadResult
          });
          
          // Check if thumbnail data is valid
          if (!uploadResult.thumbnailUrl && !uploadResult.thumbnailFile) {
            console.warn("Thumbnail upload response missing thumbnailUrl and thumbnailFile");
            
            // Try to generate fallback values if we have the raw file
            if (thumbnailFile) {
              const timestamp = Date.now();
              const filename = `project_${projectData.id}_${timestamp}_${thumbnailFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
              console.log("Generated fallback filename:", filename);
              
              // Use fallback values
              uploadResult.thumbnailFile = filename;
              uploadResult.thumbnailUrl = `/uploads/projects/${filename}`;
            }
          }
          
          // Update the thumbnail URL and file path in projectData
          projectData.thumbnailUrl = uploadResult.thumbnailUrl;
          // Using type assertion to handle the thumbnailFile property
          (projectData as any).thumbnailFile = uploadResult.thumbnailFile;
          
          // Also update in the database to ensure persistence
          try {
            const patchData = { 
              thumbnailUrl: uploadResult.thumbnailUrl,
              thumbnailFile: uploadResult.thumbnailFile
            };
            
            console.log(`Updating project ${projectData.id} with thumbnail data:`, patchData);
            
            const patchResponse = await apiRequest({
              method: 'PATCH',
              url: `/api/projects/${projectData.id}/thumbnail`,
              data: patchData
            });
            
            const patchResult = await patchResponse.json();
            console.log("Project thumbnail database update result:", patchResult);
          } catch (thumbnailUpdateError) {
            console.error("Error updating thumbnail in database:", thumbnailUpdateError);
          }
        } catch (error) {
          console.error("Error during thumbnail upload:", error);
          toast({
            title: "Warning",
            description: "Project created but thumbnail upload failed. You can edit the project to try again.",
            variant: "destructive"
          });
        }
        
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
      
      // Reset all file inputs
      if (videoInputRef.current) {
        videoInputRef.current.value = '';
      }
      if (multipleImagesInputRef.current) {
        multipleImagesInputRef.current.value = '';
      }
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess(projectData);
      }
      
      // Close modal if provided
      if (closeModal) {
        closeModal();
      }
    } catch (error) {
      console.error("Error saving project:", error);
      toast({
        title: "Error",
        description: "Failed to save your project. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  return (
    <div className="space-y-6">
      <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2">
          <TabsTrigger value="details">Assignment Details</TabsTrigger>
          <TabsTrigger value="media">Assignment Media</TabsTrigger>
        </TabsList>
        
        <TabsContent value="details" className="space-y-4 pt-4">
          <div className="mb-4 p-4 bg-muted/40 rounded-lg border border-muted">
            <h3 className="text-base font-medium mb-1">Showcase your work and expertise</h3>
            <p className="text-sm text-muted-foreground">Add details, images and links to demonstrate your professional skills. Assignments highlight your best work to potential employers and collaborators.</p>
          </div>
          <Form {...projectForm}>
            <form onSubmit={projectForm.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={projectForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assignment Title*</FormLabel>
                    <FormControl>
                      <Input placeholder="My Amazing Project" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={projectForm.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <Input placeholder="Web Development, Design, etc." {...field} value={field.value || ''} />
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
                        placeholder="Select or type an industry"
                      />
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
                        placeholder="Describe your project, its goals, and your contributions" 
                        className="resize-none" 
                        {...field}
                        value={field.value || ''} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={projectForm.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Assignment Date*</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(new Date(field.value), "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={new Date(field.value)}
                          onSelect={(date) => field.onChange(date ? format(date, 'yyyy-MM-dd') : '')}
                          disabled={(date) => date > new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={projectForm.control}
                name="projectUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assignment URL</FormLabel>
                    <FormControl>
                      <Input type="url" placeholder="https://example.com" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormDescription>
                      Link to your work (GitHub, website, portfolio, etc.)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end gap-2">
                {onCancel && (
                  <Button type="button" variant="outline" onClick={onCancel}>
                    Cancel
                  </Button>
                )}
                <Button type="button" onClick={() => setActiveTab('media')}>
                  Next: Add Media
                </Button>
              </div>
            </form>
          </Form>
        </TabsContent>
        
        <TabsContent value="media" className="space-y-4 pt-4">
          <div className="mb-4 p-4 bg-muted/40 rounded-lg border border-muted">
            <h3 className="text-base font-medium mb-1">Enhance with visuals</h3>
            <p className="text-sm text-muted-foreground">A compelling thumbnail image is required. You can also add up to 10 additional images or a short video to better demonstrate your work.</p>
          </div>
          <Form {...projectForm}>
            <form onSubmit={projectForm.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-6">
                {/* Removed thumbnail field as requested */}
                
                <h3 className="text-base font-medium">Additional Assignment Media (Optional)</h3>
                <p className="text-sm text-muted-foreground mb-4">Choose one of the following media types to enhance your assignment showcase</p>

                <div className="flex space-x-4">
                  <div className="flex-1">
                    <Label className="block mb-2">Media Type</Label>
                    <div className="flex gap-4 items-start">
                      <div className="flex items-center space-x-2">
                        <input 
                          type="radio" 
                          id="media-images" 
                          name="media-type"
                          checked={!projectVideo}
                          onChange={() => {
                            setProjectVideo(null);
                            if (videoInputRef.current) {
                              videoInputRef.current.value = '';
                            }
                          }}
                          className="h-4 w-4" 
                        />
                        <Label htmlFor="media-images" className="font-normal">Images (Max 10)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input 
                          type="radio" 
                          id="media-video" 
                          name="media-type"
                          checked={!!projectVideo}
                          onChange={() => {
                            setProjectImages([]);
                            if (multipleImagesInputRef.current) {
                              multipleImagesInputRef.current.value = '';
                            }
                          }}
                          className="h-4 w-4" 
                        />
                        <Label htmlFor="media-video" className="font-normal">Video (Max 150 sec)</Label>
                      </div>
                    </div>
                  </div>
                </div>
                
                {!projectVideo ? (
                  <FormItem>
                    <FormLabel>Assignment Images</FormLabel>
                    <FormControl>
                      <Input 
                        type="file" 
                        ref={multipleImagesInputRef}
                        accept="image/*"
                        multiple
                        onChange={(e) => {
                          const files = Array.from(e.target.files || []);
                          if (files.length > 10) {
                            setMediaErrors(prev => ({...prev, images: "Maximum 10 images allowed"}));
                            return;
                          }
                          setProjectImages(files);
                          setMediaErrors(prev => ({...prev, images: undefined}));
                          // Reset featured image index when new images are uploaded
                          setFeaturedImageIndex(0);
                        }} 
                      />
                    </FormControl>
                    {projectImages.length > 0 && (
                      <div className="mt-4">
                        <Label>Select featured image</Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {projectImages.map((file, index) => (
                            <div 
                              key={index} 
                              className={`relative cursor-pointer border-2 ${
                                featuredImageIndex === index ? 'border-primary' : 'border-transparent'
                              }`}
                              onClick={() => handleSelectFeaturedImage(index)}
                            >
                              <img 
                                src={URL.createObjectURL(file)} 
                                alt={`New media ${index + 1}`} 
                                className="h-16 w-16 object-cover rounded"
                              />
                              {featuredImageIndex === index && (
                                <div className="absolute -top-2 -right-2 bg-primary text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                                  ★
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                        <div className="mt-2 text-xs text-muted-foreground">
                          Click an image to select which one will be featured on your profile.
                        </div>
                      </div>
                    )}
                    <FormDescription>
                      {existingProject?.mediaUrls && existingProject.mediaUrls.length > 0 ? (
                        <>
                          <span>Current media:</span>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {existingProject.mediaUrls.map((url, index) => (
                              <div 
                                key={index} 
                                className={`relative cursor-pointer border-2 ${
                                  featuredImageIndex === index ? 'border-primary' : 'border-transparent'
                                }`}
                                onClick={() => handleSelectFeaturedImage(index)}
                              >
                                <img 
                                  src={url} 
                                  alt={`Assignment media ${index + 1}`} 
                                  className="h-16 w-16 object-cover rounded"
                                />
                                {featuredImageIndex === index && (
                                  <div className="absolute -top-2 -right-2 bg-primary text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                                    ★
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                          <div className="mt-2 text-xs text-muted-foreground">
                            Click an image to set it as the featured image. Upload new images to replace all current ones.
                          </div>
                        </>
                      ) : (
                        "Upload up to 10 images to showcase your assignment"
                      )}
                    </FormDescription>
                    {mediaErrors?.images && <p className="text-sm font-medium text-destructive">{mediaErrors.images}</p>}
                    <FormMessage />
                  </FormItem>
                ) : (
                  <FormItem>
                    <FormLabel>Assignment Video</FormLabel>
                    <FormControl>
                      <Input 
                        type="file" 
                        ref={videoInputRef}
                        accept="video/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            // Create a temporary video element to check duration
                            const validateVideoLength = (file: File): Promise<boolean> => {
                              return new Promise((resolve) => {
                                // Create a temporary video element to check duration
                                const video = document.createElement('video');
                                video.preload = 'metadata';
                                
                                video.onloadedmetadata = () => {
                                  window.URL.revokeObjectURL(video.src);
                                  const duration = video.duration;
                                  
                                  if (duration > 150) { // 150 seconds limit for Assignments
                                    setMediaErrors(prev => ({...prev, video: `Video must be shorter than 150 seconds. Current length: ${Math.round(duration)} seconds.`}));
                                    resolve(false);
                                  } else {
                                    resolve(true);
                                  }
                                };
                                
                                video.onerror = () => {
                                  // If we can't determine length, we'll use file size as a fallback
                                  if (file.size > 6 * 1024 * 1024) { // ~150 seconds at 320kbps
                                    setMediaErrors(prev => ({...prev, video: "Video might exceed maximum size (max 150 seconds)"}));
                                    resolve(false);
                                  } else {
                                    resolve(true);
                                  }
                                };
                                
                                video.src = URL.createObjectURL(file);
                              });
                            };
                            
                            // Check video length and only proceed if it's valid
                            validateVideoLength(file).then(isValid => {
                              if (isValid) {
                                setProjectVideo(file);
                                setMediaErrors(prev => ({...prev, video: undefined}));
                              } else if (videoInputRef.current) {
                                videoInputRef.current.value = '';
                              }
                            });
                            return;
                          }
                        }} 
                      />
                    </FormControl>
                    <FormDescription>
                      Upload a short video (max 150 seconds) to demonstrate your assignment
                      {existingProject?.mediaUrls && existingProject.mediaUrls.length > 0 && (
                        <span className="text-xs text-muted-foreground block mt-1">(Upload a new one to replace)</span>
                      )}
                    </FormDescription>
                    {mediaErrors?.video && <p className="text-sm font-medium text-destructive">{mediaErrors.video}</p>}
                    <FormMessage />
                  </FormItem>
                )}
              </div>
              
              <div className="flex justify-between gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setActiveTab('details')}>
                  Back to Details
                </Button>
                <div className="space-x-2">
                  {onCancel && (
                    <Button type="button" variant="outline" onClick={onCancel}>
                      Cancel
                    </Button>
                  )}
                  <Button type="submit">
                    {existingProject ? 'Update Assignment' : 'Create Assignment'}
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </TabsContent>
      </Tabs>
    </div>
  );
}