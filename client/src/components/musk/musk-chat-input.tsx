import * as React from "react";

import { Input, type InputProps } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const MuskChatInput = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => (
    <Input
      ref={ref}
      className={cn(
        "h-11 rounded-xl pr-10 !bg-zinc-900/80 !text-white !placeholder:text-zinc-400 !border !border-zinc-700 focus:!border-primary focus:!ring-1 focus:!ring-primary",
        className
      )}
      {...props}
    />
  )
);

MuskChatInput.displayName = "MuskChatInput";

export { MuskChatInput };
