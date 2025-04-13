import { forwardRef, ReactNode, CSSProperties } from 'react';
import { motion } from 'framer-motion';
import { EASING, DURATIONS } from '@/lib/animation-utils';
import { cn } from '@/lib/utils';

type MorphingStyles = {
  [key: string]: string | number;
};

interface MorphContainerProps {
  children: ReactNode;
  from: MorphingStyles;
  to: MorphingStyles;
  className?: string;
  style?: CSSProperties;
  duration?: number;
  ease?: number[] | string;
  delay?: number;
}

/**
 * MorphContainer - A container that smoothly morphs between different styles
 * 
 * This component allows for smooth transitions between different style states,
 * such as changing dimensions, colors, border radius, etc.
 */
export const MorphContainer = forwardRef<HTMLDivElement, MorphContainerProps>(({
  children,
  from,
  to,
  className,
  style,
  duration = DURATIONS.normal,
  ease = EASING.spring,
  delay = 0,
  ...props
}, ref) => {
  return (
    <motion.div
      ref={ref}
      className={cn(className)}
      style={{ ...style, ...from }}
      animate={{ ...to }}
      initial={{ ...from }}
      transition={{
        duration,
        ease,
        delay
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
});

MorphContainer.displayName = "MorphContainer";