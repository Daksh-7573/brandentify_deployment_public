import { useState, useEffect } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { cn } from "@/lib/utils";

export interface JobTitleComboboxProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  error?: boolean;
}

// Common job titles that will be used for suggestions
const JOB_TITLES = [
  "Software Engineer",
  "Product Manager",
  "UX Designer",
  "Data Scientist",
  "Marketing Manager",
  "Financial Analyst",
  "Human Resources Manager",
  "Sales Manager",
  "Project Manager",
  "Operations Manager",
  "Customer Success Manager",
  "Business Analyst",
  "DevOps Engineer",
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "Mobile Developer",
  "Data Engineer",
  "Content Creator",
  "Digital Marketing Specialist",
  "Account Executive",
  "Chief Executive Officer (CEO)",
  "Chief Technology Officer (CTO)",
  "Chief Financial Officer (CFO)",
  "Chief Marketing Officer (CMO)",
  "Chief Operating Officer (COO)",
  "Vice President (VP)",
  "Director"
];

export function JobTitleCombobox({ 
  value, 
  onChange, 
  placeholder = "Select a job title",
  className,
  disabled = false,
  error = false
}: JobTitleComboboxProps) {
  const [open, setOpen] = useState(false);
  const [filteredTitles, setFilteredTitles] = useState<string[]>([]);
  const [searchValue, setSearchValue] = useState("");

  // Filter job titles based on search value
  useEffect(() => {
    if (!searchValue) {
      setFilteredTitles(JOB_TITLES);
      return;
    }

    const filtered = JOB_TITLES.filter(
      title => title.toLowerCase().includes(searchValue.toLowerCase())
    );
    setFilteredTitles(filtered);
  }, [searchValue]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between", 
            className, 
            error && "border-destructive"
          )}
          disabled={disabled}
        >
          {value ? value : <span className="text-muted-foreground">{placeholder}</span>}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command shouldFilter={false}>
          <CommandInput 
            placeholder="Search job title..." 
            onValueChange={setSearchValue}
            value={searchValue}
            className="h-9"
          />
          {filteredTitles.length === 0 && (
            <CommandEmpty>
              No job title found. 
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
            {filteredTitles.map((title) => (
              <CommandItem
                key={title}
                value={title}
                onSelect={() => {
                  onChange(title);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === title ? "opacity-100" : "opacity-0"
                  )}
                />
                {title}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}