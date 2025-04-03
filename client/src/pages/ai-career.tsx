import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Demo user ID for development
const DEMO_USER_ID = 1;

export default function AICareerPage() {
  const { toast } = useToast();
  const [resumeText, setResumeText] = useState("");
  const [targetIndustry, setTargetIndustry] = useState("");
  const [networkingPurpose, setNetworkingPurpose] = useState("mentorship");

  // Fetch existing chat messages for the user
  const { data: chatMessages, isLoading: messagesLoading } = useQuery({
    queryKey: ["/api/users", DEMO_USER_ID, "chat-messages"],
    queryFn: async () => {
      const res = await apiRequest(
        "GET",
        `/api/users/${DEMO_USER_ID}/chat-messages`
      );
      return res.json();
    }
  });

  // Career advice mutation
  const careerAdviceMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/ai/career-advice", {
        userId: DEMO_USER_ID
      });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Career advice generated",
        description: "Your personalized career advice has been generated."
      });
      queryClient.invalidateQueries({
        queryKey: ["/api/users", DEMO_USER_ID, "chat-messages"]
      });
    },
    onError: (error: Error) => {
      const isApiKeyMissing = error.message.includes("API key");
      
      toast({
        title: "Error generating career advice",
        description: isApiKeyMissing 
          ? "OpenAI API key is missing. Please check your environment variables."
          : "Failed to generate career advice. Please try again later.",
        variant: "destructive"
      });
    }
  });

  // Resume analysis mutation
  const resumeAnalysisMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/ai/analyze-resume", {
        resumeText,
        userId: DEMO_USER_ID
      });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Resume analysis complete",
        description: "Your resume has been analyzed."
      });
      queryClient.invalidateQueries({
        queryKey: ["/api/users", DEMO_USER_ID, "chat-messages"]
      });
      setResumeText("");
    },
    onError: (error: Error) => {
      const isApiKeyMissing = error.message.includes("API key");
      
      toast({
        title: "Error analyzing resume",
        description: isApiKeyMissing 
          ? "OpenAI API key is missing. Please check your environment variables."
          : "Failed to analyze resume. Please try again later.",
        variant: "destructive"
      });
    }
  });

  // Networking recommendations mutation
  const networkingMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/ai/networking-recommendations", {
        userId: DEMO_USER_ID,
        targetIndustry,
        purpose: networkingPurpose
      });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Networking recommendations generated",
        description: "Your personalized networking recommendations have been generated."
      });
      queryClient.invalidateQueries({
        queryKey: ["/api/users", DEMO_USER_ID, "chat-messages"]
      });
      setTargetIndustry("");
    },
    onError: (error: Error) => {
      const isApiKeyMissing = error.message.includes("API key");
      
      toast({
        title: "Error generating recommendations",
        description: isApiKeyMissing 
          ? "OpenAI API key is missing. Please check your environment variables."
          : "Failed to generate networking recommendations. Please try again later.",
        variant: "destructive"
      });
    }
  });

  // Get recent AI messages for display
  const getRecentAIMessages = () => {
    if (!chatMessages) return [];
    
    return chatMessages
      .filter((msg: any) => msg.sender === "ai")
      .sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  };

  // Format timestamp for display
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    }).format(date);
  };

  // Message type to human-readable format
  const getMessageTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      'career_advice': 'Career Advice',
      'resume_analysis': 'Resume Analysis',
      'networking_recommendations': 'Networking Recommendations',
      'general': 'General'
    };
    return types[type] || 'AI Message';
  };

  return (
    <div className="container py-6 px-4 sm:px-6 md:py-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">AI Career Assistant</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <div className="lg:col-span-1">
          <Tabs defaultValue="career" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="career">Career Advice</TabsTrigger>
              <TabsTrigger value="resume">Resume Analysis</TabsTrigger>
              <TabsTrigger value="networking">Networking</TabsTrigger>
            </TabsList>
            
            <TabsContent value="career" className="mt-2">
              <Card className="p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Get Career Advice</h2>
                <p className="text-sm text-muted-foreground mb-5">
                  Generate personalized career advice based on your profile. 
                  We'll analyze your work experience, skills, and education to provide tailored recommendations.
                </p>
                <Button 
                  className="w-full"
                  onClick={() => careerAdviceMutation.mutate()}
                  disabled={careerAdviceMutation.isPending}
                >
                  {careerAdviceMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Generate Career Advice
                </Button>
              </Card>
            </TabsContent>
            
            <TabsContent value="resume" className="mt-2">
              <Card className="p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Resume Analysis</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Paste your resume text to get an AI-powered analysis with suggestions for improvement.
                </p>
                <Textarea 
                  className="min-h-[150px] sm:min-h-[200px] mb-4 w-full" 
                  placeholder="Paste your resume text here..."
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                />
                <Button 
                  className="w-full"
                  onClick={() => resumeAnalysisMutation.mutate()}
                  disabled={resumeAnalysisMutation.isPending || !resumeText.trim()}
                >
                  {resumeAnalysisMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Analyze Resume
                </Button>
              </Card>
            </TabsContent>
            
            <TabsContent value="networking" className="mt-2">
              <Card className="p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Networking Recommendations</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Get personalized networking recommendations for your career goals.
                </p>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="industry" className="mb-1.5 block">Target Industry</Label>
                    <Input 
                      id="industry" 
                      placeholder="e.g. Technology, Healthcare, Finance"
                      value={targetIndustry}
                      onChange={(e) => setTargetIndustry(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="purpose" className="mb-1.5 block">Networking Purpose</Label>
                    <Select 
                      value={networkingPurpose} 
                      onValueChange={setNetworkingPurpose}
                    >
                      <SelectTrigger id="purpose" className="w-full">
                        <SelectValue placeholder="Select purpose" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mentorship">Find a Mentor</SelectItem>
                        <SelectItem value="job_search">Job Search</SelectItem>
                        <SelectItem value="collaboration">Find Collaborators</SelectItem>
                        <SelectItem value="industry_insights">Industry Insights</SelectItem>
                        <SelectItem value="career_change">Career Change</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Button 
                    className="w-full mt-2"
                    onClick={() => networkingMutation.mutate()}
                    disabled={networkingMutation.isPending || !targetIndustry.trim()}
                  >
                    {networkingMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Get Recommendations
                  </Button>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
          
          {/* OpenAI API Key warning shows if server endpoints return specific errors */}
        </div>
        
        <div className="lg:col-span-2">
          <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Your AI Insights</h2>
          
          {messagesLoading ? (
            <div className="flex justify-center py-8 sm:py-12 border rounded-lg bg-muted/10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : getRecentAIMessages().length === 0 ? (
            <div className="text-center py-8 sm:py-12 border rounded-lg bg-muted/10">
              <h3 className="text-base sm:text-lg font-medium">No AI insights yet</h3>
              <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
                Generate career advice, analyze your resume, or get networking recommendations to see AI insights here.
              </p>
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-6">
              {getRecentAIMessages().map((message: any) => (
                <Card key={message.id} className="p-4 sm:p-6 overflow-hidden">
                  <div className="flex justify-between items-start mb-3 sm:mb-4">
                    <div>
                      <h3 className="font-medium">{getMessageTypeLabel(message.messageType)}</h3>
                      <p className="text-xs text-muted-foreground">
                        {formatTimestamp(message.timestamp)}
                      </p>
                    </div>
                  </div>
                  <div className="prose max-w-none dark:prose-invert prose-sm overflow-x-auto">
                    {message.content.split('\n').map((line: string, i: number) => (
                      <p key={i} className={line.trim() === '' ? 'my-3 sm:my-4' : ''}>
                        {line}
                      </p>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}