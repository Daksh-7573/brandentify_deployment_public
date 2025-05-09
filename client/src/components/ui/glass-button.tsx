import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50 backdrop-blur-md",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-[#00D1FF] to-[#5271FF] text-white shadow-md hover:shadow-lg hover:scale-[1.02]",
        destructive:
          "bg-gradient-to-r from-[#FF3A5E] to-[#FF274D] text-white shadow-md hover:shadow-lg hover:scale-[1.02]",
        outline:
          "border border-[rgba(255,255,255,0.15)] bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] shadow-sm hover:border-[rgba(255,255,255,0.25)] text-white",
        secondary:
          "bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.12)] text-white shadow-sm hover:bg-[rgba(255,255,255,0.12)]",
        ghost: "hover:bg-[rgba(255,255,255,0.08)] hover:text-white",
        link: "text-primary underline-offset-4 hover:underline",
        glass: "bg-[rgba(45,45,45,0.4)] border border-[rgba(255,255,255,0.12)] hover:bg-[rgba(45,45,45,0.6)] backdrop-blur-md shadow-sm text-white",
        "glass-dark": "bg-[rgba(25,25,25,0.5)] border border-[rgba(255,255,255,0.08)] hover:bg-[rgba(30,30,30,0.7)] backdrop-blur-md shadow-md text-white",
        primary: "bg-primary text-white shadow-md hover:bg-primary/90 hover:shadow-lg",
        spatial: "bg-[rgba(30,30,30,0.5)] border border-[rgba(255,255,255,0.12)] shadow-lg text-white hover:bg-[rgba(35,35,35,0.6)]",
      },
      size: {
        default: "h-10 px-5 py-2.5 rounded-2xl",
        sm: "h-9 rounded-xl px-4 text-xs",
        lg: "h-12 rounded-2xl px-8 text-base",
        icon: "h-10 w-10 rounded-full",
        pill: "h-10 rounded-full px-6",
        "pill-sm": "h-8 rounded-full px-5 text-xs",
        "pill-lg": "h-12 rounded-full px-10 text-base",
      },
      glow: {
        none: "",
        subtle: "relative overflow-hidden after:absolute after:inset-0 after:z-[-1] after:opacity-0 after:blur-md hover:after:opacity-30 after:bg-primary/40 after:transition-all",
        active: "shadow-[0_0_20px_rgba(0,209,255,0.4)] hover:shadow-[0_0_20px_rgba(0,209,255,0.6)]",
        pulse: "animate-pulse-slow shadow-[0_0_15px_rgba(0,209,255,0.4)]",
      },
    },
    defaultVariants: {
      variant: "glass-dark",
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
  ({ className, variant, size, glow, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, glow, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
GlassButton.displayName = "GlassButton";

export { GlassButton, buttonVariants };