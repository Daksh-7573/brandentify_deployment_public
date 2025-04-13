import { useEffect, useState } from 'react';

interface TypewriterOptions {
  words: string[];
  loop?: number;
  typeSpeed?: number;
  deleteSpeed?: number;
  delayBetween?: number;
}

/**
 * A hook that creates a typewriter effect
 * @param options The typewriter options
 * @returns The current text and cursor status
 */
export function useTypewriter({
  words = [],
  loop = 0,
  typeSpeed = 80,
  deleteSpeed = 50,
  delayBetween = 1500
}: TypewriterOptions): [string, boolean] {
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [wordIndex, setWordIndex] = useState(0);
  const [isWaiting, setIsWaiting] = useState(false);
  const [loopCount, setLoopCount] = useState(0);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    // If no words, or loop completed, return
    if (words.length === 0 || (loop > 0 && loopCount >= loop)) {
      setIsDone(true);
      return;
    }

    let timeout: NodeJS.Timeout;

    // If we're waiting between words
    if (isWaiting) {
      timeout = setTimeout(() => {
        setIsWaiting(false);
        setIsDeleting(true);
      }, delayBetween);
      return () => clearTimeout(timeout);
    }

    const currentWord = words[wordIndex];
    
    // Deleting text
    if (isDeleting) {
      timeout = setTimeout(() => {
        setCurrentText(prev => prev.slice(0, -1));
        
        // If all text is deleted
        if (currentText.length <= 1) {
          setIsDeleting(false);
          
          // Move to the next word or loop back to the first
          const nextIndex = (wordIndex + 1) % words.length;
          setWordIndex(nextIndex);
          
          // Increment loop count if we've gone through all words
          if (nextIndex === 0) {
            setLoopCount(prev => prev + 1);
            
            // If we've reached the loop limit, stop
            if (loop > 0 && (loopCount + 1) >= loop) {
              setIsDone(true);
              return;
            }
          }
        }
      }, deleteSpeed);
    } 
    // Typing text
    else {
      // If we've typed the full word
      if (currentText === currentWord) {
        // If there's only one word or we've reached the loop limit, we're done
        if (words.length === 1 && loop <= 1) {
          setIsDone(true);
          return;
        }
        
        // Otherwise, wait for a bit before deleting
        setIsWaiting(true);
      } else {
        // Type the next character
        timeout = setTimeout(() => {
          const nextChar = currentWord.charAt(currentText.length);
          setCurrentText(prev => prev + nextChar);
        }, typeSpeed);
      }
    }

    return () => clearTimeout(timeout);
  }, [
    currentText,
    words,
    wordIndex,
    isDeleting,
    isWaiting,
    loop,
    loopCount,
    typeSpeed,
    deleteSpeed,
    delayBetween
  ]);

  return [currentText, isDone];
}

export default useTypewriter;