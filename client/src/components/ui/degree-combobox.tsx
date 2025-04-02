import * as React from "react";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface DegreeComboboxProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

// Common degree options
const DEGREES = [
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

// Load custom degrees from localStorage
const loadCustomDegrees = (): string[] => {
  try {
    const stored = localStorage.getItem("customDegrees");
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Error loading custom degrees:", error);
    return [];
  }
};

// Save a new custom degree to localStorage
const saveCustomDegree = (degree: string) => {
  try {
    const customDegrees = loadCustomDegrees();
    if (!customDegrees.includes(degree) && !DEGREES.includes(degree)) {
      customDegrees.push(degree);
      localStorage.setItem("customDegrees", JSON.stringify(customDegrees));
    }
  } catch (error) {
    console.error("Error saving custom degree:", error);
  }
};

export function DegreeCombobox({
  value,
  onChange,
  placeholder = "Select a degree",
  className,
  disabled = false
}: DegreeComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");
  const [customDegrees, setCustomDegrees] = React.useState<string[]>(loadCustomDegrees());
  
  // Combine preset and custom degrees
  const allDegrees = React.useMemo(() => [...DEGREES, ...customDegrees], [customDegrees]);
  
  // When the user makes a selection
  const handleSelect = (currentValue: string) => {
    if (currentValue === "add-custom") {
      // Add custom degree
      if (inputValue.trim()) {
        saveCustomDegree(inputValue);
        setCustomDegrees(loadCustomDegrees());
        onChange(inputValue);
      }
    } else {
      onChange(currentValue);
    }
    setOpen(false);
  };
  
  // Should we show "Add custom" option?
  const showAddCustom = inputValue.trim().length > 0 && 
    !allDegrees.some(d => d.toLowerCase() === inputValue.toLowerCase());

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
          disabled={disabled}
          onClick={() => setOpen(true)}
        >
          {value ? (
            value
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
        <Command shouldFilter={false}>
          <CommandInput 
            placeholder="Search for a degree..." 
            value={inputValue}
            onValueChange={setInputValue}
            className="h-9"
          />
          <CommandEmpty>
            {showAddCustom ? (
              <CommandItem
                value="add-custom"
                onSelect={() => handleSelect("add-custom")}
                className="text-blue-500"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add "{inputValue}"
              </CommandItem>
            ) : (
              "No degree found."
            )}
          </CommandEmpty>
          <CommandGroup className="max-h-64 overflow-y-auto">
            {allDegrees
              .filter(degree => 
                degree.toLowerCase().includes(inputValue.toLowerCase())
              )
              .sort((a, b) => {
                // Exact match first
                if (a.toLowerCase() === inputValue.toLowerCase()) return -1;
                if (b.toLowerCase() === inputValue.toLowerCase()) return 1;
                
                // Then starts with
                const aStartsWith = a.toLowerCase().startsWith(inputValue.toLowerCase());
                const bStartsWith = b.toLowerCase().startsWith(inputValue.toLowerCase());
                
                if (aStartsWith && !bStartsWith) return -1;
                if (!aStartsWith && bStartsWith) return 1;
                
                // Alphabetical order
                return a.localeCompare(b);
              })
              .map((degree) => (
                <CommandItem
                  key={degree}
                  value={degree}
                  onSelect={() => handleSelect(degree)}
                >
                  {degree}
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      value === degree ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            {showAddCustom && allDegrees.length > 0 && (
              <CommandItem
                value="add-custom"
                onSelect={() => handleSelect("add-custom")}
                className="text-blue-500 border-t"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add "{inputValue}"
              </CommandItem>
            )}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}