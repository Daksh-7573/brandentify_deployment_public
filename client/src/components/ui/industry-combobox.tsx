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
  useDarkMode?: boolean;
}

export function IndustryCombobox({
  value,
  onChange,
  placeholder = "Select an industry",
  className,
  disabled = false,
  width = "w-full",
  triggerClassName,
  contentClassName,
  useDarkMode = false
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
            useDarkMode 
              ? "bg-[rgba(18,18,18,0.95)] text-white border-white/20 hover:bg-white/10 focus:bg-[rgba(18,18,18,0.95)]" 
              : "border-blue-100 focus:border-blue-300 focus-visible:ring-blue-500",
            triggerClassName
          )}
          disabled={disabled}
          onClick={() => setOpen(true)}
        >
          {displayValue 
            ? displayValue 
            : <span className={cn(
                "text-muted-foreground",
                useDarkMode && "text-gray-400"
              )}>{placeholder}</span>
          }
          <ChevronsUpDown className={cn(
            "ml-2 h-4 w-4 shrink-0 opacity-50",
            useDarkMode && "text-white"
          )} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className={cn(
        "p-0", 
        width, 
        useDarkMode ? "bg-[rgba(30,30,30,0.95)] border-white/20" : "",
        contentClassName
      )}>
        <Command shouldFilter={false} className={useDarkMode ? "bg-transparent" : ""}>
          <CommandInput 
            placeholder="Search industries or type to add new..." 
            onValueChange={setSearchValue}
            value={searchValue}
            className={cn(
              "h-9",
              useDarkMode
                ? "bg-[rgba(18,18,18,0.95)] text-white border-white/20 focus:border-white/40 placeholder:text-gray-400"
                : "border-blue-100 focus-visible:ring-blue-500"
            )}
            onKeyDown={handleKeyDown}
          />
          <CommandList className={useDarkMode ? "text-white" : ""}>
            {filteredIndustries.length === 0 && (
              <CommandEmpty className={useDarkMode ? "text-white" : ""}>
                No industries found
                {searchValue && (
                  <Button
                    variant="ghost"
                    className={cn(
                      "mt-2 w-full justify-start text-left",
                      useDarkMode
                        ? "text-white hover:text-white hover:bg-white/10"
                        : "text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                    )}
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
                  className={cn(
                    "px-2 py-1.5 text-sm cursor-pointer flex items-center",
                    useDarkMode
                      ? "text-white hover:bg-white/10"
                      : "hover:bg-blue-50"
                  )}
                  onClick={() => {
                    onChange(industry);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === industry 
                        ? useDarkMode
                          ? "opacity-100 text-white"
                          : "opacity-100 text-blue-600" 
                        : "opacity-0"
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