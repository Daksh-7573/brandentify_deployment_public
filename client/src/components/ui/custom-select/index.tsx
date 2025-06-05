import React, { useState, useEffect, useRef } from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type CustomSelectProps = {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  options: { value: string; label: string }[];
  className?: string;
};

export function CustomSelect({
  value,
  onValueChange,
  placeholder = "Select an option",
  options,
  className,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(value);
  const selectRef = useRef<HTMLDivElement>(null);

  // Update the selected value when the value prop changes
  useEffect(() => {
    setSelectedValue(value);
  }, [value]);

  // Close the dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Find the selected option's label
  const selectedOption = options.find(option => option.value === selectedValue);
  const displayText = selectedOption ? selectedOption.label : placeholder;

  // Handle selection
  const handleSelect = (newValue: string) => {
    setSelectedValue(newValue);
    onValueChange(newValue);
    setIsOpen(false);
  };

  return (
    <div className={cn("relative w-full", className)} ref={selectRef}>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          className?.includes("custom-select-smart-radar") && "h-10 px-3 py-2 border border-white/20 bg-[rgba(18,18,18,0.95)] backdrop-blur-md rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/30 shadow-md transition-all hover:border-white/30 placeholder:text-white/50"
        )}
      >
        <span className="truncate">{displayText}</span>
        <ChevronDown className="h-4 w-4 opacity-50" />
      </button>

      {/* Dropdown content */}
      {isOpen && (
        <div className={cn(
          "absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-popover text-popover-foreground shadow-md dropdown-content",
          className?.includes("custom-select-smart-radar") && "border border-white/20 bg-[rgba(18,18,18,0.95)] backdrop-blur-md shadow-2xl"
        )}>
          <div className="p-1">
            {options.map((option) => (
              <div
                key={option.value}
                className={cn(
                  "relative flex w-full cursor-pointer select-none items-center rounded-sm py-3 pl-8 pr-2 text-sm outline-none transition-colors dropdown-item",
                  className?.includes("custom-select-smart-radar") 
                    ? option.value === selectedValue
                      ? "bg-white/10 text-white"
                      : "hover:bg-white/10 text-white"
                    : option.value === selectedValue
                    ? "bg-accent text-accent-foreground"
                    : "hover:bg-accent hover:text-accent-foreground"
                )}
                onClick={() => handleSelect(option.value)}
              >
                {option.value === selectedValue && (
                  <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                    <Check className="h-4 w-4" />
                  </span>
                )}
                <span>{option.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}