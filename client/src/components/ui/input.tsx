import * as React from "react"

import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, style, ...props }, ref) => {
    const glassStyle = {
      backgroundColor: 'rgba(18, 18, 18, 0.95) !important' as any,
      backdropFilter: 'blur(12px) !important' as any,
      WebkitBackdropFilter: 'blur(12px) !important' as any,
      color: 'white !important' as any,
      borderColor: 'rgba(255, 255, 255, 0.2) !important' as any,
      border: '1px solid rgba(255, 255, 255, 0.2) !important' as any,
      ...style
    };
    
    return (
      <input
        type={type}
        style={glassStyle}
        className={cn(
          "flex h-10 w-full rounded-md px-3 py-2 focus:outline-none focus:ring-2 transition-all file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:cursor-not-allowed disabled:opacity-50 shadow-md placeholder:text-white/50 focus:ring-white/30",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
