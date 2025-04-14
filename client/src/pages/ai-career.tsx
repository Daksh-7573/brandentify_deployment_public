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
      
      // Determine message type based on active tab
      const messageType = activeTab === "career" ? "career_advice" : "resume_analysis";
      
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
      
      // Show chat window with initial AI message
      setShowChatWindow(true);
      
      // Replace the loading message with the actual advice
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
      
      // Immediately show chat window - don't wait for query refetch
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
  
  // Use effect to show chat window when in resume tab and no messages yet
  useEffect(() => {
    if (activeTab === "resume" && getRecentAIMessages("resume_analysis").length === 0) {
      setShowChatWindow(true);
    }
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
                    
                    if (value === 'resume') {
                      setResumeText("");
                      // Reset the uploaded resume flag when switching to resume tab
                      setHasUploadedResume(false);
                    }
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
                            // Show chat window immediately
                            setShowChatWindow(true);
                            
                            // Add a loading message to the chat
                            setChatHistory([{
                              content: "I'm preparing your career advice... this will take just a moment.",
                              sender: "musk",
                              timestamp: new Date()
                            }]);
                            
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
                                      
                                      // Set loading state
                                      // Set up the chat window immediately before analysis starts
                                      setShowChatWindow(true);
                                      
                                      // Add a loading message to the chat
                                      setChatHistory([{
                                        content: "I'm analyzing your resume... this will take just a moment.",
                                        sender: "musk",
                                        timestamp: new Date()
                                      }]);
                                      
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
                  }
                  
                  const filteredMessages = getRecentAIMessages(messageType);
                  
                  // Instead of showing "No AI insights yet", return a blank view - chat window will be shown by effect
                  if (filteredMessages.length === 0) {
                    return null;
                  }
                  
                  // If the chat window is shown, don't display the card-style messages
                  if (!showChatWindow) {
                    // If we're on the resume tab, only show the most recent analysis
                    const messagesToShow = activeTab === "resume" 
                      ? [filteredMessages[0]] // Only the first/most recent resume analysis
                      : filteredMessages;     // All career advice messages
                    
                    return (
                      <div className="space-y-4 sm:space-y-6">
                        {messagesToShow.map((message: any) => (
                          <Card key={message.id} className="p-0 overflow-hidden border border-gray-100 rounded-lg shadow-lg">
                            <div className="bg-gradient-to-r from-primary/10 to-primary/5 px-4 sm:px-6 py-3 sm:py-4 border-b flex items-center gap-3">
                              <div className="flex items-center justify-center h-9 w-9 rounded-full bg-white shadow-sm">
                                <Sparkles className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <h4 className="font-semibold text-sm text-primary">Musk AI Assistant</h4>
                                <p className="text-xs text-muted-foreground">
                                  {formatTimestamp(message.timestamp)}
                                </p>
                              </div>
                            </div>
                            
                            <div className="p-5 sm:p-6 prose prose-sm dark:prose-invert max-w-none overflow-x-auto">
                              {message.content.split('\n').map((line: string, i: number) => {
                                // For main headings (# Title)
                                if (line.trim().match(/^#\s/)) {
                                  const text = line.replace(/^#\s/, '');
                                  return (
                                    <div key={i} className="flex items-center gap-2 text-lg font-bold text-primary mt-3 mb-4 pb-2 border-b border-primary/20">
                                      <BookOpen className="h-5 w-5 text-primary" />
                                      <span>{text}</span>
                                    </div>
                                  );
                                }
                                // For secondary headings (## Subtitle)
                                else if (line.trim().match(/^##\s/)) {
                                  const text = line.replace(/^##\s/, '');
                                  return (
                                    <div key={i} className="flex items-center gap-2 text-base font-semibold mt-5 mb-2 text-primary/90 bg-primary/5 py-2 px-3 rounded">
                                      <Lightbulb className="h-4 w-4 text-primary" />
                                      <span>{text}</span>
                                    </div>
                                  );
                                }
                                // For tertiary headings (### Title)
                                else if (line.trim().match(/^###\s/)) {
                                  const text = line.replace(/^###\s/, '');
                                  // Special handling for industry match level indicators (🟢 High Match, 🟡 Medium Match, 🟠 Low Match)
                                  if (text.includes('🟢') || text.includes('🟡') || text.includes('🟠')) {
                                    // Split the text into industry name and match level
                                    const parts = text.split(' - ');
                                    if (parts.length === 2) {
                                      const industryName = parts[0];
                                      const matchLevel = parts[1];
                                      return (
                                        <div key={i} className="border-l-4 pl-3 py-2 my-3 bg-background rounded-sm shadow-sm" 
                                             style={{ 
                                               borderLeftColor: 
                                                 matchLevel.includes('🟢') ? 'rgb(34, 197, 94)' : 
                                                 matchLevel.includes('🟡') ? 'rgb(234, 179, 8)' : 
                                                 matchLevel.includes('🟠') ? 'rgb(249, 115, 22)' : 'currentColor' 
                                             }}>
                                          <div className="font-bold text-lg text-foreground">
                                            {industryName}
                                          </div>
                                          <div className="text-sm font-medium">
                                            {matchLevel}
                                          </div>
                                        </div>
                                      );
                                    }
                                  }
                                  // Standard tertiary heading - improved styling with background
                                  return (
                                    <div key={i} className="font-semibold text-base text-primary-700 mt-5 mb-3 py-1 px-2 bg-primary-50 border-l-4 border-primary-400 rounded-r">
                                      {text}
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
                                    <div key={i} className="flex items-start my-3 pl-1 group hover:bg-muted/20 rounded py-1 -mx-1 px-1 transition-colors">
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
                                else if (line.trim().startsWith('- ')) {
                                  const text = line.replace(/^- /, '');
                                  
                                  // Bold any text between ** markers with background highlight
                                  const parts = text.split(/\*\*(.*?)\*\*/g);
                                  const formattedText = parts.map((part, idx) => 
                                    idx % 2 === 0 ? part : <span key={`bold-${idx}`} className="font-semibold text-primary-600 bg-primary-50 px-1 py-0.5 rounded">{part}</span>
                                  );
                                  
                                  return (
                                    <div key={i} className="flex items-start my-2 pl-1 group hover:bg-muted/20 rounded py-1 -mx-1 px-1 transition-colors">
                                      <div className="flex items-center justify-center min-w-[18px] h-[18px] rounded-full bg-primary/15 text-primary mr-3 mt-0.5 group-hover:bg-primary/25 transition-colors">
                                        <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                                      </div>
                                      <p className="m-0 leading-relaxed">{formattedText}</p>
                                    </div>
                                  );
                                }
                                // For italic text (*text*)
                                else if (line.startsWith('*') && line.endsWith('*')) {
                                  return (
                                    <p key={i} className="my-3 italic text-primary/70 pl-1 border-l-2 border-primary/20 bg-primary/5 py-2 px-3 rounded">
                                      {line.replace(/^\*|\*$/g, '')}
                                    </p>
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
                                
                                // For signature line
                                else if (line.includes("Musk, Your Career Partner")) {
                                  return (
                                    <div key={i} className="mt-5 pt-4 border-t border-gray-200 text-sm text-primary font-medium flex items-center">
                                      <Sparkles className="h-4 w-4 mr-2" />
                                      {line}
                                    </div>
                                  );
                                }
                                // For empty lines - add spacing
                                else if (line.trim() === '') {
                                  return <div key={i} className="my-2"></div>;
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
                            <div className="bg-muted/5 border-t px-6 py-3 flex justify-between items-center">
                              <p className="text-xs text-muted-foreground">
                                Generated by AI based on your professional profile
                              </p>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="ml-auto text-primary hover:text-primary hover:bg-primary/10"
                                onClick={() => {
                                  // Enable follow-up for both career and resume tabs
                                  setShowChatWindow(true);
                                  
                                  // If chat history is empty and we have a message to show,
                                  // add this message to chat history
                                  if (chatHistory.length === 0 && message) {
                                    setChatHistory([{
                                      content: message.content,
                                      sender: "musk",
                                      timestamp: new Date(message.timestamp)
                                    }]);
                                  }
                                  
                                  scrollToBottom();
                                }}
                              >
                                <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
                                Follow up
                              </Button>
                            </div>
                          </Card>
                        ))}
                      </div>
                    );
                  }
                  
                  // If we're on career tab with chat window shown, don't display the cards
                  return null;
                })()}
                
                {/* Chat Interface with Musk */}
                {showChatWindow && (
                  <div className="mt-6">
                    <div className="bg-gradient-to-b from-gray-50 to-white border rounded-lg p-4 sm:p-6 shadow-md">
                      <div className="flex items-center gap-3 mb-5 pb-3 border-b border-gray-100">
                        <div className="flex items-center justify-center h-9 w-9 rounded-full bg-primary/15 shadow-sm">
                          <Sparkles className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-primary/90">Chat with Musk</h3>
                          <p className="text-xs text-muted-foreground">
                            {activeTab === "career" 
                              ? "Ask follow-up questions based on your career profile"
                              : "Ask follow-up questions about your resume analysis"
                            }
                          </p>
                        </div>
                      </div>
                      
                      <div className="space-y-5">
                        {/* Chat messages - fixed height container */}
                        <div className="space-y-4 h-[550px] overflow-y-auto p-5 border border-gray-200 rounded-lg bg-gray-50/20 shadow-inner" id="chat-container">
                          {chatHistory.map((message, index) => (
                            <div 
                              key={index} 
                              className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"} relative mb-3 group w-full`}
                            >
                              {message.sender !== "user" && (
                                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 mr-3 shadow-sm border border-primary/5">
                                  <Sparkles className="h-5 w-5 text-primary"/>
                                </div>
                              )}
                              <div 
                                className={`max-w-[85%] p-4 rounded-lg ${
                                  message.sender === "user" 
                                    ? "bg-primary text-primary-foreground shadow-sm" 
                                    : "bg-white border border-gray-100 shadow-md hover:shadow-lg transition-shadow w-full"
                                }`}
                              >
                                {message.sender === "user" ? (
                                  <p className="text-sm break-words">{message.content}</p>
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
                        <div className="relative mt-3">
                          <div className="border-2 rounded-xl bg-white shadow-md overflow-hidden focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary/60 transition-all">
                            <Textarea
                              value={chatMessage}
                              onChange={(e) => setChatMessage(e.target.value)}
                              placeholder="Ask Musk a follow-up question about your career..."
                              className="resize-none min-h-[90px] pr-14 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none text-sm"
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
                              className={`h-10 w-10 absolute right-3 bottom-3 rounded-full transition-all ${
                                !chatMessage.trim() 
                                  ? 'opacity-60 bg-muted hover:bg-muted' 
                                  : 'bg-primary shadow-md hover:shadow-lg hover:bg-primary/90'
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
                                <Loader2 className="h-5 w-5 animate-spin" />
                              ) : (
                                <Send className="h-5 w-5" />
                              )}
                            </Button>
                          </div>
                          <div className="flex justify-between items-center mt-2">
                            <p className="text-xs text-muted-foreground flex items-center ml-1.5">
                              <Sparkles className="h-3 w-3 mr-1.5 text-primary/70" />
                              Press Enter to send, Shift+Enter for new line
                            </p>
                            <p className="text-xs text-primary/60 font-medium">Powered by AI</p>
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