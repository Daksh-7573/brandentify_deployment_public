import { useState, useEffect } from 'react';

interface TypewriterOptions {
  text: string;
  loop?: boolean;
  speed?: number;
  delay?: number;
}

/**
 * Custom hook for creating a typewriter text effect
 * @param options.text - Text to be typed
 * @param options.loop - Whether to loop the typing effect (default: false)
 * @param options.speed - Typing speed in milliseconds (default: 100)
 * @param options.delay - Delay before typing starts in milliseconds (default: 0)
 * @returns The text with typewriter effect applied
 */
export default function useTypewriter({
  text,
  loop = false,
  speed = 100,
  delay = 0,
}: TypewriterOptions): string {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDelayed, setIsDelayed] = useState(delay > 0);

  useEffect(() => {
    // Handle initial delay
    if (isDelayed) {
      const delayTimeout = setTimeout(() => {
        setIsDelayed(false);
      }, delay);

      return () => clearTimeout(delayTimeout);
    }

    // Don't start typing until delay is completed
    if (isDelayed) return;

    // Handle typing effect
    if (!isDeleting && currentIndex <= text.length) {
      const timeout = setTimeout(() => {
        setDisplayText(text.substring(0, currentIndex));
        setCurrentIndex(currentIndex + 1);
      }, speed);

      return () => clearTimeout(timeout);
    }
    
    // Handle deletion (for loop effect)
    if (isDeleting && currentIndex >= 0) {
      const timeout = setTimeout(() => {
        setDisplayText(text.substring(0, currentIndex));
        setCurrentIndex(currentIndex - 1);
      }, speed / 2);

      return () => clearTimeout(timeout);
    }

    // Handle loop effect
    if (loop && currentIndex > text.length) {
      const timeout = setTimeout(() => {
        setIsDeleting(true);
      }, 2000); // Pause at the end before deleting

      return () => clearTimeout(timeout);
    }

    // Reset loop
    if (loop && isDeleting && currentIndex === 0) {
      const timeout = setTimeout(() => {
        setIsDeleting(false);
      }, 1000); // Pause before retyping

      return () => clearTimeout(timeout);
    }
  }, [currentIndex, isDeleting, text, loop, speed, isDelayed, delay]);

  return displayText;
}