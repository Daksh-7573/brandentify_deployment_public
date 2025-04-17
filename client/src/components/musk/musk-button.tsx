import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { BrainCircuit } from 'lucide-react';
import MuskChatPanel from '@/components/musk/musk-chat-panel';

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
  
  const buttonVariants = {
    initial: { scale: 0.8, opacity: 0 },
    animate: { 
      scale: 1, 
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 260,
        damping: 20
      }
    },
    tap: { scale: 0.9 },
    hover: { 
      scale: 1.1,
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 10
      }
    }
  };
  
  const pulseAnimation = {
    pulse: {
      scale: [1, 1.15, 1],
      opacity: [0.5, 1, 0.5],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut'
      }
    }
  };
  
  return (
    <>
      {!isOpen && (
        <motion.div
          className={`fixed bottom-6 right-6 z-[9999] ${className}`}
          initial="initial"
          animate="animate"
          variants={buttonVariants}
        >
          <motion.div
            whileHover="hover"
            whileTap="tap"
            variants={buttonVariants}
          >
            <Button
              size="lg"
              className="h-16 w-16 rounded-full shadow-xl border-4 border-white/80 bg-gradient-to-r from-primary to-purple-600 text-white"
              onClick={() => setIsOpen(true)}
            >
              <BrainCircuit className="h-8 w-8" />
              <motion.span
                className="absolute inset-0 rounded-full bg-primary/20"
                variants={pulseAnimation}
                animate="pulse"
              />
            </Button>
          </motion.div>
        </motion.div>
      )}
      
      <AnimatePresence>
        {isOpen && (
          <MuskChatPanel 
            context={context} 
            onClose={() => setIsOpen(false)} 
          />
        )}
      </AnimatePresence>
    </>
  );
}