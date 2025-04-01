import { useState, useRef, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

type Message = {
  id: string;
  message: string;
  sender: 'user' | 'ai';
  timestamp: Date;
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
        // Add AI response to chat
        setMessages(prev => [...prev, {
          id: data.aiMessage.id.toString(),
          message: data.aiMessage.message,
          sender: 'ai',
          timestamp: new Date(data.aiMessage.timestamp)
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
    <Card className="flex-1 flex flex-col overflow-hidden">
      {/* Chat Header */}
      <div className="bg-primary text-white px-6 py-4 flex items-center">
        <div className="flex-shrink-0 mr-3 bg-white rounded-full p-1">
          <i className="fas fa-robot text-primary text-lg"></i>
        </div>
        <div>
          <h2 className="font-medium">Musk - AI Career Coach</h2>
          <p className="text-xs text-primary-100">Powered by advanced AI to help you reach your career goals</p>
        </div>
      </div>
      
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(message => (
          <div 
            key={message.id} 
            className={`flex mb-4 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`px-4 py-2 rounded-lg max-w-[80%] ${
              message.sender === 'user' 
                ? 'bg-primary text-white' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {message.message}
            </div>
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
          <Input
            className="flex-1 rounded-l-lg border-gray-300 focus:ring-primary focus:border-primary"
            placeholder="Ask me about career paths, skills to develop, or job trends..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            disabled={isLoading}
          />
          <Button 
            type="submit" 
            className="rounded-l-none"
            disabled={isLoading}
          >
            <i className="fas fa-paper-plane mr-2"></i> {isLoading ? 'Sending...' : 'Send'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
