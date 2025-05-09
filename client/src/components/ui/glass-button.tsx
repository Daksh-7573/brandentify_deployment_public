import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { useGlassEffects } from '@/contexts/GlassEffectsContext';
import { useGlassEffectStyles } from '@/hooks/use-glass-effect-styles';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50 backdrop-blur-sm",
  {
    variants: {
      variant: {
        default:
          "bg-primary/90 text-white shadow hover:bg-primary/80",
        destructive:
          "bg-red-500/90 text-white shadow-sm hover:bg-red-500/80",
        outline:
          "border border-gray-200/50 bg-white/40 hover:bg-white/60 shadow-sm hover:border-gray-300/60",
        secondary:
          "bg-secondary/70 text-secondary-foreground shadow-sm hover:bg-secondary/60",
        ghost: "hover:bg-white/30 hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        glass: "bg-white/20 border border-white/30 hover:bg-white/30 backdrop-blur-md shadow-sm text-black",
        "glass-dark": "bg-black/20 border border-black/30 hover:bg-black/30 backdrop-blur-md shadow-sm text-white",
        primary: "bg-primary text-white shadow hover:bg-primary/90",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-lg px-8",
        icon: "h-9 w-9",
        pill: "h-9 rounded-full px-6",
        "pill-sm": "h-8 rounded-full px-5 text-xs",
        "pill-lg": "h-10 rounded-full px-10",
      },
      glow: {
        none: "",
        subtle: "relative overflow-hidden after:absolute after:inset-0 after:z-[-1] after:opacity-0 after:blur-md hover:after:opacity-30 after:bg-primary/40 after:transition-all",
        active: "relative overflow-hidden after:absolute after:inset-0 after:z-[-1] after:opacity-40 after:blur-md hover:after:opacity-60 after:bg-primary/60 after:transition-all",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      glow: "none",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const GlassButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant: propVariant, size, glow, asChild = false, ...props }, ref) => {
    // Get global glass effect settings
    const { settings } = useGlassEffects();
    const { cssVariables } = useGlassEffectStyles();
    
    // Use the provided variant or determine it based on glass settings
    let variant = propVariant;
    
    // If no variant is provided, use 'glass' (with dark mode awareness)
    if (variant === undefined) {
      variant = settings.variant === 'dark' ? 'glass-dark' : 'glass';
    } 
    // If it's already a glass variant, check if we need to adapt to dark mode
    else if (variant === 'glass' || variant === 'glass-dark') {
      variant = settings.variant === 'dark' ? 'glass-dark' : 'glass';
    }
    
    // Ensure variant is a valid type
    const validVariant = variant as "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "glass" | "glass-dark" | "primary";
    
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant: validVariant, size, glow, className }))}
        ref={ref}
        {...props}
        style={{
          ...(props.style || {}),
          ...(cssVariables && (validVariant === 'glass' || validVariant === 'glass-dark') 
            ? { [cssVariables]: '' } 
            : {})
        }}
      />
    );
  }
);
GlassButton.displayName = "GlassButton";

export { GlassButton, buttonVariants };