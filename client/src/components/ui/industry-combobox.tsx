import { useState, useEffect } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { INDUSTRIES } from "@/pages/profile";

export interface IndustryComboboxProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  width?: string;
}

export function IndustryCombobox({
  value,
  onChange,
  placeholder = "Select an industry",
  disabled = false,
  className,
  width = "w-full"
}: IndustryComboboxProps) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [filteredOptions, setFilteredOptions] = useState<string[]>(INDUSTRIES);

  // Convert array of industry strings to the format needed by Combobox
  const options = INDUSTRIES.map(industry => ({
    value: industry,
    label: industry
  }));

  useEffect(() => {
    if (!searchValue) {
      setFilteredOptions(INDUSTRIES);
      return;
    }

    const filtered = INDUSTRIES.filter(industry => 
      industry.toLowerCase().includes(searchValue.toLowerCase())
    );
    setFilteredOptions(filtered);
  }, [searchValue]);

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
            className
          )}
          disabled={disabled}
        >
          {value 
            ? value
            : <span className="text-muted-foreground">{placeholder}</span>
          }
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className={cn("p-0", width)}>
        <Command shouldFilter={false}>
          <CommandInput 
            placeholder="Search industries..." 
            onValueChange={setSearchValue}
            value={searchValue}
            className="h-9"
          />
          {filteredOptions.length === 0 && (
            <CommandEmpty>
              No industries found.
              {searchValue && (
                <Button
                  variant="ghost"
                  className="mt-2 w-full justify-start text-left"
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
            {filteredOptions.map((industry) => (
              <CommandItem
                key={industry}
                value={industry}
                onSelect={() => {
                  onChange(industry);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === industry ? "opacity-100" : "opacity-0"
                  )}
                />
                {industry}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}