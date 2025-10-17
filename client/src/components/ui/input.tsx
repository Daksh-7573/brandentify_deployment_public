import * as React from "react"

import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        style={{
          backgroundColor: 'rgba(18, 18, 18, 0.95)',
          backdropFilter: 'blur(12px)',
          color: 'white',
          borderColor: 'rgba(255, 255, 255, 0.2)',
        }}
        className={cn(
          "flex h-10 w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 transition-all file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:cursor-not-allowed disabled:opacity-50 shadow-md hover:border-white/30 placeholder:text-white/50 focus:border-white/50 focus:ring-white/30",
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
