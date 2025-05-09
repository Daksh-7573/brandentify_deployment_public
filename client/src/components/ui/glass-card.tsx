import React from 'react';
import { cn } from '@/lib/utils';
import { VariantProps, cva } from 'class-variance-authority';

const glassCardVariants = cva(
  "relative overflow-hidden backdrop-blur-md border transition-all duration-200",
  {
    variants: {
      variant: {
        default: "bg-white/65 border-gray-200/50 shadow-sm hover:shadow-md",
        dark: "bg-gray-900/70 border-gray-700/50 shadow-md hover:shadow-lg text-white",
        colored: "bg-primary/10 border-primary/20 shadow-sm hover:shadow-md",
        transparent: "bg-transparent border-gray-200/30 shadow-none hover:bg-white/10",
      },
      size: {
        sm: "p-3 rounded-lg",
        md: "p-4 rounded-xl",
        lg: "p-6 rounded-2xl",
        xl: "p-8 rounded-3xl",
      },
      elevation: {
        flat: "shadow-none",
        raised: "shadow-md hover:shadow-lg",
        floating: "shadow-lg hover:shadow-xl translate-y-0 hover:-translate-y-1",
      },
      interactive: {
        true: "hover:border-primary/30 hover:bg-white/75 cursor-pointer",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
      elevation: "raised",
      interactive: false,
    },
  }
);

export interface GlassCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof glassCardVariants> {
  asChild?: boolean;
  innerClassName?: string;
}

const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  (
    { 
      className, 
      variant, 
      size, 
      elevation, 
      interactive, 
      children, 
      innerClassName,
      ...props 
    }, 
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          glassCardVariants({ variant, size, elevation, interactive }),
          className
        )}
        {...props}
      >
        <div className={cn("relative z-10 h-full w-full", innerClassName)}>
          {children}
        </div>
        {variant === "colored" && (
          <div 
            className="absolute inset-0 -z-10 bg-gradient-to-tr from-primary/20 via-primary/5 to-transparent 
                      opacity-50 blur-xl"
          />
        )}
      </div>
    );
  }
);

GlassCard.displayName = "GlassCard";

export { GlassCard };