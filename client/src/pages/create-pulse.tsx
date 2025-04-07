import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AlertCircle, BarChart, Video, Image, FileCode } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProjectForm, { Project } from "@/components/shared/project-form";
import { useToast } from "@/hooks/use-toast";

export default function CreatePulsePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [pulseTitle, setPulseTitle] = useState("");
  const [pulseContent, setPulseContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pulseType, setPulseType] = useState("poll");
  const [mediaType, setMediaType] = useState("image");
  const [pollOptions, setPollOptions] = useState(["", ""]);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [activeProjectTab, setActiveProjectTab] = useState('details');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Log the submission based on type
    console.log("Submitting pulse:", { 
      type: pulseType,
      mediaType: pulseType === 'media-pulse' ? mediaType : undefined,
      title: pulseTitle,
      content: pulseContent
    });
    
    // Simulate submission delay
    setTimeout(() => {
      setIsSubmitting(false);
      alert("Pulse created successfully! This is a placeholder. Actual implementation will be added later.");
      setPulseTitle("");
      setPulseContent("");
    }, 1500);
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

  return (
    <div className="flex h-screen flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden pt-16"> {/* Added padding-top for fixed header */}
        <Sidebar activePage="create-pulse" />
        <div className="flex-1 overflow-auto">
          <div className="container py-8 px-6 max-w-5xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold tracking-tight">Create Pulse</h1>
              <p className="text-muted-foreground mt-1">
                Share your thoughts, projects, or expertise with the professional community
              </p>
            </div>

            {/* Pulse Type Selection */}
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <Card 
                className={`cursor-pointer transition-all hover:shadow-md ${pulseType === 'poll' ? 'ring-2 ring-primary' : ''}`}
                onClick={() => setPulseType('poll')}
              >
                <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                  <BarChart className={`h-10 w-10 mb-2 ${pulseType === 'poll' ? 'text-primary' : 'text-gray-500'}`} />
                  <h3 className="font-medium">Poll</h3>
                  <p className="text-xs text-gray-500 mt-1">Ask questions with options</p>
                </CardContent>
              </Card>

              <Card 
                className={`cursor-pointer transition-all hover:shadow-md ${pulseType === 'media-pulse' ? 'ring-2 ring-primary' : ''}`}
                onClick={() => setPulseType('media-pulse')}
              >
                <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                  {mediaType === 'video' ? (
                    <Video className={`h-10 w-10 mb-2 ${pulseType === 'media-pulse' ? 'text-primary' : 'text-gray-500'}`} />
                  ) : (
                    <Image className={`h-10 w-10 mb-2 ${pulseType === 'media-pulse' ? 'text-primary' : 'text-gray-500'}`} />
                  )}
                  <h3 className="font-medium">Media Pulse</h3>
                  <p className="text-xs text-gray-500 mt-1">Images or video for your branding</p>
                </CardContent>
              </Card>

              <Card 
                className={`cursor-pointer transition-all hover:shadow-md ${pulseType === 'project' ? 'ring-2 ring-primary' : ''}`}
                onClick={() => setPulseType('project')}
              >
                <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                  <FileCode className={`h-10 w-10 mb-2 ${pulseType === 'project' ? 'text-primary' : 'text-gray-500'}`} />
                  <h3 className="font-medium">Project</h3>
                  <p className="text-xs text-gray-500 mt-1">Showcase your work and skills</p>
                </CardContent>
              </Card>
            </div>

            <Card className="mb-6">
              <CardContent className="p-6">
                {pulseType === 'poll' && (
                  <Alert className="mb-6 bg-purple-50 border-purple-200">
                    <BarChart className="h-4 w-4 text-purple-500" />
                    <AlertTitle className="text-purple-700">Poll Pulse</AlertTitle>
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
                    <AlertTitle className="text-blue-700">Media Pulse</AlertTitle>
                    <AlertDescription className="text-blue-600">
                      Share branding visuals through images (max 5) or a video (max 120 seconds).
                    </AlertDescription>
                  </Alert>
                )}
                
                {pulseType === 'project' && (
                  <Alert className="mb-6 bg-green-50 border-green-200">
                    <FileCode className="h-4 w-4 text-green-500" />
                    <AlertTitle className="text-green-700">Project</AlertTitle>
                    <AlertDescription className="text-green-600">
                      Showcase your work and achievements with projects. Add images, videos, and details about your contribution.
                    </AlertDescription>
                  </Alert>
                )}

                {pulseType === 'poll' && (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="poll-question" className="flex items-center gap-2">
                        <BarChart className="h-4 w-4 text-purple-500" />
                        <span>Poll Question</span>
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
                        <Label className="flex items-center gap-2">
                          <BarChart className="h-4 w-4 text-purple-500" />
                          <span>Poll Options</span>
                        </Label>
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm"
                          onClick={addPollOption}
                          disabled={pollOptions.length >= 6}
                          className="border-purple-200 text-purple-700 hover:bg-purple-50"
                        >
                          + Add Option
                        </Button>
                      </div>
                      <div className="space-y-2 bg-purple-50/30 p-4 border border-purple-100 rounded-md">
                        {pollOptions.map((option, index) => (
                          <div key={index} className="flex gap-2">
                            <Input
                              placeholder={`Option ${index + 1}`}
                              value={option}
                              onChange={(e) => updatePollOption(index, e.target.value)}
                              required
                              className="border-purple-100 focus-visible:ring-purple-500"
                            />
                            {pollOptions.length > 2 && (
                              <Button 
                                type="button" 
                                variant="ghost" 
                                size="icon"
                                onClick={() => removePollOption(index)}
                                className="text-purple-400 hover:text-purple-700 hover:bg-purple-50"
                              >
                                ✕
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <BarChart className="h-4 w-4 text-purple-500" />
                        <span>Poll Settings</span>
                      </Label>
                      <div className="flex flex-wrap gap-4 bg-purple-50/30 p-4 border border-purple-100 rounded-md">
                        <div className="flex items-center gap-2">
                          <input type="checkbox" id="allow-multiple" className="text-purple-500 focus:ring-purple-500" />
                          <Label htmlFor="allow-multiple" className="text-sm font-normal">Allow multiple selections</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <input type="checkbox" id="hide-results" className="text-purple-500 focus:ring-purple-500" />
                          <Label htmlFor="hide-results" className="text-sm font-normal">Hide results until voting</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <input type="checkbox" id="allow-comments" defaultChecked className="text-purple-500 focus:ring-purple-500" />
                          <Label htmlFor="allow-comments" className="text-sm font-normal">Allow comments</Label>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="poll-content" className="flex items-center gap-2">
                        <BarChart className="h-4 w-4 text-purple-500" />
                        <span>Additional Context (Optional)</span>
                      </Label>
                      <Textarea
                        id="poll-content"
                        placeholder="Provide additional context for your poll question..."
                        className="min-h-[80px] border-purple-100 focus-visible:ring-purple-500"
                        value={pulseContent}
                        onChange={(e) => setPulseContent(e.target.value)}
                      />
                    </div>
                    <div className="flex justify-end">
                      <Button className="px-6 bg-purple-600 hover:bg-purple-700">
                        Create Poll
                      </Button>
                    </div>
                  </form>
                )}

                {pulseType === 'media-pulse' && (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="mb-6">
                      <Label className="text-base font-medium mb-3 block flex items-center gap-2">
                        <span className="text-blue-500">
                          {mediaType === 'video' ? <Video className="h-4 w-4" /> : <Image className="h-4 w-4" />}
                        </span>
                        Media Type
                      </Label>
                      <RadioGroup 
                        value={mediaType} 
                        onValueChange={setMediaType}
                        className="flex flex-col sm:flex-row gap-4"
                      >
                        <div className="flex items-start space-x-2 p-3 rounded-md hover:bg-blue-50/30 transition-colors">
                          <RadioGroupItem value="image" id="media-image" className="text-blue-500" />
                          <div className="grid gap-1.5">
                            <Label htmlFor="media-image" className="font-medium flex items-center gap-2">
                              <Image className="h-4 w-4 text-blue-500" />
                              Images (Max 5)
                            </Label>
                            <p className="text-sm text-muted-foreground">
                              Upload up to 5 images for your personal branding
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-2 p-3 rounded-md hover:bg-blue-50/30 transition-colors">
                          <RadioGroupItem value="video" id="media-video" className="text-blue-500" />
                          <div className="grid gap-1.5">
                            <Label htmlFor="media-video" className="font-medium flex items-center gap-2">
                              <Video className="h-4 w-4 text-blue-500" />
                              Video (Max 120 sec)
                            </Label>
                            <p className="text-sm text-muted-foreground">
                              Upload a single video for your personal branding
                            </p>
                          </div>
                        </div>
                      </RadioGroup>
                    </div>

                    {mediaType === 'video' ? (
                      <>
                        <div className="border-2 border-dashed border-blue-200 rounded-lg p-8 flex flex-col items-center justify-center text-center bg-blue-50/30">
                          <Video className="h-12 w-12 text-blue-500 mb-4" />
                          <h3 className="font-medium text-lg mb-2">Upload Video</h3>
                          <p className="text-sm text-blue-700/70 mb-4">
                            Drag and drop a video file here, or click to browse.<br />
                            Maximum length: 120 seconds | Supported formats: MP4, MOV, WebM
                          </p>
                          <Button variant="outline" className="mb-4 border-blue-200 text-blue-700 hover:bg-blue-100">
                            Select File
                          </Button>
                          <input type="file" className="hidden" accept="video/*" />
                          <p className="text-xs text-blue-500/70">Max file size: 100 MB</p>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="media-title" className="flex items-center gap-2">
                            <Video className="h-4 w-4 text-blue-500" />
                            <span>Video Title</span>
                          </Label>
                          <Input
                            id="media-title"
                            placeholder="Add a descriptive title for your video"
                            required
                            value={pulseTitle}
                            onChange={(e) => setPulseTitle(e.target.value)}
                            className="border-blue-100 focus-visible:ring-blue-500"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="media-description" className="flex items-center gap-2">
                            <Video className="h-4 w-4 text-blue-500" />
                            <span>Video Description</span>
                          </Label>
                          <Textarea
                            id="media-description"
                            placeholder="Add context or details about your video..."
                            className="min-h-[100px] border-blue-100 focus-visible:ring-blue-500"
                            value={pulseContent}
                            onChange={(e) => setPulseContent(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2 bg-blue-50/30 p-4 border border-blue-100 rounded-md">
                          <Label className="flex items-center gap-2 mb-2">
                            <Video className="h-4 w-4 text-blue-500" />
                            <span>Video Settings</span>
                          </Label>
                          <div className="flex items-center space-x-2">
                            <input type="checkbox" id="auto-captions" defaultChecked className="text-blue-500 focus:ring-blue-500" />
                            <Label htmlFor="auto-captions" className="text-sm font-normal">
                              Use AI to automatically generate captions
                            </Label>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="border-2 border-dashed border-blue-200 rounded-lg p-8 flex flex-col items-center justify-center text-center bg-blue-50/30">
                          <Image className="h-12 w-12 text-blue-500 mb-4" />
                          <h3 className="font-medium text-lg mb-2">Upload Images</h3>
                          <p className="text-sm text-blue-700/70 mb-4">
                            Drag and drop up to 5 images here, or click to browse.<br />
                            Supported formats: JPG, PNG, WebP, GIF
                          </p>
                          <Button variant="outline" className="mb-4 border-blue-200 text-blue-700 hover:bg-blue-100">
                            Select Files
                          </Button>
                          <input type="file" className="hidden" accept="image/*" multiple />
                          <p className="text-xs text-blue-500/70">Max file size: 20 MB per image</p>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="image-title" className="flex items-center gap-2">
                            <Image className="h-4 w-4 text-blue-500" />
                            <span>Gallery Title</span>
                          </Label>
                          <Input
                            id="image-title"
                            placeholder="Add a title for your images"
                            required
                            value={pulseTitle}
                            onChange={(e) => setPulseTitle(e.target.value)}
                            className="border-blue-100 focus-visible:ring-blue-500"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="image-description" className="flex items-center gap-2">
                            <Image className="h-4 w-4 text-blue-500" />
                            <span>Gallery Description</span>
                          </Label>
                          <Textarea
                            id="image-description"
                            placeholder="Add context or details about your images..."
                            className="min-h-[100px] border-blue-100 focus-visible:ring-blue-500"
                            value={pulseContent}
                            onChange={(e) => setPulseContent(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2 bg-blue-50/30 p-4 border border-blue-100 rounded-md">
                          <Label className="flex items-center gap-2 mb-2">
                            <Image className="h-4 w-4 text-blue-500" />
                            <span>Image Settings</span>
                          </Label>
                          <div className="flex items-center space-x-2">
                            <input type="checkbox" id="ai-tags" defaultChecked className="text-blue-500 focus:ring-blue-500" />
                            <Label htmlFor="ai-tags" className="text-sm font-normal">
                              Generate suggested hashtags & keywords from my images
                            </Label>
                          </div>
                        </div>
                      </>
                    )}
                    
                    <div className="flex justify-end">
                      <Button className="px-6 bg-blue-600 hover:bg-blue-700">
                        Upload & Publish Media
                      </Button>
                    </div>
                  </form>
                )}

                {pulseType === 'project' && (
                  <div className="space-y-6">
                    <div className="border-2 border-dashed border-green-200 rounded-lg p-8 flex flex-col items-center justify-center text-center bg-green-50/30">
                      <FileCode className="h-12 w-12 text-green-500 mb-4" />
                      <h3 className="font-medium text-lg mb-2">Create Project Pulse</h3>
                      <p className="text-sm text-green-700/70 mb-4">
                        Showcase your work and expertise with a detailed project.<br />
                        Add details, images and links to demonstrate your professional skills.
                      </p>
                      <Button 
                        variant="outline" 
                        className="mb-4 border-green-200 text-green-700 hover:bg-green-100"
                        onClick={() => setIsProjectModalOpen(true)}
                      >
                        Add New Project
                      </Button>
                    </div>

                    <Dialog open={isProjectModalOpen} onOpenChange={setIsProjectModalOpen}>
                      <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2 text-green-700">
                            <FileCode className="h-5 w-5 text-green-500" />
                            Add New Project
                          </DialogTitle>
                        </DialogHeader>
                        
                        <Tabs value={activeProjectTab} onValueChange={setActiveProjectTab} className="mt-4">
                          <TabsList className="grid w-full grid-cols-3 bg-green-50">
                            <TabsTrigger value="details" className="data-[state=active]:bg-white data-[state=active]:text-green-700">Details</TabsTrigger>
                            <TabsTrigger value="team" className="data-[state=active]:bg-white data-[state=active]:text-green-700">Team</TabsTrigger>
                            <TabsTrigger value="endorsements" className="data-[state=active]:bg-white data-[state=active]:text-green-700">Endorsements</TabsTrigger>
                          </TabsList>
                          
                          <TabsContent value="details" className="space-y-4 pt-4">
                            <ProjectForm 
                              onSuccess={() => {
                                setIsProjectModalOpen(false);
                                toast({
                                  title: "Project created",
                                  description: "Your project has been created successfully and added to your profile",
                                });
                              }}
                              onCancel={() => setIsProjectModalOpen(false)}
                              closeModal={() => setIsProjectModalOpen(false)}
                            />
                          </TabsContent>
                          
                          <TabsContent value="team" className="space-y-4 pt-4">
                            <div className="space-y-4">
                              <h3 className="text-sm font-medium">Add Team Member</h3>
                              <div className="space-y-4 border rounded-lg p-4">
                                <div className="space-y-2">
                                  <Label>Profile Link*</Label>
                                  <Input placeholder="https://brandentifier.replit.app/profile/username" disabled />
                                  <p className="text-xs text-muted-foreground">
                                    Add Brandentifier profile link to connect with users
                                  </p>
                                </div>
                                <Button size="sm" className="mt-2" disabled>
                                  Add Team Member
                                </Button>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                You can add team members after saving the project
                              </p>
                            </div>
                          </TabsContent>
                          
                          <TabsContent value="endorsements" className="space-y-4 pt-4">
                            <div className="space-y-4">
                              <h3 className="text-sm font-medium">Add Client</h3>
                              <p className="text-sm text-muted-foreground">
                                Add a client's profile link to invite them to endorse your project.
                              </p>
                              <div className="space-y-4 border rounded-lg p-4">
                                <div className="space-y-2">
                                  <Label>Client Profile Link*</Label>
                                  <Input placeholder="https://brandentifier.replit.app/profile/username" disabled />
                                  <p className="text-xs text-muted-foreground">
                                    Add Brandentifier profile link of your client
                                  </p>
                                </div>
                                <Button 
                                  size="sm" 
                                  className="mt-2"
                                  disabled
                                >
                                  Add Client
                                </Button>
                              </div>
                              <p className="text-xs text-muted-foreground italic">
                                Note: You'll need to save the project first before client endorsements can be processed.
                              </p>
                            </div>
                          </TabsContent>
                        </Tabs>
                      </DialogContent>
                    </Dialog>
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