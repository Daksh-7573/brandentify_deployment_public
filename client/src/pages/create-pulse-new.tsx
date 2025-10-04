import { useState, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, BarChart, Video, Image, FileCode, Loader2, X, ChevronLeft, Briefcase, Award, ExternalLink } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProjectForm, { Project } from "@/components/shared/project-form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { InsertPulse } from "@shared/schema";
import { IndustryCombobox } from "@/components/ui/industry-combobox";
import { INDUSTRIES, INDUSTRY_DOMAINS } from "@shared/constants";
import { Link, useLocation } from "wouter";
import { NeoGlassLayout, NeoGlassSection } from "@/components/layout/neo-glass-layout";
import { cn } from "@/lib/utils";
import "../styles/neo-glass-spotify.css";
import backgroundImage from "@assets/Brandentifier Landing_1751376023002.png";

export default function CreatePulsePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [pulseTitle, setPulseTitle] = useState("");
  const [pulseContent, setPulseContent] = useState("");
  const [pulseType, setPulseType] = useState("poll"); // Options: 'poll' (Trends), 'media-pulse' (Insights), 'assignment' (Assignments)
  const [mediaType, setMediaType] = useState("image");
  const [pulseCategory, setPulseCategory] = useState("");
  const [pulseIndustry, setPulseIndustry] = useState("");
  const [pollOptions, setPollOptions] = useState(["", ""]);
  // Project tab state
  const [activeProjectTab, setActiveProjectTab] = useState('details');
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [projectUrl, setProjectUrl] = useState("");
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [mediaUrlInput, setMediaUrlInput] = useState("");
  const [teamMembers, setTeamMembers] = useState<string[]>([""]);
  const [clientProfile, setClientProfile] = useState("");
  const videoInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Create a mutation for submitting the pulse
  const createPulseMutation = useMutation({
    mutationFn: async (pulseData: InsertPulse) => {
      const res = await apiRequest('POST', '/api/pulses', pulseData);
      return res;
    },
    onSuccess: () => {
      // Show success toast
      toast({
        title: "Pulse Created",
        description: "Your pulse has been successfully published!",
      });
      
      // Reset form
      setPulseTitle("");
      setPulseContent("");
      setPulseCategory("");
      setPulseIndustry("");
      setProjectUrl("");
      setPollOptions(["", ""]);
      setMediaUrls([]);
      setUploadedFiles([]);
      setMediaUrlInput("");
      setSelectedProject(null);
      setActiveProjectTab('details');
      setTeamMembers([""]);
      setClientProfile("");
      
      // Invalidate pulse cache so user sees their new post
      queryClient.invalidateQueries({ queryKey: ["/api/pulses"] });
      
      // Redirect to Industry Pulse page
      setLocation("/industry-pulse");
    },
    onError: (error) => {
      console.error("Error creating pulse:", error);
      // Show error toast
      toast({
        title: "Creation Failed",
        description: "There was an error publishing your pulse. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Function to add a poll option
  const addPollOption = () => {
    if (pollOptions.length < 5) {
      setPollOptions([...pollOptions, ""]);
    }
  };

  // Function to update a poll option
  const updatePollOption = (index: number, value: string) => {
    const newOptions = [...pollOptions];
    newOptions[index] = value;
    setPollOptions(newOptions);
  };

  // Function to remove a poll option
  const removePollOption = (index: number) => {
    if (pollOptions.length > 2) {
      const newOptions = [...pollOptions];
      newOptions.splice(index, 1);
      setPollOptions(newOptions);
    }
  };
  
  // Handle pulse creation
  const handleCreatePulse = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to create a pulse.",
        variant: "destructive",
      });
      return;
    }
    
    if (!pulseTitle.trim()) {
      toast({
        title: "Missing Title",
        description: "Please provide a title for your pulse.",
        variant: "destructive",
      });
      return;
    }
    
    // Common pulse data
    const pulseData: any = {
      userId: user.id,
      title: pulseTitle,
      content: pulseContent,
      type: pulseType,
      industry: pulseIndustry,
      domain: pulseCategory, // Domain specialty within the industry
    };
    
    // Add type-specific data
    if (pulseType === 'poll') {
      // Validate poll options
      const validOptions = pollOptions.filter(option => option.trim() !== '');
      if (validOptions.length < 2) {
        toast({
          title: "Poll Options Required",
          description: "Please provide at least two poll options.",
          variant: "destructive",
        });
        return;
      }
      
      pulseData.pollOptions = validOptions;
    } 
    else if (pulseType === 'media-pulse') {
      pulseData.mediaType = mediaType;
      
      // Validate media uploads
      if (mediaUrls.length === 0) {
        toast({
          title: "Media Required",
          description: `Please upload at least one ${mediaType === 'image' ? 'image' : 'video'} for your media pulse.`,
          variant: "destructive",
        });
        return;
      }
      
      pulseData.mediaUrls = mediaUrls;
    }
    else if (pulseType === 'project') {
      // For project pulses, create the project automatically
      if (!pulseTitle.trim() || !pulseContent.trim() || !pulseIndustry) {
        toast({
          title: "Project Details Required",
          description: "Please fill in project title, description, and industry.",
          variant: "destructive",
        });
        return;
      }
      
      try {
        // Create the project first
        const projectData = {
          userId: user.id,
          title: pulseTitle,
          description: pulseContent,
          industry: pulseIndustry,
          category: pulseCategory || null,
          projectUrl: projectUrl || null,
          startDate: new Date().toISOString().split('T')[0], // Today's date
          mediaUrls: mediaUrls.length > 0 ? mediaUrls : null,
        };
        
        const projectResponse = await apiRequest('POST', '/api/projects', projectData);
        const createdProject = await projectResponse.json();
        
        // Set the created project ID for the pulse
        pulseData.projectId = createdProject.id;
        setSelectedProject(createdProject.id);
        
        toast({
          title: "Project Created",
          description: "Your project has been saved to your profile and will be featured in this pulse.",
        });
        
      } catch (error: any) {
        console.error("Error creating project:", error);
        
        // Extract the error message from the server response
        let errorMessage = "Failed to create project. Please try again.";
        if (error?.message) {
          errorMessage = error.message;
        } else if (typeof error === 'string') {
          errorMessage = error;
        }
        
        // Check if it's a project limit message
        if (errorMessage.includes("Max 6 projects")) {
          toast({
            title: "Project Limit Reached",
            description: errorMessage,
          });
        } else {
          toast({
            title: "Error",
            description: errorMessage,
            variant: "destructive",
          });
        }
        return;
      }
    }
    
    // Submit the pulse
    try {
      await createPulseMutation.mutateAsync(pulseData as InsertPulse);
    } catch (error) {
      console.error("Error in mutation:", error);
    }
  };
  
  // Team member management functions
  const addTeamMember = () => {
    setTeamMembers([...teamMembers, ""]);
  };
  
  const removeTeamMember = (index: number) => {
    if (teamMembers.length > 1) {
      const newTeamMembers = teamMembers.filter((_, i) => i !== index);
      setTeamMembers(newTeamMembers);
    }
  };
  
  const updateTeamMember = (index: number, value: string) => {
    const newTeamMembers = [...teamMembers];
    newTeamMembers[index] = value;
    setTeamMembers(newTeamMembers);
  };
  
  // Handle media upload (images and videos)
  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    // Convert FileList to Array for filtering
    const filesArray = Array.from(files);
    
    // Check file count limit based on media type
    if (mediaType === 'image') {
      if (filesArray.length + uploadedFiles.length > 5) {
        toast({
          title: "Too Many Files",
          description: "You can only upload up to 5 images.",
          variant: "destructive",
        });
        return;
      }
    } else if (mediaType === 'video') {
      if (filesArray.length > 1) {
        toast({
          title: "Video Limit",
          description: "You can only upload one video at a time.",
          variant: "destructive",
        });
        return;
      }
    }
    
    // Validate file types and sizes
    const validFiles = filesArray.filter(file => {
      if (mediaType === 'image') {
        // Check image file type
        if (!file.type.startsWith('image/')) {
          toast({
            title: "Invalid File Type",
            description: `"${file.name}" is not an image file.`,
            variant: "destructive",
          });
          return false;
        }
        
        // Check image file size (20MB limit)
        if (file.size > 20 * 1024 * 1024) {
          toast({
            title: "File Too Large",
            description: `"${file.name}" exceeds the 20MB limit.`,
            variant: "destructive",
          });
          return false;
        }
      } else if (mediaType === 'video') {
        // Check video file type
        if (!file.type.startsWith('video/')) {
          toast({
            title: "Invalid File Type",
            description: `"${file.name}" is not a video file.`,
            variant: "destructive",
          });
          return false;
        }
        
        // Check video file size (25MB limit for 2 minutes)
        if (file.size > 25 * 1024 * 1024) {
          toast({
            title: "File Too Large",
            description: `"${file.name}" exceeds the 25MB limit. Please compress your video or reduce duration to 2 minutes.`,
            variant: "destructive",
          });
          return false;
        }
      }
      
      return true;
    });
    
    // Return if no valid files
    if (validFiles.length === 0) return;
    
    try {
      // Create FormData to send files to server
      const formData = new FormData();
      if (!user) {
        throw new Error("User not logged in");
      }
      
      formData.append("userId", user.id.toString());
      validFiles.forEach(file => {
        formData.append("media", file);
      });
      
      // Show uploading toast
      const fileType = mediaType === 'video' ? 'video' : 'images';
      toast({
        title: "Uploading",
        description: `Uploading ${fileType} to the server...`,
      });
      
      // Upload files to server
      const response = await fetch('/api/pulses/upload-media', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        let errorMessage = `Server returned ${response.status}: ${response.statusText}`;
        try {
          const errorData = await response.json();
          if (errorData.message) {
            errorMessage = errorData.message;
          } else if (errorData.error) {
            errorMessage = errorData.error;
          }
        } catch (parseError) {
          console.warn("Could not parse error response:", parseError);
        }
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      console.log("Media upload successful:", data);
      
      // Update mediaUrls with server URLs
      if (data.mediaUrls && data.mediaUrls.length > 0) {
        setMediaUrls(data.mediaUrls);
        setUploadedFiles(validFiles);
        
        toast({
          title: "Upload Complete",
          description: `${fileType.charAt(0).toUpperCase() + fileType.slice(1)} uploaded successfully`,
        });
      }
    } catch (error) {
      console.error("Error uploading media:", error);
      
      // Clear any partial uploads on error
      setMediaUrls([]);
      setUploadedFiles([]);
      
      // Reset file inputs
      if (imageInputRef.current) {
        imageInputRef.current.value = '';
      }
      if (videoInputRef.current) {
        videoInputRef.current.value = '';
      }
      
      let errorMessage = "Failed to upload media";
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null && 'message' in error) {
        errorMessage = String(error.message);
      }
      
      toast({
        title: "Upload Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };
  
  const removeMedia = (index: number) => {
    const newUrls = [...mediaUrls];
    const newFiles = [...uploadedFiles];
    
    // Revoke the URL to prevent memory leaks
    URL.revokeObjectURL(newUrls[index]);
    
    newUrls.splice(index, 1);
    newFiles.splice(index, 1);
    
    setMediaUrls(newUrls);
    setUploadedFiles(newFiles);
  };

  // Function to add media URL
  const addMediaUrl = () => {
    if (!mediaUrlInput.trim()) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid URL.",
        variant: "destructive",
      });
      return;
    }

    // Validate URL format
    try {
      new URL(mediaUrlInput);
    } catch {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid URL format.",
        variant: "destructive",
      });
      return;
    }

    // Check media type limit
    if (mediaType === 'image' && mediaUrls.length >= 10) {
      toast({
        title: "Limit Reached",
        description: "You can only add up to 10 images.",
        variant: "destructive",
      });
      return;
    }

    if (mediaType === 'video' && mediaUrls.length >= 1) {
      toast({
        title: "Limit Reached", 
        description: "You can only add one video.",
        variant: "destructive",
      });
      return;
    }

    // Add URL to mediaUrls
    setMediaUrls([...mediaUrls, mediaUrlInput]);
    setMediaUrlInput("");
    
    toast({
      title: "URL Added",
      description: `${mediaType === 'image' ? 'Image' : 'Video'} URL added successfully.`,
    });
  };

  return (
    <div 
      className="fixed inset-0 w-full h-full responsive-background"
      style={{ 
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Glass UI overlay to maintain design consistency - Modal Screen Effect */}
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900/80 via-black/70 to-gray-800/80 backdrop-blur-sm"></div>
      
      <div className="relative z-10 w-full h-full overflow-auto">
        <Header />
        <NeoGlassLayout className="mt-3 mx-3 sm:mx-6">
              <div className="w-full">
              <div className="mb-4 sm:mb-6">
                <h1 className="text-xl sm:text-2xl font-bold text-white">Create Pulse</h1>
                <p className="text-white/70 text-sm sm:text-base">Share your thoughts, projects, or expertise with the professional community</p>
              </div>
              
              <NeoGlassSection className="mb-4 sm:mb-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  <Card 
                    className={cn(
                      "cursor-pointer transition-all hover:shadow-md bg-[rgba(18,18,18,0.95)] text-white border-white/20",
                      pulseType === 'poll' ? 'ring-2 ring-white/40' : ''
                    )}
                    onClick={() => setPulseType('poll')}
                  >
                    <CardContent className="p-3 sm:p-4 flex flex-col items-center justify-center text-center">
                      <BarChart className={cn(
                        "h-8 w-8 sm:h-10 sm:w-10 mb-2",
                        pulseType === 'poll' ? 'text-white' : 'text-white/70'
                      )} />
                      <h3 className="font-medium text-sm sm:text-base">Trends</h3>
                      <p className="text-xs text-gray-300 mt-1">Ask questions with options</p>
                    </CardContent>
                  </Card>

                  <Card 
                    className={cn(
                      "cursor-pointer transition-all hover:shadow-md bg-[rgba(18,18,18,0.95)] text-white border-white/20",
                      pulseType === 'media-pulse' ? 'ring-2 ring-white/40' : ''
                    )}
                    onClick={() => setPulseType('media-pulse')}
                  >
                    <CardContent className="p-3 sm:p-4 flex flex-col items-center justify-center text-center">
                      {mediaType === 'video' ? (
                        <Video className={cn(
                          "h-8 w-8 sm:h-10 sm:w-10 mb-2",
                          pulseType === 'media-pulse' ? 'text-white' : 'text-white/70'
                        )} />
                      ) : (
                        <Image className={cn(
                          "h-8 w-8 sm:h-10 sm:w-10 mb-2",
                          pulseType === 'media-pulse' ? 'text-white' : 'text-white/70'
                        )} />
                      )}
                      <h3 className="font-medium text-sm sm:text-base">Insights</h3>
                      <p className="text-xs text-gray-300 mt-1">Images or video for your branding</p>
                    </CardContent>
                  </Card>

                  <Card 
                    className={cn(
                      "cursor-pointer transition-all hover:shadow-md bg-[rgba(18,18,18,0.95)] text-white border-white/20",
                      pulseType === 'project' ? 'ring-2 ring-white/40' : ''
                    )}
                    onClick={() => setPulseType('project')}
                  >
                    <CardContent className="p-3 sm:p-4 flex flex-col items-center justify-center text-center">
                      <FileCode className={cn(
                        "h-8 w-8 sm:h-10 sm:w-10 mb-2",
                        pulseType === 'project' ? 'text-white' : 'text-white/70'
                      )} />
                      <h3 className="font-medium text-sm sm:text-base">Projects</h3>
                      <p className="text-xs text-gray-300 mt-1">Add or select a project</p>
                    </CardContent>
                  </Card>
                </div>
              </NeoGlassSection>
              
              {/* Form fields for non-project pulses only - project fields are in tabs */}
              {pulseType !== 'project' && (
                <NeoGlassSection>
                  <div className="space-y-4 sm:space-y-6">
                    <>
                      <div className="space-y-1 sm:space-y-2">
                        <Label htmlFor="title" className="text-white text-sm sm:text-base">Title</Label>
                        <Input 
                          id="title" 
                          placeholder="Enter a title for your pulse" 
                          value={pulseTitle}
                          onChange={(e) => setPulseTitle(e.target.value)}
                          className="neo-glass-input bg-[rgba(18,18,18,0.95)] text-white border-white/20 h-9 sm:h-10 text-sm sm:text-base"
                        />
                      </div>
                      
                      <div className="space-y-1 sm:space-y-2">
                        <Label htmlFor="content" className="text-white text-sm sm:text-base">Content</Label>
                        <Textarea 
                          id="content" 
                          placeholder="What's on your mind? Share your professional thoughts, insights, or ask a question." 
                          rows={3}
                          value={pulseContent}
                          onChange={(e) => setPulseContent(e.target.value)}
                          className="neo-glass-input bg-[rgba(18,18,18,0.95)] text-white border-white/20 text-sm sm:text-base min-h-[80px] sm:min-h-[100px] resize-y"
                        />
                      </div>
                      
                      <div className="space-y-1 sm:space-y-2">
                        <Label htmlFor="industry" className="text-white flex items-center gap-2 text-sm sm:text-base">
                          <Briefcase className="h-3 w-3 sm:h-4 sm:w-4" />
                          Industry
                        </Label>
                        <div className="relative">
                          <select
                            id="industry"
                            value={pulseIndustry}
                            onChange={(e) => {
                              setPulseIndustry(e.target.value);
                              if (e.target.value !== pulseIndustry) {
                                setPulseCategory("");
                              }
                            }}
                            className="bg-[rgba(18,18,18,0.95)] backdrop-blur-md text-white border-white/20 shadow-md transition-all hover:border-white/30 w-full h-10 sm:h-12 px-2 sm:px-3 pr-8 sm:pr-10 rounded-md border appearance-none cursor-pointer focus:border-white/50 focus:ring-2 focus:ring-white/30 focus:outline-none text-sm leading-relaxed"
                          >
                            <option value="">Select your industry</option>
                            {INDUSTRIES.map((ind) => (
                              <option key={ind} value={ind} className="bg-gray-800 text-white">
                                {ind}
                              </option>
                            ))}
                          </select>
                          <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:pr-3 pointer-events-none">
                            <svg className="h-3 w-3 sm:h-4 sm:w-4 text-white/70" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                      </div>
                      
                      {pulseIndustry && INDUSTRY_DOMAINS[pulseIndustry] && (
                        <div className="space-y-1 sm:space-y-2">
                          <Label htmlFor="domain" className="text-white flex items-center gap-2 text-sm sm:text-base">
                            <Award className="h-3 w-3 sm:h-4 sm:w-4" />
                            Domain Specialty
                          </Label>
                          <div className="relative">
                            <select
                              id="domain"
                              value={pulseCategory}
                              onChange={(e) => setPulseCategory(e.target.value)}
                              className="bg-[rgba(18,18,18,0.95)] backdrop-blur-md text-white border-white/20 shadow-md transition-all hover:border-white/30 w-full h-10 sm:h-12 px-2 sm:px-3 pr-8 sm:pr-10 rounded-md border appearance-none cursor-pointer focus:border-white/50 focus:ring-2 focus:ring-white/30 focus:outline-none text-sm leading-relaxed"
                            >
                              <option value="">Select domain specialty</option>
                              {INDUSTRY_DOMAINS[pulseIndustry].map((dom) => (
                                <option key={dom} value={dom} className="bg-gray-800 text-white">
                                  {dom}
                                </option>
                              ))}
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:pr-3 pointer-events-none">
                              <svg className="h-3 w-3 sm:h-4 sm:w-4 text-white/70" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  </div>
                </NeoGlassSection>
              )}

              {/* Poll Options */}
              {pulseType === 'poll' && (
                <NeoGlassSection>
                  <div className="space-y-3 sm:space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-white text-sm sm:text-base">Poll Options</Label>
                        <button
                          type="button"
                          onClick={addPollOption}
                          className="neo-glass-button text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
                          disabled={pollOptions.length >= 5}
                        >
                          Add Option
                        </button>
                      </div>
                      
                      {pollOptions.map((option, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Input
                            placeholder={`Option ${index + 1}`}
                            value={option}
                            onChange={(e) => updatePollOption(index, e.target.value)}
                            className="neo-glass-input bg-[rgba(18,18,18,0.95)] text-white border-white/20 h-9 sm:h-10 text-sm sm:text-base"
                          />
                          {pollOptions.length > 2 && (
                            <button
                              type="button"
                              onClick={() => removePollOption(index)}
                              className="neo-glass-button neo-glass-icon-button min-w-[32px] h-8 sm:min-w-[36px] sm:h-9"
                            >
                              <X className="h-3 w-3 sm:h-4 sm:w-4" />
                            </button>
                          )}
                        </div>
                      ))}
                  </div>
                </NeoGlassSection>
              )}

              {/* Media Upload for Insights */}
              {pulseType === 'media-pulse' && (
                <NeoGlassSection>
                  <div className="space-y-4 sm:space-y-6">
                    <div className="space-y-1 sm:space-y-2">
                      <Label className="text-white text-sm sm:text-base">Media Content</Label>
                      <p className="text-xs text-gray-400">Upload images or videos to share your insights</p>
                    </div>
                    
                    {/* Media Type Selection */}
                    <div className="space-y-3 sm:space-y-4">
                      <div className="space-y-1 sm:space-y-2">
                        <Label className="text-white text-sm sm:text-base">Media Type</Label>
                        <div className="flex gap-2 sm:gap-4">
                          <button
                            type="button"
                            onClick={() => setMediaType('image')}
                            className={`neo-glass-button ${mediaType === 'image' ? 'primary' : 'secondary'} text-xs sm:text-sm px-3 sm:px-4 py-2`}
                          >
                            <Image className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                            Images
                          </button>
                          <button
                            type="button"
                            onClick={() => setMediaType('video')}
                            className={`neo-glass-button ${mediaType === 'video' ? 'primary' : 'secondary'} text-xs sm:text-sm px-3 sm:px-4 py-2`}
                          >
                            <Video className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                            Video
                          </button>
                        </div>
                      </div>

                      {mediaType === 'image' ? (
                        <div className="space-y-3 sm:space-y-4">
                          <div className="space-y-1 sm:space-y-2">
                            <Label htmlFor="insights-images" className="text-white text-sm sm:text-base">Upload Images</Label>
                            <div className="flex flex-col space-y-1 sm:space-y-2">
                              <Input
                                ref={imageInputRef}
                                id="insights-images"
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleMediaUpload}
                                className="w-full min-h-[48px] sm:min-h-[56px] px-3 sm:px-4 py-2 sm:py-3 bg-[rgba(18,18,18,0.95)] text-white border border-white/20 rounded-lg text-sm sm:text-base"
                                style={{
                                  lineHeight: '1.5',
                                  display: 'flex',
                                  alignItems: 'center'
                                }}
                              />
                              <p className="text-xs text-gray-400">Select up to 5 images (max 20MB each)</p>
                            </div>
                          </div>
                          
                          {mediaUrls.length > 0 && (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3 sm:mt-4">
                              {mediaUrls.map((url, index) => (
                                <div key={index} className="relative group">
                                  <img 
                                    src={url} 
                                    alt={`Preview ${index}`}
                                    className="w-full aspect-video object-cover rounded-md border border-white/20" 
                                  />
                                  <button
                                    type="button"
                                    className="absolute top-2 right-2 h-6 w-6 neo-glass-button neo-glass-icon-button opacity-0 group-hover:opacity-100 transition-all"
                                    onClick={() => removeMedia(index)}
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-3 sm:space-y-4">
                          <div className="space-y-1 sm:space-y-2">
                            <Label htmlFor="insights-video" className="text-white text-sm sm:text-base">Upload Video</Label>
                            <div className="flex flex-col space-y-1 sm:space-y-2">
                              <Input
                                ref={videoInputRef}
                                id="insights-video"
                                type="file"
                                accept="video/*"
                                onChange={handleMediaUpload}
                                className="w-full min-h-[48px] sm:min-h-[56px] px-3 sm:px-4 py-2 sm:py-3 bg-[rgba(18,18,18,0.95)] text-white border border-white/20 rounded-lg text-sm sm:text-base"
                                style={{
                                  lineHeight: '1.5',
                                  display: 'flex',
                                  alignItems: 'center'
                                }}
                              />
                              <p className="text-xs text-gray-400">Select video file (max 120 seconds, 25MB)</p>
                            </div>
                          </div>
                          
                          {mediaUrls.length > 0 && (
                            <div className="mt-3 sm:mt-4">
                              <div className="relative group border border-white/20 rounded-md overflow-hidden">
                                <video
                                  src={mediaUrls[0]}
                                  controls
                                  className="w-full aspect-video object-cover"
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="icon"
                                  className="absolute top-2 right-2 h-6 w-6 bg-black/60 text-white border-white/20 opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={() => removeMedia(0)}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </NeoGlassSection>
              )}

              {/* Project Tabs Navigation */}
              {pulseType === 'project' && (
                <NeoGlassSection>
                  <Tabs defaultValue="details" value={activeProjectTab} onValueChange={setActiveProjectTab}>
                    <TabsList className="mb-0 dark-tabs-list grid grid-cols-2 sm:grid-cols-4 w-full">
                      <TabsTrigger 
                        value="details" 
                        className="dark-tabs-trigger text-xs sm:text-sm"
                      >
                        Details
                      </TabsTrigger>
                      <TabsTrigger 
                        value="media" 
                        className="dark-tabs-trigger text-xs sm:text-sm"
                      >
                        Media
                      </TabsTrigger>
                      <TabsTrigger 
                        value="team" 
                        className="dark-tabs-trigger text-xs sm:text-sm"
                      >
                        Team
                      </TabsTrigger>
                      <TabsTrigger 
                        value="client" 
                        className="dark-tabs-trigger text-xs sm:text-sm"
                      >
                        Client
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </NeoGlassSection>
              )}

              {/* Project Creation Content */}
              {pulseType === 'project' && (
                <NeoGlassSection>
                  <Tabs defaultValue="details" value={activeProjectTab} onValueChange={setActiveProjectTab}>
                        
                        <TabsContent value="details" className="space-y-4 sm:space-y-6 pt-4 sm:pt-6">
                          <div className="space-y-4 sm:space-y-6">
                            {/* Project Title */}
                            <div className="space-y-1 sm:space-y-2">
                              <Label htmlFor="project-title" className="text-white text-sm sm:text-base">Project Title*</Label>
                              <Input
                                id="project-title"
                                placeholder="Enter your project title"
                                value={pulseTitle}
                                onChange={(e) => setPulseTitle(e.target.value)}
                                className="neo-glass-input bg-[rgba(18,18,18,0.95)] text-white border-white/20 h-9 sm:h-10 text-sm sm:text-base"
                                required
                              />
                            </div>
                            
                            {/* Project Description */}
                            <div className="space-y-1 sm:space-y-2">
                              <Label htmlFor="project-description" className="text-white text-sm sm:text-base">Project Description*</Label>
                              <Textarea
                                id="project-description"
                                placeholder="Describe your project, challenges faced, and solutions implemented"
                                value={pulseContent}
                                onChange={(e) => setPulseContent(e.target.value)}
                                className="neo-glass-input bg-[rgba(18,18,18,0.95)] text-white border-white/20 min-h-[80px] sm:min-h-[120px] text-sm sm:text-base resize-y"
                                required
                              />
                            </div>
                            
                            {/* Industry Selection */}
                            <div className="space-y-1 sm:space-y-2">
                              <Label htmlFor="project-industry" className="text-white flex items-center gap-2 text-sm sm:text-base">
                                <Briefcase className="h-3 w-3 sm:h-4 sm:w-4" />
                                Industry*
                              </Label>
                              <div className="relative">
                                <select
                                  id="project-industry"
                                  value={pulseIndustry}
                                  onChange={(e) => {
                                    setPulseIndustry(e.target.value);
                                    if (e.target.value !== pulseIndustry) {
                                      setPulseCategory("");
                                    }
                                  }}
                                  className="bg-[rgba(18,18,18,0.95)] backdrop-blur-md text-white border-white/20 shadow-md transition-all hover:border-white/30 w-full h-10 sm:h-12 px-2 sm:px-3 pr-8 sm:pr-10 rounded-md border appearance-none cursor-pointer focus:border-white/50 focus:ring-2 focus:ring-white/30 focus:outline-none text-sm leading-relaxed"
                                  required
                                >
                                  <option value="">Select project industry</option>
                                  {INDUSTRIES.map((ind) => (
                                    <option key={ind} value={ind} className="bg-gray-800 text-white">
                                      {ind}
                                    </option>
                                  ))}
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:pr-3 pointer-events-none">
                                  <svg className="h-3 w-3 sm:h-4 sm:w-4 text-white/70" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                  </svg>
                                </div>
                              </div>
                            </div>
                            
                            {/* Domain Specialty */}
                            {pulseIndustry && INDUSTRY_DOMAINS[pulseIndustry] && (
                              <div className="space-y-1 sm:space-y-2">
                                <Label htmlFor="project-domain" className="text-white flex items-center gap-2 text-sm sm:text-base">
                                  <Award className="h-3 w-3 sm:h-4 sm:w-4" />
                                  Domain Specialty
                                </Label>
                                <div className="relative">
                                  <select
                                    id="project-domain"
                                    value={pulseCategory}
                                    onChange={(e) => setPulseCategory(e.target.value)}
                                    className="bg-[rgba(18,18,18,0.95)] backdrop-blur-md text-white border-white/20 shadow-md transition-all hover:border-white/30 w-full h-10 sm:h-12 px-2 sm:px-3 pr-8 sm:pr-10 rounded-md border appearance-none cursor-pointer focus:border-white/50 focus:ring-2 focus:ring-white/30 focus:outline-none text-sm leading-relaxed"
                                  >
                                    <option value="">Select domain specialty</option>
                                    {INDUSTRY_DOMAINS[pulseIndustry].map((dom) => (
                                      <option key={dom} value={dom} className="bg-gray-800 text-white">
                                        {dom}
                                      </option>
                                    ))}
                                  </select>
                                  <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:pr-3 pointer-events-none">
                                    <svg className="h-3 w-3 sm:h-4 sm:w-4 text-white/70" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                  </div>
                                </div>
                              </div>
                            )}
                            
                            {/* Project URL */}
                            <div className="space-y-1 sm:space-y-2">
                              <Label htmlFor="project-url" className="text-white flex items-center gap-2 text-sm sm:text-base">
                                <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4" />
                                Project URL
                              </Label>
                              <Input
                                id="project-url"
                                placeholder="https://your-project.com"
                                type="url"
                                value={projectUrl}
                                onChange={(e) => setProjectUrl(e.target.value)}
                                className="neo-glass-input bg-[rgba(18,18,18,0.95)] text-white border-white/20 h-9 sm:h-10 text-sm sm:text-base"
                              />
                              <p className="text-xs text-gray-400">Link to live project or repository</p>
                            </div>
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="media" className="space-y-4 sm:space-y-6 pt-4 sm:pt-6">
                          <div className="space-y-4 sm:space-y-6">
                            <div className="space-y-1 sm:space-y-2">
                              <Label className="text-white text-sm sm:text-base">Project Media</Label>
                              <p className="text-xs text-gray-400">Upload images and videos to showcase your project</p>
                            </div>
                            
                            {/* Media Type Selection */}
                            <div className="space-y-3 sm:space-y-4">
                              <div className="space-y-1 sm:space-y-2">
                                <Label className="text-white text-sm sm:text-base">Media Type</Label>
                                <div className="flex gap-2 sm:gap-4">
                                  <button
                                    type="button"
                                    onClick={() => setMediaType('image')}
                                    className={`neo-glass-button ${mediaType === 'image' ? 'primary' : 'secondary'} text-xs sm:text-sm px-3 sm:px-4 py-2`}
                                  >
                                    <Image className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                                    Images
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setMediaType('video')}
                                    className={`neo-glass-button ${mediaType === 'video' ? 'primary' : 'secondary'} text-xs sm:text-sm px-3 sm:px-4 py-2`}
                                  >
                                    <Video className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                                    Video
                                  </button>
                                </div>
                              </div>

                              {mediaType === 'image' ? (
                                <div className="space-y-3 sm:space-y-4">
                                  <div className="space-y-1 sm:space-y-2">
                                    <Label htmlFor="project-images" className="text-white text-sm sm:text-base">Upload Images</Label>
                                    <div className="flex flex-col space-y-1 sm:space-y-2">
                                      <Input
                                        ref={imageInputRef}
                                        id="project-images"
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={handleMediaUpload}
                                        className="w-full min-h-[48px] sm:min-h-[56px] px-3 sm:px-4 py-2 sm:py-3 bg-[rgba(18,18,18,0.95)] text-white border border-white/20 rounded-lg text-sm sm:text-base"
                                        style={{
                                          lineHeight: '1.5',
                                          display: 'flex',
                                          alignItems: 'center'
                                        }}
                                      />
                                      <p className="text-xs text-gray-400">Select up to 10 images (max 25MB each)</p>
                                    </div>
                                  </div>
                                  
                                  {mediaUrls.length > 0 && (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3 sm:mt-4">
                                      {mediaUrls.map((url, index) => (
                                        <div key={index} className="relative group">
                                          <img 
                                            src={url} 
                                            alt={`Preview ${index}`}
                                            className="w-full aspect-video object-cover rounded-md border border-white/20" 
                                          />
                                          <button
                                            type="button"
                                            className="absolute top-2 right-2 h-6 w-6 neo-glass-button neo-glass-icon-button opacity-0 group-hover:opacity-100 transition-all"
                                            onClick={() => removeMedia(index)}
                                          >
                                            <X className="h-3 w-3" />
                                          </button>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="space-y-3 sm:space-y-4">
                                  <div className="space-y-1 sm:space-y-2">
                                    <Label htmlFor="project-video" className="text-white text-sm sm:text-base">Upload Video</Label>
                                    <div className="flex flex-col space-y-1 sm:space-y-2">
                                      <Input
                                        ref={videoInputRef}
                                        id="project-video"
                                        type="file"
                                        accept="video/*"
                                        onChange={handleMediaUpload}
                                        className="w-full min-h-[48px] sm:min-h-[56px] px-3 sm:px-4 py-2 sm:py-3 bg-[rgba(18,18,18,0.95)] text-white border border-white/20 rounded-lg text-sm sm:text-base"
                                        style={{
                                          lineHeight: '1.5',
                                          display: 'flex',
                                          alignItems: 'center'
                                        }}
                                      />
                                      <p className="text-xs text-gray-400">Select video file (max 120 seconds)</p>
                                    </div>
                                  </div>
                                  
                                  {mediaUrls.length > 0 && (
                                    <div className="mt-3 sm:mt-4">
                                      <div className="relative group border border-white/20 rounded-md overflow-hidden">
                                        <video
                                          src={mediaUrls[0]}
                                          controls
                                          className="w-full aspect-video object-cover"
                                        />
                                        <Button
                                          type="button"
                                          variant="outline"
                                          size="icon"
                                          className="absolute top-2 right-2 h-6 w-6 bg-black/60 text-white border-white/20 opacity-0 group-hover:opacity-100 transition-opacity"
                                          onClick={() => removeMedia(0)}
                                        >
                                          <X className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="team" className="space-y-6 pt-6">
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label className="text-white">Team Members</Label>
                              <p className="text-xs text-gray-400">Add team members who worked on this project</p>
                            </div>
                            
                            {teamMembers.map((member, index) => (
                              <div key={index} className="space-y-4 border border-white/20 rounded-lg p-4 bg-[rgba(18,18,18,0.3)]">
                                <div className="flex items-center gap-2">
                                  <div className="flex-1 space-y-2">
                                    <Label className="text-white">Team Member {index + 1}</Label>
                                    <Input
                                      placeholder="https://brandentifier.replit.app/r/abc123xyz789"
                                      value={member}
                                      onChange={(e) => updateTeamMember(index, e.target.value)}
                                      className="neo-glass-input bg-[rgba(18,18,18,0.95)] text-white border-white/20"
                                    />
                                  </div>
                                  {teamMembers.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => removeTeamMember(index)}
                                      className="neo-glass-button neo-glass-icon-button mt-6"
                                    >
                                      <X className="h-4 w-4" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}
                            
                            <button 
                              type="button"
                              onClick={addTeamMember}
                              className="neo-glass-button w-full"
                            >
                              Add Team Member
                            </button>
                            
                            {!selectedProject && (
                              <p className="text-sm text-amber-400">
                                Complete project details first to add team members
                              </p>
                            )}
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="client" className="space-y-6 pt-6">
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label className="text-white">Client Endorsement</Label>
                              <p className="text-xs text-gray-400">
                                Add a client's profile link to invite them to endorse your project
                              </p>
                            </div>
                            
                            <div className="space-y-4 border border-white/20 rounded-lg p-4 bg-[rgba(18,18,18,0.3)]">
                              <div className="space-y-2">
                                <Label htmlFor="client-profile" className="text-white">Client Profile Link</Label>
                                <Input
                                  id="client-profile"
                                  placeholder="https://brandentifier.replit.app/r/abc123xyz789"
                                  value={clientProfile}
                                  onChange={(e) => setClientProfile(e.target.value)}
                                  className="neo-glass-input bg-[rgba(18,18,18,0.95)] text-white border-white/20"
                                />
                                <p className="text-xs text-gray-400">
                                  Add Brandentifier profile link of your client
                                </p>
                              </div>
                            </div>
                            
                            {!selectedProject && (
                              <p className="text-sm text-amber-400">
                                Complete project details first to request client endorsements
                              </p>
                            )}
                          </div>
                        </TabsContent>
                  </Tabs>
                </NeoGlassSection>
              )}

              <NeoGlassSection className="mb-8 sm:mb-12">
                <div className="pt-3 sm:pt-4">
                  <button 
                    type="button"
                    onClick={handleCreatePulse}
                    disabled={createPulseMutation.isPending}
                    className="neo-glass-button primary w-full sm:w-auto flex items-center justify-center gap-2 h-10 sm:h-12 text-sm sm:text-base px-4 sm:px-6"
                  >
                    {createPulseMutation.isPending ? (
                      <>
                        <div className="animate-spin h-3 w-3 sm:h-4 sm:w-4 border-2 border-white border-t-transparent rounded-full"></div>
                        <span>Publishing...</span>
                      </>
                    ) : (
                      <span>Publish Pulse</span>
                    )}
                  </button>
                </div>
              </NeoGlassSection>
              </div>
            </NeoGlassLayout>
      </div>
    </div>
  );
}

// ProjectSelect component for selecting an existing project
interface ProjectSelectProps {
  userId: number;
  value: number | null;
  onChange: (projectId: number | null) => void;
  className?: string;
}

function ProjectSelect({ userId, value, onChange, className }: ProjectSelectProps) {
  // Use React Query to fetch user's projects
  const { data: projects = [], isLoading, error } = useQuery<Project[]>({
    queryKey: [`/api/users/${userId}/projects`],
  });
  
  if (isLoading) {
    return <div className="text-sm text-white">Loading projects...</div>;
  }
  
  if (error) {
    return <div className="text-sm text-red-500">Error loading projects</div>;
  }
  
  if (projects.length === 0) {
    return <div className="text-sm text-amber-500">No projects found. Create a new project first.</div>;
  }
  
  return (
    <Select onValueChange={(v) => onChange(Number(v))} value={value?.toString()}>
      <SelectTrigger className={className}>
        <SelectValue placeholder="Select a project" />
      </SelectTrigger>
      <SelectContent className="neo-glass-input bg-[rgba(30,30,30,0.95)] text-white border-white/20">
        {projects.map((project: Project) => (
          <SelectItem key={project.id} value={project.id.toString()}>
            {project.title}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}