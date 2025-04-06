import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Loader2, Send, Sparkles, Lightbulb, BookOpen, BarChart, LucideIcon, Bot, UserRound, CheckCircle2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
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

// Simple hash function to generate a hash from a string
// This is used to detect if content has changed between renders
function hashString(str: string): string {
  let hash = 0;
  if (str.length === 0) return hash.toString();
  
  for (let i = 0; i < Math.min(str.length, 1000); i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  return hash.toString();
}

// Component to extract and display resume scores from AI analysis
interface ResumeScoreSummaryProps {
  content: string;
}

// Maintain a cache of scores between renders to ensure consistency
const scoreCache = {
  overall: 0,
  categories: {} as Record<string, number>,
  timestamp: 0,
  contentHash: ""
};

function ResumeScoreSummary({ content }: ResumeScoreSummaryProps) {
  // Check if the content contains an error message about parsing failure
  const isParsingError = content.includes("unable to analyze") || 
                          content.includes("improperly formatted") ||
                          content.includes("incomplete") ||
                          content.includes("cannot extract") ||
                          content.includes("could not process");
  
  // Parse the content to extract score information
  const extractScores = () => {
    // Generate a hash of the content to detect changes
    const contentHash = hashString(content);
    const now = Date.now();
    
    // If we have cached scores and they're from the same content, use them
    // This prevents score fluctuations on the same analysis
    if (scoreCache.timestamp > 0 && contentHash === scoreCache.contentHash && now - scoreCache.timestamp < 300000) {
      console.log("Using cached scores to ensure consistency");
      return {
        scores: { ...scoreCache.categories },
        overallScore: scoreCache.overall,
        hasScores: true
      };
    }
    const scores: { [key: string]: number } = {
      "Structure & Layout": 0,
      "Content Quality": 0,
      "Relevance to Role/Industry": 0,
      "Achievements & Metrics": 0,
      "Soft Skills & Personality": 0,
      "ATS Compatibility": 0
    };
    
    // Define category keywords to look for in the content
    const categoryKeywords = [
      ["structure", "layout"],
      ["content", "quality"],
      ["relevance", "role", "industry"],
      ["achievements", "metrics"],
      ["soft", "skills", "personality"],
      ["ats", "compatibility"]
    ];
    
    // Function to search for scores near category keywords
    const findScoreForCategory = (categoryIndex: number) => {
      const keywords = categoryKeywords[categoryIndex];
      const categoryName = Object.keys(scores)[categoryIndex];
      
      // Try to find paragraph containing these keywords
      const lines = content.split("\n");
      
      // Keep track of lines that match our category so we can search them and nearby lines
      const matchingLineIndices: number[] = [];
      
      // First pass: find all lines containing our keywords
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const containsAllKeywords = keywords.every(keyword => 
          line.toLowerCase().includes(keyword.toLowerCase())
        );
        
        if (containsAllKeywords) {
          matchingLineIndices.push(i);
        }
      }
      
      // Second pass: for each matching line, check it and the next few lines for score patterns
      for (const lineIndex of matchingLineIndices) {
        // Look at this line and the next 5 lines for scores
        for (let i = lineIndex; i < Math.min(lineIndex + 5, lines.length); i++) {
          const line = lines[i];
          
          // Skip section headings with small numbers (like "1. STRUCTURE & LAYOUT")
          if (/^\s*\*?\*?\s*\d+\s*\.\s*[A-Z]/.test(line)) {
            continue;
          }
          
          // More specific score patterns to avoid picking up section numbers
          const scorePatterns = [
            /score\s*:?\s*(\d{1,3})(?:\s*\/\s*100|\s*%)?/i,            // "Score: 85/100" or "score: 85%"
            /rated(?:\s+at)?\s*:?\s*(\d{1,3})(?:\s*\/\s*100|\s*%)?/i,  // "Rated at: 85/100"
            /rating\s*:?\s*(\d{1,3})(?:\s*\/\s*100|\s*%)?/i,           // "Rating: 85/100"
            /(\d{2,3})\s*\/\s*100/,                                    // "85/100" (only 2-3 digit numbers)
            /(\d{2,3})(?:\s*%)/,                                       // "85%" (only 2-3 digit numbers)
            /grade\s*:?\s*(\d{1,3})(?:\s*\/\s*100|\s*%)?/i,            // "Grade: 85/100"
          ];
          
          for (const pattern of scorePatterns) {
            const match = line.match(pattern);
            if (match && match[1]) {
              const score = parseInt(match[1], 10);
              if (!isNaN(score) && score >= 0 && score <= 100) {
                console.log(`Found score for ${categoryName}: ${score} in "${line.trim()}"`);
                return score;
              }
            }
          }
        }
      }
      
      return 0; // No score found
    };
    
    const categoryNames = Object.keys(scores);
    
    // Use the new keyword-based approach to find scores
    let foundScores = 0;
    for (let i = 0; i < categoryNames.length; i++) {
      const score = findScoreForCategory(i);
      if (score > 0) {
        scores[categoryNames[i]] = score;
        foundScores++;
      }
    }
    
    // Try to extract the overall score directly if present
    let overallScore = 0;
    
    // Try multiple patterns to find the overall score, looking for common ways it would be presented
    const overallScorePatterns = [
      /overall(?:\s+score|\s+rating):?\s*(\d{2,3})(?:\s*\/\s*100|\s*%|\/100)?/i, // "Overall Score: 82/100"
      /total(?:\s+score|\s+rating):?\s*(\d{2,3})(?:\s*\/\s*100|\s*%|\/100)?/i,   // "Total Score: 82/100"
      /resume(?:\s+score|\s+rating):?\s*(\d{2,3})(?:\s*\/\s*100|\s*%|\/100)?/i,  // "Resume Score: 82/100"
      /final(?:\s+score|\s+rating):?\s*(\d{2,3})(?:\s*\/\s*100|\s*%|\/100)?/i,   // "Final Score: 82/100"
      /score:?\s*(\d{2,3})(?:\s*\/\s*100|\s*%|\/100)?/i,                        // "Score: 82/100" (on its own line)
      /^.*(?:summary|overall|resume|final).*?(\d{2,3})(?:\s*\/\s*100|\s*%|\/100)/i // Lines containing summary/overall/etc with a score
    ];
    
    // Look for these patterns line by line
    const lines = content.split("\n");
    
    for (const line of lines) {
      if (overallScore > 0) break; // Stop once we find a score
      
      // Skip section heading lines
      if (/^\s*\*?\*?\s*\d+\s*\.\s*[A-Z]/.test(line)) {
        continue;
      }
      
      for (const pattern of overallScorePatterns) {
        const match = line.match(pattern);
        if (match && match[1]) {
          const extractedScore = parseInt(match[1], 10);
          // Only accept scores between 10-100 to avoid picking up section numbers
          if (!isNaN(extractedScore) && extractedScore >= 10 && extractedScore <= 100) {
            overallScore = extractedScore;
            console.log("Found direct overall score:", overallScore, "in:", line.trim());
            break;
          }
        }
      }
    }
    
    // If no overall score was found, calculate from individual scores
    if (overallScore === 0) {
      const validScores = Object.values(scores).filter(score => score > 0);
      overallScore = validScores.length > 0 
        ? Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length) 
        : 0;
    }
    
    // Re-check valid scores to ensure we have the latest data
    const allValidScores = Object.values(scores).filter(score => score > 0);
    const hasScores = allValidScores.length > 0 || overallScore > 0;
    
    // Update the score cache to maintain consistency
    if (hasScores) {
      scoreCache.overall = overallScore;
      scoreCache.categories = {...scores};
      scoreCache.timestamp = Date.now();
      scoreCache.contentHash = contentHash;
      console.log("Updated score cache for future consistency");
    }
    
    return {
      scores,
      overallScore,
      hasScores
    };
  };
  
  const { scores, overallScore, hasScores } = extractScores();
  
  // Don't render if no scores were found and there's a parsing error
  if (!hasScores && isParsingError) return null;
  
  // Get color based on score
  const getScoreColor = (score: number) => {
    if (score >= 85) return 'bg-emerald-500 text-white';
    if (score >= 70) return 'bg-green-500 text-white';
    if (score >= 50) return 'bg-amber-500 text-white';
    return 'bg-rose-500 text-white';
  };
  
  // Get color for progress bar based on score
  const getProgressColor = (score: number) => {
    if (score >= 85) return 'bg-emerald-500';
    if (score >= 70) return 'bg-green-500';
    if (score >= 50) return 'bg-amber-500';
    return 'bg-rose-500';
  };
  
  // Get description for overall score
  const getScoreDescription = (score: number) => {
    if (score >= 85) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 50) return 'Average';
    return 'Needs Improvement';
  };
  
  return (
    <div className="border border-border rounded-lg p-5 bg-card shadow-sm">
      {/* Large centered overall score display */}
      <div className="text-center mb-6">
        <h3 className="font-medium text-lg mb-3">Resume Overall Score</h3>
        <div className="flex flex-col items-center">
          <div className={`flex items-center justify-center ${getScoreColor(overallScore)} rounded-full w-28 h-28 mb-3 transition-all duration-300 shadow-md`}>
            <div className="text-center">
              <span className="text-4xl font-bold">{overallScore}</span>
              <span className="text-sm font-medium block">/100</span>
            </div>
          </div>
          <div className="text-sm font-medium text-center text-muted-foreground">
            {getScoreDescription(overallScore)}
          </div>
        </div>
        <div className="text-xs text-muted-foreground mt-2">Based on 6 key resume evaluation factors</div>
      </div>
      
      {/* Score breakdown heading */}
      <div className="flex items-center mb-4">
        <h3 className="font-semibold text-base">Score Breakdown</h3>
      </div>
      
      {/* Individual category scores with enhanced visuals */}
      <div className="space-y-4">
        {Object.entries(scores).map(([category, score], index) => (
          <div key={index} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="font-medium">{category}</span>
              <span className={`font-semibold px-2 py-0.5 rounded-full text-xs ${getScoreColor(score)}`}>{score}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2.5 dark:bg-gray-700">
              <div 
                className={`h-2.5 rounded-full ${getProgressColor(score)}`} 
                style={{ width: `${score}%`, transition: 'width 1s ease-in-out' }}
              ></div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-5 text-xs text-muted-foreground bg-muted/30 p-2 rounded-md">
        <div className="flex items-center gap-1">
          <CheckCircle2 className="h-3 w-3 text-primary" />
          <span>Scoring based on AI analysis of resume content</span>
        </div>
      </div>
    </div>
  );
}

export default function AICareerPage() {
  // Hooks
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [_, setLocation] = useLocation();
  
  // Form states
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
    mutationFn: async (data: { fileData: string; userId: number }) => {
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
  
  // Clear resume analysis mutation
  const clearResumeAnalysisMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) {
        throw new Error("User ID not found");
      }
      
      // Delete all resume analysis messages for this user
      const res = await apiRequest("POST", "/api/chat-messages", {
        userId: user.id,
        content: "Resume analysis was cleared by the user",
        messageType: "system_notification",
        sender: "system",
        clearExistingType: "resume_analysis" // This is a special flag for the server to clear messages of this type
      });
      return res.json();
    },
    onSuccess: () => {
      // Reset the score cache when clearing the analysis to avoid showing stale data
      scoreCache.overall = 0;
      scoreCache.categories = {};
      scoreCache.timestamp = 0;
      scoreCache.contentHash = "";
      
      toast({
        title: "Resume analysis cleared",
        description: "Your resume analysis has been cleared."
      });
      
      if (user?.id) {
        queryClient.invalidateQueries({
          queryKey: ["/api/users", user.id, "chat-messages"]
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error clearing resume analysis",
        description: "Failed to clear resume analysis. Please try again.",
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
                    // Update active tab
                    setActiveTab(value);
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
                        Get AI-powered resume analysis with improvement suggestions by Musk.
                        Upload your resume file to get started.
                      </p>
                      
                      {/* File Upload Section */}
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-primary transition-colors">
                        <div className="flex flex-col items-center">
                          <p className="text-sm text-gray-500 mb-2">Upload Resume File</p>
                          <p className="text-xs text-gray-400 mb-3">Supported formats: PDF, DOCX (Max 5MB)</p>
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
                                    toast({
                                      title: "Processing resume",
                                      description: "Your resume is being analyzed. This may take up to 30 seconds.",
                                    });
                                    
                                    // Add a timeout to prevent UI from being stuck if the request takes too long
                                    const timeoutMs = 65000; // 65 seconds - slightly higher than server-side timeout of 60 seconds
                                    const timeoutPromise = new Promise((_, reject) => {
                                      setTimeout(() => {
                                        reject(new Error("Request timed out. Please try again later."));
                                      }, timeoutMs);
                                    });
                                    
                                    // Create the main request promise
                                    const analysisPromise = resumeAnalysisMutation.mutateAsync({ 
                                      fileData: base64Data, 
                                      userId: user.id 
                                    } as any);
                                    
                                    // Use Promise.race to handle potential timeouts
                                    await Promise.race([analysisPromise, timeoutPromise]).catch(error => {
                                      if (error.message?.includes("timed out")) {
                                        // For timeout errors, update the toast with a more helpful message
                                        toast({
                                          title: "Process taking longer than expected",
                                          description: "The analysis is taking longer than anticipated. Please try again later.",
                                          variant: "destructive",
                                          duration: 6000
                                        });
                                        
                                        // Abort the mutation if it's still pending
                                        if (resumeAnalysisMutation.isPending) {
                                          // We can't actually abort the API request, but we can set UI state correctly
                                          console.log("Resume analysis request timed out");
                                        }
                                        
                                        throw error;
                                      }
                                      throw error;
                                    });
                                    
                                  } catch (error) {
                                    console.error('Error analyzing resume file:', error);
                                    toast({
                                      title: "Analysis failed",
                                      description: "We couldn't analyze your resume. Please try again later.",
                                      variant: "destructive",
                                      duration: 5000
                                    });
                                  }
                                };
                                
                                fileReader.onerror = () => {
                                  toast({
                                    title: "Upload failed",
                                    description: "Failed to read file. Please try again with a different file.",
                                    variant: "destructive"
                                  });
                                };
                              }
                            }}
                          />
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
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">
                                  {formatTimestamp(message.timestamp)}
                                </span>
                                
                                {/* Clear button for resume analysis */}
                                {message.messageType === "resume_analysis" && (
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => clearResumeAnalysisMutation.mutate()}
                                    disabled={clearResumeAnalysisMutation.isPending}
                                    className="border-red-300 hover:bg-red-50 hover:text-red-600 text-red-500 flex items-center gap-1 h-7 text-xs px-2"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" 
                                      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                      <path d="M3 6h18"></path>
                                      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                                      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                                    </svg>
                                    Clear
                                    {clearResumeAnalysisMutation.isPending && (
                                      <Loader2 className="ml-1 h-3 w-3 animate-spin" />
                                    )}
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          {message.messageType === "resume_analysis" && (
                            <div className="mb-6">
                              <ResumeScoreSummary content={message.content} />
                            </div>
                          )}
                          
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