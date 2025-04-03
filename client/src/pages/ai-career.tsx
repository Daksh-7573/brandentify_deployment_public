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
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";

// Demo user ID for development
const DEMO_USER_ID = 1;

export default function AICareerPage() {
  const { toast } = useToast();
  const [resumeText, setResumeText] = useState("");
  const [targetIndustry, setTargetIndustry] = useState("");
  const [networkingPurpose, setNetworkingPurpose] = useState("mentorship");
  const [activeTab, setActiveTab] = useState("career");
  const { user, isAuthenticated, isLoading } = useAuth();
  const [_, setLocation] = useLocation();

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
    mutationFn: async (data: { resumeText?: string; fileData?: string; userId: number }) => {
      const res = await apiRequest("POST", "/api/ai/analyze-resume", data);
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

  // Get recent AI messages for display based on active tab
  const getRecentAIMessages = (messageType?: string) => {
    if (!chatMessages) return [];
    
    let filteredMessages = chatMessages.filter((msg: any) => msg.sender === "ai");
    
    // If a specific message type is requested, filter by that type
    if (messageType) {
      filteredMessages = filteredMessages.filter((msg: any) => msg.messageType === messageType);
    }
    
    return filteredMessages.sort((a: any, b: any) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
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

  // Redirect to landing if not authenticated
  if (!isLoading && !isAuthenticated) {
    setLocation('/');
    return null;
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Navigation */}
      <Header />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar activePage="ai-career" />
        
        {/* Main content area */}
        <div className="flex-1 overflow-auto p-4 sm:p-6 bg-gray-50">
          <div className="mx-auto max-w-6xl">
            <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">AI Career Assistant</h1>
      
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
              <div className="lg:col-span-1">
                <Tabs defaultValue="career" className="w-full" onValueChange={(value) => {
                    // Update active tab and reset appropriate state
                    setActiveTab(value);
                    
                    if (value === 'resume') {
                      setResumeText("");
                    } else if (value === 'networking') {
                      setTargetIndustry("");
                    }
                  }}>
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
                        Upload your resume file or paste a link to your resume to get AI-powered analysis with suggestions for improvement by Musk. Please note that while Musk can provide general resume advice, it cannot directly download content from external links.
                      </p>
                      
                      {/* File Upload Section */}
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-primary transition-colors mb-5">
                        <div className="flex flex-col items-center">
                          <input 
                            id="resume-file-input"
                            type="file" 
                            accept=".pdf,.docx" 
                            className="hidden" 
                            onChange={(e) => {
                              if (e.target.files && e.target.files.length > 0) {
                                const selectedFile = e.target.files[0];
                                
                                // Validate file type
                                if (!['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(selectedFile.type)) {
                                  toast({
                                    title: "Invalid file type",
                                    description: "Please upload a PDF or DOCX file.",
                                    variant: "destructive"
                                  });
                                  return;
                                }
                                
                                // Validate file size (5MB limit)
                                if (selectedFile.size > 5 * 1024 * 1024) {
                                  toast({
                                    title: "File too large",
                                    description: "Please upload a file smaller than 5MB.",
                                    variant: "destructive"
                                  });
                                  return;
                                }
                                
                                // Handle file upload
                                const fileReader = new FileReader();
                                fileReader.readAsDataURL(selectedFile);
                                
                                fileReader.onload = async () => {
                                  const base64Data = fileReader.result?.toString().split(',')[1];
                                  
                                  if (!base64Data) {
                                    toast({
                                      title: "Upload failed",
                                      description: "Failed to process file. Please try again.",
                                      variant: "destructive"
                                    });
                                    return;
                                  }
                                  
                                  try {
                                    // Set loading state
                                    resumeAnalysisMutation.mutate({ 
                                      fileData: base64Data, 
                                      userId: DEMO_USER_ID 
                                    } as any);
                                    
                                    toast({
                                      title: "Processing resume",
                                      description: "Your resume is being analyzed. This may take a moment."
                                    });
                                  } catch (error) {
                                    console.error('Error analyzing resume file:', error);
                                    toast({
                                      title: "Analysis failed",
                                      description: error instanceof Error ? error.message : "Failed to analyze resume. Please try again.",
                                      variant: "destructive"
                                    });
                                  }
                                };
                                
                                fileReader.onerror = () => {
                                  toast({
                                    title: "Upload failed",
                                    description: "Failed to read file. Please try again.",
                                    variant: "destructive"
                                  });
                                };
                              }
                            }}
                          />
                          <p className="text-sm text-gray-500 mb-2">Upload your resume file</p>
                          <p className="text-xs text-gray-400 mb-3">Supported formats: PDF, DOCX (Max 5MB)</p>
                          <Button 
                            variant="outline" 
                            className="cursor-pointer"
                            disabled={resumeAnalysisMutation.isPending}
                            onClick={() => {
                              document.getElementById('resume-file-input')?.click();
                            }}
                          >
                            Upload Resume for Detailed Analysis
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex items-center mb-4">
                        <div className="border-t border-gray-300 flex-grow"></div>
                        <span className="mx-4 text-xs text-gray-500">OR</span>
                        <div className="border-t border-gray-300 flex-grow"></div>
                      </div>
                      
                      {/* Link Input Section */}
                      <div>
                        <p className="text-sm text-gray-500 mb-2">Paste your resume link</p>
                        <Textarea 
                          className="min-h-[100px] sm:min-h-[120px] mb-4 w-full" 
                          placeholder="Paste a link to your resume (e.g., Google Drive, Dropbox, OneDrive link). Note: Musk will provide general resume advice but cannot directly access the linked content."
                          value={resumeText}
                          onChange={(e) => setResumeText(e.target.value)}
                        />
                        <Button 
                          className="w-full"
                          onClick={() => resumeAnalysisMutation.mutate({ resumeText, userId: DEMO_USER_ID } as any)}
                          disabled={resumeAnalysisMutation.isPending || !resumeText.trim()}
                        >
                          {resumeAnalysisMutation.isPending && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          )}
                          Get General Resume Advice
                        </Button>
                      </div>
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
              </div>
              
              <div className="lg:col-span-2">
                <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Your AI Insights</h2>
                
                {messagesLoading ? (
                  <div className="flex justify-center py-8 sm:py-12 border rounded-lg bg-muted/10">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (() => {
                  // Get messages filtered by the active tab's type
                  let messageType;
                  
                  if (activeTab === "career") {
                    messageType = "career_advice";
                  } else if (activeTab === "resume") {
                    messageType = "resume_analysis";
                  } else if (activeTab === "networking") {
                    messageType = "networking_recommendations";
                  }
                  
                  const filteredMessages = getRecentAIMessages(messageType);
                  
                  if (filteredMessages.length === 0) {
                    return (
                      <div className="text-center py-8 sm:py-12 border rounded-lg bg-muted/10">
                        <h3 className="text-base sm:text-lg font-medium">No AI insights yet</h3>
                        <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
                          {activeTab === "career" ? "Generate career advice to see insights here." :
                           activeTab === "resume" ? "Analyze your resume to see insights here." :
                           "Generate networking recommendations to see insights here."}
                        </p>
                      </div>
                    );
                  }
                  
                  return (
                    <div className="space-y-4 sm:space-y-6">
                      {filteredMessages.map((message: any) => (
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
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}