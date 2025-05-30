import { useState, useRef } from "react";
import { useAuth } from "@/context/auth-context";
import { useMutation, useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, BarChart, Video, Image, FileCode, Loader2, X, ChevronLeft, Briefcase, Award } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProjectForm, { Project } from "@/components/shared/project-form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { InsertPulse } from "@shared/schema";
import { IndustryCombobox } from "@/components/ui/industry-combobox";
import { INDUSTRIES, INDUSTRY_DOMAINS } from "@shared/constants";
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
      // Show success toast
      toast({
        title: "Pulse Created",
        description: "Your pulse has been successfully published!",
      });
      
      // Reset form
      setPulseTitle("");
      setPulseContent("");
      setPollOptions(["", ""]);
      setMediaUrls([]);
      setUploadedFiles([]);
      setSelectedProject(null);
      
      // Invalidate pulse cache so user sees their new post
      queryClient.invalidateQueries({ queryKey: ["/api/pulses"] });
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
      category: pulseCategory,
      industry: pulseIndustry || "Technology", // Default to Technology if not specified
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
      // Validate project selection
      if (!selectedProject) {
        toast({
          title: "Project Required",
          description: "Please select or create a project to feature in your pulse.",
          variant: "destructive",
        });
        return;
      }
      
      pulseData.projectId = selectedProject;
    }
    
    // Submit the pulse
    try {
      await createPulseMutation.mutateAsync(pulseData as InsertPulse);
    } catch (error) {
      console.error("Error in mutation:", error);
    }
  };
  
  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    // Check file count limit
    if (files.length + uploadedFiles.length > 5) {
      toast({
        title: "Too Many Files",
        description: "You can only upload up to 5 images.",
        variant: "destructive",
      });
      return;
    }
    
    // Convert FileList to Array for filtering
    const filesArray = Array.from(files);
    
    // Validate file types and sizes
    const validFiles = filesArray.filter(file => {
      // Check file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid File Type",
          description: `"${file.name}" is not an image file.`,
          variant: "destructive",
        });
        return false;
      }
      
      // Check file size (20MB limit)
      if (file.size > 20 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: `"${file.name}" exceeds the 20MB limit.`,
          variant: "destructive",
        });
        return false;
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
    <div className="min-h-screen bg-[url('/bg-dark-room.jpg')] bg-cover bg-center">
      <div className="min-h-screen bg-black/50 backdrop-blur-sm">
        <Header />
        <div className="container mx-auto p-4 pt-16">
          <div className="flex items-center mb-4">
            <Link to="/industry-pulse-new" className="text-white hover:text-white/80 flex items-center">
              <ChevronLeft className="h-5 w-5 mr-1" />
              <span>Back to Industry Pulse</span>
            </Link>
          </div>
          
          <NeoGlassLayout>
            <div className="w-full">
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-white">Create Pulse</h1>
                <p className="text-white/70">Share your thoughts, projects, or expertise with the professional community</p>
              </div>
              
              <NeoGlassSection className="mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card 
                    className={cn(
                      "cursor-pointer transition-all hover:shadow-md bg-[rgba(18,18,18,0.95)] text-white border-white/20",
                      pulseType === 'poll' ? 'ring-2 ring-white/40' : ''
                    )}
                    onClick={() => setPulseType('poll')}
                  >
                    <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                      <BarChart className={cn(
                        "h-10 w-10 mb-2",
                        pulseType === 'poll' ? 'text-white' : 'text-white/70'
                      )} />
                      <h3 className="font-medium">Trends</h3>
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
                    <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                      {mediaType === 'video' ? (
                        <Video className={cn(
                          "h-10 w-10 mb-2",
                          pulseType === 'media-pulse' ? 'text-white' : 'text-white/70'
                        )} />
                      ) : (
                        <Image className={cn(
                          "h-10 w-10 mb-2",
                          pulseType === 'media-pulse' ? 'text-white' : 'text-white/70'
                        )} />
                      )}
                      <h3 className="font-medium">Insights</h3>
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
                    <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                      <FileCode className={cn(
                        "h-10 w-10 mb-2",
                        pulseType === 'project' ? 'text-white' : 'text-white/70'
                      )} />
                      <h3 className="font-medium">Projects</h3>
                      <p className="text-xs text-gray-300 mt-1">Add or select a project</p>
                    </CardContent>
                  </Card>
                </div>
              </NeoGlassSection>
              
              <NeoGlassSection>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-white">Title</Label>
                    <Input 
                      id="title" 
                      placeholder="Enter a title for your pulse" 
                      value={pulseTitle}
                      onChange={(e) => setPulseTitle(e.target.value)}
                      className="neo-glass-input bg-[rgba(18,18,18,0.95)] text-white border-white/20"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="content" className="text-white">Content</Label>
                    <Textarea 
                      id="content" 
                      placeholder="What's on your mind? Share your professional thoughts, insights, or ask a question." 
                      rows={4}
                      value={pulseContent}
                      onChange={(e) => setPulseContent(e.target.value)}
                      className="neo-glass-input bg-[rgba(18,18,18,0.95)] text-white border-white/20"
                    />
                  </div>
                  
                  {/* Industry Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="industry" className="text-white flex items-center gap-2">
                      <Briefcase className="h-4 w-4" />
                      Industry
                    </Label>
                    <div className="relative">
                      <select
                        id="industry"
                        value={pulseIndustry}
                        onChange={(e) => {
                          setPulseIndustry(e.target.value);
                          // Reset category when industry changes
                          if (e.target.value !== pulseIndustry) {
                            setPulseCategory("");
                          }
                        }}
                        className="bg-[rgba(18,18,18,0.95)] backdrop-blur-md text-white border-white/20 shadow-md transition-all hover:border-white/30 w-full h-12 px-3 pr-10 rounded-md border appearance-none cursor-pointer focus:border-white/50 focus:ring-2 focus:ring-white/30 focus:outline-none text-sm leading-relaxed"
                        style={{ lineHeight: '1.5', paddingTop: '0.75rem', paddingBottom: '0.75rem' }}
                      >
                        <option value="">Select your industry</option>
                        {INDUSTRIES.map((ind) => (
                          <option key={ind} value={ind} className="bg-gray-800 text-white">
                            {ind}
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <svg className="h-4 w-4 text-white/70" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  {/* Domain/Specialty - Dynamic based on selected industry */}
                  {pulseIndustry && INDUSTRY_DOMAINS[pulseIndustry] && (
                    <div className="space-y-2">
                      <Label htmlFor="domain" className="text-white flex items-center gap-2">
                        <Award className="h-4 w-4" />
                        Domain Specialty
                      </Label>
                      <div className="relative">
                        <select
                          id="domain"
                          value={pulseCategory}
                          onChange={(e) => setPulseCategory(e.target.value)}
                          className="bg-[rgba(18,18,18,0.95)] backdrop-blur-md text-white border-white/20 shadow-md transition-all hover:border-white/30 w-full h-12 px-3 pr-10 rounded-md border appearance-none cursor-pointer focus:border-white/50 focus:ring-2 focus:ring-white/30 focus:outline-none text-sm leading-relaxed"
                          style={{ lineHeight: '1.5', paddingTop: '0.75rem', paddingBottom: '0.75rem' }}
                        >
                          <option value="">Select your domain specialty</option>
                          {INDUSTRY_DOMAINS[pulseIndustry].map((dom) => (
                            <option key={dom} value={dom} className="bg-gray-800 text-white">
                              {dom}
                            </option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <svg className="h-4 w-4 text-white/70" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  )}

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
                            className="neo-glass-input bg-[rgba(18,18,18,0.95)] text-white border-white/20"
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
                            className={mediaType === 'image' ? 'bg-white/20 text-white hover:bg-white/30' : 'bg-[rgba(18,18,18,0.95)] text-white border-white/20 hover:bg-white/10'}
                          >
                            <Image className="mr-2 h-4 w-4" />
                            Images
                          </Button>
                          <Button
                            type="button"
                            variant={mediaType === 'video' ? 'default' : 'outline'}
                            onClick={() => setMediaType('video')}
                            className={mediaType === 'video' ? 'bg-white/20 text-white hover:bg-white/30' : 'bg-[rgba(18,18,18,0.95)] text-white border-white/20 hover:bg-white/10'}
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
                              className="neo-glass-input bg-[rgba(18,18,18,0.95)] text-white border-white/20 file:bg-white/20 file:text-white file:hover:bg-white/30"
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
                                    className="w-full aspect-video object-cover rounded-md border border-white/20" 
                                  />
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    className="absolute top-2 right-2 h-6 w-6 bg-black/60 text-white border-white/20 opacity-0 group-hover:opacity-100 transition-opacity"
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
                              onChange={(e) => console.log(e.target.files)}
                              className="neo-glass-input bg-[rgba(18,18,18,0.95)] text-white border-white/20 file:bg-white/20 file:text-white file:hover:bg-white/30"
                            />
                            <p className="text-xs text-gray-400">Select a video file (max 100MB, 2.5 min)</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Project Selection */}
                  {pulseType === 'project' && (
                    <div className="space-y-4">
                      <Tabs defaultValue="details" onValueChange={setActiveProjectTab} value={activeProjectTab}>
                        <TabsList className="bg-[rgba(18,18,18,0.8)] border-white/10">
                          <TabsTrigger 
                            value="details" 
                            onClick={() => setActiveProjectTab('details')}
                            className={cn(
                              activeProjectTab === 'details' ? 'bg-white/20 text-white' : 'text-white/70 data-[state=active]:text-white'
                            )}
                          >
                            Create New
                          </TabsTrigger>
                          <TabsTrigger 
                            value="select" 
                            onClick={() => setActiveProjectTab('select')}
                            className={cn(
                              activeProjectTab === 'select' ? 'bg-white/20 text-white' : 'text-white/70 data-[state=active]:text-white'
                            )}
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
                                className="neo-glass-input bg-[rgba(18,18,18,0.95)] text-white border-white/20"
                              />
                            </div>
                          ) : (
                            <Alert variant="destructive">
                              <AlertCircle className="h-4 w-4" />
                              <AlertTitle>Authentication Required</AlertTitle>
                              <AlertDescription>
                                You must be logged in to select projects.
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
                      className="px-5 py-2 rounded-md bg-primary text-white hover:bg-opacity-90 shadow-sm font-medium transition-all flex items-center justify-center w-full md:w-auto"
                    >
                      {createPulseMutation.isPending ? (
                        <>
                          <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                          <span>Publishing...</span>
                        </>
                      ) : (
                        <span>Publish Pulse</span>
                      )}
                    </Button>
                  </div>
                </div>
              </NeoGlassSection>
            </div>
          </NeoGlassLayout>
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