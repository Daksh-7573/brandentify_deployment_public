import * as React from "react";
import { Check, ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

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
  "Associate Degree"
];

export function DegreeCombobox({
  value,
  onChange,
  placeholder = "Type to search degrees...",
  className,
  disabled = false
}: DegreeComboboxProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState(value || "");
  const inputRef = React.useRef<HTMLInputElement>(null);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  
  // Filter the options based on input value
  const filteredOptions = DEGREE_OPTIONS.filter(
    option => option.toLowerCase().includes(inputValue.toLowerCase())
  );
  
  // When value changes from outside, update the input value
  React.useEffect(() => {
    setInputValue(value || "");
  }, [value]);
  
  // Handle input change directly (for custom entry)
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);
    
    // If we're typing, make sure the dropdown is open
    if (!isOpen && newValue) {
      setIsOpen(true);
    }
  };
  
  // Handle selection from dropdown
  const handleSelect = (selectedValue: string) => {
    setInputValue(selectedValue);
    onChange(selectedValue);
    setIsOpen(false);
    
    // Focus the input after selection
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };
  
  // Handle click outside to close dropdown
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  
  // Clear input and focus
  const handleClear = () => {
    setInputValue("");
    onChange("");
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className={cn("relative w-full", className)}>
      <div className="relative">
        <Input
          ref={inputRef}
          disabled={disabled}
          placeholder={placeholder}
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          className="w-full pr-10"
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-2">
          {inputValue ? (
            <button 
              type="button"
              onClick={handleClear}
              className="p-1 rounded-full hover:bg-gray-100 focus:outline-none"
            >
              <X className="h-4 w-4" />
            </button>
          ) : (
            <ChevronDown 
              className="h-4 w-4 cursor-pointer"
              onClick={() => setIsOpen(!isOpen)}
            />
          )}
        </div>
      </div>
      
      {isOpen && (
        <div 
          ref={dropdownRef}
          className="absolute w-full z-50 mt-1 bg-white rounded-md shadow-lg border border-gray-200 max-h-60 overflow-auto"
        >
          {filteredOptions.length === 0 ? (
            <div className="py-2 px-4 text-sm text-gray-500">
              No matches found. Your custom entry will be used.
            </div>
          ) : (
            <ul>
              {filteredOptions.map((option) => (
                <li 
                  key={option}
                  onClick={() => handleSelect(option)}
                  className={cn(
                    "py-2 px-4 text-sm cursor-pointer flex items-center",
                    option === value ? "bg-primary/10 text-primary" : "hover:bg-gray-100"
                  )}
                >
                  <span className="w-5 h-5 mr-2 flex items-center justify-center">
                    {option === value && <Check className="h-4 w-4" />}
                  </span>
                  {option}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}