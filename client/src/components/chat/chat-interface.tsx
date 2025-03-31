import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type Message = {
  id: string;
  message: string;
  sender: 'user' | 'ai';
  timestamp: Date;
};

export default function ChatInterface() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      message: `Hi ${user?.name?.split(' ')[0] || 'there'}! I'm Mark, your AI career advisor. Based on your profile, I see you're interested in advancing your data analysis career. How can I help you today?`,
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
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
        sender: 'user'
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
      // If API fails, provide a fallback response
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        message: "Based on your profile and recent queries, I'd suggest focusing on developing skills in data visualization and advanced SQL. These are highly sought after in the analytics field you're targeting. Would you like me to recommend specific courses?",
        sender: 'ai',
        timestamp: new Date()
      }]);
      
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="flex-1 flex flex-col overflow-hidden">
      {/* Chat Header */}
      <div className="bg-primary text-white px-6 py-4 flex items-center">
        <div className="flex-shrink-0 mr-3 bg-white rounded-full p-1">
          <i className="fas fa-robot text-primary text-lg"></i>
        </div>
        <div>
          <h2 className="font-medium">Mark - AI Career Coach</h2>
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
