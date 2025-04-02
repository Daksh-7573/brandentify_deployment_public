import * as React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DegreeComboboxProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

// Common degree options
const DEGREE_OPTIONS = [
  // Bachelor Degrees
  "Bachelor of Arts (BA)",
  "Bachelor of Science (BS/BSc)",
  "Bachelor of Business Administration (BBA)",
  "Bachelor of Engineering (BEng)",
  "Bachelor of Fine Arts (BFA)",
  "Bachelor of Technology (BTech)",
  "Bachelor of Architecture (BArch)",
  "Bachelor of Education (BEd)",
  
  // Master Degrees
  "Master of Arts (MA)",
  "Master of Science (MS/MSc)",
  "Master of Business Administration (MBA)",
  "Master of Engineering (MEng)",
  "Master of Fine Arts (MFA)",
  "Master of Education (MEd)",
  
  // Doctoral Degrees
  "Doctor of Philosophy (PhD)",
  "Doctor of Education (EdD)",
  "Doctor of Medicine (MD)",
  "Doctor of Business Administration (DBA)",
  
  // Other Credentials
  "Diploma",
  "Certificate",
  "High School Diploma",
  "Associate Degree",
  "Other"
];

export function DegreeCombobox({
  value,
  onChange,
  placeholder = "Select a degree",
  className,
  disabled = false
}: DegreeComboboxProps) {
  const [useCustomDegree, setUseCustomDegree] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Check if current value is in list of predefined options
  const isCustomValue = !DEGREE_OPTIONS.includes(value);

  // Handle click outside of dropdown
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Set useCustomDegree based on whether the value is custom or not
  React.useEffect(() => {
    setUseCustomDegree(isCustomValue && value !== "");
  }, [value, isCustomValue]);

  if (useCustomDegree) {
    return (
      <div className={className}>
        <div className="flex gap-2">
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Enter custom degree"
            disabled={disabled}
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => setUseCustomDegree(false)}
            className="h-10 w-10"
            disabled={disabled}
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(className, "relative")} ref={dropdownRef}>
      <div 
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
          "focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
          "cursor-pointer",
          disabled && "cursor-not-allowed opacity-50"
        )}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <span className={cn("flex-1 truncate", !value && "text-muted-foreground")}>
          {value || placeholder}
        </span>
        <ChevronDown className="h-4 w-4 opacity-50" />
      </div>
      
      {isOpen && (
        <div className="absolute top-full left-0 z-50 mt-1 w-full rounded-md border bg-popover p-1 shadow-md">
          <div className="max-h-60 overflow-y-auto">
            {DEGREE_OPTIONS.map((option) => (
              <div
                key={option}
                className={cn(
                  "flex cursor-pointer items-center rounded-sm px-2 py-1.5 text-sm outline-none",
                  "hover:bg-accent hover:text-accent-foreground",
                  value === option && "bg-accent text-accent-foreground"
                )}
                onClick={() => {
                  onChange(option);
                  setIsOpen(false);
                }}
              >
                <span className="flex-1">{option}</span>
                {value === option && <Check className="h-4 w-4" />}
              </div>
            ))}
            <div
              className="flex cursor-pointer items-center rounded-sm border-t px-2 py-1.5 text-sm text-blue-500 outline-none hover:bg-accent hover:text-accent-foreground"
              onClick={() => {
                setUseCustomDegree(true);
                setIsOpen(false);
                onChange("");
              }}
            >
              Enter custom degree...
            </div>
          </div>
        </div>
      )}
    </div>
  );
}