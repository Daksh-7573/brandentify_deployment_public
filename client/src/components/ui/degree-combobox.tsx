import { useState, useEffect } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { cn } from "@/lib/utils";

export interface DegreeComboboxProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

// Common degree options that will be used as default suggestions
const DEFAULT_DEGREES = [
  // Bachelor Degrees
  "Bachelor of Arts (BA)",
  "Bachelor of Science (BS/BSc)",
  "Bachelor of Business Administration (BBA)",
  "Bachelor of Engineering (BEng)",
  "Bachelor of Fine Arts (BFA)",
  "Bachelor of Technology (BTech)",
  "Bachelor of Architecture (BArch)",
  "Bachelor of Commerce (BCom)",
  "Bachelor of Education (BEd)",
  "Bachelor of Law (LLB)",
  "Bachelor of Medicine, Bachelor of Surgery (MBBS)",
  "Bachelor of Computer Applications (BCA)",
  "Bachelor of Design (BDes)",
  "Bachelor of Pharmacy (BPharm)",
  "Bachelor of Nursing (BSN/BN)",
  "Bachelor of Social Work (BSW)",
  "Bachelor of Music (BMus)",
  "Bachelor of Journalism (BJ)",
  "Bachelor of Dental Surgery (BDS)",
  
  // Master Degrees
  "Master of Arts (MA)",
  "Master of Science (MS/MSc)",
  "Master of Business Administration (MBA)",
  "Master of Engineering (MEng)",
  "Master of Fine Arts (MFA)",
  "Master of Technology (MTech)",
  "Master of Architecture (MArch)",
  "Master of Commerce (MCom)",
  "Master of Education (MEd)",
  "Master of Law (LLM)",
  "Master of Computer Applications (MCA)",
  "Master of Design (MDes)",
  "Master of Pharmacy (MPharm)",
  "Master of Public Health (MPH)",
  "Master of Social Work (MSW)",
  "Master of Philosophy (MPhil)",
  "Master of Public Administration (MPA)",
  "Master of Library Science (MLS)",
  "Master of Music (MMus)",
  
  // Doctoral Degrees
  "Doctor of Philosophy (PhD)",
  "Doctor of Education (EdD)",
  "Doctor of Medicine (MD)",
  "Doctor of Business Administration (DBA)",
  "Doctor of Engineering (DEng/EngD)",
  "Doctor of Arts (DA)",
  "Doctor of Science (DSc/ScD)",
  "Doctor of Psychology (PsyD)",
  "Doctor of Nursing Practice (DNP)",
  "Doctor of Public Health (DrPH)",
  "Doctor of Social Work (DSW)",
  
  // Professional Degrees
  "Juris Doctor (JD)",
  "Doctor of Dental Medicine (DMD)",
  "Doctor of Dental Surgery (DDS)",
  "Doctor of Pharmacy (PharmD)",
  "Doctor of Veterinary Medicine (DVM)",
  "Doctor of Osteopathic Medicine (DO)",
  
  // Associate Degrees
  "Associate of Arts (AA)",
  "Associate of Science (AS)",
  "Associate of Applied Science (AAS)",
  "Associate of Business Administration (ABA)",
  "Associate of Engineering (AE)",
  "Associate of Fine Arts (AFA)",
  
  // Other Credentials
  "Diploma",
  "Certificate",
  "Post Graduate Diploma",
  "Post Graduate Certificate",
  "Executive Education Certificate",
  "Professional Certificate",
  "High School Diploma",
  "GED (General Educational Development)",
  "International Baccalaureate (IB)",
  "Technical Diploma",
  "Vocational Training Certificate",
  "Foundation Degree",
  "Higher National Diploma (HND)",
  "Higher National Certificate (HNC)",
  "Other"
];

// Get stored custom degrees
const getCustomDegrees = (): string[] => {
  try {
    const stored = localStorage.getItem("customDegrees");
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Error loading custom degrees:", error);
    return [];
  }
};

// Save custom degree
const addCustomDegree = (degree: string) => {
  if (!degree.trim()) return;
  
  try {
    const existing = getCustomDegrees();
    // Check if degree already exists (case insensitive)
    if (!existing.some(d => d.toLowerCase() === degree.toLowerCase()) && 
        !DEFAULT_DEGREES.some(d => d.toLowerCase() === degree.toLowerCase())) {
      const updated = [...existing, degree];
      localStorage.setItem("customDegrees", JSON.stringify(updated));
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
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [customDegrees, setCustomDegrees] = useState<string[]>(getCustomDegrees());
  
  // All available degrees (default + custom)
  const allDegrees = [...DEFAULT_DEGREES, ...customDegrees];
  
  // Keep popover open when user is typing
  useEffect(() => {
    if (inputValue.length > 0) {
      setOpen(true);
    }
  }, [inputValue]);
  
  // Filter degrees based on input
  const filteredDegrees = allDegrees.filter(degree => 
    degree.toLowerCase().includes(inputValue.toLowerCase())
  );
  
  // Sort filtered degrees to bring matching ones to the top
  const sortedDegrees = filteredDegrees.sort((a, b) => {
    // Exact matches first
    if (a.toLowerCase() === inputValue.toLowerCase()) return -1;
    if (b.toLowerCase() === inputValue.toLowerCase()) return 1;
    
    // Then starts with matches
    const aStartsWith = a.toLowerCase().startsWith(inputValue.toLowerCase());
    const bStartsWith = b.toLowerCase().startsWith(inputValue.toLowerCase());
    
    if (aStartsWith && !bStartsWith) return -1;
    if (!aStartsWith && bStartsWith) return 1;
    
    // Finally alphabetical order
    return a.localeCompare(b);
  });
  
  // Show "Add New" only if we have input and no exact match
  const hasExactMatch = allDegrees.some(
    d => d.toLowerCase() === inputValue.toLowerCase()
  );
  
  const showAddNew = inputValue.length >= 2 && !hasExactMatch;
  
  // Handle selection
  const handleSelect = (selectedValue: string) => {
    if (selectedValue === "add-new") {
      // Add as custom degree and set as value
      addCustomDegree(inputValue);
      setCustomDegrees(getCustomDegrees());
      onChange(inputValue);
    } else {
      onChange(selectedValue);
    }
    setOpen(false);
  };
  
  // Click handler for button to show all options
  const handleButtonClick = () => {
    if (!disabled) {
      setOpen(!open);
      if (!open) {
        setInputValue(""); // Clear input when opening to show all options
      }
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
          disabled={disabled}
          onClick={handleButtonClick}
        >
          {value ? value : <span className="text-muted-foreground">{placeholder}</span>}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command>
          <CommandInput 
            placeholder="Type to search degrees..." 
            value={inputValue}
            onValueChange={setInputValue}
            className="h-9"
            autoFocus={true}
          />
          <CommandEmpty>
            {showAddNew ? (
              <div className="px-2 py-2 text-sm">
                No matches found
              </div>
            ) : (
              <div className="px-2 py-2 text-sm">
                No degrees found
              </div>
            )}
          </CommandEmpty>
          <CommandGroup className="max-h-60 overflow-y-auto">
            {showAddNew && (
              <CommandItem
                value={`add-${inputValue}`} 
                onSelect={() => handleSelect("add-new")}
                className="text-blue-500 font-medium"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add "{inputValue}"
              </CommandItem>
            )}
            {sortedDegrees.map((degree) => (
              <CommandItem
                key={degree}
                value={degree}
                onSelect={() => handleSelect(degree)}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === degree ? "opacity-100" : "opacity-0"
                  )}
                />
                {degree}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}