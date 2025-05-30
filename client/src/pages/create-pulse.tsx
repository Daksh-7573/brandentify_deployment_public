import { useState, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "@tanstack/react-query";
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
import { INDUSTRIES, INDUSTRY_DOMAINS } from "@shared/constants";
import { Link } from "wouter";
import "../styles/neo-glass-spotify.css";

export default function CreatePulsePage() {
  const { user } = useAuth();
  const { toast } = useToast();
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
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Create a mutation for submitting the pulse
  const createPulseMutation = useMutation({
    mutationFn: async (pulseData: InsertPulse) => {
      const res = await apiRequest('POST', '/api/pulses', pulseData);
      return res;
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create a pulse",
        variant: "destructive",
      });
      return;
    }
    
    // Validate form data
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
      
      // Set the domain (not category - category is for pulse type classification)
      pulseData.domain = pulseCategory;
      
      // Calculate expires date for highlight category (24 hours from now)
      if (pulseCategory === 'highlight') {
        const expirationDate = new Date();
        expirationDate.setHours(expirationDate.getHours() + 24);
        pulseData.expiresAt = expirationDate;
      }
      
      // Use the mediaUrls that have been updated from server upload
      pulseData.mediaUrls = mediaUrls;
      
      // For backward compatibility with the viewer component
      pulseData.mediaLocalStorageKeys = mediaUrls;
      
      console.log(`Submitting pulse with ${mediaType} URLs:`, pulseData);
    } 
    else if (pulseType === 'project') {
      if (!selectedProject) {
        toast({
          title: "Error",
          description: "Please select an assignment to share",
          variant: "destructive",
        });
        return;
      }
      
      pulseData.projectId = selectedProject;
    }
    
    // Submit the pulse
    console.log("Submitting pulse:", pulseData);
    createPulseMutation.mutate(pulseData);
  };

  const addPollOption = () => {
    if (pollOptions.length < 6) {
      setPollOptions([...pollOptions, ""]);
    }
  };

  const updatePollOption = (index: number, value: string) => {
    const newOptions = [...pollOptions];
    newOptions[index] = value;
    setPollOptions(newOptions);
  };

  const removePollOption = (index: number) => {
    if (pollOptions.length > 2) {
      const newOptions = [...pollOptions];
      newOptions.splice(index, 1);
      setPollOptions(newOptions);
    }
  };
  
  // Media file handlers
  const handleVideoClick = () => {
    if (videoInputRef.current) {
      videoInputRef.current.click();
    }
  };
  
  const handleImageClick = () => {
    if (imageInputRef.current) {
      imageInputRef.current.click();
    }
  };
  
  // Function to validate video duration
  const validateVideoLength = (file: File, maxSeconds: number): Promise<boolean> => {
    return new Promise((resolve) => {
      // Create a temporary video element to check duration
      const video = document.createElement('video');
      video.preload = 'metadata';
      
      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        const duration = video.duration;
        
        if (duration > maxSeconds) {
          toast({
            title: "Video too long",
            description: `Video must be shorter than ${maxSeconds} seconds. Current length: ${Math.round(duration)} seconds.`,
            variant: "destructive",
          });
          resolve(false);
        } else {
          resolve(true);
        }
      };
      
      video.onerror = () => {
        // If we can't determine length, we'll allow it and server can validate
        resolve(true);
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
      
      // Append each file to the form data
      validFiles.forEach((file, index) => {
        formData.append("media", file);
      });
      
      // Show uploading toast
      toast({
        title: "Uploading",
        description: `Uploading ${validFiles.length} image(s) to the server...`,
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
          description: `${validFiles.length} image(s) uploaded successfully`,
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
                    <Link href="/industry-pulse">
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
                      className={`cursor-pointer transition-all hover:shadow-md ${pulseType === 'poll' ? 'ring-2 ring-primary' : ''} bg-[rgba(18,18,18,0.95)] text-white border-white/20 mb-2`}
                      onClick={() => setPulseType('poll')}
                    >
                      <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                        <BarChart className={`h-10 w-10 mb-2 ${pulseType === 'poll' ? 'text-green-500' : 'text-white'}`} />
                        <h3 className="font-medium">Trends</h3>
                        <p className="text-xs text-gray-300 mt-1">Ask questions with options</p>
                      </CardContent>
                    </Card>

                    <Card 
                      className={`cursor-pointer transition-all hover:shadow-md ${pulseType === 'media-pulse' ? 'ring-2 ring-primary' : ''} bg-[rgba(18,18,18,0.95)] text-white border-white/20 mb-2`}
                      onClick={() => setPulseType('media-pulse')}
                    >
                      <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                        {mediaType === 'video' ? (
                          <Video className={`h-10 w-10 mb-2 ${pulseType === 'media-pulse' ? 'text-green-500' : 'text-white'}`} />
                        ) : (
                          <Image className={`h-10 w-10 mb-2 ${pulseType === 'media-pulse' ? 'text-green-500' : 'text-white'}`} />
                        )}
                        <h3 className="font-medium">Insights</h3>
                        <p className="text-xs text-gray-300 mt-1">Images or video for your branding</p>
                      </CardContent>
                    </Card>

                    <Card 
                      className={`cursor-pointer transition-all hover:shadow-md ${pulseType === 'project' ? 'ring-2 ring-primary' : ''} bg-[rgba(18,18,18,0.95)] text-white border-white/20`}
                      onClick={() => setPulseType('project')} // Note: value remains 'project' for backward compatibility
                    >
                      <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                        <FileCode className={`h-10 w-10 mb-2 ${pulseType === 'project' ? 'text-green-500' : 'text-white'}`} />
                        <h3 className="font-medium">Assignments</h3>
                        <p className="text-xs text-gray-300 mt-1">Showcase your work and expertise with a detailed assignment.</p>
                      </CardContent>
                    </Card>
                  </div>

                  <Card className="mb-6 bg-[rgba(18,18,18,0.95)] text-white border-white/20">
                    <CardContent className="p-6">
                {pulseType === 'poll' && (
                  <Alert className="mb-6 bg-purple-50 border-purple-200">
                    <BarChart className="h-4 w-4 text-purple-500" />
                    <AlertTitle className="text-purple-700">Trends</AlertTitle>
                    <AlertDescription className="text-purple-600">
                      Ask your network questions with custom options. Results update live as people vote.
                    </AlertDescription>
                  </Alert>
                )}

                {pulseType === 'media-pulse' && (
                  <Alert className="mb-6 bg-blue-50 border-blue-200">
                    {mediaType === 'video' ? (
                      <Video className="h-4 w-4 text-blue-500" />
                    ) : (
                      <Image className="h-4 w-4 text-blue-500" />
                    )}
                    <AlertTitle className="text-blue-700">Insights</AlertTitle>
                    <AlertDescription className="text-blue-600">
                      Share branding visuals through images (max 5) or a video (max 80 seconds).
                    </AlertDescription>
                  </Alert>
                )}
                
                {pulseType === 'project' && (
                  <Alert className="mb-6 bg-green-50 border-green-200">
                    <FileCode className="h-4 w-4 text-green-500" />
                    <AlertTitle className="text-green-700">Assignments</AlertTitle>
                    <AlertDescription className="text-green-600">
                      Showcase your work and expertise with a detailed assignment. Add details, images and links to demonstrate your professional skills.
                    </AlertDescription>
                  </Alert>
                )}

                {pulseType === 'poll' && (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="poll-question" className="flex items-center gap-2">
                        <BarChart className="h-4 w-4 text-purple-500" />
                        <span>Title</span>
                      </Label>
                      <Input
                        id="poll-question"
                        placeholder="What's your question for your network?"
                        value={pulseTitle}
                        onChange={(e) => setPulseTitle(e.target.value)}
                        required
                        className="border-purple-100 focus-visible:ring-purple-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="poll-description" className="flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-purple-500" />
                          <span>Description (optional)</span>
                        </Label>
                      </div>
                      <Textarea
                        id="poll-description"
                        placeholder="Add context to your question..."
                        value={pulseContent}
                        onChange={(e) => setPulseContent(e.target.value)}
                        className="resize-none border-purple-100 focus-visible:ring-purple-500"
                        rows={3}
                      />
                    </div>
                    {/* Industry Selection */}
                    <div className="space-y-2 mb-6">
                      <Label htmlFor="poll-industry" className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-purple-500" />
                        <span>Industry</span>
                      </Label>
                      <div className="relative">
                        <select
                          id="poll-industry"
                          value={pulseIndustry}
                          onChange={(e) => {
                            setPulseIndustry(e.target.value);
                            // Reset category when industry changes
                            if (e.target.value !== pulseIndustry) {
                              setPulseCategory("");
                            }
                          }}
                          className="w-full h-10 px-3 pr-10 rounded-md border border-purple-100 appearance-none cursor-pointer focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 focus:outline-none text-sm"
                        >
                          <option value="">Select your industry</option>
                          {INDUSTRIES.map((ind) => (
                            <option key={ind} value={ind}>
                              {ind}
                            </option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <svg className="h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Select your industry to help others find your trends
                      </p>
                    </div>

                    {/* Domain/Specialty - Dynamic based on selected industry */}
                    {pulseIndustry && INDUSTRY_DOMAINS[pulseIndustry] && (
                      <div className="space-y-2 mb-6">
                        <Label htmlFor="poll-domain" className="flex items-center gap-2">
                          <Award className="h-4 w-4 text-purple-500" />
                          <span>Domain Specialty</span>
                        </Label>
                        <div className="relative">
                          <select
                            id="poll-domain"
                            value={pulseCategory}
                            onChange={(e) => setPulseCategory(e.target.value)}
                            className="w-full h-10 px-3 pr-10 rounded-md border border-purple-100 appearance-none cursor-pointer focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 focus:outline-none text-sm"
                          >
                            <option value="">Select your domain specialty</option>
                            {INDUSTRY_DOMAINS[pulseIndustry].map((dom) => (
                              <option key={dom} value={dom}>
                                {dom}
                              </option>
                            ))}
                          </select>
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <svg className="h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Choose your area of expertise within this industry
                        </p>
                      </div>
                    )}

                    <div className="space-y-4">
                      <Label className="flex items-center gap-2">
                        <BarChart className="h-4 w-4 text-purple-500" />
                        <span>Poll Options</span>
                      </Label>
                      {pollOptions.map((option, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Input
                            placeholder={`Option ${index + 1}`}
                            value={option}
                            onChange={(e) => updatePollOption(index, e.target.value)}
                            className="border-purple-100 focus-visible:ring-purple-500"
                            required={index < 2} // First two options are required
                          />
                          {index >= 2 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removePollOption(index)}
                              className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                      {pollOptions.length < 6 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={addPollOption}
                          className="mt-2 border-purple-200 text-purple-700 hover:bg-purple-50"
                        >
                          Add Option
                        </Button>
                      )}
                    </div>
                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        className="bg-purple-600 hover:bg-purple-700"
                        disabled={createPulseMutation.isPending}
                      >
                        {createPulseMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating Trends...
                          </>
                        ) : (
                          "Create Trends"
                        )}
                      </Button>
                    </div>
                  </form>
                )}

                {pulseType === 'media-pulse' && (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      {/* Media Type Selection */}
                      <div className="space-y-2">
                        <Label htmlFor="media-type" className="flex items-center gap-2">
                          {mediaType === 'video' ? (
                            <Video className="h-4 w-4 text-blue-500" />
                          ) : (
                            <Image className="h-4 w-4 text-blue-500" />
                          )}
                          <span>Media Type</span>
                        </Label>
                        <div className="flex flex-wrap gap-4">
                          <button
                            type="button"
                            onClick={() => setMediaType('image')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-md ${
                              mediaType === 'image'
                                ? 'bg-blue-100 text-blue-700 font-medium'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            <Image className="h-4 w-4" />
                            <span>Images</span>
                            <span className="text-xs ml-1">(max 5)</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setMediaType('video')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-md ${
                              mediaType === 'video'
                                ? 'bg-blue-100 text-blue-700 font-medium'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            <Video className="h-4 w-4" />
                            <span>Video</span>
                            <span className="text-xs ml-1">(max 80 sec)</span>
                          </button>
                        </div>
                      </div>
                      
                      {/* Pulse Category Selection */}
                      <div className="space-y-2">
                        <Label htmlFor="pulse-category" className="flex items-center gap-2">
                          {pulseCategory === 'certification' && <BadgeCheck className="h-4 w-4 text-blue-500" />}
                          {pulseCategory === 'launch' && <Rocket className="h-4 w-4 text-blue-500" />}
                          {pulseCategory === 'award' && <Award className="h-4 w-4 text-blue-500" />}
                          {pulseCategory === 'project' && <Wrench className="h-4 w-4 text-blue-500" />}
                          {pulseCategory === 'announcement' && <Bell className="h-4 w-4 text-blue-500" />}
                          {pulseCategory === 'highlight' && <Zap className="h-4 w-4 text-blue-500" />}
                          <span>Pulse Category</span>
                        </Label>
                        <Select
                          value={pulseCategory}
                          onValueChange={(value) => setPulseCategory(value)}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="certification">
                              <div className="flex items-center gap-2">
                                <BadgeCheck className="h-4 w-4" />
                                <span>Certification</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="launch">
                              <div className="flex items-center gap-2">
                                <Rocket className="h-4 w-4" />
                                <span>Launch</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="award">
                              <div className="flex items-center gap-2">
                                <Award className="h-4 w-4" />
                                <span>Award</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="project">
                              <div className="flex items-center gap-2">
                                <Wrench className="h-4 w-4" />
                                <span>Project</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="announcement">
                              <div className="flex items-center gap-2">
                                <Bell className="h-4 w-4" />
                                <span>Announcement</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="highlight">
                              <div className="flex items-center gap-2">
                                <Zap className="h-4 w-4" />
                                <span>Highlight (expires in 24h)</span>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    {/* Industry Selection */}
                    <div className="space-y-2 mb-6">
                      <Label htmlFor="pulse-industry" className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-blue-500" />
                        <span>Industry</span>
                      </Label>
                      <div className="relative">
                        <select
                          id="pulse-industry"
                          value={pulseIndustry}
                          onChange={(e) => {
                            setPulseIndustry(e.target.value);
                            // Reset category when industry changes
                            if (e.target.value !== pulseIndustry) {
                              setPulseCategory("");
                            }
                          }}
                          className="w-full h-10 px-3 pr-10 rounded-md border appearance-none cursor-pointer focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 focus:outline-none text-sm"
                        >
                          <option value="">Select your industry</option>
                          {INDUSTRIES.map((ind) => (
                            <option key={ind} value={ind}>
                              {ind}
                            </option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <svg className="h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Select your industry to help others find your content
                      </p>
                    </div>

                    {/* Domain/Specialty - Dynamic based on selected industry */}
                    {pulseIndustry && INDUSTRY_DOMAINS[pulseIndustry] && (
                      <div className="space-y-2 mb-6">
                        <Label htmlFor="pulse-domain" className="flex items-center gap-2">
                          <Award className="h-4 w-4 text-blue-500" />
                          <span>Domain Specialty</span>
                        </Label>
                        <div className="relative">
                          <select
                            id="pulse-domain"
                            value={pulseCategory}
                            onChange={(e) => setPulseCategory(e.target.value)}
                            className="w-full h-10 px-3 pr-10 rounded-md border appearance-none cursor-pointer focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 focus:outline-none text-sm"
                          >
                            <option value="">Select your domain specialty</option>
                            {INDUSTRY_DOMAINS[pulseIndustry].map((dom) => (
                              <option key={dom} value={dom}>
                                {dom}
                              </option>
                            ))}
                          </select>
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <svg className="h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Choose your area of expertise within this industry
                        </p>
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label htmlFor="media-title" className="flex items-center gap-2">
                        {mediaType === 'video' ? (
                          <Video className="h-4 w-4 text-blue-500" />
                        ) : (
                          <Image className="h-4 w-4 text-blue-500" />
                        )}
                        <span>Title</span>
                      </Label>
                      <Input
                        id="media-title"
                        placeholder={`Add a title for your ${mediaType === 'video' ? 'video' : 'images'}`}
                        value={pulseTitle}
                        onChange={(e) => setPulseTitle(e.target.value)}
                        required
                        className="border-blue-100 focus-visible:ring-blue-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="media-description" className="flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-blue-500" />
                          <span>Description (optional)</span>
                        </Label>
                      </div>
                      <Textarea
                        id="media-description"
                        placeholder={`Add context to your ${mediaType === 'video' ? 'video' : 'images'}...`}
                        value={pulseContent}
                        onChange={(e) => setPulseContent(e.target.value)}
                        className="resize-none border-blue-100 focus-visible:ring-blue-500"
                        rows={3}
                      />
                    </div>
                    <div className="space-y-4">
                      <Label className="flex items-center gap-2">
                        {mediaType === 'video' ? (
                          <Video className="h-4 w-4 text-blue-500" />
                        ) : (
                          <Image className="h-4 w-4 text-blue-500" />
                        )}
                        <span>Upload {mediaType === 'video' ? 'Video' : 'Images'}</span>
                      </Label>
                      
                      {mediaType === 'video' ? (
                        <div className="space-y-4">
                          <input
                            type="file"
                            accept="video/*"
                            className="hidden"
                            ref={videoInputRef}
                            onChange={handleVideoUpload}
                          />
                          
                          {mediaUrls.length === 0 ? (
                            <div
                              className="border-2 border-dashed border-blue-200 rounded-lg p-8 text-center cursor-pointer hover:bg-blue-50 transition-colors"
                              onClick={handleVideoClick}
                            >
                              <Video className="h-10 w-10 text-blue-400 mx-auto mb-2" />
                              <p className="text-blue-600 font-medium">Upload Video</p>
                              <p className="text-xs text-gray-500 mt-1">Maximum 80 seconds, MP4 format recommended</p>
                            </div>
                          ) : (
                            <div className="border rounded-lg overflow-hidden">
                              <div className="relative aspect-video">
                                <video
                                  src={mediaUrls[0]}
                                  controls
                                  className="w-full h-full object-cover"
                                />
                                <button
                                  type="button"
                                  className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full"
                                  onClick={() => removeMedia(0)}
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            ref={imageInputRef}
                            onChange={handleImageUpload}
                            multiple
                          />
                          
                          <div 
                            className={`border-2 border-dashed border-blue-200 rounded-lg p-8 text-center cursor-pointer hover:bg-blue-50 transition-colors ${mediaUrls.length > 0 ? 'p-4' : 'p-8'}`}
                            onClick={handleImageClick}
                          >
                            {mediaUrls.length === 0 ? (
                              <>
                                <Image className="h-10 w-10 text-blue-400 mx-auto mb-2" />
                                <p className="text-blue-600 font-medium">Upload Images</p>
                                <p className="text-xs text-gray-500 mt-1">Up to 5 images, 20MB max each</p>
                              </>
                            ) : (
                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                {mediaUrls.map((url, index) => (
                                  <div key={index} className="relative aspect-video rounded-lg overflow-hidden">
                                    <img
                                      src={url}
                                      alt={`Uploaded image ${index + 1}`}
                                      className="w-full h-full object-cover"
                                    />
                                    <button
                                      type="button"
                                      className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        removeMedia(index);
                                      }}
                                    >
                                      <X className="h-4 w-4" />
                                    </button>
                                  </div>
                                ))}
                                {mediaUrls.length < 5 && (
                                  <div className="aspect-video flex items-center justify-center border-2 border-dashed border-blue-200 rounded-lg">
                                    <div className="text-center">
                                      <Image className="h-6 w-6 text-blue-400 mx-auto mb-1" />
                                      <p className="text-sm text-blue-600">Add More</p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700"
                        disabled={createPulseMutation.isPending}
                      >
                        {createPulseMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating Insights...
                          </>
                        ) : (
                          "Create Insights"
                        )}
                      </Button>
                    </div>
                  </form>
                )}

                {pulseType === 'project' && (
                  <div className="space-y-6" data-pulse-type="assignment">
                    <div className="space-y-2">
                      <h3 className="text-lg font-medium text-green-700">Project Details</h3>
                      <p className="text-sm text-muted-foreground">Add your project details. This will be saved to your profile and published as a pulse.</p>
                    </div>
                    
                    <div className="space-y-4 pt-4">
                      {selectedProject ? (
                        <div className="space-y-6">
                          <div className="p-4 bg-green-50 border border-green-100 rounded-md">
                            <h3 className="font-medium text-green-800">Assignment ready to publish!</h3>
                            <p className="text-sm text-green-700 mt-1">
                              Your assignment has been created and is ready to be published as a pulse.
                            </p>
                          </div>
                          
                          <div className="flex justify-end mt-6">
                            <Button 
                              type="button"
                              className="px-6 bg-green-600 hover:bg-green-700 text-white"
                              onClick={() => {
                                if (!user) {
                                  toast({
                                    title: "Error",
                                    description: "You must be logged in to create a pulse",
                                    variant: "destructive",
                                  });
                                  return;
                                }
                                
                                createPulseMutation.mutate({
                                  userId: user.id,
                                  type: "project" as any,
                                  title: pulseTitle,
                                  content: pulseContent,
                                  isPublished: true,
                                  projectId: selectedProject,
                                  industry: pulseIndustry.trim() !== "" ? pulseIndustry : undefined
                                });
                              }}
                            >
                              Publish Assignment
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <ProjectForm 
                          onSuccess={(project) => {
                            if (project && project.id) {
                              setSelectedProject(project.id);
                              
                              // Auto-populate the pulse title, content, and industry
                              setPulseTitle(project.title || "");
                              setPulseContent(project.description || "");
                              setPulseIndustry(project.industry || "");
                              
                              toast({
                                title: "Assignment created",
                                description: "Your assignment has been created successfully and added to your profile. You can now publish it as a pulse.",
                              });
                            }
                          }}
                        />
                      )}
                    </div>

                  </div>
                )}
              </CardContent>
            </Card>

            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">Pulse Best Practices</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <Card className="border-purple-100">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <BarChart className="h-4 w-4 text-purple-500" />
                      <h3 className="font-medium">Focus on Value</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">Share unique insights from your professional experience that others can learn from.</p>
                  </CardContent>
                </Card>
                <Card className="border-blue-100">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Image className="h-4 w-4 text-blue-500" />
                      <h3 className="font-medium">Be Authentic</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">Your unique voice and perspective are what make your content valuable to your network.</p>
                  </CardContent>
                </Card>
                <Card className="border-green-100">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <FileCode className="h-4 w-4 text-green-500" />
                      <h3 className="font-medium">Engage Actively</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">Respond to comments and engage with those who interact with your pulse to build relationships.</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}