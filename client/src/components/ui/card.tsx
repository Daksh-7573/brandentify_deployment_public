import * as React from "react"

import { cn } from "@/lib/utils"

// Enhanced Card with several variants
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "glass" | "gradient" | "hover3d" | "outline"
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const baseStyles = "rounded-xl text-card-foreground transition-all duration-300";
    
    const variantStyles = {
      default: "border bg-card shadow-sm hover:shadow-md",
      glass: "glass-card border-0",
      gradient: "border-gradient p-[1px] overflow-hidden bg-gradient-to-br from-primary/20 via-primary/10 to-background",
      hover3d: "hover-card border bg-card shadow-md",
      outline: "border-2 border-primary/10 hover:border-primary/30 bg-card/50",
    };
    
    return (
      <div
        ref={ref}
        className={cn(
          baseStyles,
          variantStyles[variant],
          className
        )}
        {...props}
      />
    );
  }
);
Card.displayName = "Card";

// Enhanced CardHeader with better spacing
const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6 pb-3", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

// Enhanced Card Title with better typography
const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-xl md:text-2xl font-semibold leading-tight tracking-tight text-foreground/90",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

// Enhanced Card Description with improved readability
const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm leading-relaxed text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

// Enhanced Card Content with improved spacing
const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-2", className)} {...props} />
))
CardContent.displayName = "CardContent"

// Enhanced Card Footer with improved spacing and alignment
const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center justify-between px-6 pb-6 pt-2", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
