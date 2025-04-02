import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
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
  "Other",
  "Other Custom..." // Special option for custom entry
];

export function DegreeCombobox({
  value,
  onChange,
  placeholder = "Select a degree",
  className,
  disabled = false
}: DegreeComboboxProps) {
  const [showCustomInput, setShowCustomInput] = React.useState(false);
  const [customValue, setCustomValue] = React.useState("");
  
  // Check if value is in predefined options
  const isCustomValue = !DEGREE_OPTIONS.includes(value) && value !== "";
  
  // Initialize custom input state if value is custom
  React.useEffect(() => {
    if (isCustomValue) {
      setShowCustomInput(true);
      setCustomValue(value);
    }
  }, [isCustomValue, value]);

  const handleSelectChange = (newValue: string) => {
    if (newValue === "Other Custom...") {
      // Switch to custom input mode
      setShowCustomInput(true);
      setCustomValue("");
    } else {
      // Standard selection
      onChange(newValue);
      setShowCustomInput(false);
    }
  };

  const handleCustomInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setCustomValue(newValue);
    onChange(newValue);
  };

  return (
    <div className={className}>
      {showCustomInput ? (
        <div className="flex gap-2">
          <Input
            value={customValue}
            onChange={handleCustomInputChange}
            placeholder="Enter custom degree"
            disabled={disabled}
            className="flex-1"
          />
          <button 
            onClick={() => {
              setShowCustomInput(false);
              onChange("");
            }}
            className="px-3 py-2 rounded border border-gray-300 hover:bg-gray-50"
            type="button"
          >
            Cancel
          </button>
        </div>
      ) : (
        <Select 
          value={isCustomValue ? undefined : (value || undefined)}
          onValueChange={handleSelectChange}
          disabled={disabled}
        >
          <SelectTrigger>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {DEGREE_OPTIONS.map((degree) => (
              <SelectItem key={degree} value={degree}>
                {degree}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}