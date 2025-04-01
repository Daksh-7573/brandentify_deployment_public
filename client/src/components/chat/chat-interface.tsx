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
      console.log("Checking for follow-up section in:", message);
      
      // Look for the follow-up question section
      if (!message.includes("## Let me ask you a follow-up question:")) {
        console.log("No follow-up question section found");
        return undefined;
      }
      
      // Extract the options section
      const parts = message.split("**Quick Response Options:**");
      if (parts.length < 2) {
        console.log("No quick response options section found");
        return undefined;
      }
      
      const optionSection = parts[1];
      console.log("Option section:", optionSection);
      
      // Extract the options using regex to find lines starting with "- "
      const optionLines = optionSection.split("\n")
        .filter(line => line.trim().startsWith("- "))
        .map(line => {
          // Remove the "- " prefix and any brackets or other formatting
          const option = line.trim().substring(2).trim(); 
          const cleanOption = option
            .replace(/^\[/, '') // Remove leading [
            .replace(/\]$/, '') // Remove trailing ]
            .replace(/^.*?:/, '').trim(); // Remove any prefix before colon
          
          return option.includes("Tell me more about something else") 
            ? "Tell me more about something else" 
            : cleanOption;
        });
      
      console.log("Extracted option lines:", optionLines);
      return optionLines.length > 0 ? optionLines : undefined;
    } catch (error) {
      console.error("Error extracting quick responses:", error);
      return undefined;
    }
  };
  
  // Modify the message to emphasize the follow-up question
  const processMessage = (message: string): string => {
    if (!message.includes("## Let me ask you a follow-up question:")) {
      return message;
    }
    
    try {
      // Split the message at the follow-up question to add emphasis styling
      const [mainContent, questionSection] = message.split("## Let me ask you a follow-up question:");
      
      // Split the question section at the quick response options
      const [question, options] = questionSection.split("**Quick Response Options:**");
      
      // Remove the quick response options from the displayed message for cleaner UI
      // (they'll be shown as buttons instead)
      return `${mainContent}\n\n## Let me ask you a follow-up question:${question}\n`;
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
        
        // Extract quick response options if available
        const quickResponses = extractQuickResponses(data.aiMessage.message);
        console.log("Extracted quick responses:", quickResponses);
        
        // Add AI response to chat
        setMessages(prev => [...prev, {
          id: data.aiMessage.id.toString(),
          message: data.aiMessage.message,
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
              <div className="mt-3 flex flex-wrap gap-2 max-w-[85%]">
                {message.quickResponses.map((response, index) => (
                  <Button
                    key={index}
                    size="sm"
                    variant={response === "Tell me more about something else" ? "outline" : "secondary"}
                    className={`text-xs rounded-full px-4 py-1 h-auto ${
                      response === "Tell me more about something else"
                        ? "border-primary text-primary hover:bg-primary/10"
                        : "bg-primary/10 text-primary hover:bg-primary/20"
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
