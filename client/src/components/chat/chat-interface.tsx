import { useState, useRef, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

type Message = {
  id: string;
  message: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  quickResponses?: string[]; // Quick response options extracted from AI messages
};

type CareerGoal = {
  value: string;
  label: string;
  prompt: string;
};

// Define career goals for the dropdown
const CAREER_GOALS: CareerGoal[] = [
  { 
    value: "boost_career", 
    label: "📈 Boost My Career", 
    prompt: "What are the best strategies to boost my career right now?"
  },
  { 
    value: "career_change", 
    label: "💼 Career Change / Switch Industry", 
    prompt: "How can I successfully transition to a new industry or role?"
  },
  { 
    value: "get_promotion", 
    label: "🚀 Get a Promotion", 
    prompt: "What strategies should I use to get promoted to the next level?"
  },
  { 
    value: "international_jobs", 
    label: "🌍 Find International Job Opportunities", 
    prompt: "How can I find and secure international job opportunities in my field?"
  },
  { 
    value: "profile_visibility", 
    label: "🔥 Boost My Profile Visibility", 
    prompt: "What are the best ways to increase my professional visibility online?"
  },
  { 
    value: "thought_leadership", 
    label: "🎤 Become a Thought Leader in My Industry", 
    prompt: "How can I establish myself as a thought leader in my industry?"
  },
  { 
    value: "personal_brand", 
    label: "📝 Publish Articles & Build Personal Brand", 
    prompt: "What's the most effective way to publish content and build my personal brand?"
  },
  { 
    value: "expand_network", 
    label: "🤝 Expand My Professional Network", 
    prompt: "What are the most effective strategies for expanding my professional network?"
  },
  { 
    value: "launch_startup", 
    label: "🚀 Launch My Startup", 
    prompt: "What should I focus on when launching a startup in my industry?"
  },
  { 
    value: "scale_business", 
    label: "🏗 Scale My Business", 
    prompt: "What are the key strategies for scaling my business to the next level?"
  },
  { 
    value: "learn_skills", 
    label: "🎓 Learn New Skills", 
    prompt: "What new skills should I focus on learning for career advancement?"
  },
  { 
    value: "certifications", 
    label: "🏆 Get Industry Certifications", 
    prompt: "Which industry certifications would be most valuable for my career progression?"
  },
  { 
    value: "upskill", 
    label: "🛠 Upskill for a Better Job", 
    prompt: "What specific skills should I develop to qualify for a better position?"
  },
  { 
    value: "become_consultant", 
    label: "📊 Become a Consultant / Advisor", 
    prompt: "How can I transition into consulting or advisory roles in my field?"
  }
];

type ChatInterfaceProps = {
  initialQuestion?: string;
};

export default function ChatInterface({ initialQuestion }: ChatInterfaceProps = {}) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      message: `Hi ${user?.name?.split(' ')[0] || 'there'}! I'm Musk, your AI career advisor. 👋\n\nI can help with career strategy, skill development, and professional growth tailored to your profile. Select one of the goals from the dropdown below to get started with specific advice, or type your own question!`,
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  // Using a ref for tracking if the initial question has been processed
  const initialQuestionProcessed = useRef(false);

  // Function to extract quick response options from AI messages
  const extractQuickResponses = (message: string): string[] | undefined => {
    try {
      console.log("Checking message for quick response options...");
      
      // Less strict check for follow-up sections
      const hasFollowUp = message.includes("## Let me ask you a follow-up question:") ||
                          message.includes("let me ask you a follow-up question") ||
                          message.includes("follow-up question");
                          
      if (!hasFollowUp) {
        console.log("No follow-up question section detected");
        return undefined;
      }
      
      // Look for Quick Response Options section
      const hasQuickOptions = message.includes("**Quick Response Options:**") || 
                               message.includes("Quick Response Options:");
      
      if (!hasQuickOptions) {
        console.log("No quick response options section detected");
        return undefined;
      }
      
      // Extract response options (looking for lines with bullet points)
      const bulletPointLines = message.split('\n')
        .filter(line => line.trim().startsWith('- '))
        .map(line => line.trim().substring(2).trim());
      
      console.log("Found bullet points:", bulletPointLines);
      
      if (bulletPointLines.length === 0) {
        return undefined;
      }
      
      // Process the options (removing brackets and formatting)
      const cleanOptions = bulletPointLines.map(option => {
        // Clean up the option text
        let cleanOption = option
          .replace(/^\[|\]$/g, '') // Remove surrounding brackets
          .replace(/^.*?:/, '').trim(); // Remove any prefix before colon
        
        // Special case for the "tell me more" option
        if (option.toLowerCase().includes("tell me more")) {
          return "Tell me more about something else";
        }
        
        return cleanOption;
      });
      
      console.log("Extracted clean options:", cleanOptions);
      
      // If we don't have the "Tell me more" option, add it
      if (!cleanOptions.some(opt => opt === "Tell me more about something else")) {
        cleanOptions.push("Tell me more about something else");
      }
      
      return cleanOptions;
    } catch (error) {
      console.error("Error extracting quick responses:", error);
      
      // Fallback with default options
      console.log("Using fallback quick response options");
      return [
        "Yes, that's helpful",
        "I need more specific advice",
        "What about alternatives?",
        "Tell me more about something else"
      ];
    }
  };
  
  // Modify the message to emphasize the follow-up question and remove response options
  const processMessage = (message: string): string => {
    try {
      // Try to find any follow-up section
      if (message.includes("## Let me ask you a follow-up question:")) {
        // Standard format found, split it cleanly
        const [mainContent, questionSection] = message.split("## Let me ask you a follow-up question:");
        
        // If we have Quick Response Options, remove them
        if (questionSection.includes("**Quick Response Options:**")) {
          const [question, _] = questionSection.split("**Quick Response Options:**");
          return `${mainContent}\n\n## Let me ask you a follow-up question:${question}`;
        } else {
          // Just keep the question part
          return `${mainContent}\n\n## Let me ask you a follow-up question:${questionSection.split("\n\n")[0]}`;
        }
      } 
      
      // Look for other possible follow-up formats
      else if (message.includes("follow-up question")) {
        // Split the message at the options if present
        if (message.includes("Quick Response Options")) {
          return message.split("Quick Response Options")[0];
        }
        
        // Look for bullet points that might indicate options
        const lines = message.split("\n");
        let bulletPointIndex = -1;
        
        // Find the first bullet point after "follow-up"
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].includes("follow-up question") && i < lines.length - 1) {
            // Look ahead for bullet points
            for (let j = i + 1; j < lines.length; j++) {
              if (lines[j].trim().startsWith("- ")) {
                bulletPointIndex = j;
                break;
              }
            }
            break;
          }
        }
        
        // If we found bullet points, remove them and all subsequent lines
        if (bulletPointIndex > 0) {
          return lines.slice(0, bulletPointIndex).join("\n");
        }
      }
      
      // No follow-up sections found or no modifications needed
      return message;
    } catch (error) {
      console.error("Error processing message:", error);
      return message;
    }
  };

  const handleQuickResponse = (response: string) => {
    if (response === "Tell me more about something else") {
      // Just focus the input field for a new question
      setInputMessage("");
      document.querySelector("input")?.focus();
    } else {
      // Submit the quick response
      setInputMessage(response);
      
      // Use a timeout to ensure the state update has completed
      setTimeout(() => {
        const submitEvent = new Event('submit', { cancelable: true }) as unknown as React.FormEvent;
        submitEvent.preventDefault = () => {}; // Mock preventDefault
        handleSubmit(submitEvent);
      }, 100);
    }
  };

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputMessage.trim()) return;
    
    const userId = 1; // This would ideally come from authenticated user
    const userMessage: Message = {
      id: Date.now().toString(),
      message: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    
    try {
      const response = await apiRequest('POST', '/api/chat-messages', {
        userId,
        message: inputMessage,
        sender: 'user',
        careerGoal: selectedGoal || undefined
      });
      
      const data = await response.json();
      
      if (data.aiMessage) {
        console.log("Raw AI response:", data.aiMessage.message);
        
        // Always generate follow-up options, even if AI didn't provide them
        // This ensures we always have a two-way conversation experience
        let quickResponses: string[] = [];
        
        // First try to extract options from AI's message
        const extractedResponses = extractQuickResponses(data.aiMessage.message);
        console.log("Extracted quick responses:", extractedResponses);
        
        if (extractedResponses && extractedResponses.length > 0) {
          // Use AI provided responses if available
          quickResponses = extractedResponses;
        } else {
          // Generate context-aware fallback options based on the career goal
          console.log("Using fallback response options for goal:", selectedGoal);
          
          if (selectedGoal === 'career-change') {
            quickResponses = [
              "Which industries are best?",
              "Skills I need to transfer",
              "Resume advice for career change",
              "Tell me more about something else"
            ];
          } else if (selectedGoal === 'promotion') {
            quickResponses = [
              "How to approach my boss",
              "Skills to demonstrate",
              "Timeline for promotion",
              "Tell me more about something else"
            ];
          } else if (selectedGoal === 'salary-negotiation') {
            quickResponses = [
              "What's a reasonable increase?",
              "Negotiation tactics",
              "When to discuss salary",
              "Tell me more about something else"
            ];
          } else if (selectedGoal === 'leadership-skills') {
            quickResponses = [
              "Best leadership courses",
              "Daily leadership habits",
              "Common leadership mistakes",
              "Tell me more about something else"
            ];
          } else {
            // Default options for any other scenario
            quickResponses = [
              "Tell me more about this",
              "What specific steps to take?",
              "Any recommended resources?",
              "Tell me more about something else"
            ];
          }
        }
        
        // Add a follow-up question if the AI didn't include one
        let finalMessage = data.aiMessage.message;
        
        // Check if message doesn't already have a follow-up question
        if (!finalMessage.includes("follow-up question")) {
          // Add an appropriate follow-up question based on the career goal
          let followUpQuestion = "\n\n## Let me ask you a follow-up question:\n";
          
          if (selectedGoal === 'career-change') {
            followUpQuestion += "What specific aspect of changing careers interests you most?";
          } else if (selectedGoal === 'promotion') {
            followUpQuestion += "Which of these promotion strategies would you like to focus on first?";
          } else if (selectedGoal === 'salary-negotiation') {
            followUpQuestion += "What's your biggest concern about negotiating your salary?";
          } else if (selectedGoal === 'leadership-skills') {
            followUpQuestion += "Which leadership skill do you think is most important for your career growth?";
          } else {
            followUpQuestion += "What specific aspect would you like me to elaborate on?";
          }
          
          finalMessage = finalMessage + followUpQuestion;
        }
        
        // Add AI response to chat with quick responses
        setMessages(prev => [...prev, {
          id: data.aiMessage.id.toString(),
          message: finalMessage,
          sender: 'ai',
          timestamp: new Date(data.aiMessage.timestamp),
          quickResponses
        }]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive"
      });
      
      // Add error message to chat
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        message: "I'm sorry, I couldn't process your request at the moment. Please try again later.",
        sender: 'ai',
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [inputMessage, selectedGoal, setMessages, setInputMessage, setIsLoading, toast]);
  
  // Handle initialQuestion if provided
  useEffect(() => {
    if (initialQuestion && initialQuestion.trim() && !initialQuestionProcessed.current) {
      initialQuestionProcessed.current = true;
      setInputMessage(initialQuestion);
      // Use a timeout to ensure the state update has completed
      setTimeout(() => {
        const submitEvent = new Event('submit', { cancelable: true }) as unknown as React.FormEvent;
        submitEvent.preventDefault = () => {}; // Mock preventDefault
        handleSubmit(submitEvent);
      }, 100);
    }
  }, [initialQuestion, handleSubmit, setInputMessage]);

  return (
    <Card className="flex-1 flex flex-col overflow-hidden shadow-lg border-0">
      {/* Chat Header */}
      <div className="bg-gradient-to-r from-primary to-primary-600 text-white px-6 py-4 flex items-center">
        <div className="flex-shrink-0 mr-3 bg-white rounded-full p-2 shadow-md">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
            <rect x="3" y="11" width="18" height="10" rx="2" />
            <circle cx="12" cy="5" r="2" />
            <path d="M12 7v4" />
            <line x1="8" y1="16" x2="8" y2="16" />
            <line x1="16" y1="16" x2="16" y2="16" />
          </svg>
        </div>
        <div>
          <h2 className="font-semibold text-lg">Musk - AI Career Coach</h2>
          <p className="text-xs opacity-90">Powered by advanced AI to help you reach your career goals</p>
        </div>
      </div>
      
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(message => (
          <div 
            key={message.id} 
            className={`flex flex-col mb-4 ${message.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div className={`px-4 py-3 rounded-lg ${
              message.sender === 'user' 
                ? 'bg-primary text-white max-w-[70%]' 
                : 'bg-white border border-gray-200 shadow-sm max-w-[85%] prose prose-sm'
            }`}>
              {message.sender === 'user' ? (
                <div>{message.message}</div>
              ) : (
                <div className="prose prose-sm max-w-none">
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                  >
                    {processMessage(message.message)}
                  </ReactMarkdown>
                </div>
              )}
            </div>
            
            {/* Quick Response Buttons */}
            {message.sender === 'ai' && message.quickResponses && message.quickResponses.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2 max-w-[85%] bg-gray-50 p-3 rounded-lg border border-gray-100 shadow-sm">
                <div className="w-full mb-1.5 text-xs text-gray-500 font-medium">
                  <span className="flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                    Quick Responses:
                  </span>
                </div>
                {message.quickResponses.map((response, index) => (
                  <Button
                    key={index}
                    size="sm"
                    variant={response === "Tell me more about something else" ? "outline" : "secondary"}
                    className={`text-xs rounded-full px-4 py-1 h-auto transition-all duration-200 ${
                      response === "Tell me more about something else"
                        ? "border-primary text-primary hover:bg-primary/10"
                        : "bg-primary/10 text-primary hover:bg-primary/20 hover:shadow-md"
                    }`}
                    onClick={() => handleQuickResponse(response)}
                  >
                    {response}
                  </Button>
                ))}
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Chat Input */}
      <CardContent className="border-t border-gray-200 p-4">
        <div className="mb-4">
          <Label htmlFor="career-goal" className="mb-2 block text-sm font-medium">What are you trying to achieve? (Select a goal)</Label>
          <Select
            value={selectedGoal}
            onValueChange={(value) => {
              setSelectedGoal(value);
              // Find the selected goal's prompt
              const selectedCareerGoal = CAREER_GOALS.find(goal => goal.value === value);
              if (selectedCareerGoal) {
                setInputMessage(selectedCareerGoal.prompt);
                
                // Auto-submit when a goal is selected
                setTimeout(() => {
                  const submitEvent = new Event('submit', { cancelable: true }) as unknown as React.FormEvent;
                  submitEvent.preventDefault = () => {}; // Mock preventDefault
                  handleSubmit(submitEvent);
                }, 100);
              }
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a goal to get tailored advice" />
            </SelectTrigger>
            <SelectContent>
              {CAREER_GOALS.map((goal) => (
                <SelectItem key={goal.value} value={goal.value}>
                  {goal.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <form onSubmit={handleSubmit} className="flex">
          <div className="relative flex-grow">
            <Input
              className="flex-1 w-full px-4 py-2 rounded-l-lg shadow-sm border-gray-300 focus:ring-primary focus:border-primary pl-4 pr-10"
              placeholder="Ask me about career paths, skills to develop, or job trends..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <Button 
            type="submit" 
            className="rounded-l-none bg-gradient-to-r from-primary to-primary-600 hover:from-primary-600 hover:to-primary-700 transition-all"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                Send
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
