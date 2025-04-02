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

// Get degrees from local storage or use default list
const getStoredDegrees = (): string[] => {
  try {
    const stored = localStorage.getItem('degreeSuggestions');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error("Error loading stored degrees:", error);
  }
  return DEFAULT_DEGREES;
};

// Save degrees to local storage
const saveDegrees = (degrees: string[]) => {
  try {
    localStorage.setItem('degreeSuggestions', JSON.stringify(degrees));
  } catch (error) {
    console.error("Error saving degrees:", error);
  }
};

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

export function DegreeCombobox({ 
  value, 
  onChange, 
  placeholder = "Select a degree",
  className,
  disabled = false
}: DegreeComboboxProps) {
  const [open, setOpen] = useState(false);
  const [degrees, setDegrees] = useState<string[]>(() => getStoredDegrees());
  const [filteredDegrees, setFilteredDegrees] = useState<string[]>(degrees);
  const [searchValue, setSearchValue] = useState("");
  const [showAddNew, setShowAddNew] = useState(false);

  // Filter degrees based on search value
  useEffect(() => {
    if (!searchValue) {
      setFilteredDegrees(degrees);
      setShowAddNew(false);
      return;
    }

    const filtered = degrees.filter(
      degree => degree.toLowerCase().includes(searchValue.toLowerCase())
    );
    
    setFilteredDegrees(filtered);
    
    // Only show "Add New" if it's not an exact match and has at least 3 characters
    const hasExactMatch = degrees.some(
      degree => degree.toLowerCase() === searchValue.toLowerCase()
    );
    
    setShowAddNew(!hasExactMatch && searchValue.length >= 3);
  }, [searchValue, degrees]);

  // Add a new degree to the list
  const addNewDegree = () => {
    if (!searchValue.trim() || degrees.includes(searchValue)) return;
    
    const newDegrees = [...degrees, searchValue];
    setDegrees(newDegrees);
    saveDegrees(newDegrees);
    
    // Set the value and close the popover
    onChange(searchValue);
    setOpen(false);
  };

  // Handle custom entry by pressing Enter
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && showAddNew) {
      e.preventDefault();
      addNewDegree();
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
        >
          {value ? value : <span className="text-muted-foreground">{placeholder}</span>}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command onKeyDown={handleKeyDown}>
          <CommandInput 
            placeholder="Search or type a degree..." 
            onValueChange={setSearchValue}
            className="h-9"
          />
          <CommandEmpty>
            {showAddNew ? (
              <div className="py-2 px-1">
                <p className="text-sm text-muted-foreground">No matches found</p>
              </div>
            ) : (
              <div className="py-2 px-1">
                <p className="text-sm text-muted-foreground">No degree found. Type to add custom degree.</p>
              </div>
            )}
          </CommandEmpty>
          <CommandGroup className="max-h-64 overflow-y-auto">
            {showAddNew && (
              <CommandItem
                key="add-new"
                value={`add-${searchValue}`}
                onSelect={addNewDegree}
                className="text-blue-500 font-medium"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add "{searchValue}"
              </CommandItem>
            )}
            {filteredDegrees.map((degree) => (
              <CommandItem
                key={degree}
                value={degree}
                onSelect={() => {
                  onChange(degree);
                  setOpen(false);
                }}
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