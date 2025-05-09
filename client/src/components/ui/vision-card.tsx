import * as React from "react"
import { cn } from "@/lib/utils"

const VisionCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border border-[#3A3A3C] bg-white/5 backdrop-blur-sm shadow-sm",
      className
    )}
    {...props}
  />
))
VisionCard.displayName = "VisionCard"

const VisionCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-5", className)}
    {...props}
  />
))
VisionCardHeader.displayName = "VisionCardHeader"

const VisionCardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("font-semibold leading-none tracking-tight text-[#E5E5E7]", className)}
    {...props}
  />
))
VisionCardTitle.displayName = "VisionCardTitle"

const VisionCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-[#A1A1AA]", className)}
    {...props}
  />
))
VisionCardDescription.displayName = "VisionCardDescription"

const VisionCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("p-5 pt-0", className)}
    {...props}
  />
))
VisionCardContent.displayName = "VisionCardContent"

const VisionCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-5 pt-0", className)}
    {...props}
  />
))
VisionCardFooter.displayName = "VisionCardFooter"

export { 
  VisionCard, 
  VisionCardHeader, 
  VisionCardFooter, 
  VisionCardTitle, 
  VisionCardDescription, 
  VisionCardContent
}