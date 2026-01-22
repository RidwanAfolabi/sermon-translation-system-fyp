import { useState, useEffect, useRef } from 'react';

interface TypewriterTextProps {
  text: string;
  className?: string;
  wordDelay?: number; // ms between words (default: 80ms for smooth real-time feel)
  onComplete?: () => void;
}

/**
 * TypewriterText - Professional word-by-word reveal animation
 * 
 * Features:
 * - Smooth fade-in per word (no jarring effects)
 * - Configurable timing for real-time feel
 * - Graceful handling of text changes mid-animation
 * - CSS-based animations for performance
 */
export function TypewriterText({ 
  text, 
  className = '', 
  wordDelay = 80,
  onComplete 
}: TypewriterTextProps) {
  const [visibleWordCount, setVisibleWordCount] = useState(0);
  const [displayText, setDisplayText] = useState(text);
  const animationRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const words = displayText.split(/\s+/).filter(word => word.length > 0);

  // Reset animation when text changes
  useEffect(() => {
    // Clear any running animation
    if (animationRef.current) {
      clearInterval(animationRef.current);
      animationRef.current = null;
    }

    // Update display text and reset counter
    setDisplayText(text);
    setVisibleWordCount(0);
  }, [text]);

  // Run the word reveal animation
  useEffect(() => {
    const totalWords = words.length;
    
    if (totalWords === 0) return;
    
    // Start revealing words
    animationRef.current = setInterval(() => {
      setVisibleWordCount(prev => {
        const next = prev + 1;
        if (next >= totalWords) {
          // Animation complete
          if (animationRef.current) {
            clearInterval(animationRef.current);
            animationRef.current = null;
          }
          onComplete?.();
          return totalWords;
        }
        return next;
      });
    }, wordDelay);

    return () => {
      if (animationRef.current) {
        clearInterval(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [displayText, wordDelay, onComplete, words.length]);

  return (
    <span className={className}>
      {words.map((word, index) => (
        <span
          key={`${word}-${index}`}
          className={`inline-block transition-all duration-200 ease-out ${
            index < visibleWordCount 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-1'
          }`}
          style={{
            marginRight: index < words.length - 1 ? '0.3em' : 0,
          }}
        >
          {word}
        </span>
      ))}
    </span>
  );
}

export default TypewriterText;
