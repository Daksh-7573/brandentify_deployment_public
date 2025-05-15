import { useState, useEffect, KeyboardEvent } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";

// Main industries list
const INDUSTRIES = [
  "Technology",
  "Healthcare",
  "Finance",
  "Education",
  "Manufacturing",
  "Retail",
  "Media & Entertainment",
  "Construction",
  "Transportation",
  "Energy",
  "Hospitality",
  "Agriculture",
  "Telecommunications",
  "Real Estate",
  "Consulting",
  "Pharmaceuticals",
  "Legal Services",
  "Marketing & Advertising",
  "Aerospace",
  "Automotive",
  "Biotechnology",
  "Nonprofit",
  "Government",
  "Food & Beverage",
  "Fashion",
  "Arts & Design",
];

export interface IndustryComboboxProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  width?: string;
  triggerClassName?: string;
  contentClassName?: string;
}

export function IndustryCombobox({
  value,
  onChange,
  placeholder = "Select an industry",
  className,
  disabled = false,
  width = "w-full",
  triggerClassName,
  contentClassName
}: IndustryComboboxProps) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [filteredIndustries, setFilteredIndustries] = useState<string[]>(INDUSTRIES);
  
  // Debug value passed to the component
  console.log("IndustryCombobox received value:", value);

  useEffect(() => {
    if (!searchValue) {
      setFilteredIndustries(INDUSTRIES);
      return;
    }

    const filtered = INDUSTRIES.filter(industry => 
      industry.toLowerCase().includes(searchValue.toLowerCase())
    );
    setFilteredIndustries(filtered);
  }, [searchValue]);

  // Handle Enter key to add custom industry
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchValue.trim() !== '') {
      e.preventDefault();
      onChange(searchValue.trim());
      setOpen(false);
    }
  };

  // Initialize value to "Technology" if empty to ensure a default value 
  // that meets validation requirements
  useEffect(() => {
    if (!value || value.trim() === '') {
      onChange('Technology');  // Set a default value if empty
    }
  }, [value, onChange]);

  // Before rendering, ensure value is properly formatted
  const displayValue = value && value.trim() !== '' 
    ? (INDUSTRIES.find(industry => industry === value) || value) 
    : 'Technology'; // Always show a default value
    
  // Log the calculated display value
  console.log("IndustryCombobox display value:", displayValue);
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "justify-between", 
            width, 
            className,
            triggerClassName || "border-blue-100 focus:border-blue-300 focus-visible:ring-blue-500"
          )}
          disabled={disabled}
          onClick={() => setOpen(true)}
        >
          {displayValue 
            ? displayValue 
            : <span className="text-muted-foreground">{placeholder}</span>
          }
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className={cn("p-0", width, contentClassName)}>
        <Command shouldFilter={false}>
          <CommandInput 
            placeholder="Search industries or type to add new..." 
            onValueChange={setSearchValue}
            value={searchValue}
            className="h-9 border-blue-100 focus-visible:ring-blue-500"
            onKeyDown={handleKeyDown}
          />
          <CommandList>
            {filteredIndustries.length === 0 && (
              <CommandEmpty>
                No industries found
                {searchValue && (
                  <Button
                    variant="ghost"
                    className="mt-2 w-full justify-start text-left text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                    onClick={() => {
                      onChange(searchValue);
                      setOpen(false);
                    }}
                  >
                    Use "{searchValue}"
                  </Button>
                )}
              </CommandEmpty>
            )}
            <CommandGroup className="max-h-60 overflow-auto">
              {filteredIndustries.map(industry => (
                <div 
                  key={industry}
                  className="px-2 py-1.5 text-sm cursor-pointer hover:bg-blue-50 flex items-center"
                  onClick={() => {
                    onChange(industry);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === industry ? "opacity-100 text-blue-600" : "opacity-0"
                    )}
                  />
                  {industry}
                </div>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}