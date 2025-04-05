import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Loader2, Send } from "lucide-react";
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
  const [resumeText, setResumeText] = useState(""); // Add this back for file upload
  const [activeTab, setActiveTab] = useState("career");
  
  // Chat message mutation
  const chatMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      const res = await apiRequest("POST", "/api/chat-messages", {
        userId: DEMO_USER_ID,
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
      
      queryClient.invalidateQueries({
        queryKey: ["/api/users", DEMO_USER_ID, "chat-messages"]
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error sending message",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    }
  });
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

  // State for career advice options
  const [careerAdviceType, setCareerAdviceType] = useState<string>("");
  const [customAdviceText, setCustomAdviceText] = useState<string>("");
  const [showCustomTextInput, setShowCustomTextInput] = useState<boolean>(false);
  const [showChatWindow, setShowChatWindow] = useState<boolean>(false);
  const [chatMessage, setChatMessage] = useState<string>("");
  const [chatHistory, setChatHistory] = useState<Array<{content: string, sender: "user" | "musk", timestamp: Date}>>([]);

  // Career advice mutation
  const careerAdviceMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/ai/career-advice", {
        userId: DEMO_USER_ID,
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
      queryClient.invalidateQueries({
        queryKey: ["/api/users", DEMO_USER_ID, "chat-messages"]
      });
      
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

  // We've removed the networking recommendations mutation

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
                <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">
                  {activeTab === "career" ? "Your Career Insights" : "Your Resume Analysis"}
                </h2>
                
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
                      <div className="text-center py-8 sm:py-12 border rounded-lg bg-muted/10">
                        <h3 className="text-base sm:text-lg font-medium">No AI insights yet</h3>
                        <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
                          {activeTab === "career" ? "Generate career advice to see insights here." :
                           "Analyze your resume to see insights here."}
                        </p>
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
                          <Card key={message.id} className="p-4 sm:p-6 overflow-hidden">
                            <div className="flex justify-between items-start mb-3 sm:mb-4">
                              <div>
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
                  }
                  
                  // If we're on career tab with chat window shown, don't display the cards
                  return null;
                })()}
                
                {/* Chat Interface with Musk */}
                {showChatWindow && activeTab === "career" && (
                  <div className="mt-6">
                    <div className="bg-gray-50 border rounded-lg p-4">
                      <h3 className="text-lg font-medium mb-4">Ask Follow-up Questions</h3>
                      
                      <div className="space-y-4">
                        {/* Chat messages - fixed height container */}
                        <div className="space-y-3 h-[300px] overflow-y-auto p-2 border border-gray-100 rounded-lg" id="chat-container">
                          {chatHistory.map((message, index) => (
                            <div 
                              key={index} 
                              className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                            >
                              <div 
                                className={`max-w-[80%] p-3 rounded-lg ${
                                  message.sender === "user" 
                                    ? "bg-primary text-primary-foreground" 
                                    : "bg-muted"
                                }`}
                              >
                                {message.sender === "user" ? (
                                  <p className="text-sm break-words">{message.content}</p>
                                ) : (
                                  <div className="prose prose-sm dark:prose-invert max-w-none">
                                    {message.content.split('\n').map((line, i) => (
                                      <p 
                                        key={i} 
                                        className={line.trim() === '' ? 'my-2' : 
                                                  line.startsWith('##') ? 'font-bold text-base mt-3 mb-2' :
                                                  line.startsWith('#') ? 'font-bold text-lg mt-4 mb-2' :
                                                  line.startsWith('*') && line.endsWith('*') ? 'italic' :
                                                  line.startsWith('- ') ? 'ml-2' : ''}
                                      >
                                        {/* Remove markdown characters for display */}
                                        {line.startsWith('#') ? line.replace(/^#+\s/, '') :
                                         line.startsWith('*') && line.endsWith('*') ? line.replace(/^\*|\*$/g, '') :
                                         line}
                                      </p>
                                    ))}
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
                        <div className="flex items-end gap-2">
                          <div className="flex-1">
                            <Textarea
                              value={chatMessage}
                              onChange={(e) => setChatMessage(e.target.value)}
                              placeholder="Ask Musk a follow-up question about your career..."
                              className="resize-none min-h-[80px]"
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
                            <p className="text-xs text-muted-foreground mt-1">
                              Press Enter to send, Shift+Enter for new line
                            </p>
                          </div>
                          <Button 
                            size="icon" 
                            className="h-10 w-10"
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