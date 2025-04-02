import { useState, useEffect } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { cn } from "@/lib/utils";

export interface DegreeComboboxProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

// Common degree options that will be used for suggestions
const DEGREES = [
  "Bachelor of Arts (BA)",
  "Bachelor of Science (BS/BSc)",
  "Bachelor of Business Administration (BBA)",
  "Bachelor of Engineering (BEng)",
  "Bachelor of Fine Arts (BFA)",
  "Bachelor of Technology (BTech)",
  "Master of Arts (MA)",
  "Master of Science (MS/MSc)",
  "Master of Business Administration (MBA)",
  "Master of Engineering (MEng)",
  "Master of Fine Arts (MFA)",
  "Master of Technology (MTech)",
  "Doctor of Philosophy (PhD)",
  "Doctor of Education (EdD)",
  "Doctor of Medicine (MD)",
  "Juris Doctor (JD)",
  "Associate of Arts (AA)",
  "Associate of Science (AS)",
  "Associate of Applied Science (AAS)",
  "Diploma",
  "Certificate",
  "Post Graduate Diploma",
  "High School Diploma",
  "GED",
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
  const [filteredDegrees, setFilteredDegrees] = useState<string[]>([]);
  const [searchValue, setSearchValue] = useState("");

  // Filter degrees based on search value
  useEffect(() => {
    if (!searchValue) {
      setFilteredDegrees(DEGREES);
      return;
    }

    const filtered = DEGREES.filter(
      degree => degree.toLowerCase().includes(searchValue.toLowerCase())
    );
    setFilteredDegrees(filtered);
  }, [searchValue]);

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
            placeholder="Search degree..." 
            onValueChange={setSearchValue}
            className="h-9"
          />
          <CommandEmpty>No degree found.</CommandEmpty>
          <CommandGroup className="max-h-64 overflow-y-auto">
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