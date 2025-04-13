import { useState, useEffect, useRef, useCallback } from 'react';

export type TextAnimationType = 
  | 'typewriter' 
  | 'fade-characters' 
  | 'slide-up' 
  | 'scramble' 
  | 'bounce' 
  | 'rainbow';

interface AnimatedTextOptions {
  text: string;
  type?: TextAnimationType;
  speed?: number;
  delay?: number;
  loop?: boolean;
  loopDelay?: number;
  onComplete?: () => void;
}

/**
 * useAnimatedText - A hook for creating animated text effects
 * 
 * This hook provides various text animation effects that can be used
 * throughout the application, such as typewriter, fade-in, slide-up, etc.
 */
export function useAnimatedText({
  text,
  type = 'typewriter',
  speed = 40,
  delay = 0,
  loop = false,
  loopDelay = 2000,
  onComplete,
}: AnimatedTextOptions) {
  const [displayText, setDisplayText] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const characterIndexRef = useRef(0);
  
  // Clear all timeouts and intervals
  const clearTimers = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  }, []);
  
  // Start the animation
  const startAnimation = useCallback(() => {
    clearTimers();
    characterIndexRef.current = 0;
    setIsDone(false);
    setIsPlaying(true);
    
    if (type === 'typewriter') {
      // Typewriter effect
      intervalRef.current = setInterval(() => {
        if (characterIndexRef.current < text.length) {
          setDisplayText(text.substring(0, characterIndexRef.current + 1));
          characterIndexRef.current++;
        } else {
          clearInterval(intervalRef.current!);
          setIsDone(true);
          setIsPlaying(false);
          onComplete?.();
          
          if (loop) {
            timeoutRef.current = setTimeout(() => {
              setDisplayText('');
              startAnimation();
            }, loopDelay);
          }
        }
      }, speed);
    } else if (type === 'scramble') {
      // Scramble effect (letters randomly appearing/changing)
      const finalText = text;
      let iteration = 0;
      
      const alphabets = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      let displayTextTemp = Array(finalText.length).fill('');
      
      intervalRef.current = setInterval(() => {
        const newText = displayTextTemp.map((char, index) => {
          if (index < iteration) {
            return finalText[index];
          }
          
          if (finalText[index] === ' ') {
            return ' ';
          }
          
          return alphabets[Math.floor(Math.random() * alphabets.length)];
        }).join('');
        
        setDisplayText(newText);
        
        if (iteration >= finalText.length) {
          clearInterval(intervalRef.current!);
          setIsDone(true);
          setIsPlaying(false);
          onComplete?.();
          
          if (loop) {
            timeoutRef.current = setTimeout(() => {
              setDisplayText('');
              startAnimation();
            }, loopDelay);
          }
        }
        
        iteration += 1 / 3;
      }, speed / 3);
    } else {
      // For other animation types, we just show the full text
      // The actual animation happens in CSS
      setDisplayText(text);
      
      timeoutRef.current = setTimeout(() => {
        setIsDone(true);
        setIsPlaying(false);
        onComplete?.();
        
        if (loop) {
          timeoutRef.current = setTimeout(() => {
            setDisplayText('');
            startAnimation();
          }, loopDelay);
        }
      }, text.length * speed);
    }
  }, [text, type, speed, loop, loopDelay, onComplete, clearTimers]);
  
  // Start animation on mount or when text/type changes
  useEffect(() => {
    characterIndexRef.current = 0;
    setDisplayText('');
    setIsDone(false);
    
    // Delay the start of the animation
    timeoutRef.current = setTimeout(() => {
      startAnimation();
    }, delay);
    
    return clearTimers;
  }, [text, type, delay, startAnimation, clearTimers]);
  
  // Generate class names based on animation type
  const generateClassNames = () => {
    const baseClass = 'animated-text';
    
    switch (type) {
      case 'typewriter':
        return `${baseClass} typewriter`;
      case 'fade-characters':
        return `${baseClass} fade-characters`;
      case 'slide-up':
        return `${baseClass} slide-up`;
      case 'bounce':
        return `${baseClass} bounce`;
      case 'rainbow':
        return `${baseClass} rainbow`;
      default:
        return baseClass;
    }
  };
  
  // Reset the animation
  const reset = useCallback(() => {
    clearTimers();
    setDisplayText('');
    setIsDone(false);
    setIsPlaying(false);
    characterIndexRef.current = 0;
  }, [clearTimers]);
  
  // Play the animation
  const play = useCallback(() => {
    if (isPlaying) return;
    startAnimation();
  }, [isPlaying, startAnimation]);
  
  // Pause the animation
  const pause = useCallback(() => {
    clearTimers();
    setIsPlaying(false);
  }, [clearTimers]);
  
  return {
    text: displayText,
    isPlaying,
    isDone,
    className: generateClassNames(),
    reset,
    play,
    pause,
  };
}