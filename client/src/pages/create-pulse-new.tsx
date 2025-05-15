import { useState, useRef } from "react";
import { useAuth } from "@/context/auth-context";
import { useMutation, useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
// Removed Sidebar import, using top navigation only
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, BarChart, Video, Image, FileCode, Loader2, X, Award, Rocket, BadgeCheck, Wrench, Bell, Zap, Briefcase, ChevronLeft } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProjectForm, { Project } from "@/components/shared/project-form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { InsertPulse } from "@shared/schema";
import { IndustryCombobox } from "@/components/ui/industry-combobox";
import { Link } from "wouter";
import { NeoGlassLayout, NeoGlassSection } from "@/components/layout/neo-glass-layout";
import { cn } from "@/lib/utils";
import "../styles/neo-glass-spotify.css";

export default function CreatePulsePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [pulseTitle, setPulseTitle] = useState("");
  const [pulseContent, setPulseContent] = useState("");
  const [pulseType, setPulseType] = useState("poll"); // Options: 'poll' (Trends), 'media-pulse' (Insights), 'assignment' (Assignments)
  const [mediaType, setMediaType] = useState("image");
  const [pulseCategory, setPulseCategory] = useState("highlight");
  const [pulseIndustry, setPulseIndustry] = useState("");
  const [pollOptions, setPollOptions] = useState(["", ""]);
  // Project tab state
  const [activeProjectTab, setActiveProjectTab] = useState('details');
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Create a mutation for submitting the pulse
  const createPulseMutation = useMutation({
    mutationFn: async (pulseData: InsertPulse) => {
      const res = await apiRequest({
        method: 'POST', 
        url: '/api/pulses', 
        data: pulseData
      });
      return res.json();
    },
    onSuccess: () => {
      // Invalidate the pulses query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['/api/pulses'] });
      
      // Reset form
      setPulseTitle("");
      setPulseContent("");
      setPollOptions(["", ""]);
      setSelectedProject(null);
      
      // Clean up file resources
      mediaUrls.forEach(url => URL.revokeObjectURL(url));
      setMediaUrls([]);
      setUploadedFiles([]);
      
      // Reset file inputs
      if (videoInputRef.current) videoInputRef.current.value = "";
      if (imageInputRef.current) imageInputRef.current.value = "";
      
      // Show success message
      toast({
        title: "Success",
        description: `Your ${pulseType} has been created successfully`,
        variant: "default",
      });
    },
    onError: (error: Error) => {
      console.error("Error creating pulse:", error);
      toast({
        title: "Error",
        description: `Failed to create pulse: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Handle create pulse form submission
  const handleCreatePulse = () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create a pulse",
        variant: "destructive",
      });
      return;
    }
    
    if (!pulseTitle.trim()) {
      toast({
        title: "Error",
        description: "Please enter a title",
        variant: "destructive",
      });
      return;
    }
    
    // Prepare pulse data based on type
    let pulseData: InsertPulse = {
      userId: user.id,
      type: pulseType as any, // Type assertion to match enum
      title: pulseTitle,
      content: pulseContent,
      isPublished: true,
      industry: pulseIndustry.trim() !== "" ? pulseIndustry : undefined
    };
    
    // Add type-specific data
    if (pulseType === 'poll') {
      // Filter out any empty options
      const validOptions = pollOptions.filter(option => option.trim() !== "");
      if (validOptions.length < 2) {
        toast({
          title: "Error",
          description: "Please provide at least two poll options",
          variant: "destructive",
        });
        return;
      }
      
      pulseData.pollOptions = validOptions;
    } 
    else if (pulseType === 'media-pulse') {
      if (mediaUrls.length === 0) {
        toast({
          title: "Error",
          description: `Please upload at least one ${mediaType === 'video' ? 'video' : 'image'}`,
          variant: "destructive",
        });
        return;
      }
      
      // Set the proper media type
      pulseData.mediaType = mediaType as any; // Type assertion to match enum
      
      // Set the pulse category
      pulseData.category = pulseCategory as any; // Type assertion to match enum
      
      // Calculate expires date for highlight category (24 hours from now)
      if (pulseCategory === 'highlight') {
        const expirationDate = new Date();
        expirationDate.setHours(expirationDate.getHours() + 24);
        pulseData.expiresAt = expirationDate.toISOString();
      }
    }
    else if (pulseType === 'project') {
      if (!selectedProject) {
        toast({
          title: "Error",
          description: "Please select or create a project",
          variant: "destructive",
        });
        return;
      }
      
      pulseData.projectId = selectedProject;
    }
    
    // Submit the pulse
    createPulseMutation.mutate(pulseData);
  };

  const addPollOption = () => {
    if (pollOptions.length < 5) {
      setPollOptions([...pollOptions, ""]);
    } else {
      toast({
        title: "Maximum options reached",
        description: "You can have at most 5 poll options",
        variant: "default",
      });
    }
  };

  const removePollOption = (index: number) => {
    if (pollOptions.length > 2) {
      const newOptions = [...pollOptions];
      newOptions.splice(index, 1);
      setPollOptions(newOptions);
    } else {
      toast({
        title: "Minimum options required",
        description: "You need at least 2 poll options",
        variant: "default",
      });
    }
  };

  const updatePollOption = (index: number, value: string) => {
    const newOptions = [...pollOptions];
    newOptions[index] = value;
    setPollOptions(newOptions);
  };
  
  // Helper function to check the video duration
  const validateVideoLength = (file: File, maxSeconds: number): Promise<boolean> => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      
      video.onloadedmetadata = () => {
        // Clean up memory
        window.URL.revokeObjectURL(video.src);
        
        if (video.duration > maxSeconds) {
          toast({
            title: "Video too long",
            description: `Video must be less than ${maxSeconds} seconds`,
            variant: "destructive",
          });
          resolve(false);
        } else {
          resolve(true);
        }
      };
      
      video.onerror = () => {
        // Clean up memory
        window.URL.revokeObjectURL(video.src);
        
        toast({
          title: "Invalid video",
          description: "Could not read video metadata",
          variant: "destructive",
        });
        resolve(false);
      };
      
      video.src = URL.createObjectURL(file);
    });
  };
  
  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0]; // Only take the first video
    
    // Check file size (100MB limit)
    if (file.size > 100 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "Video file must be less than 100MB",
        variant: "destructive",
      });
      return;
    }
    
    // Check video length based on pulse type
    const maxSeconds = pulseType === 'media-pulse' ? 80 : 150; // 80s for Insights, 150s for Assignments
    const isValidLength = await validateVideoLength(file, maxSeconds);
    
    if (!isValidLength) {
      // Reset the file input
      if (videoInputRef.current) {
        videoInputRef.current.value = '';
      }
      return;
    }
    
    // Create a preview URL for immediate display
    const previewUrl = URL.createObjectURL(file);
    setMediaUrls([previewUrl]);
    setUploadedFiles([file]);
    
    try {
      // Create FormData to send file to server
      const formData = new FormData();
      if (!user) {
        throw new Error("User not logged in");
      }
      
      formData.append("userId", user.id.toString());
      formData.append("media", file);
      
      // Show uploading toast
      toast({
        title: "Uploading",
        description: "Uploading video to the server...",
      });
      
      // Upload file to server
      const response = await fetch('/api/pulses/upload-media', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log("Video upload successful:", data);
      
      // Update mediaUrls with server URL
      if (data.mediaUrls && data.mediaUrls.length > 0) {
        setMediaUrls(data.mediaUrls);
        
        toast({
          title: "Video uploaded",
          description: "Video file uploaded successfully",
        });
      }
    } catch (error) {
      console.error("Error uploading video:", error);
      
      toast({
        title: "Upload Error",
        description: error instanceof Error ? error.message : "Failed to upload video",
        variant: "destructive",
      });
    }
  };
  
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    // Limit to 5 images
    const imageFiles = Array.from(files).slice(0, 5);
    
    // Check each file size (20MB limit)
    const validFiles = imageFiles.filter(file => {
      if (file.size > 20 * 1024 * 1024) {
        toast({
          title: "Warning",
          description: `Image ${file.name} exceeds 20MB limit and was ignored`,
          variant: "destructive",
        });
        return false;
      }
      return true;
    });
    
    if (validFiles.length === 0) return;
    
    // Create preview URLs for immediate display
    const previewUrls = validFiles.map(file => URL.createObjectURL(file));
    setMediaUrls(previewUrls);
    setUploadedFiles(validFiles);
    
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
      toast({
        title: "Uploading",
        description: "Uploading images to the server...",
      });
      
      // Upload files to server
      const response = await fetch('/api/pulses/upload-media', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log("Image upload successful:", data);
      
      // Update mediaUrls with server URLs
      if (data.mediaUrls && data.mediaUrls.length > 0) {
        setMediaUrls(data.mediaUrls);
        
        toast({
          title: "Images uploaded",
          description: "Image files uploaded successfully",
        });
      }
    } catch (error) {
      console.error("Error uploading images:", error);
      
      toast({
        title: "Upload Error",
        description: error instanceof Error ? error.message : "Failed to upload images",
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

  return (
    <div className="flex h-screen flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden pt-16"> {/* Added padding-top for fixed header */}
        <div className="flex-1 overflow-auto">
          <div className="neo-spotify-container">
            <div className="neo-spotify-wrapper">
              <div className="neo-spotify-main w-full">
                <div className="neo-spotify-header">
                  <div className="header-nav">
                    <Link href="/industry-pulse-new">
                      <button className="header-nav-btn">
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                    </Link>
                  </div>
                </div>
                
                <div className="neo-spotify-artist-header">
                  <div className="artist-verified">
                    <span className="verified-badge">✓</span>
                    Create New Content
                  </div>
                  <h1 className="artist-name">Create Pulse</h1>
                  <div className="artist-stats">
                    <span className="stats-icon">📝</span>
                    Share your thoughts, projects, or expertise with the professional community
                  </div>
                </div>
                
                <div className="neo-spotify-content">
                  {/* Pulse Type Selection */}
                  <div className="tracks-list mb-6">
                    <Card 
                      className={`cursor-pointer transition-all hover:shadow-md ${pulseType === 'poll' ? 'ring-2 ring-[#1DB954]' : ''} bg-[rgba(18,18,18,0.95)] text-white border-white/20 mb-2`}
                      onClick={() => setPulseType('poll')}
                    >
                      <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                        <BarChart className={`h-10 w-10 mb-2 ${pulseType === 'poll' ? 'text-[#1DB954]' : 'text-white'}`} />
                        <h3 className="font-medium">Trends</h3>
                        <p className="text-xs text-gray-300 mt-1">Ask questions with options</p>
                      </CardContent>
                    </Card>

                    <Card 
                      className={`cursor-pointer transition-all hover:shadow-md ${pulseType === 'media-pulse' ? 'ring-2 ring-[#1DB954]' : ''} bg-[rgba(18,18,18,0.95)] text-white border-white/20 mb-2`}
                      onClick={() => setPulseType('media-pulse')}
                    >
                      <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                        {mediaType === 'video' ? (
                          <Video className={`h-10 w-10 mb-2 ${pulseType === 'media-pulse' ? 'text-[#1DB954]' : 'text-white'}`} />
                        ) : (
                          <Image className={`h-10 w-10 mb-2 ${pulseType === 'media-pulse' ? 'text-[#1DB954]' : 'text-white'}`} />
                        )}
                        <h3 className="font-medium">Insights</h3>
                        <p className="text-xs text-gray-300 mt-1">Images or video for your branding</p>
                      </CardContent>
                    </Card>

                    <Card 
                      className={`cursor-pointer transition-all hover:shadow-md ${pulseType === 'project' ? 'ring-2 ring-[#1DB954]' : ''} bg-[rgba(18,18,18,0.95)] text-white border-white/20`}
                      onClick={() => setPulseType('project')} // Note: value remains 'project' for backward compatibility
                    >
                      <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                        <FileCode className={`h-10 w-10 mb-2 ${pulseType === 'project' ? 'text-[#1DB954]' : 'text-white'}`} />
                        <h3 className="font-medium">Assignments</h3>
                        <p className="text-xs text-gray-300 mt-1">Showcase your work and expertise with a detailed assignment.</p>
                      </CardContent>
                    </Card>
                  </div>

                  <Card className="mb-6 bg-[rgba(18,18,18,0.95)] text-white border-white/20">
                    <CardContent className="p-6">
                      {pulseType === 'poll' && (
                        <Alert className="mb-6 bg-[rgba(18,18,18,0.8)] border-[#1DB954]/20 text-white">
                          <BarChart className="h-4 w-4 text-[#1DB954]" />
                          <AlertTitle className="text-white">Trends</AlertTitle>
                          <AlertDescription className="text-gray-300">
                            Ask your network questions with custom options. Results update live as people vote.
                          </AlertDescription>
                        </Alert>
                      )}

                      {pulseType === 'media-pulse' && (
                        <Alert className="mb-6 bg-[rgba(18,18,18,0.8)] border-[#1DB954]/20 text-white">
                          {mediaType === 'video' ? (
                            <Video className="h-4 w-4 text-[#1DB954]" />
                          ) : (
                            <Image className="h-4 w-4 text-[#1DB954]" />
                          )}
                          <AlertTitle className="text-white">Insights</AlertTitle>
                          <AlertDescription className="text-gray-300">
                            Share branding visuals through images (max 5) or a video (max 80 seconds).
                          </AlertDescription>
                        </Alert>
                      )}

                      {pulseType === 'project' && (
                        <Alert className="mb-6 bg-[rgba(18,18,18,0.8)] border-[#1DB954]/20 text-white">
                          <FileCode className="h-4 w-4 text-[#1DB954]" />
                          <AlertTitle className="text-white">Assignments</AlertTitle>
                          <AlertDescription className="text-gray-300">
                            Share your professional work with detailed information and links.
                          </AlertDescription>
                        </Alert>
                      )}

                      <div className="space-y-6">
                        {/* Title Field */}
                        <div className="space-y-2">
                          <Label htmlFor="title" className="text-white">Title</Label>
                          <Input
                            id="title"
                            placeholder="Enter a title for your pulse"
                            value={pulseTitle}
                            onChange={(e) => setPulseTitle(e.target.value)}
                            className="neo-glass-input"
                          />
                        </div>

                        {/* Industry Field */}
                        <div className="space-y-2">
                          <Label htmlFor="industry" className="text-white">Industry (optional)</Label>
                          <IndustryCombobox 
                            value={pulseIndustry} 
                            onChange={setPulseIndustry} 
                            triggerClassName="neo-glass-input"
                            contentClassName="bg-[rgba(18,18,18,0.95)] text-white border-white/20"
                          />
                        </div>

                        {/* Content Field */}
                        <div className="space-y-2">
                          <Label htmlFor="content" className="text-white">Description</Label>
                          <Textarea
                            id="content"
                            placeholder="Add some details about your pulse"
                            value={pulseContent}
                            onChange={(e) => setPulseContent(e.target.value)}
                            rows={5}
                            className="neo-glass-input"
                          />
                        </div>

                        {/* Poll Options */}
                        {pulseType === 'poll' && (
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <Label className="text-white">Poll Options</Label>
                              <Button
                                type="button"
                                onClick={addPollOption}
                                variant="outline"
                                size="sm"
                                className="bg-[rgba(18,18,18,0.95)] text-white border-white/20 hover:bg-white/10"
                                disabled={pollOptions.length >= 5}
                              >
                                Add Option
                              </Button>
                            </div>
                            
                            {pollOptions.map((option, index) => (
                              <div key={index} className="flex items-center gap-2">
                                <Input
                                  placeholder={`Option ${index + 1}`}
                                  value={option}
                                  onChange={(e) => updatePollOption(index, e.target.value)}
                                  className="neo-glass-input"
                                />
                                {pollOptions.length > 2 && (
                                  <Button
                                    type="button"
                                    onClick={() => removePollOption(index)}
                                    variant="ghost"
                                    size="icon"
                                    className="bg-transparent text-white hover:bg-white/10"
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Media Type Selection for Insights */}
                        {pulseType === 'media-pulse' && (
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label className="text-white">Media Type</Label>
                              <div className="flex gap-4">
                                <Button
                                  type="button"
                                  variant={mediaType === 'image' ? 'default' : 'outline'}
                                  onClick={() => setMediaType('image')}
                                  className={mediaType === 'image' ? 'bg-[#1DB954] text-black hover:bg-[#1DB954]/90' : 'bg-[rgba(18,18,18,0.95)] text-white border-white/20 hover:bg-white/10'}
                                >
                                  <Image className="mr-2 h-4 w-4" />
                                  Images
                                </Button>
                                <Button
                                  type="button"
                                  variant={mediaType === 'video' ? 'default' : 'outline'}
                                  onClick={() => setMediaType('video')}
                                  className={mediaType === 'video' ? 'bg-[#1DB954] text-black hover:bg-[#1DB954]/90' : 'bg-[rgba(18,18,18,0.95)] text-white border-white/20 hover:bg-white/10'}
                                >
                                  <Video className="mr-2 h-4 w-4" />
                                  Video
                                </Button>
                              </div>
                            </div>

                            {mediaType === 'image' ? (
                              <div className="space-y-2">
                                <Label htmlFor="images" className="text-white">Upload Images</Label>
                                <div className="flex flex-col space-y-2">
                                  <Input
                                    ref={imageInputRef}
                                    id="images"
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleImageUpload}
                                    className="neo-glass-input"
                                  />
                                  <p className="text-xs text-gray-400">Select up to 5 images (max 20MB each)</p>
                                </div>
                                
                                {mediaUrls.length > 0 && (
                                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-4">
                                    {mediaUrls.map((url, index) => (
                                      <div key={index} className="relative group">
                                        <img 
                                          src={url} 
                                          alt={`Preview ${index}`}
                                          className="h-24 w-full object-cover rounded"
                                        />
                                        <Button
                                          type="button"
                                          variant="destructive"
                                          size="icon"
                                          className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                          onClick={() => removeMedia(index)}
                                        >
                                          <X className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <Label htmlFor="video" className="text-white">Upload Video</Label>
                                <div className="flex flex-col space-y-2">
                                  <Input
                                    ref={videoInputRef}
                                    id="video"
                                    type="file"
                                    accept="video/*"
                                    onChange={handleVideoUpload}
                                    className="neo-glass-input"
                                  />
                                  <p className="text-xs text-gray-400">Select a video file (max 80 seconds, 100MB)</p>
                                </div>
                                
                                {mediaUrls.length > 0 && (
                                  <div className="mt-4 relative group">
                                    <video 
                                      src={mediaUrls[0]} 
                                      controls
                                      className="w-full rounded"
                                    />
                                    <Button
                                      type="button"
                                      variant="destructive"
                                      size="icon"
                                      className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                      onClick={() => removeMedia(0)}
                                    >
                                      <X className="h-3 w-3" />
                                    </Button>
                                  </div>
                                )}
                              </div>
                            )}

                            <div className="space-y-2">
                              <Label htmlFor="category" className="text-white">Content Category</Label>
                              <Select
                                value={pulseCategory}
                                onValueChange={setPulseCategory}
                              >
                                <SelectTrigger id="category" className="neo-glass-input">
                                  <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                                <SelectContent className="bg-[rgba(18,18,18,0.95)] text-white border-white/20">
                                  <SelectItem value="highlight" className="focus:bg-white/10 focus:text-white hover:bg-white/10">
                                    24-hour Highlight
                                  </SelectItem>
                                  <SelectItem value="portfolio" className="focus:bg-white/10 focus:text-white hover:bg-white/10">
                                    Portfolio Piece
                                  </SelectItem>
                                  <SelectItem value="service" className="focus:bg-white/10 focus:text-white hover:bg-white/10">
                                    Service Showcase
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        )}

                        {/* Project Selection for Assignments */}
                        {pulseType === 'project' && (
                          <div className="space-y-4">
                            <Tabs 
                              value={activeProjectTab} 
                              onValueChange={setActiveProjectTab}
                              className="w-full"
                            >
                              <TabsList className="bg-[rgba(30,30,30,0.7)] text-white border-white/10">
                                <TabsTrigger 
                                  value="details" 
                                  className="data-[state=active]:bg-[#1DB954] data-[state=active]:text-black"
                                >
                                  Create New
                                </TabsTrigger>
                                <TabsTrigger 
                                  value="select"
                                  className="data-[state=active]:bg-[#1DB954] data-[state=active]:text-black"
                                >
                                  Select Existing
                                </TabsTrigger>
                              </TabsList>
                              
                              <TabsContent value="details" className="mt-4">
                                <ProjectForm 
                                  onSuccess={(project) => {
                                    setSelectedProject(project.id);
                                    toast({
                                      title: "Project Created",
                                      description: "Your project has been created and selected for this pulse.",
                                    });
                                  }}
                                  useDarkMode={true}
                                  className="neo-glass-input"
                                  closeModal={() => {}}
                                />
                              </TabsContent>
                              
                              <TabsContent value="select" className="mt-4">
                                {user ? (
                                  <div className="space-y-2">
                                    <Label htmlFor="project-select" className="text-white">Select a Project</Label>
                                    <ProjectSelect 
                                      userId={user.id} 
                                      value={selectedProject}
                                      onChange={setSelectedProject}
                                      className="neo-glass-input"
                                    />
                                  </div>
                                ) : (
                                  <Alert variant="destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertTitle>Error</AlertTitle>
                                    <AlertDescription>
                                      You must be logged in to select a project
                                    </AlertDescription>
                                  </Alert>
                                )}
                              </TabsContent>
                            </Tabs>
                          </div>
                        )}

                        <div className="pt-4">
                          <Button 
                            type="button"
                            onClick={handleCreatePulse}
                            disabled={createPulseMutation.isPending}
                            className="action-button primary border-0"
                          >
                            {createPulseMutation.isPending ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Publishing...
                              </>
                            ) : (
                              'Publish Pulse'
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
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
  const { data: projects, isLoading, error } = useTanStack.useQuery({
    queryKey: [`/api/users/${userId}/projects`],
    enabled: !!userId,
  });
  
  if (isLoading) return <div className="text-sm text-gray-400">Loading projects...</div>;
  if (error) return <div className="text-sm text-red-500">Error loading projects</div>;
  if (!projects || !Array.isArray(projects) || projects.length === 0) {
    return <div className="text-sm text-gray-400">No projects found. Please create a project first.</div>;
  }
  
  return (
    <Select
      value={value?.toString() || ""}
      onValueChange={(value) => onChange(value ? parseInt(value) : null)}
    >
      <SelectTrigger className={className}>
        <SelectValue placeholder="Select a project" />
      </SelectTrigger>
      <SelectContent className="bg-[rgba(18,18,18,0.95)] text-white border-white/20">
        {projects.map((project: Project) => (
          <SelectItem 
            key={project.id} 
            value={project.id.toString()}
            className="focus:bg-white/10 focus:text-white hover:bg-white/10"
          >
            {project.title}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

// Import additional dependencies at the top
import * as useTanStack from "@tanstack/react-query";