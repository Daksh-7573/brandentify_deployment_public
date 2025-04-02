import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState(value);
  
  // Filter the options based on input value
  const filteredOptions = DEGREE_OPTIONS.filter(
    option => option.toLowerCase().includes(inputValue.toLowerCase())
  );

  // Handle selection from dropdown
  const handleSelect = (currentValue: string) => {
    // If user selects the same value that's already selected, clear it
    setInputValue(currentValue);
    onChange(currentValue);
    setOpen(false);
  };
  
  // When value changes from outside, update the input value
  React.useEffect(() => {
    setInputValue(value);
  }, [value]);
  
  // Handle input change directly (for custom entry)
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);
  };

  return (
    <div className={cn("relative w-full", className)}>
      <Input
        disabled={disabled}
        placeholder={placeholder}
        value={inputValue}
        onChange={handleInputChange}
        onFocus={() => setOpen(true)}
        className="w-full"
      />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="absolute inset-y-0 right-0 flex items-center px-2 opacity-50"
            onClick={() => setOpen(!open)}
            tabIndex={-1}
          >
            <ChevronsUpDown className="h-4 w-4 shrink-0" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
          <Command>
            <CommandInput placeholder="Search degrees..." className="h-9" value={inputValue} onValueChange={setInputValue} />
            <CommandEmpty>No degree found. You can use your custom entry.</CommandEmpty>
            <CommandGroup className="max-h-[300px] overflow-auto">
              {filteredOptions.map((option) => (
                <CommandItem
                  key={option}
                  value={option}
                  onSelect={() => handleSelect(option)}
                  className="flex items-center"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      option === value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}