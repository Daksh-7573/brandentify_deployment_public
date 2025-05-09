import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const visionButtonVariants = cva(
  "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-[#4F8CFF]/10 border border-[#4F8CFF]/20 text-[#E5E5E7] hover:bg-[#4F8CFF]/20",
        secondary: "bg-[#3ED7C2]/10 border border-[#3ED7C2]/20 text-[#E5E5E7] hover:bg-[#3ED7C2]/20",
        success: "bg-[#4ADE80]/10 border border-[#4ADE80]/20 text-[#E5E5E7] hover:bg-[#4ADE80]/20",
        destructive: "bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#E5E5E7] hover:bg-[#EF4444]/20",
        warning: "bg-[#FCD34D]/10 border border-[#FCD34D]/20 text-[#E5E5E7] hover:bg-[#FCD34D]/20",
        outline: "border border-[#3A3A3C] bg-transparent text-[#E5E5E7] hover:bg-white/5",
        glass: "bg-white/5 backdrop-blur-md border border-[#3A3A3C] text-[#E5E5E7] hover:bg-white/10",
        ghost: "text-[#A1A1AA] hover:text-[#E5E5E7] hover:bg-white/5",
        link: "text-[#4F8CFF] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface VisionButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof visionButtonVariants> {
  asChild?: boolean
}

const VisionButton = React.forwardRef<HTMLButtonElement, VisionButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(visionButtonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
VisionButton.displayName = "VisionButton"

export { VisionButton, visionButtonVariants }