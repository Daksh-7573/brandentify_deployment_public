import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Loader2, Send, Sparkles, Lightbulb, BookOpen, BarChart, LucideIcon } from "lucide-react";
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
  
  // Fetch existing chat messages for the user
  const { data: chatMessages, isLoading: messagesLoading } = useQuery({
    queryKey: ["/api/users", user?.id, "chat-messages"],
    queryFn: async () => {
      if (!user?.id) return [];
      const res = await apiRequest(
        "GET",
        `/api/users/${user.id}/chat-messages`
      );
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
      const res = await apiRequest("POST", "/api/chat-messages", {
        userId: user.id,
        content: message,
        messageType: "career_advice",
        sender: "user"
      });
      return res.json();
    },
    onSuccess: (data) => {
      // Add AI response to chat history
      setTimeout(() => {
        setChatHistory(prev => [...prev, {
          content: data.aiResponse || "I'm analyzing your question. Let me think about this based on your profile and career goals.",
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
      const res = await apiRequest("POST", "/api/ai/career-advice", {
        userId: user.id,
        adviceType: careerAdviceType,
        customAdviceText: showCustomTextInput ? customAdviceText : undefined
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
      
      // Add AI's initial message to chat history
      setChatHistory(prev => [...prev, {
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
    mutationFn: async (data: { resumeText?: string; fileData?: string; userId: number }) => {
      const res = await apiRequest("POST", "/api/ai/analyze-resume", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Resume analysis complete",
        description: "Your resume has been analyzed."
      });
      
      if (user?.id) {
        queryClient.invalidateQueries({
          queryKey: ["/api/users", user.id, "chat-messages"]
        });
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
    
    // For resume analysis, only show the most recent one
    if (messageType === "resume_analysis") {
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
                        Generate personalized career advice based on your profile. 
                        We'll analyze your work experience, skills, and education to provide tailored recommendations.
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
                              <SelectItem value="expand_network">Expand My Professional Network</SelectItem>
                              <SelectItem value="find_job">Find a Job</SelectItem>
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
                          onClick={() => careerAdviceMutation.mutate()}
                          disabled={
                            careerAdviceMutation.isPending || 
                            !careerAdviceType || 
                            (careerAdviceType === "custom" && !customAdviceText.trim())
                          }
                        >
                          {careerAdviceMutation.isPending && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          )}
                          Generate Career Advice
                        </Button>
                      </div>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="resume" className="mt-2">
                    <Card className="p-4 sm:p-6">
                      <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Resume Analysis</h2>
                      <p className="text-sm text-muted-foreground mb-4">
                        Upload your resume file to get AI-powered analysis with suggestions for improvement by Musk.
                      </p>
                      
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
                            {resumeAnalysisMutation.isPending && (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Upload Resume
                          </Button>
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
                  
                  if (filteredMessages.length === 0) {
                    return (
                      <div className="text-center py-10 sm:py-14 border rounded-lg bg-muted/10 flex flex-col items-center">
                        {activeTab === "career" ? (
                          <div className="bg-primary/10 rounded-full p-3 mb-4">
                            <BarChart className="h-7 w-7 text-primary" />
                          </div>
                        ) : (
                          <div className="bg-primary/10 rounded-full p-3 mb-4">
                            <BookOpen className="h-7 w-7 text-primary" />
                          </div>
                        )}
                        <h3 className="text-base sm:text-lg font-medium">No AI insights yet</h3>
                        <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
                          {activeTab === "career" ? 
                            "Generate career advice to see personalized insights here based on your profile and career goals." :
                            "Upload your resume to get AI-powered analysis and improvement suggestions."}
                        </p>
                        <div className="mt-6">
                          <Button 
                            size="sm"
                            variant="outline"
                            className="flex items-center gap-2"
                            onClick={() => {
                              if (activeTab === "resume") {
                                document.getElementById('resume-file-input')?.click();
                              }
                            }}
                          >
                            <Sparkles className="h-4 w-4" />
                            {activeTab === "career" ? "Select advice type above" : "Upload your resume"}
                          </Button>
                        </div>
                      </div>
                    );
                  }
                  
                  // Only show card-style messages if:
                  // 1. We're on the resume tab, OR
                  // 2. We're on the career tab but the chat window isn't shown
                  if (activeTab === "resume" || (activeTab === "career" && !showChatWindow)) {
                    // If we're on the resume tab, only show the most recent analysis
                    const messagesToShow = activeTab === "resume" 
                      ? [filteredMessages[0]] // Only the first/most recent resume analysis
                      : filteredMessages;     // All career advice messages
                    
                    return (
                      <div className="space-y-4 sm:space-y-6">
                        {messagesToShow.map((message: any) => (
                          <Card key={message.id} className="p-4 sm:p-6 overflow-hidden border border-gray-100 shadow-md">
                            <div className="flex justify-between items-start mb-3 sm:mb-4">
                              <div className="flex items-center gap-2">
                                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10">
                                  <Sparkles className="h-4 w-4 text-primary" />
                                </div>
                                <div>
                                  <h4 className="font-medium text-sm">Musk AI Assistant</h4>
                                  <p className="text-xs text-muted-foreground">
                                    {formatTimestamp(message.timestamp)}
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div className="prose prose-sm dark:prose-invert max-w-none overflow-x-auto mt-2">
                              {message.content.split('\n').map((line: string, i: number) => {
                                // For main headings
                                if (line.trim().match(/^#+\s/)) {
                                  const level = line.trim().match(/^(#+)\s/)?.[1].length || 1;
                                  const text = line.replace(/^#+\s/, '');
                                  return (
                                    <div key={i} className={`font-bold ${level === 1 ? 'text-lg text-primary pb-1 border-b mt-3 mb-2' : 'text-base mt-3 mb-1'}`}>
                                      {text}
                                    </div>
                                  );
                                } 
                                // For bullet points
                                else if (line.trim().startsWith('- ')) {
                                  return (
                                    <div key={i} className="flex items-start my-1 ml-1">
                                      <div className="flex items-center justify-center min-w-[18px] h-[18px] rounded-full bg-primary/10 text-primary mr-2 mt-0.5">
                                        <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                                      </div>
                                      <p className="m-0">{line.replace(/^- /, '')}</p>
                                    </div>
                                  );
                                } 
                                // For empty lines
                                else if (line.trim() === '') {
                                  return <div key={i} className="my-2"></div>;
                                } 
                                // For normal text
                                else {
                                  return <p key={i} className="my-1.5 leading-relaxed">{line}</p>;
                                }
                              })}
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
                {showChatWindow && activeTab === "career" && (
                  <div className="mt-6">
                    <div className="bg-gray-50 border rounded-lg p-4 sm:p-5">
                      <div className="flex items-center gap-2 mb-4">
                        <Sparkles className="h-5 w-5 text-primary" />
                        <h3 className="text-lg font-medium">Ask Follow-up Questions</h3>
                      </div>
                      
                      <div className="space-y-4">
                        {/* Chat messages - fixed height container */}
                        <div className="space-y-3 h-[400px] overflow-y-auto p-4 border border-gray-100 rounded-lg bg-gray-50/30 shadow-inner" id="chat-container">
                          {chatHistory.map((message, index) => (
                            <div 
                              key={index} 
                              className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"} mb-3`}
                            >
                              {message.sender !== "user" && (
                                <div className="flex items-center justify-center w-9 h-9 rounded-full bg-primary/15 mr-2.5 shadow-sm">
                                  <Sparkles className="h-4.5 w-4.5 text-primary"/>
                                </div>
                              )}
                              <div 
                                className={`max-w-[85%] p-3.5 rounded-lg ${
                                  message.sender === "user" 
                                    ? "bg-primary text-primary-foreground shadow-sm" 
                                    : "bg-white border border-gray-100 shadow-md"
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
                                          <div key={i} className="mt-4 pt-3 border-t border-gray-200 text-sm text-primary/80 font-medium flex items-center">
                                            <Sparkles className="h-4 w-4 mr-2" />
                                            {line}
                                          </div>
                                        );
                                      }
                                      // For main headings (# Title)
                                      else if (line.startsWith('# ')) {
                                        return (
                                          <div key={i} className="flex items-center gap-2 text-lg font-bold text-primary mt-5 mb-3 pb-2 border-b">
                                            <BookOpen className="h-4 w-4 text-primary/80" />
                                            <span>{line.replace(/^# /, '')}</span>
                                          </div>
                                        );
                                      }
                                      // For secondary headings (## Subtitle)
                                      else if (line.startsWith('## ')) {
                                        return (
                                          <div key={i} className="flex items-center gap-2 text-base font-semibold mt-4 mb-2 text-foreground/90">
                                            <Lightbulb className="h-3.5 w-3.5 text-primary/80" />
                                            <span>{line.replace(/^## /, '')}</span>
                                          </div>
                                        );
                                      }
                                      // For numbered list items (1. Item, 2. Item, etc.)
                                      else if (/^\d+\.\s/.test(line)) {
                                        // Safe extraction of the number with proper null check
                                        const matchResult = line.match(/^\d+/);
                                        const number = matchResult && matchResult[0] ? matchResult[0] : "•";
                                        const text = line.replace(/^\d+\.\s/, '');
                                        return (
                                          <div key={i} className="flex items-start my-1.5 pl-1">
                                            <div className="flex items-center justify-center min-w-[22px] h-[22px] rounded-full bg-primary/10 text-primary text-xs font-medium mr-2">
                                              {number}
                                            </div>
                                            <p className="m-0 mt-0.5">{text}</p>
                                          </div>
                                        );
                                      }
                                      // For bullet points (- Item)
                                      else if (line.startsWith('- ')) {
                                        return (
                                          <div key={i} className="flex items-start my-1.5 pl-1">
                                            <div className="flex items-center justify-center min-w-[18px] h-[18px] rounded-full bg-primary/10 text-primary mr-2 mt-0.5">
                                              <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                                            </div>
                                            <p className="m-0">{line.replace(/^- /, '')}</p>
                                          </div>
                                        );
                                      }
                                      // For italic text (*text*)
                                      else if (line.startsWith('*') && line.endsWith('*')) {
                                        return (
                                          <p key={i} className="my-1.5 italic text-muted-foreground pl-1">
                                            {line.replace(/^\*|\*$/g, '')}
                                          </p>
                                        );
                                      }
                                      // For empty lines - add spacing
                                      else if (line.trim() === '') {
                                        return <div key={i} className="my-2"></div>;
                                      }
                                      // For normal text
                                      else {
                                        return <p key={i} className="my-1.5 leading-relaxed">{line}</p>;
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
                        <div className="relative mt-2">
                          <div className="border rounded-lg bg-white shadow-sm overflow-hidden focus-within:ring-1 focus-within:ring-primary/50">
                            <Textarea
                              value={chatMessage}
                              onChange={(e) => setChatMessage(e.target.value)}
                              placeholder="Ask Musk a follow-up question about your career..."
                              className="resize-none min-h-[80px] pr-14 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none"
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
                              className={`h-9 w-9 absolute right-3 bottom-3 rounded-full transition-all ${!chatMessage.trim() ? 'opacity-70' : 'shadow-sm'}`}
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
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Send className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1.5 ml-1.5 flex items-center">
                            <Sparkles className="h-3 w-3 mr-1 text-primary/70" />
                            Press Enter to send, Shift+Enter for new line
                          </p>
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