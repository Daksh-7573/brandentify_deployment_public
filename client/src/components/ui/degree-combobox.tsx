import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
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
  // For custom degree input
  const [customDegree, setCustomDegree] = React.useState("");
  const [showCustomInput, setShowCustomInput] = React.useState(false);

  // Handle selection of a regular degree
  const handleSelectChange = (selectedValue: string) => {
    if (selectedValue === "custom") {
      setShowCustomInput(true);
    } else {
      onChange(selectedValue);
      setShowCustomInput(false);
    }
  };

  // Handle submission of custom degree
  const handleCustomDegreeSubmit = () => {
    if (customDegree.trim()) {
      onChange(customDegree);
      setShowCustomInput(false);
      setCustomDegree("");
    }
  };

  // Handle pressing enter in custom degree input
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleCustomDegreeSubmit();
    }
  };

  return (
    <div className={className}>
      {!showCustomInput ? (
        <Select 
          value={value} 
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
            <SelectItem value="custom" className="text-blue-500">
              <div className="flex items-center">
                <Plus className="mr-2 h-4 w-4" />
                Add custom degree
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      ) : (
        <div className="flex gap-2">
          <Input
            value={customDegree}
            onChange={(e) => setCustomDegree(e.target.value)}
            placeholder="Enter custom degree"
            onKeyDown={handleKeyDown}
            autoFocus
          />
          <Button 
            onClick={handleCustomDegreeSubmit}
            type="button"
            size="sm"
          >
            Add
          </Button>
          <Button 
            onClick={() => {
              setShowCustomInput(false);
              setCustomDegree("");
            }}
            type="button"
            variant="outline"
            size="sm"
          >
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
}