import { useState, useEffect } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export interface JobTitleComboboxProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  error?: boolean;
}

// Fallback common job titles that will be used if the API fails
const FALLBACK_JOB_TITLES = [
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
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [filteredTitles, setFilteredTitles] = useState<string[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [useLocalFilter, setUseLocalFilter] = useState(false);

  // Fetch suggestions from the API or filter locally
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (!searchValue || searchValue.trim().length < 2) {
        setFilteredTitles([]);
        return;
      }

      if (useLocalFilter) {
        // Use local filtering if API failed previously
        const filtered = FALLBACK_JOB_TITLES.filter(
          title => title.toLowerCase().includes(searchValue.toLowerCase())
        );
        setFilteredTitles(filtered);
        return;
      }

      try {
        setIsLoading(true);
        const response = await fetch(`/api/job-title-suggestions?q=${encodeURIComponent(searchValue)}`);
        const data = await response.json();
        
        if (response.ok) {
          if (Array.isArray(data.suggestions) && data.suggestions.length > 0) {
            setFilteredTitles(data.suggestions);
          } else {
            // If no suggestions from API, fall back to local filtering
            const filtered = FALLBACK_JOB_TITLES.filter(
              title => title.toLowerCase().includes(searchValue.toLowerCase())
            );
            setFilteredTitles(filtered);
          }
        } else {
          console.error("Error fetching job title suggestions:", data);
          setUseLocalFilter(true);
          const filtered = FALLBACK_JOB_TITLES.filter(
            title => title.toLowerCase().includes(searchValue.toLowerCase())
          );
          setFilteredTitles(filtered);
        }
      } catch (error) {
        console.error("Failed to fetch job title suggestions:", error);
        toast({
          variant: "destructive",
          title: "Failed to fetch suggestions",
          description: "Using local suggestions instead.",
        });
        setUseLocalFilter(true);
        const filtered = FALLBACK_JOB_TITLES.filter(
          title => title.toLowerCase().includes(searchValue.toLowerCase())
        );
        setFilteredTitles(filtered);
      } finally {
        setIsLoading(false);
      }
    }, 300); // Debounce to avoid too many API calls

    return () => clearTimeout(delayDebounceFn);
  }, [searchValue, useLocalFilter, toast]);

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
          {isLoading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              <span className="ml-2 text-sm text-muted-foreground">Loading suggestions...</span>
            </div>
          ) : filteredTitles.length === 0 && (
            <CommandEmpty>
              {searchValue && searchValue.trim().length >= 2 ? (
                <div>
                  <p>No job title found.</p>
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
                </div>
              ) : (
                <p>Type at least 2 characters to search</p>
              )}
            </CommandEmpty>
          )}
          <CommandGroup className="max-h-60 overflow-auto">
            {filteredTitles.map((title) => (
              <CommandItem
                key={title}
                value={title}
                onSelect={() => {
                  // Set the title value directly instead of using 'currentValue'
                  onChange(title);
                  setOpen(false);
                }}
                className="cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors duration-150 flex items-center px-2 py-1.5 text-sm rounded-sm w-full"
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