import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Loader2, Send, Sparkles, Lightbulb, BookOpen, BarChart, LucideIcon, Bot, UserRound } from "lucide-react";
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
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';

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
    onError: (error: any) => {
      const isApiKeyMissing = error.message?.includes("API key");
      const isTokenLimitError = error.response?.status === 413 || 
                               (error.response?.data?.error === "TOKEN_LIMIT_EXCEEDED");
      
      toast({
        title: "Error analyzing resume",
        description: isApiKeyMissing 
          ? "OpenAI API key is missing. Please check your environment variables."
          : isTokenLimitError
            ? "Your resume is too large for our AI analysis. Please try with a shorter text (2500 characters or less)."
            : "Failed to analyze resume. Please try again later.",
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
                                    if (!user?.id) {
                                      throw new Error("User ID not found");
                                    }
                                    
                                    // Set loading state
                                    resumeAnalysisMutation.mutate({ 
                                      fileData: base64Data, 
                                      userId: user.id 
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
                          <p className="text-sm text-gray-500 mb-2">Option 1: Upload your resume file</p>
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
                          
                          <div className="w-full mt-6 pt-6 border-t border-gray-200">
                            <p className="text-sm text-gray-500 mb-3 text-center">
                              Option 2: Paste your resume text directly
                            </p>
                            <p className="text-xs text-gray-400 mb-3 text-center">
                              Use this option if file upload doesn't work properly
                            </p>
                            <Textarea
                              value={resumeText}
                              onChange={(e) => setResumeText(e.target.value)}
                              placeholder="Paste your resume content here..."
                              className="w-full min-h-[200px] mb-3"
                            />
                            <div className="flex justify-center">
                              <Button
                                disabled={!resumeText.trim() || resumeAnalysisMutation.isPending}
                                onClick={() => {
                                  if (!user?.id) {
                                    toast({
                                      title: "User not found",
                                      description: "Please log in to analyze your resume.",
                                      variant: "destructive"
                                    });
                                    return;
                                  }
                                  
                                  if (!resumeText.trim()) {
                                    toast({
                                      title: "Empty input",
                                      description: "Please paste your resume content before analyzing.",
                                      variant: "destructive"
                                    });
                                    return;
                                  }
                                  
                                  resumeAnalysisMutation.mutate({
                                    resumeText: resumeText.trim(),
                                    userId: user.id
                                  });
                                  
                                  toast({
                                    title: "Processing resume",
                                    description: "Your resume is being analyzed. This may take a moment."
                                  });
                                }}
                              >
                                {resumeAnalysisMutation.isPending && (
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                Analyze Text
                              </Button>
                            </div>
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
                  
                  if (filteredMessages.length === 0) {
                    return (
                      <div className="text-center py-10 sm:py-14 border rounded-lg bg-muted/10 flex flex-col items-center">
                        {activeTab === "career" ? (
                          <>
                            <BarChart className="h-10 w-10 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-medium mb-2">No Career Insights Yet</h3>
                            <p className="text-sm text-muted-foreground max-w-md">
                              Use the career advice tool to get personalized insights based on your profile and career goals.
                            </p>
                          </>
                        ) : (
                          <>
                            <BookOpen className="h-10 w-10 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-medium mb-2">No Resume Analysis Yet</h3>
                            <p className="text-sm text-muted-foreground max-w-md">
                              Upload your resume to get AI-powered analysis with suggestions for improvements.
                            </p>
                          </>
                        )}
                      </div>
                    );
                  }
                  
                  // Display messages
                  return (
                    <div className="space-y-4">
                      {filteredMessages.map((message: any, index: number) => (
                        <Card key={index} className="p-4 sm:p-6">
                          <div className="flex items-center gap-2 mb-3">
                            <Sparkles className="h-5 w-5 text-primary" />
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full">
                              <h3 className="font-medium">{getMessageTypeLabel(message.messageType)}</h3>
                              <span className="text-xs text-muted-foreground">
                                {formatTimestamp(message.timestamp)}
                              </span>
                            </div>
                          </div>
                          
                          <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:font-medium 
                                        prose-headings:text-foreground prose-strong:font-semibold prose-strong:text-foreground
                                        prose-code:text-muted-foreground prose-code:font-mono prose-code:bg-muted
                                        prose-code:rounded prose-code:px-1 prose-code:py-0.5 prose-code:text-sm">
                            <div className="break-words">
                              <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                rehypePlugins={[rehypeRaw]}
                              >
                                {message.content}
                              </ReactMarkdown>
                            </div>
                          </div>
                        </Card>
                      ))}
                      
                      {/* Chat interface for Career Advice */}
                      {activeTab === "career" && showChatWindow && (
                        <div className="mt-6 border rounded-lg overflow-hidden">
                          <div className="bg-muted/25 p-3 border-b">
                            <div className="flex items-center gap-2">
                              <Bot className="h-5 w-5 text-primary" />
                              <span className="font-medium">Chat with Musk</span>
                            </div>
                          </div>
                          
                          <div 
                            id="chat-container"
                            className="bg-background h-96 overflow-y-auto p-4 space-y-4"
                          >
                            {chatHistory.map((message, index) => (
                              <div 
                                key={index} 
                                className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"} mb-3`}
                              >
                                {message.sender !== "user" && (
                                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 mr-2">
                                    <Bot className="h-4 w-4 text-primary" />
                                  </div>
                                )}
                                
                                <div 
                                  className={`px-4 py-2 rounded-lg max-w-[75%] ${
                                    message.sender === "user" 
                                      ? "bg-primary text-primary-foreground ml-2" 
                                      : "bg-muted"
                                  }`}
                                >
                                  {message.sender === "user" ? (
                                    <p>{message.content}</p>
                                  ) : (
                                    <div className="break-words prose-sm max-w-none prose-p:mb-1 prose-p:mt-1">
                                      <ReactMarkdown
                                        remarkPlugins={[remarkGfm]}
                                        rehypePlugins={[rehypeRaw]}
                                      >
                                        {message.content}
                                      </ReactMarkdown>
                                    </div>
                                  )}
                                  <div className="text-xs opacity-70 mt-1 text-right">
                                    {message.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                  </div>
                                </div>
                                
                                {message.sender === "user" && (
                                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 ml-2">
                                    <UserRound className="h-4 w-4 text-primary" />
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                          
                          <div className="p-3 border-t bg-muted/20">
                            <form 
                              className="flex items-end gap-2"
                              onSubmit={(e) => {
                                e.preventDefault();
                                if (!chatMessage.trim()) return;
                                
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
                              }}
                            >
                              <Textarea
                                value={chatMessage}
                                onChange={(e) => setChatMessage(e.target.value)}
                                placeholder="Ask a follow-up question..."
                                className="min-h-[80px] flex-1 resize-none"
                              />
                              <Button 
                                type="submit" 
                                size="icon" 
                                className="h-10 w-10"
                                disabled={!chatMessage.trim() || chatMessageMutation.isPending}
                              >
                                {chatMessageMutation.isPending ? 
                                  <Loader2 className="h-4 w-4 animate-spin" /> : 
                                  <Send className="h-4 w-4" />
                                }
                              </Button>
                            </form>
                          </div>
                        </div>
                      )}
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