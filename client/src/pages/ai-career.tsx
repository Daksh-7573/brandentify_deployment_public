import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Loader2, Send, Sparkles, Lightbulb, BookOpen, BarChart, MessageSquare, ExternalLink, LucideIcon } from "lucide-react";
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
// Removed Sidebar import, using top navigation only
import Header from "@/components/layout/header";

export default function AICareerPage() {
  // Hooks
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [_, setLocation] = useLocation();
  
  // Form states
  const [resumeText, setResumeText] = useState("");
  const [activeTab, setActiveTab] = useState("career");
  const [activeMessageType, setActiveMessageType] = useState<string>("career_advice");
  const [careerAdviceType, setCareerAdviceType] = useState<string>("");
  const [customAdviceText, setCustomAdviceText] = useState<string>("");
  const [showCustomTextInput, setShowCustomTextInput] = useState<boolean>(false);
  const [showChatWindow, setShowChatWindow] = useState<boolean>(false);
  const [chatMessage, setChatMessage] = useState<string>("");
  const [chatHistory, setChatHistory] = useState<Array<{content: string, sender: "user" | "musk", timestamp: Date}>>([]);
  const [targetRole, setTargetRole] = useState<string>("");
  const [targetIndustry, setTargetIndustry] = useState<string>("");
  const [hasUploadedResume, setHasUploadedResume] = useState<boolean>(false);
  
  // Fetch existing chat messages for the user
  const { data: chatMessages, isLoading: messagesLoading } = useQuery({
    queryKey: ["/api/users", user?.id, "chat-messages"],
    queryFn: async () => {
      if (!user?.id) return [];
      const res = await apiRequest({
        method: "GET",
        url: `/api/users/${user.id}/chat-messages`
      });
      return res.json();
    },
    enabled: !!user?.id // Only run query if user is logged in
  });

  // Chat message mutation
  const chatMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      if (!user?.id) {
        throw new Error("User ID not found");
      }
      
      // Use the active message type to ensure messages are properly categorized
      const messageType = activeMessageType;
      
      const res = await apiRequest({
        method: "POST", 
        url: "/api/chat-messages",
        data: {
          userId: user.id,
          content: message,
          messageType: messageType,
          sender: "user"
        }
      });
      return res.json();
    },
    onSuccess: (data) => {
      // Add AI response to chat history
      setTimeout(() => {
        // Create appropriate fallback message based on active tab
        let fallbackMessage = "I'm analyzing your question...";
        if (activeTab === "career") {
          fallbackMessage = "I'm analyzing your question. Let me think about this based on your profile and career goals.";
        } else {
          fallbackMessage = "I'm analyzing your question about your resume. Let me consider the details of your profile and the resume analysis.";
        }
        
        setChatHistory(prev => [...prev, {
          content: data.aiResponse || fallbackMessage,
          sender: "musk",
          timestamp: new Date()
        }]);
      }, 1000); // Simulate AI thinking time
      
      if (user?.id) {
        queryClient.invalidateQueries({
          queryKey: ["/api/users", user.id, "chat-messages"]
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error sending message",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Career advice mutation
  const careerAdviceMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) {
        throw new Error("User ID not found");
      }
      const res = await apiRequest({
        method: "POST", 
        url: "/api/ai/career-advice", 
        data: {
          userId: user.id,
          adviceType: careerAdviceType,
          customAdviceText: showCustomTextInput ? customAdviceText : undefined
        }
      });
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Career advice generated",
        description: "Your personalized career advice has been generated."
      });
      
      if (user?.id) {
        queryClient.invalidateQueries({
          queryKey: ["/api/users", user.id, "chat-messages"]
        });
      }
      
      // Now that results are ready, show the chat window
      setShowChatWindow(true);
      
      // Set the actual advice in the chat history
      setChatHistory([{
        content: data.advice || "I've analyzed your profile and career goals. What specific questions do you have?",
        sender: "musk",
        timestamp: new Date()
      }]);
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
    mutationFn: async (data: { resumeText?: string; fileData?: string; userId: number; targetRole?: string; targetIndustry?: string }) => {
      const res = await apiRequest({
        method: "POST", 
        url: "/api/ai/analyze-resume", 
        data
      });
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Resume analysis complete",
        description: "Your resume has been analyzed. You can now chat with Musk about your resume."
      });
      
      // Ensure the hasUploadedResume flag is set
      setHasUploadedResume(true);
      
      // Now that results are ready, show the chat window
      setShowChatWindow(true);
      
      if (user?.id) {
        queryClient.invalidateQueries({
          queryKey: ["/api/users", user.id, "chat-messages"]
        });
        
        // Add the analysis directly from the response data to the chat history, replacing any loading message
        if (data.analysis) {
          // Replace the loading message with the actual analysis
          setChatHistory([{
            content: data.analysis,
            sender: "musk",
            timestamp: new Date()
          }]);
          scrollToBottom();
        } else {
          // If for some reason we don't have the analysis in the response,
          // wait for the query to refetch and get it from there
          setTimeout(() => {
            const recentMessages = getRecentAIMessages("resume_analysis");
            if (recentMessages && recentMessages.length > 0) {
              // Get the most recent resume analysis
              const latestAnalysis = recentMessages[0];
              
              // Add it to the chat history
              setChatHistory([{
                content: latestAnalysis.content,
                sender: "musk",
                timestamp: new Date(latestAnalysis.timestamp)
              }]);
              scrollToBottom();
            }
          }, 500);
        }
      }
      
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

  // We've removed the networking recommendations mutation

  // Get recent AI messages for display based on active tab
  const getRecentAIMessages = (messageType?: string) => {
    if (!chatMessages) return [];
    
    let filteredMessages = chatMessages.filter((msg: any) => msg.sender === "ai");
    
    // If a specific message type is requested, filter by that type
    if (messageType) {
      filteredMessages = filteredMessages.filter((msg: any) => msg.messageType === messageType);
    }
    
    // Sort messages with most recent first
    let sortedMessages = filteredMessages.sort((a: any, b: any) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    
    // For resume analysis, only show if user has uploaded a resume in this session
    if (messageType === "resume_analysis") {
      // If no resume has been uploaded in this session, don't show demo analysis
      if (!hasUploadedResume) {
        return [];
      }
      // Otherwise just show the most recent one
      return sortedMessages.slice(0, 1);
    }
    
    return sortedMessages;
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
      'general': 'General'
    };
    return types[type] || 'AI Message';
  };
  
  // Function to scroll chat container to bottom when new messages arrive
  const scrollToBottom = () => {
    const chatContainer = document.getElementById('chat-container');
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  };
  
  // Use effect to scroll to bottom when chat history changes
  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);
  
  // Use effect to update message type when tab changes
  useEffect(() => {
    // Update the active message type based on the tab
    if (activeTab === "resume") {
      setActiveMessageType("resume_analysis");
    } else {
      setActiveMessageType("career_advice");
    }
    
    // Don't show chat window until results are ready
    // Instead show initial form
    setShowChatWindow(false);
  }, [activeTab]);

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
      <div className="flex-1 flex overflow-hidden pt-16"> {/* Added padding-top (pt-16) to account for fixed header */}
        {/* Sidebar */}
        
        
        {/* Main content area */}
        <div className="flex-1 overflow-auto p-4 sm:p-6 bg-gray-50">
          <div className="mx-auto max-w-6xl">
            <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">AI Career Assistant</h1>
      
            <div className="grid grid-cols-1 gap-6">
              <div className="w-full">
                <Tabs defaultValue="career" className="w-full" onValueChange={(value) => {
                    // Update active tab and reset appropriate state
                    setActiveTab(value);
                    
                    // Reset chat history when switching tabs to prevent cross-contamination
                    setChatHistory([]);
                    
                    if (value === 'resume') {
                      setResumeText("");
                      // Reset the uploaded resume flag when switching to resume tab
                      setHasUploadedResume(false);
                    }
                    
                    // Reset chat window to show tab-specific content
                    setShowChatWindow(false);
                  }}>
                  <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="career">Career Advice</TabsTrigger>
                    <TabsTrigger value="resume">Resume Analysis</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="career" className="mt-2">
                    <Card className="p-4 sm:p-6">
                      <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Get Career Advice</h2>
                      <p className="text-sm text-muted-foreground mb-4">
                        Get personalized career advice from Musk, your AI career assistant. 
                        Choose a topic below and Musk will analyze your profile to provide tailored guidance and answer your follow-up questions.
                      </p>
                      
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="career-advice-type">What do you need help with?</Label>
                          <Select
                            value={careerAdviceType}
                            onValueChange={(value) => {
                              setCareerAdviceType(value);
                              setShowCustomTextInput(value === "custom");
                              if (value !== "custom") {
                                setCustomAdviceText("");
                              }
                            }}
                          >
                            <SelectTrigger id="career-advice-type">
                              <SelectValue placeholder="Select advice type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="explore_options">Explore Career Options</SelectItem>
                              <SelectItem value="switch_industry">Switch My Industry</SelectItem>
                              <SelectItem value="build_skills">Build Core Skills for Future Roles</SelectItem>
                              <SelectItem value="get_certifications">Get Certifications to Grow</SelectItem>
                              <SelectItem value="prepare_interviews">Prepare for Job Interviews</SelectItem>
                              <SelectItem value="launch_startup">Launch My Own Startup</SelectItem>
                              <SelectItem value="international">Study and Work Internationally</SelectItem>
                              <SelectItem value="custom">Custom Request</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        {showCustomTextInput && (
                          <div className="space-y-2">
                            <Label htmlFor="custom-advice-text">Describe your career question (max 400 words)</Label>
                            <Textarea
                              id="custom-advice-text"
                              value={customAdviceText}
                              onChange={(e) => {
                                // Calculate word count
                                const words = e.target.value.trim().split(/\s+/);
                                const wordCount = e.target.value.trim() ? words.length : 0;
                                
                                // Limit to 400 words
                                if (wordCount <= 400) {
                                  setCustomAdviceText(e.target.value);
                                }
                              }}
                              placeholder="Describe your specific career question or situation here..."
                              className="min-h-[120px] resize-y"
                            />
                            <div className="text-xs text-right text-muted-foreground">
                              {customAdviceText.trim() 
                                ? `${customAdviceText.trim().split(/\s+/).length} / 400 words`
                                : "0 / 400 words"}
                            </div>
                          </div>
                        )}
                        
                        <Button 
                          className="w-full"
                          onClick={() => {
                            // Don't show chat window until results are ready
                            setShowChatWindow(false);
                            
                            // Clear any previous chat history
                            setChatHistory([]);
                            
                            // Start the advice generation
                            careerAdviceMutation.mutate();
                          }}
                          disabled={
                            careerAdviceMutation.isPending || 
                            !careerAdviceType || 
                            (careerAdviceType === "custom" && !customAdviceText.trim())
                          }
                        >
                          {careerAdviceMutation.isPending && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          )}
                          Chat with Musk about Your Career
                        </Button>
                      </div>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="resume" className="mt-2">
                    <Card className="p-4 sm:p-6">
                      <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Resume Analysis</h2>
                      <p className="text-sm text-muted-foreground mb-4">
                        Upload your resume PDF file to get AI-powered analysis with suggestions for improvement by Musk. For more targeted recommendations, specify your desired role and industry.
                      </p>
                      
                      {/* Target Role and Industry Fields */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="space-y-2">
                          <Label htmlFor="target-role">Target Role (Optional)</Label>
                          <Input
                            id="target-role"
                            placeholder="e.g., Product Manager, UX Designer, Data Analyst"
                            value={targetRole}
                            onChange={(e) => setTargetRole(e.target.value)}
                          />
                          <p className="text-xs text-muted-foreground">
                            Specify the role you're targeting for more customized advice
                          </p>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="target-industry">Target Industry (Optional)</Label>
                          <Input
                            id="target-industry"
                            placeholder="e.g., Fintech, Healthcare, E-commerce"
                            value={targetIndustry}
                            onChange={(e) => setTargetIndustry(e.target.value)}
                          />
                          <p className="text-xs text-muted-foreground">
                            Specify the industry you're targeting for better recommendations
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-6">
                        {/* File Upload Section */}
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-primary transition-colors">
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
                                      // Mark that we've uploaded a resume in this session
                                      setHasUploadedResume(true);
                                      
                                      // Don't show chat window until results are ready
                                      setShowChatWindow(false);
                                      
                                      // Clear any previous chat history
                                      setChatHistory([]);
                                      
                                      // Start the resume analysis
                                      resumeAnalysisMutation.mutate({ 
                                        fileData: base64Data, 
                                        userId: user?.id || 0,
                                        targetRole: targetRole.trim() || undefined,
                                        targetIndustry: targetIndustry.trim() || undefined
                                      });
                                      
                                      toast({
                                        title: "Processing resume",
                                        description: "Your resume is being analyzed with our multi-layered improvement engine. This may take a moment."
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
                              {resumeAnalysisMutation.isPending && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              )}
                              Upload Resume
                            </Button>
                          </div>
                        </div>

                      </div>
                    </Card>
                  </TabsContent>
                  

                </Tabs>
              </div>
              
              <div className="lg:col-span-2">
                <div className="flex items-center gap-2 mb-3 sm:mb-4">
                  {activeTab === "career" ? (
                    <BarChart className="h-5 w-5 text-primary" />
                  ) : (
                    <BookOpen className="h-5 w-5 text-primary" />
                  )}
                  <h2 className="text-lg sm:text-xl font-semibold">
                    {activeTab === "career" ? "Your Career Insights" : "Your Resume Analysis"}
                  </h2>
                </div>
                
                {/* Show loading indicator only when messages are loading */}
                {messagesLoading && (
                  <div className="flex justify-center py-8 sm:py-12 border rounded-lg bg-muted/10">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                )}
                
                {/* Chat Interface with Musk - only shown after results are generated */}
                {showChatWindow && (
                  <div className="mt-6">
                    <div className="bg-gradient-to-br from-white via-gray-50/80 to-blue-50/30 border-0 rounded-2xl p-5 sm:p-7 shadow-lg transition-all duration-300 hover:shadow-xl relative overflow-hidden">
                      {/* Animated background element */}
                      <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-100/30 rounded-full blur-3xl animate-pulse"></div>
                      <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-indigo-100/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
                      
                      <div className="flex items-center gap-4 mb-6 pb-4 border-b border-gray-100/80 relative z-10">
                        <div className="flex items-center justify-center h-12 w-12 rounded-full bg-gradient-to-br from-primary/80 to-primary/60 shadow-md shadow-primary/20">
                          <Sparkles className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-primary/90 tracking-tight">Chat with Musk</h3>
                          <p className="text-sm text-muted-foreground mt-0.5">
                            {activeTab === "career" 
                              ? "Ask follow-up questions based on your career profile"
                              : "Ask follow-up questions about your resume analysis"
                            }
                          </p>
                        </div>
                      </div>
                      
                      <div className="space-y-5 relative z-10">
                        {/* Chat messages - fixed height container */}
                        <div className="space-y-5 h-[600px] overflow-y-auto p-6 rounded-xl bg-gradient-to-br from-white to-gray-50/80 backdrop-blur-md shadow-inner border border-white/60" id="chat-container" style={{ scrollBehavior: 'smooth' }}>
                          {chatHistory.map((message, index) => (
                            <div 
                              key={index} 
                              className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"} relative mb-3 group w-full`}
                            >
                              {message.sender !== "user" && (
                                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 mr-4 shadow-md border border-primary/10 transition-all duration-300 group-hover:shadow-lg group-hover:border-primary/20">
                                  <Sparkles className="h-6 w-6 text-primary"/>
                                </div>
                              )}
                              <div 
                                className={`max-w-[85%] p-5 rounded-xl ${
                                  message.sender === "user" 
                                    ? "bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-md backdrop-blur-sm" 
                                    : "bg-gradient-to-br from-white via-white to-gray-50/90 border border-gray-100/80 shadow-lg hover:shadow-xl transition-all duration-300 w-full backdrop-blur-sm"
                                }`}
                              >
                                {message.sender === "user" ? (
                                  <p className="text-sm tracking-wide break-words font-medium">{message.content}</p>
                                ) : (
                                  <div className="prose prose-sm dark:prose-invert max-w-none">
                                    {message.content.split('\n').map((line, i) => {
                                      // Detect if this is a signature line from Musk
                                      if (line.includes("Musk, Your Career Partner")) {
                                        return (
                                          <div key={i} className="mt-5 pt-4 border-t border-gray-200 text-sm text-primary font-medium flex items-center">
                                            <Sparkles className="h-4 w-4 mr-2" />
                                            {line}
                                          </div>
                                        );
                                      }
                                      // For main headings (# Title)
                                      else if (line.startsWith('# ')) {
                                        return (
                                          <div key={i} className="flex items-center gap-2 text-lg font-bold text-primary mt-5 mb-3 pb-2 border-b border-primary/20">
                                            <BookOpen className="h-4 w-4 text-primary" />
                                            <span>{line.replace(/^# /, '')}</span>
                                          </div>
                                        );
                                      }
                                      // For secondary headings (## Subtitle)
                                      else if (line.startsWith('## ')) {
                                        return (
                                          <div key={i} className="flex items-center gap-2 text-base font-semibold mt-4 mb-2 text-primary/90">
                                            <Lightbulb className="h-3.5 w-3.5 text-primary" />
                                            <span>{line.replace(/^## /, '')}</span>
                                          </div>
                                        );
                                      }
                                      // For tertiary headings (### Subtitle)
                                      else if (line.startsWith('### ')) {
                                        return (
                                          <div key={i} className="font-semibold text-base text-primary-700 mt-5 mb-3 py-1 px-2 bg-primary-50 border-l-4 border-primary-400 rounded-r">
                                            {line.replace(/^### /, '')}
                                          </div>
                                        );
                                      }
                                      // For numbered list items (1. Item, 2. Item, etc.)
                                      else if (/^\d+\.\s/.test(line)) {
                                        // Safe extraction of the number with proper null check
                                        const matchResult = line.match(/^\d+/);
                                        const number = matchResult && matchResult[0] ? matchResult[0] : "•";
                                        const text = line.replace(/^\d+\.\s/, '');
                                        
                                        // Bold the first few words for emphasis
                                        const emphasisMatch = text.match(/^([^:.]+)[:.]?\s(.*)/);
                                        const [firstPart, restPart] = emphasisMatch 
                                          ? [emphasisMatch[1], emphasisMatch[2]] 
                                          : [null, text];
                                        
                                        return (
                                          <div key={i} className="flex items-start my-2 pl-1 group">
                                            <div className="flex items-center justify-center min-w-[24px] h-[24px] rounded-full bg-primary/15 text-primary text-xs font-semibold mr-3 shadow-sm group-hover:bg-primary group-hover:text-white transition-colors">
                                              {number}
                                            </div>
                                            <div className="mt-0.5">
                                              {firstPart ? (
                                                <p className="m-0 leading-relaxed">
                                                  <span className="font-semibold text-primary/90">{firstPart}:</span> {restPart}
                                                </p>
                                              ) : (
                                                <p className="m-0 leading-relaxed">{text}</p>
                                              )}
                                            </div>
                                          </div>
                                        );
                                      }
                                      // For bullet points (- Item)
                                      else if (line.startsWith('- ')) {
                                        const text = line.replace(/^- /, '');
                                        
                                        // Bold any text between ** markers
                                        const parts = text.split(/\*\*(.*?)\*\*/g);
                                        const formattedText = parts.map((part, idx) => 
                                          idx % 2 === 0 ? part : <span key={`bold-${idx}`} className="font-semibold text-primary-600 bg-primary-50 px-1 py-0.5 rounded">{part}</span>
                                        );
                                        
                                        return (
                                          <div key={i} className="flex items-start my-2 pl-1 group">
                                            <div className="flex items-center justify-center min-w-[18px] h-[18px] rounded-full bg-primary/15 text-primary mr-3 mt-0.5 group-hover:bg-primary/25 transition-colors">
                                              <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                                            </div>
                                            <p className="m-0 leading-relaxed">{formattedText}</p>
                                          </div>
                                        );
                                      }
                                      // For markdown tables - check for | separator (tables have multiple | characters)
                                      else if (line.includes('|') && line.split('|').length > 2) {
                                        // Check if this is a header separator row (contains ---)
                                        if (line.includes('---')) {
                                          return null; // Skip separator rows, they're just for markdown formatting
                                        }
                                        
                                        // Split the row into cells and trim whitespace
                                        const cells = line.split('|')
                                          .filter(cell => cell.trim() !== '') // Remove empty cells from start/end
                                          .map(cell => cell.trim());
                                        
                                        // Determine if this is a header row based on column headers like "Role | Match % | Why"
                                        const isHeaderRow = line.includes('Role') || 
                                                         line.includes('Track') || 
                                                         (cells.length >= 3 && 
                                                         cells.some(cell => cell.includes('%') || cell.includes('Match')));
                                        
                                        return (
                                          <div key={i} className={`flex w-full ${isHeaderRow ? 'font-bold bg-primary/10 text-primary' : 'border-b border-gray-100'} my-0`}>
                                            {cells.map((cell, cellIndex) => (
                                              <div 
                                                key={`cell-${cellIndex}`} 
                                                className={`px-3 py-2 flex-1 ${cellIndex === 0 ? 'font-medium' : ''}`}
                                                style={{ minWidth: cellIndex === 0 ? '120px' : '80px' }}
                                              >
                                                {cell}
                                              </div>
                                            ))}
                                          </div>
                                        );
                                      }
                                      
                                      // For book titles or emphasized terms (_text_)
                                      else if (line.match(/^_.*_$/)) {
                                        return (
                                          <p key={i} className="my-2 italic font-medium text-primary/90 pl-1 border-l-2 border-primary/20 bg-primary/5 py-1 px-3 rounded">
                                            {line.replace(/^_|_$/g, '')}
                                          </p>
                                        );
                                      }
                                      // For italic text (*text*)
                                      else if (line.startsWith('*') && line.endsWith('*')) {
                                        return (
                                          <p key={i} className="my-2 italic text-primary/70 pl-1 border-l-2 border-primary/20 bg-primary/5 py-1 px-3 rounded">
                                            {line.replace(/^\*|\*$/g, '')}
                                          </p>
                                        );
                                      }
                                      // For empty lines - add spacing
                                      else if (line.trim() === '') {
                                        return <div key={i} className="my-2"></div>;
                                      }
                                      // For links [text](url)
                                      else if (line.match(/\[.*?\]\(https?:\/\/.*?\)/)) {
                                        const linkMatches = line.match(/\[(.*?)\]\((https?:\/\/.*?)\)/g) || [];
                                        let remainingText = line;
                                        const elements = [];
                                        
                                        // Process each link in the line
                                        linkMatches.forEach((match, idx) => {
                                          const [beforeLink, afterLink] = remainingText.split(match, 2);
                                          
                                          // Extract link text and URL with safe null checks
                                          const linkTextMatch = match.match(/\[(.*?)\]/);
                                          const linkUrlMatch = match.match(/\((https?:\/\/.*?)\)/);
                                          
                                          const linkText = linkTextMatch && linkTextMatch[1] ? linkTextMatch[1] : "Link";
                                          const linkUrl = linkUrlMatch && linkUrlMatch[1] ? linkUrlMatch[1] : "#";
                                          
                                          // Add text before the link if it exists
                                          if (beforeLink) {
                                            elements.push(
                                              <span key={`text-before-${idx}`} className="leading-relaxed">
                                                {beforeLink}
                                              </span>
                                            );
                                          }
                                          
                                          // Add the link
                                          elements.push(
                                            <a 
                                              key={`link-${idx}`}
                                              href={linkUrl}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="text-primary font-medium hover:underline inline-flex items-center gap-1"
                                            >
                                              {linkText}
                                              <ExternalLink className="h-3 w-3 mb-0.5" />
                                            </a>
                                          );
                                          
                                          // Update remaining text
                                          remainingText = afterLink;
                                        });
                                        
                                        // Add any remaining text after the last link
                                        if (remainingText) {
                                          elements.push(
                                            <span key="text-after" className="leading-relaxed">
                                              {remainingText}
                                            </span>
                                          );
                                        }
                                        
                                        return <p key={i} className="my-2 leading-relaxed">{elements}</p>;
                                      }
                                      // For normal text
                                      else {
                                        // Bold any text between ** markers
                                        const parts = line.split(/\*\*(.*?)\*\*/g);
                                        const formattedText = parts.map((part, idx) => 
                                          idx % 2 === 0 ? part : <span key={`bold-${idx}`} className="font-semibold text-primary-600 bg-primary-50 px-1 py-0.5 rounded">{part}</span>
                                        );
                                        
                                        return <p key={i} className="my-2 leading-relaxed">{formattedText}</p>;
                                      }
                                    })}
                                  </div>
                                )}
                                <div className="text-xs mt-1 opacity-70">
                                  {message.timestamp.toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        {/* Chat input */}
                        <div className="relative mt-4">
                          <div className="border border-gray-200/80 rounded-2xl bg-gradient-to-b from-white to-gray-50/90 shadow-lg backdrop-blur-sm overflow-hidden focus-within:shadow-xl focus-within:border-primary/40 transition-all duration-300">
                            <Textarea
                              value={chatMessage}
                              onChange={(e) => setChatMessage(e.target.value)}
                              placeholder="Ask Musk a follow-up question about your career..."
                              className="resize-none min-h-[100px] pr-16 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none text-sm font-medium bg-transparent"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                  e.preventDefault();
                                  if (chatMessage.trim() && !chatMessageMutation.isPending) {
                                    // Add user message to chat history
                                    setChatHistory(prev => [...prev, {
                                      content: chatMessage,
                                      sender: "user",
                                      timestamp: new Date()
                                    }]);
                                    
                                    // Send message to AI
                                    chatMessageMutation.mutate(chatMessage);
                                    
                                    // Clear input
                                    setChatMessage("");
                                  }
                                }
                              }}
                            />
                            <Button 
                              size="icon" 
                              className={`h-12 w-12 absolute right-4 bottom-4 rounded-full transition-all duration-300 ${
                                !chatMessage.trim() 
                                  ? 'opacity-60 bg-gradient-to-br from-gray-200 to-gray-300 hover:bg-gray-200' 
                                  : 'bg-gradient-to-br from-primary to-primary/90 shadow-md hover:shadow-lg hover:scale-105'
                              }`}
                              onClick={() => {
                                if (chatMessage.trim() && !chatMessageMutation.isPending) {
                                  // Add user message to chat history
                                  setChatHistory(prev => [...prev, {
                                    content: chatMessage,
                                    sender: "user",
                                    timestamp: new Date()
                                  }]);
                                  
                                  // Send message to AI
                                  chatMessageMutation.mutate(chatMessage);
                                  
                                  // Clear input
                                  setChatMessage("");
                                }
                              }}
                              disabled={!chatMessage.trim() || chatMessageMutation.isPending}
                            >
                              {chatMessageMutation.isPending ? (
                                <Loader2 className="h-6 w-6 animate-spin" />
                              ) : (
                                <Send className="h-6 w-6 ml-0.5" />
                              )}
                            </Button>
                          </div>
                          <div className="flex justify-between items-center mt-3">
                            <p className="text-xs text-muted-foreground flex items-center ml-1.5 bg-gray-50/50 py-1 px-2 rounded-md border border-gray-100">
                              <Sparkles className="h-3.5 w-3.5 mr-1.5 text-primary/70" />
                              Press <span className="font-medium mx-1 text-primary/80">Enter</span> to send, <span className="font-medium mx-1 text-primary/80">Shift+Enter</span> for new line
                            </p>
                            <p className="text-xs bg-primary/5 py-1 px-3 rounded-md border border-primary/10 text-primary/80 font-medium">Powered by Musk AI</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}