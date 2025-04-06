import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, Zap, Newspaper, BarChart, Video, Image, MessageSquare } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export default function CreatePulsePage() {
  const { user } = useAuth();
  const [pulseTitle, setPulseTitle] = useState("");
  const [pulseContent, setPulseContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("compose");
  const [pulseType, setPulseType] = useState("text-post");
  const [pollOptions, setPollOptions] = useState(["", ""]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
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
            <div className="grid md:grid-cols-5 gap-4 mb-6">
              <Card 
                className={`cursor-pointer transition-all hover:shadow-md ${pulseType === 'text-post' ? 'ring-2 ring-primary' : ''}`}
                onClick={() => setPulseType('text-post')}
              >
                <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                  <MessageSquare className={`h-10 w-10 mb-2 ${pulseType === 'text-post' ? 'text-primary' : 'text-gray-500'}`} />
                  <h3 className="font-medium">Text Post</h3>
                  <p className="text-xs text-gray-500 mt-1">Standard post with text</p>
                </CardContent>
              </Card>

              <Card 
                className={`cursor-pointer transition-all hover:shadow-md ${pulseType === 'news-trend' ? 'ring-2 ring-primary' : ''}`}
                onClick={() => setPulseType('news-trend')}
              >
                <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                  <Newspaper className={`h-10 w-10 mb-2 ${pulseType === 'news-trend' ? 'text-primary' : 'text-gray-500'}`} />
                  <h3 className="font-medium">News/Trend</h3>
                  <p className="text-xs text-gray-500 mt-1">AI-curated industry news</p>
                </CardContent>
              </Card>

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
                className={`cursor-pointer transition-all hover:shadow-md ${pulseType === 'video-post' ? 'ring-2 ring-primary' : ''}`}
                onClick={() => setPulseType('video-post')}
              >
                <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                  <Video className={`h-10 w-10 mb-2 ${pulseType === 'video-post' ? 'text-primary' : 'text-gray-500'}`} />
                  <h3 className="font-medium">Video Post</h3>
                  <p className="text-xs text-gray-500 mt-1">120 sec max with captions</p>
                </CardContent>
              </Card>

              <Card 
                className={`cursor-pointer transition-all hover:shadow-md ${pulseType === 'image-post' ? 'ring-2 ring-primary' : ''}`}
                onClick={() => setPulseType('image-post')}
              >
                <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                  <Image className={`h-10 w-10 mb-2 ${pulseType === 'image-post' ? 'text-primary' : 'text-gray-500'}`} />
                  <h3 className="font-medium">Image Post</h3>
                  <p className="text-xs text-gray-500 mt-1">Portfolio & project visuals</p>
                </CardContent>
              </Card>
            </div>

            <Card className="mb-6">
              <CardContent className="p-6">
                {pulseType === 'news-trend' && (
                  <Alert className="mb-6 bg-blue-50 border-blue-200">
                    <Newspaper className="h-4 w-4 text-blue-500" />
                    <AlertTitle className="text-blue-700">News/Trend Pulse</AlertTitle>
                    <AlertDescription className="text-blue-600">
                      Musk will fetch industry-specific news or emerging trends based on your profile and selected topics.
                    </AlertDescription>
                  </Alert>
                )}

                {pulseType === 'poll' && (
                  <Alert className="mb-6 bg-purple-50 border-purple-200">
                    <BarChart className="h-4 w-4 text-purple-500" />
                    <AlertTitle className="text-purple-700">Poll Pulse</AlertTitle>
                    <AlertDescription className="text-purple-600">
                      Ask your network questions with custom options. Results update live as people vote.
                    </AlertDescription>
                  </Alert>
                )}

                {pulseType === 'video-post' && (
                  <Alert className="mb-6 bg-red-50 border-red-200">
                    <Video className="h-4 w-4 text-red-500" />
                    <AlertTitle className="text-red-700">Video Pulse</AlertTitle>
                    <AlertDescription className="text-red-600">
                      Upload videos up to 120 seconds. AI will generate captions and recommend soundtracks.
                    </AlertDescription>
                  </Alert>
                )}

                {pulseType === 'image-post' && (
                  <Alert className="mb-6 bg-emerald-50 border-emerald-200">
                    <Image className="h-4 w-4 text-emerald-500" />
                    <AlertTitle className="text-emerald-700">Image Pulse</AlertTitle>
                    <AlertDescription className="text-emerald-600">
                      Share portfolio/project visuals, infographics, or professional event photos with your network.
                    </AlertDescription>
                  </Alert>
                )}

                {pulseType === 'text-post' && (
                  <Alert className="mb-6 bg-amber-50 border-amber-200">
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                    <AlertTitle className="text-amber-700">Pro Tip</AlertTitle>
                    <AlertDescription className="text-amber-600">
                      Pulses with clear professional insights get 3x more engagement. Keep it focused on your expertise.
                    </AlertDescription>
                  </Alert>
                )}

                <Tabs defaultValue="compose" className="w-full" onValueChange={setActiveTab}>
                  <TabsList className="mb-4">
                    <TabsTrigger value="compose">Compose</TabsTrigger>
                    <TabsTrigger value="ai-assist">AI Assist</TabsTrigger>
                  </TabsList>
                  <TabsContent value="compose">
                    {pulseType === 'text-post' && (
                      <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                          <Label htmlFor="title">Title</Label>
                          <Input
                            id="title"
                            placeholder="Add a professional, attention-grabbing title"
                            value={pulseTitle}
                            onChange={(e) => setPulseTitle(e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="content">Content</Label>
                          <Textarea
                            id="content"
                            placeholder="Share your professional insight, experience or expertise..."
                            className="min-h-[200px]"
                            value={pulseContent}
                            onChange={(e) => setPulseContent(e.target.value)}
                            required
                          />
                        </div>
                        <div className="flex justify-end">
                          <Button 
                            type="submit" 
                            className="px-6"
                            disabled={isSubmitting}
                          >
                            {isSubmitting ? (
                              <>
                                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                Publishing...
                              </>
                            ) : (
                              "Publish Pulse"
                            )}
                          </Button>
                        </div>
                      </form>
                    )}

                    {pulseType === 'news-trend' && (
                      <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4">
                          <div>
                            <Label>Industry Focus</Label>
                            <RadioGroup defaultValue="user-profile" className="mt-2">
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="user-profile" id="user-profile" />
                                <Label htmlFor="user-profile" className="cursor-pointer">Use my profile industry</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="custom" id="custom" />
                                <Label htmlFor="custom" className="cursor-pointer">Custom industry selection</Label>
                              </div>
                            </RadioGroup>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="trend-type">Trend Type</Label>
                            <div className="flex flex-wrap gap-2">
                              {["Latest News", "Emerging Tech", "Industry Changes", "Career Trends", "Market Insights"].map((type) => (
                                <Button 
                                  key={type} 
                                  variant="outline" 
                                  className="rounded-full" 
                                  type="button"
                                >
                                  {type}
                                </Button>
                              ))}
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="additional-context">Additional Context (Optional)</Label>
                            <Textarea
                              id="additional-context"
                              placeholder="Add specific angles or aspects you'd like the AI to focus on..."
                              className="min-h-[100px]"
                            />
                          </div>
                        </div>
                        <div className="flex justify-end">
                          <Button className="px-6">
                            Generate News/Trend Pulse
                          </Button>
                        </div>
                      </form>
                    )}

                    {pulseType === 'poll' && (
                      <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                          <Label htmlFor="poll-question">Poll Question</Label>
                          <Input
                            id="poll-question"
                            placeholder="What's your question for your network?"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label>Poll Options</Label>
                            <Button 
                              type="button" 
                              variant="outline" 
                              size="sm"
                              onClick={addPollOption}
                              disabled={pollOptions.length >= 6}
                            >
                              + Add Option
                            </Button>
                          </div>
                          <div className="space-y-2">
                            {pollOptions.map((option, index) => (
                              <div key={index} className="flex gap-2">
                                <Input
                                  placeholder={`Option ${index + 1}`}
                                  value={option}
                                  onChange={(e) => updatePollOption(index, e.target.value)}
                                  required
                                />
                                {pollOptions.length > 2 && (
                                  <Button 
                                    type="button" 
                                    variant="ghost" 
                                    size="icon"
                                    onClick={() => removePollOption(index)}
                                    className="text-gray-500 hover:text-red-500"
                                  >
                                    ✕
                                  </Button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Poll Settings</Label>
                          <div className="flex flex-wrap gap-4">
                            <div className="flex items-center gap-2">
                              <input type="checkbox" id="allow-multiple" />
                              <Label htmlFor="allow-multiple" className="text-sm font-normal">Allow multiple selections</Label>
                            </div>
                            <div className="flex items-center gap-2">
                              <input type="checkbox" id="hide-results" />
                              <Label htmlFor="hide-results" className="text-sm font-normal">Hide results until voting</Label>
                            </div>
                            <div className="flex items-center gap-2">
                              <input type="checkbox" id="allow-comments" defaultChecked />
                              <Label htmlFor="allow-comments" className="text-sm font-normal">Allow comments</Label>
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-end">
                          <Button className="px-6">
                            Create Poll
                          </Button>
                        </div>
                      </form>
                    )}

                    {pulseType === 'video-post' && (
                      <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center text-center">
                          <Video className="h-12 w-12 text-gray-400 mb-4" />
                          <h3 className="font-medium text-lg mb-2">Upload Video</h3>
                          <p className="text-sm text-gray-500 mb-4">
                            Drag and drop a video file here, or click to browse.<br />
                            Maximum length: 120 seconds | Supported formats: MP4, MOV, WebM
                          </p>
                          <Button variant="outline" className="mb-4">
                            Select File
                          </Button>
                          <input type="file" className="hidden" accept="video/*" />
                          <p className="text-xs text-gray-400">Max file size: 100 MB</p>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="video-title">Title</Label>
                          <Input
                            id="video-title"
                            placeholder="Add a descriptive title for your video"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="video-description">Description</Label>
                          <Textarea
                            id="video-description"
                            placeholder="Add context or details about your video..."
                            className="min-h-[100px]"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Auto-Generate Captions</Label>
                          <div className="flex items-center space-x-2">
                            <input type="checkbox" id="auto-captions" defaultChecked />
                            <Label htmlFor="auto-captions" className="text-sm font-normal">
                              Use AI to automatically generate captions
                            </Label>
                          </div>
                        </div>
                        <div className="flex justify-end">
                          <Button className="px-6">
                            Upload & Publish Video
                          </Button>
                        </div>
                      </form>
                    )}

                    {pulseType === 'image-post' && (
                      <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center text-center">
                          <Image className="h-12 w-12 text-gray-400 mb-4" />
                          <h3 className="font-medium text-lg mb-2">Upload Images</h3>
                          <p className="text-sm text-gray-500 mb-4">
                            Drag and drop up to 5 images here, or click to browse.<br />
                            Supported formats: JPG, PNG, WebP, GIF
                          </p>
                          <Button variant="outline" className="mb-4">
                            Select Files
                          </Button>
                          <input type="file" className="hidden" accept="image/*" multiple />
                          <p className="text-xs text-gray-400">Max file size: 20 MB per image</p>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="image-title">Title</Label>
                          <Input
                            id="image-title"
                            placeholder="Add a caption for your images"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="image-description">Description</Label>
                          <Textarea
                            id="image-description"
                            placeholder="Add context or details about your images..."
                            className="min-h-[100px]"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>AI Image Analysis</Label>
                          <div className="flex items-center space-x-2">
                            <input type="checkbox" id="ai-tags" defaultChecked />
                            <Label htmlFor="ai-tags" className="text-sm font-normal">
                              Generate suggested hashtags & keywords from my images
                            </Label>
                          </div>
                        </div>
                        <div className="flex justify-end">
                          <Button className="px-6">
                            Upload & Publish Images
                          </Button>
                        </div>
                      </form>
                    )}
                  </TabsContent>
                  <TabsContent value="ai-assist">
                    <div className="space-y-6">
                      <Alert className="bg-blue-50 border-blue-200">
                        <Zap className="h-4 w-4 text-blue-500" />
                        <AlertTitle className="text-blue-700">AI Pulse Assistant</AlertTitle>
                        <AlertDescription className="text-blue-600">
                          Let Musk help you craft a professional {pulseType.replace('-', ' ')} from a simple idea or topic.
                        </AlertDescription>
                      </Alert>
                      
                      <div className="space-y-2">
                        <Label htmlFor="ai-prompt">What would you like to write about?</Label>
                        <Textarea
                          id="ai-prompt"
                          placeholder="E.g., My recent project using React and Firebase, Key insights from my industry conference..."
                          className="min-h-[120px]"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Style & Tone</Label>
                        <div className="flex flex-wrap gap-2">
                          {["Professional", "Thought Leadership", "Educational", "Case Study", "Opinion"].map((tone) => (
                            <Button 
                              key={tone} 
                              variant="outline" 
                              className="rounded-full" 
                              type="button"
                            >
                              {tone}
                            </Button>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Length</Label>
                        <div className="flex flex-wrap gap-2">
                          {["Brief", "Standard", "Detailed"].map((length) => (
                            <Button 
                              key={length} 
                              variant="outline" 
                              className="rounded-full" 
                              type="button"
                            >
                              {length}
                            </Button>
                          ))}
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <Button className="px-6">
                          Generate {pulseType.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">Pulse Best Practices</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-medium mb-2">Focus on Value</h3>
                    <p className="text-sm text-gray-600">Share unique insights from your professional experience that others can learn from.</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-medium mb-2">Be Authentic</h3>
                    <p className="text-sm text-gray-600">Your unique voice and perspective are what make your content valuable to your network.</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-medium mb-2">Engage Actively</h3>
                    <p className="text-sm text-gray-600">Respond to comments and engage with those who interact with your pulse to build relationships.</p>
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