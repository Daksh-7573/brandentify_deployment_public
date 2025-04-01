import { useEffect, useState } from "react";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
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
import { useQuery } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";

interface JobTitleComboboxProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  defaultSuggestions?: string[];
}

export function JobTitleCombobox({
  value,
  onChange,
  placeholder = "Select job title...",
  className,
  defaultSuggestions = [
    "Software Engineer",
    "Product Manager",
    "UX Designer",
    "Data Scientist",
    "Marketing Manager",
    "Financial Analyst",
    "Project Manager",
    "Sales Representative",
  ],
}: JobTitleComboboxProps) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value || "");
  const [debouncedInput, setDebouncedInput] = useState("");
  
  // Set up debounce mechanism for input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputValue.length >= 2) {
        setDebouncedInput(inputValue);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [inputValue]);

  // Fetch suggestions from the API when input changes
  const { data, isLoading, isError } = useQuery({
    queryKey: ["job-title-suggestions", debouncedInput],
    queryFn: async () => {
      if (debouncedInput.length < 2) {
        return { suggestions: defaultSuggestions };
      }
      
      try {
        const response = await fetch(`/api/job-title-suggestions?q=${encodeURIComponent(debouncedInput)}`);
        
        if (!response.ok) {
          throw new Error("Failed to fetch job title suggestions");
        }
        
        return await response.json();
      } catch (error) {
        console.error("Error fetching job title suggestions:", error);
        // Return default suggestions on error
        return { suggestions: defaultSuggestions };
      }
    },
    enabled: debouncedInput.length >= 2,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  // Handle errors in a user-friendly way
  useEffect(() => {
    if (isError) {
      toast({
        title: "Couldn't load suggestions",
        description: "Using default job titles instead",
        variant: "destructive",
      });
    }
  }, [isError]);

  // Get suggestions to display
  const suggestions = data?.suggestions || defaultSuggestions;
  
  // Custom handler for handling selection or free input
  const handleSelect = (selectedValue: string) => {
    onChange(selectedValue);
    setInputValue(selectedValue);
    setOpen(false);
  };

  // Update local state when the parent value changes
  useEffect(() => {
    if (value !== inputValue) {
      setInputValue(value);
    }
  }, [value]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
        >
          {value || placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput 
            placeholder="Search job titles..." 
            value={inputValue}
            onValueChange={(val) => {
              setInputValue(val);
              onChange(val); // Optional: update parent value on every keystroke
            }}
            className="h-9"
          />
          
          {isLoading && (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}

          {!isLoading && (
            <>
              <CommandEmpty>
                {inputValue.length > 0 
                  ? `No job titles match "${inputValue}"`
                  : "Type to search job titles"}
              </CommandEmpty>
              <CommandGroup>
                {suggestions.map((suggestion) => (
                  <CommandItem
                    key={suggestion}
                    value={suggestion}
                    onSelect={() => handleSelect(suggestion)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === suggestion ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {suggestion}
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  );
}