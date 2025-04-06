import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AlertCircle, BarChart, Video, Image } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export default function CreatePulsePage() {
  const { user } = useAuth();
  const [pulseTitle, setPulseTitle] = useState("");
  const [pulseContent, setPulseContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pulseType, setPulseType] = useState("poll");
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