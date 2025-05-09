import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const visionCardVariants = cva(
  "relative rounded-xl border backdrop-blur-md shadow-sm transition-all",
  {
    variants: {
      variant: {
        default: "bg-white/5 border-[#3A3A3C] text-[#E5E5E7]",
        dark: "bg-[#1C1C1E]/90 border-[#3A3A3C] text-[#E5E5E7]",
        glass: "bg-white/5 border-[#3A3A3C] text-[#E5E5E7]",
        accent: "bg-[#4F8CFF]/10 border-[#4F8CFF]/20 text-[#E5E5E7]",
        success: "bg-[#4ADE80]/10 border-[#4ADE80]/20 text-[#E5E5E7]",
        warning: "bg-[#FCD34D]/10 border-[#FCD34D]/20 text-[#E5E5E7]",
        error: "bg-[#EF4444]/10 border-[#EF4444]/20 text-[#E5E5E7]",
      },
      size: {
        default: "p-6",
        sm: "p-4",
        lg: "p-8",
      },
      hover: {
        default: "hover:shadow-md hover:bg-white/8 hover:border-white/10",
        subtle: "hover:shadow-sm hover:bg-white/8 hover:border-white/10",
        accent: "hover:shadow-sm hover:bg-[#4F8CFF]/15 hover:border-[#4F8CFF]/30",
        none: "",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      hover: "default",
    },
  }
)

export interface VisionCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof visionCardVariants> {
  asChild?: boolean
}

const VisionCard = React.forwardRef<HTMLDivElement, VisionCardProps>(
  ({ className, variant, size, hover, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(visionCardVariants({ variant, size, hover, className }))}
      {...props}
    />
  )
)
VisionCard.displayName = "VisionCard"

const VisionCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5", className)}
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
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
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
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
VisionCardDescription.displayName = "VisionCardDescription"

const VisionCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("pt-0", className)} {...props} />
))
VisionCardContent.displayName = "VisionCardContent"

const VisionCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center pt-4", className)}
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
  VisionCardContent,
}