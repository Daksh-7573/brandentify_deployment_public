import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const visionCardVariants = cva(
  "relative rounded-xl border backdrop-blur-md shadow-sm transition-all",
  {
    variants: {
      variant: {
        default: "bg-white/20 border-white/10",
        dark: "bg-gray-900/30 border-gray-800/20 text-white",
        light: "bg-white/30 border-white/20",
        accent: "bg-primary/10 border-primary/20",
      },
      size: {
        default: "p-6",
        sm: "p-4",
        lg: "p-8",
      },
      hover: {
        default: "hover:shadow-md hover:bg-white/30 hover:border-white/20",
        subtle: "hover:shadow-sm hover:bg-white/25 hover:border-white/15",
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