import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, MessageSquare, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import MuskChatPanel from './musk-chat-panel';

type MuskButtonProps = {
  className?: string;
  initialOpen?: boolean;
  context?: {
    page?: string;
    userId?: number;
    section?: string;
    data?: any;
  };
};

export default function MuskButton({ 
  className, 
  initialOpen = false, 
  context 
}: MuskButtonProps) {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [hasNewSuggestion, setHasNewSuggestion] = useState(false);
  const [lastActivity, setLastActivity] = useState<Date>(new Date());
  const [displayPrompt, setDisplayPrompt] = useState("");
  
  // Simulate Musk's contextual awareness based on user activity
  useEffect(() => {
    // Detect inactivity (2 minutes without interaction)
    const checkForInactivity = () => {
      const inactiveThreshold = 2 * 60 * 1000; // 2 minutes in milliseconds
      const timeSinceActivity = new Date().getTime() - lastActivity.getTime();
      
      if (timeSinceActivity > inactiveThreshold && !isOpen) {
        // Generate a contextual prompt based on current page/section
        const contextPrompts: {[key: string]: string[]} = {
          home: [
            "Need help getting started?",
            "Let me help you boost your profile visibility",
            "What are you working on today?"
          ],
          profile: [
            "Your profile could use a boost. Need help?",
            "Want to see if your profile stands out?",
            "Let me suggest some improvements to your profile"
          ],
          pulses: [
            "Ready to share something with your network?",
            "What's on your mind today?",
            "Need help crafting your next post?"
          ],
          projects: [
            "Let me help you showcase your work",
            "Want to highlight your expertise?",
            "Need ideas for your next assignment?"
          ],
          search: [
            "Looking for something specific?",
            "Need help finding relevant connections?",
            "I can help you discover opportunities"
          ]
        };
        
        // Default prompts if context isn't available
        const defaultPrompts = [
          "Need career advice?",
          "Looking to optimize your presence?",
          "How can I help you today?"
        ];
        
        // Select prompt based on current page
        const page = context?.page || "home";
        const promptsForPage = contextPrompts[page] || defaultPrompts;
        const randomPrompt = promptsForPage[Math.floor(Math.random() * promptsForPage.length)];
        
        setDisplayPrompt(randomPrompt);
        setHasNewSuggestion(true);
      }
    };
    
    const inactivityTimer = setInterval(checkForInactivity, 30000); // Check every 30 seconds
    
    // Reset activity timer on user interaction
    const resetActivityTimer = () => {
      setLastActivity(new Date());
    };
    
    // Listen for user activity
    window.addEventListener('click', resetActivityTimer);
    window.addEventListener('keypress', resetActivityTimer);
    window.addEventListener('scroll', resetActivityTimer);
    window.addEventListener('mousemove', resetActivityTimer);
    
    return () => {
      clearInterval(inactivityTimer);
      window.removeEventListener('click', resetActivityTimer);
      window.removeEventListener('keypress', resetActivityTimer);
      window.removeEventListener('scroll', resetActivityTimer);
      window.removeEventListener('mousemove', resetActivityTimer);
    };
  }, [isOpen, context, lastActivity]);

  // Toggle the chat panel
  const toggleChat = () => {
    setIsOpen(prev => !prev);
    setHasNewSuggestion(false);
  };

  return (
    <>
      {/* Floating Button */}
      <div className={cn("fixed bottom-6 right-6 z-50", className)}>
        <AnimatePresence>
          {!isOpen && hasNewSuggestion && (
            <motion.div 
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.8 }}
              className="bg-white rounded-lg shadow-lg p-4 mb-4 max-w-xs"
            >
              <p className="text-sm font-medium">{displayPrompt}</p>
              <div className="mt-2 flex justify-end">
                <button 
                  onClick={toggleChat} 
                  className="text-xs text-primary font-medium hover:underline"
                >
                  Let's chat
                </button>
                <button 
                  onClick={() => setHasNewSuggestion(false)}
                  className="text-xs text-gray-500 font-medium hover:underline ml-4"
                >
                  Dismiss
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <motion.button
          onClick={toggleChat}
          className={cn(
            "rounded-full shadow-lg w-14 h-14 flex items-center justify-center",
            "bg-primary text-white transition-all duration-300",
            "hover:shadow-xl",
            isOpen ? "scale-[0.95]" : "scale-100",
            hasNewSuggestion && !isOpen ? "animate-pulse" : ""
          )}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <div className="relative">
              <MessageSquare className="w-6 h-6" />
              <Sparkles className="w-3 h-3 absolute -top-1 -right-1 text-yellow-300" />
            </div>
          )}
        </motion.button>
      </div>
      
      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: 20, height: 0 }}
            className="fixed bottom-24 right-6 z-50 w-[90%] max-w-md"
          >
            <MuskChatPanel context={context} onClose={toggleChat} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}