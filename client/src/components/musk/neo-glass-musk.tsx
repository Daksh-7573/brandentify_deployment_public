import React, { useState } from 'react';
import { Send, Sparkles, X } from 'lucide-react';
import { NeoGlassCard, NeoGlassButton, NeoGlassInput, NeoGlassMuskBubble, NeoGlassSparkle } from '@/components/ui/neo-glass';
import { cn } from '@/lib/utils';

interface NeoGlassMuskAIProps {
  className?: string;
  expanded?: boolean;
  position?: 'bottom-right' | 'bottom-left';
}

const NeoGlassMuskAI: React.FC<NeoGlassMuskAIProps> = ({
  className,
  expanded: initialExpanded = false,
  position = 'bottom-right'
}) => {
  const [expanded, setExpanded] = useState(initialExpanded);
  const [inputValue, setInputValue] = useState('');
  
  // Mock conversation data - in a real app, this would come from your backend
  const [conversation, setConversation] = useState([
    { 
      id: 1, 
      message: "Hi there! I'm Musk, your AI career assistant. How can I help you today?",
      isUser: false
    }
  ]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim()) return;
    
    // Add user message
    setConversation(prev => [
      ...prev,
      { id: Date.now(), message: inputValue, isUser: true }
    ]);
    
    // Clear input
    setInputValue('');
    
    // In a real app, you'd call your API here
    // Mock AI response after a delay
    setTimeout(() => {
      setConversation(prev => [
        ...prev,
        { 
          id: Date.now() + 1, 
          message: "I'm just a demo component right now, but the real Musk AI would provide insightful career guidance!",
          isUser: false
        }
      ]);
    }, 1000);
  };
  
  const toggleExpanded = () => {
    setExpanded(prev => !prev);
  };
  
  const positionClasses = position === 'bottom-right' 
    ? 'bottom-4 right-4' 
    : 'bottom-4 left-4';
  
  return (
    <div className={cn('fixed z-50', positionClasses, className)}>
      {expanded ? (
        <NeoGlassCard 
          className="w-[350px] max-h-[500px] flex flex-col overflow-hidden"
          glow="primary"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b border-white/20">
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <NeoGlassSparkle top="-5px" left="-5px" />
              </div>
              <h3 className="neo-glass-text font-medium">Musk AI Assistant</h3>
            </div>
            <NeoGlassButton 
              isIcon 
              variant="tertiary" 
              className="w-7 h-7" 
              onClick={toggleExpanded}
            >
              <X className="w-4 h-4" />
            </NeoGlassButton>
          </div>
          
          {/* Conversation */}
          <div className="flex-1 p-3 overflow-y-auto flex flex-col gap-3">
            {conversation.map(item => (
              <div 
                key={item.id}
                className={`flex ${item.isUser ? 'justify-end' : 'justify-start'}`}
              >
                {item.isUser ? (
                  <div className="bg-white/20 py-2 px-3 rounded-xl max-w-[80%]">
                    <p className="text-white text-sm">{item.message}</p>
                  </div>
                ) : (
                  <NeoGlassMuskBubble message={item.message} />
                )}
              </div>
            ))}
          </div>
          
          {/* Input */}
          <div className="p-3 border-t border-white/20">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <NeoGlassInput
                placeholder="Type your message..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="flex-1"
              />
              <NeoGlassButton 
                type="submit"
                variant="primary"
                isIcon
              >
                <Send className="w-4 h-4" />
              </NeoGlassButton>
            </form>
          </div>
        </NeoGlassCard>
      ) : (
        <div className="relative">
          <NeoGlassButton 
            variant="primary"
            className="h-14 w-14 rounded-full flex items-center justify-center"
            onClick={toggleExpanded}
          >
            <Sparkles className="w-6 h-6" />
          </NeoGlassButton>
          <NeoGlassSparkle top="-10px" left="-5px" />
          <NeoGlassSparkle top="-5px" left="35px" delay={1.5} />
        </div>
      )}
    </div>
  );
};

export default NeoGlassMuskAI;