import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { SparklesIcon, LightbulbIcon, RefreshCwIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { UserData } from '@/types/user';
import { getSuggestedQuestions, SuggestedQuestion } from './suggested-questions';

interface SuggestedQuestionsDisplayProps {
  user: UserData | null;
  onSelectQuestion: (question: string) => void;
  className?: string;
}

export default function SuggestedQuestionsDisplay({ 
  user, 
  onSelectQuestion,
  className = ''
}: SuggestedQuestionsDisplayProps) {
  const [questions, setQuestions] = useState<SuggestedQuestion[]>([]);
  const [engagementHistory, setEngagementHistory] = useState<Record<string, number>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const questionsPerView = 3;
  
  // Load engagement history from localStorage if available
  useEffect(() => {
    try {
      const saved = localStorage.getItem('musk-question-engagement');
      if (saved) {
        setEngagementHistory(JSON.parse(saved));
      }
    } catch (error) {
      console.error("Failed to load question engagement history:", error);
    }
  }, []);
  
  // Generate questions when user changes
  useEffect(() => {
    if (user) {
      const suggestions = getSuggestedQuestions(user, engagementHistory);
      setQuestions(suggestions);
      setCurrentIndex(0);
    }
  }, [user, engagementHistory]);
  
  // Handle question selection
  const handleSelectQuestion = (question: SuggestedQuestion) => {
    // Update engagement history
    const newHistory = { ...engagementHistory };
    newHistory[question.category] = (newHistory[question.category] || 0) + 1;
    setEngagementHistory(newHistory);
    
    // Save to localStorage
    try {
      localStorage.setItem('musk-question-engagement', JSON.stringify(newHistory));
    } catch (error) {
      console.error("Failed to save question engagement history:", error);
    }
    
    // Trigger the parent callback
    onSelectQuestion(question.text);
  };
  
  // Refresh questions
  const handleRefresh = () => {
    const suggestions = getSuggestedQuestions(user, engagementHistory);
    setQuestions(suggestions);
    setCurrentIndex(0);
  };
  
  // Go to next set of questions
  const goNext = () => {
    if (currentIndex + questionsPerView < questions.length) {
      setCurrentIndex(currentIndex + questionsPerView);
    } else {
      setCurrentIndex(0); // Loop back to the start
    }
  };
  
  // Go to previous set of questions
  const goPrev = () => {
    if (currentIndex - questionsPerView >= 0) {
      setCurrentIndex(currentIndex - questionsPerView);
    } else {
      const lastGroupStartIndex = Math.floor((questions.length - 1) / questionsPerView) * questionsPerView;
      setCurrentIndex(lastGroupStartIndex); // Go to last group
    }
  };
  
  // Calculate if we have pages
  const hasMultiplePages = questions.length > questionsPerView;
  const currentPage = Math.floor(currentIndex / questionsPerView) + 1;
  const totalPages = Math.ceil(questions.length / questionsPerView);
  
  // Skip rendering if no user or questions
  if (!user || questions.length === 0) return null;
  
  return (
    <div className={`w-full space-y-3 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <LightbulbIcon className="h-3.5 w-3.5 text-amber-400 mr-1" />
          <span className="text-xs text-muted-foreground">Try asking</span>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-6 w-6 p-0 rounded-full" 
          onClick={handleRefresh}
        >
          <RefreshCwIcon className="h-3 w-3 text-muted-foreground/70" />
          <span className="sr-only">Refresh questions</span>
        </Button>
      </div>
      
      <div className="grid gap-0.5">
        <AnimatePresence mode="sync">
          {questions.slice(currentIndex, currentIndex + questionsPerView).map((question) => (
            <motion.div
              key={question.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.2 }}
              className="w-full"
            >
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-left h-auto py-1 px-2 font-normal text-xs hover:bg-primary/5 rounded-md"
                onClick={() => handleSelectQuestion(question)}
              >
                {question.isNew && (
                  <SparklesIcon className="h-3 w-3 text-amber-400 mr-1.5 flex-shrink-0" />
                )}
                <span className="text-muted-foreground hover:text-foreground line-clamp-2">{question.text}</span>
              </Button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      
      {hasMultiplePages && (
        <div className="flex items-center justify-center gap-1 mt-1">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-5 w-5 p-0 rounded-full" 
            onClick={goPrev}
            title="Previous questions"
          >
            <ChevronLeft className="h-3 w-3 text-muted-foreground" />
            <span className="sr-only">Previous</span>
          </Button>
          <span className="text-[10px] text-muted-foreground/70 mx-1">
            {currentPage}/{totalPages}
          </span>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-5 w-5 p-0 rounded-full" 
            onClick={goNext}
            title="More questions"
          >
            <ChevronRight className="h-3 w-3 text-muted-foreground" />
            <span className="sr-only">Next</span>
          </Button>
        </div>
      )}
    </div>
  );
}