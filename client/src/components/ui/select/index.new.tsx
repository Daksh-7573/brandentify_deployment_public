import * as React from "react"
import * as SelectPrimitive from "@radix-ui/react-select"
import { Check, ChevronDown, ChevronUp } from "lucide-react"

import { cn } from "@/lib/utils"

const Select = SelectPrimitive.Root

const SelectGroup = SelectPrimitive.Group

const SelectValue = SelectPrimitive.Value

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
      className
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="h-4 w-4 opacity-50" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
))
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName

const SelectScrollUpButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => {
  // Add throttling to scroll buttons
  const [isPressed, setIsPressed] = React.useState(false);
  const intervalRef = React.useRef<NodeJS.Timeout | null>(null);
  
  const handleMouseDown = () => {
    setIsPressed(true);
    // Start a recurring throttled scroll
    intervalRef.current = setInterval(() => {
      // This is just to keep the button active - the actual scrolling is managed by Radix
    }, 600); // Very slow scroll speed (600ms between actions)
  };
  
  const handleMouseUp = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsPressed(false);
  };
  
  React.useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);
  
  return (
    <SelectPrimitive.ScrollUpButton
      ref={ref}
      className={cn(
        "flex cursor-pointer items-center justify-center py-1 transition-colors",
        isPressed ? "bg-accent" : "hover:bg-accent/50",
        className
      )}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      {...props}
    >
      <ChevronUp className="h-4 w-4" />
    </SelectPrimitive.ScrollUpButton>
  );
})
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName

const SelectScrollDownButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => {
  // Add throttling to scroll buttons
  const [isPressed, setIsPressed] = React.useState(false);
  const intervalRef = React.useRef<NodeJS.Timeout | null>(null);
  
  const handleMouseDown = () => {
    setIsPressed(true);
    // Start a recurring throttled scroll
    intervalRef.current = setInterval(() => {
      // This is just to keep the button active - the actual scrolling is managed by Radix
    }, 600); // Very slow scroll speed (600ms between actions)
  };
  
  const handleMouseUp = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsPressed(false);
  };
  
  React.useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);
  
  return (
    <SelectPrimitive.ScrollDownButton
      ref={ref}
      className={cn(
        "flex cursor-pointer items-center justify-center py-1 transition-colors",
        isPressed ? "bg-accent" : "hover:bg-accent/50",
        className
      )}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      {...props}
    >
      <ChevronDown className="h-4 w-4" />
    </SelectPrimitive.ScrollDownButton>
  );
})
SelectScrollDownButton.displayName =
  SelectPrimitive.ScrollDownButton.displayName

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = "popper", ...props }, ref) => {
  // Create a ref for the content
  const contentRef = React.useRef<HTMLDivElement>(null);
  
  // Use effect to apply global styles to prevent hover behavior
  React.useEffect(() => {
    const content = contentRef.current;
    if (!content) return;
    
    // Add a style to prevent any hover effects in the dropdown
    const style = document.createElement('style');
    style.textContent = `
      [data-radix-select-viewport] > * {
        pointer-events: none !important;
      }
      [data-radix-select-viewport] [role="option"] {
        pointer-events: auto !important;
      }
      [data-radix-select-item] {
        pointer-events: auto !important;
      }
    `;
    content.appendChild(style);
    
    return () => {
      style.remove();
    };
  }, []);
  
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        ref={(node) => {
          // Assign the ref to both our ref and the forwardRef
          if (node) {
            if (contentRef) contentRef.current = node as HTMLDivElement;
            if (typeof ref === 'function') ref(node);
            else if (ref) ref.current = node;
          }
        }}
        className={cn(
          "relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          position === "popper" &&
            "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
          className
        )}
        position={position}
        onPointerEnter={(e) => {
          // Prevent default hover behavior
          e.preventDefault();
        }}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport
          className={cn(
            "p-1",
            position === "popper" &&
              "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
})
SelectContent.displayName = SelectPrimitive.Content.displayName

const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn("py-1.5 pl-8 pr-2 text-sm font-semibold", className)}
    {...props}
  />
))
SelectLabel.displayName = SelectPrimitive.Label.displayName

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => {
  const [isSelected, setIsSelected] = React.useState(false);
  const [isHighlighted, setIsHighlighted] = React.useState(false);
  const itemRef = React.useRef<HTMLDivElement>(null);
  
  // Completely disable hover behavior
  React.useEffect(() => {
    const item = itemRef.current;
    if (!item) return;
    
    // Override any hover styles that might be applied by Radix
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'data-highlighted') {
          const isHighlightedNow = item.hasAttribute('data-highlighted');
          if (isHighlightedNow && !isHighlighted) {
            // Only allow highlighting through explicit clicks
            setIsHighlighted(false);
            item.removeAttribute('data-highlighted');
          }
        }
      });
    });
    
    observer.observe(item, { attributes: true });
    
    return () => {
      observer.disconnect();
    };
  }, [isHighlighted]);
  
  const handleClick = (e: React.MouseEvent) => {
    // Explicitly set our own highlighted state
    setIsHighlighted(true);
    setIsSelected(true);
    
    // Let the actual click propagate with a delay for visual feedback
    setTimeout(() => {
      if (props.onClick) {
        props.onClick(e as any);
      }
    }, 50);
  };
  
  return (
    <div 
      ref={itemRef}
      className={cn(
        "relative flex w-full select-none items-center rounded-sm py-3 pl-8 pr-2 text-sm outline-none cursor-pointer",
        (isSelected || isHighlighted) ? "bg-accent text-accent-foreground" : "bg-transparent hover:bg-transparent",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className
      )}
      onClick={handleClick}
    >
      <SelectPrimitive.Item
        ref={ref}
        className="absolute inset-0 opacity-0 cursor-pointer"
        onMouseEnter={(e) => {
          // Prevent default hover behavior
          e.preventDefault();
          e.stopPropagation();
        }}
        {...props}
      >
        <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
      </SelectPrimitive.Item>
      
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        {isSelected && <Check className="h-4 w-4" />}
      </span>

      <span className="truncate">{children}</span>
    </div>
  );
})
SelectItem.displayName = SelectPrimitive.Item.displayName

const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-muted", className)}
    {...props}
  />
))
SelectSeparator.displayName = SelectPrimitive.Separator.displayName

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
}