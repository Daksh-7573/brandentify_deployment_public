import * as React from "react"
import { cn } from "@/lib/utils"

export interface VisionInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const VisionInput = React.forwardRef<HTMLInputElement, VisionInputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-md bg-white/5 border border-[#3A3A3C] px-3 py-2 text-sm text-[#E5E5E7] placeholder:text-[#6B7280] focus:outline-none focus:ring-1 focus:ring-[#4F8CFF] focus:border-[#4F8CFF]/20 focus:bg-white/8 focus:shadow-[0_0_0_4px_rgba(79,140,255,0.1)] disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 ease-out backdrop-blur-sm",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
VisionInput.displayName = "VisionInput"

export { VisionInput }