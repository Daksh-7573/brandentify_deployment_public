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

export function DegreeCombobox({ 
  value, 
  onChange, 
  placeholder = "Select a degree",
  className,
  disabled = false
}: DegreeComboboxProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Get all custom degrees from localStorage
  const getCustomDegrees = (): string[] => {
    try {
      const customDegrees = localStorage.getItem("customDegrees");
      return customDegrees ? JSON.parse(customDegrees) : [];
    } catch (error) {
      console.error("Error getting custom degrees:", error);
      return [];
    }
  };
  
  // All degrees (default + custom)
  const allDegrees = [...DEFAULT_DEGREES, ...getCustomDegrees()];
  
  // Filtered degrees based on search term
  const filteredDegrees = searchTerm === "" 
    ? allDegrees 
    : allDegrees.filter(degree => 
        degree.toLowerCase().includes(searchTerm.toLowerCase())
      );
  
  // Save a custom degree
  const saveCustomDegree = (newDegree: string) => {
    try {
      const existingCustomDegrees = getCustomDegrees();
      if (!existingCustomDegrees.includes(newDegree) && 
          !DEFAULT_DEGREES.includes(newDegree)) {
        const updatedDegrees = [...existingCustomDegrees, newDegree];
        localStorage.setItem("customDegrees", JSON.stringify(updatedDegrees));
      }
    } catch (error) {
      console.error("Error saving custom degree:", error);
    }
  };
  
  // Check if we should show the "Add new" option
  const showAddNew = 
    searchTerm.length >= 3 && 
    !allDegrees.some(d => d.toLowerCase() === searchTerm.toLowerCase());
  
  // Handle selecting an item
  const onSelect = (selectedValue: string) => {
    if (selectedValue === "add-new") {
      // Save the custom degree
      saveCustomDegree(searchTerm);
      onChange(searchTerm);
    } else {
      onChange(selectedValue);
    }
    setOpen(false);
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
        <Command>
          <CommandInput 
            placeholder="Search or type a degree..." 
            value={searchTerm}
            onValueChange={setSearchTerm}
          />
          <CommandEmpty>
            {showAddNew ? (
              <div className="px-2 py-1 text-sm">
                Type Enter to add this degree
              </div>
            ) : (
              <div className="px-2 py-1 text-sm">
                No degree found
              </div>
            )}
          </CommandEmpty>
          <CommandGroup className="max-h-60 overflow-y-auto">
            {showAddNew && (
              <CommandItem
                onSelect={() => onSelect("add-new")}
                className="cursor-pointer text-blue-500"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add "{searchTerm}"
              </CommandItem>
            )}
            {filteredDegrees.map((degree) => (
              <CommandItem
                key={degree}
                onSelect={() => onSelect(degree)}
                className="cursor-pointer"
              >
                <div className="flex items-center">
                  {value === degree && (
                    <Check className="mr-2 h-4 w-4 text-green-500" />
                  )}
                  {value !== degree && <span className="mr-2 w-4" />}
                  {degree}
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}