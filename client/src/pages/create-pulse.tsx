import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, Zap } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function CreatePulsePage() {
  const { user } = useAuth();
  const [pulseTitle, setPulseTitle] = useState("");
  const [pulseContent, setPulseContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("compose");

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

            <Card className="mb-6">
              <CardContent className="p-6">
                <Alert className="mb-6 bg-amber-50 border-amber-200">
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                  <AlertTitle className="text-amber-700">Pro Tip</AlertTitle>
                  <AlertDescription className="text-amber-600">
                    Pulses with clear professional insights get 3x more engagement. Keep it focused on your expertise.
                  </AlertDescription>
                </Alert>

                <Tabs defaultValue="compose" className="w-full" onValueChange={setActiveTab}>
                  <TabsList className="mb-4">
                    <TabsTrigger value="compose">Compose</TabsTrigger>
                    <TabsTrigger value="ai-assist">AI Assist</TabsTrigger>
                  </TabsList>
                  <TabsContent value="compose">
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
                  </TabsContent>
                  <TabsContent value="ai-assist">
                    <div className="space-y-6">
                      <Alert className="bg-blue-50 border-blue-200">
                        <Zap className="h-4 w-4 text-blue-500" />
                        <AlertTitle className="text-blue-700">AI Pulse Assistant</AlertTitle>
                        <AlertDescription className="text-blue-600">
                          Let Musk help you craft a professional pulse from a simple idea or topic.
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
                          Generate Pulse
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