import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const visionButtonVariants = cva(
  "inline-flex items-center justify-center rounded-md font-medium transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-[#4F8CFF]/10 border border-[#4F8CFF]/20 text-[#E5E5E7] hover:bg-[#4F8CFF]/20 hover:shadow-[0_0_10px_rgba(79,140,255,0.15)] hover:border-[#4F8CFF]/30",
        secondary: "bg-[#3ED7C2]/10 border border-[#3ED7C2]/20 text-[#E5E5E7] hover:bg-[#3ED7C2]/20 hover:shadow-[0_0_10px_rgba(62,215,194,0.15)] hover:border-[#3ED7C2]/30",
        success: "bg-[#4ADE80]/10 border border-[#4ADE80]/20 text-[#E5E5E7] hover:bg-[#4ADE80]/20 hover:shadow-[0_0_10px_rgba(74,222,128,0.15)] hover:border-[#4ADE80]/30",
        destructive: "bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#E5E5E7] hover:bg-[#EF4444]/20 hover:shadow-[0_0_10px_rgba(239,68,68,0.15)] hover:border-[#EF4444]/30",
        warning: "bg-[#FCD34D]/10 border border-[#FCD34D]/20 text-[#E5E5E7] hover:bg-[#FCD34D]/20 hover:shadow-[0_0_10px_rgba(252,211,77,0.15)] hover:border-[#FCD34D]/30",
        outline: "border border-[#3A3A3C] bg-transparent text-[#E5E5E7] hover:bg-white/5 hover:border-white/20",
        glass: "bg-white/5 backdrop-blur-md border border-[#3A3A3C] text-[#E5E5E7] hover:bg-white/10 hover:shadow-[0_0_15px_rgba(255,255,255,0.05)] hover:border-white/20",
        ghost: "text-[#A1A1AA] hover:text-[#E5E5E7] hover:bg-white/5 hover:shadow-sm",
        link: "text-[#4F8CFF] underline-offset-4 hover:underline hover:text-[#4F8CFF]/90",
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