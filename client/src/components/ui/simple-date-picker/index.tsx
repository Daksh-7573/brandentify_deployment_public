import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { format, isValid, parse } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type SimpleDatePickerProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
};

export function SimpleDatePicker({
  value,
  onChange,
  placeholder = "MM/DD/YYYY",
  className,
  disabled = false,
}: SimpleDatePickerProps) {
  // Parse the initial value into month, day, year
  const parseInitialDate = () => {
    if (!value) return { month: "", day: "", year: "" };
    
    try {
      const date = parse(value, "yyyy-MM-dd", new Date());
      if (isValid(date)) {
        return {
          month: String(date.getMonth() + 1).padStart(2, '0'),
          day: String(date.getDate()).padStart(2, '0'),
          year: String(date.getFullYear())
        };
      }
    } catch (error) {
      console.error("Error parsing date:", error);
    }
    
    return { month: "", day: "", year: "" };
  };

  const [dateValues, setDateValues] = useState(parseInitialDate());
  const [monthOpen, setMonthOpen] = useState(false);
  const [yearOpen, setYearOpen] = useState(false);
  
  // Month and year suggestions
  const months = [
    { label: "January", value: "01" },
    { label: "February", value: "02" },
    { label: "March", value: "03" },
    { label: "April", value: "04" },
    { label: "May", value: "05" },
    { label: "June", value: "06" },
    { label: "July", value: "07" },
    { label: "August", value: "08" },
    { label: "September", value: "09" },
    { label: "October", value: "10" },
    { label: "November", value: "11" },
    { label: "December", value: "12" }
  ];

  // Generate years from 1950 to current year + 5
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1950 + 5 + 1 }, (_, i) => ({
    label: String(currentYear - i + 5),
    value: String(currentYear - i + 5)
  })).reverse();

  // Filter suggestions based on input
  const getFilteredMonths = () => {
    if (!dateValues.month) return months;
    return months.filter(month => 
      month.label.toLowerCase().startsWith(dateValues.month.toLowerCase()) || 
      month.value.startsWith(dateValues.month)
    );
  };

  const getFilteredYears = () => {
    if (!dateValues.year) return years;
    return years.filter(year => 
      year.value.startsWith(dateValues.year)
    );
  };

  // Update the component when the value prop changes
  useEffect(() => {
    setDateValues(parseInitialDate());
  }, [value]);

  // Validate and format date parts
  const validateMonth = (value: string) => {
    const numValue = parseInt(value);
    if (value === "") return "";
    if (isNaN(numValue) || numValue < 1 || numValue > 12) return dateValues.month;
    return String(numValue).padStart(2, '0');
  };

  const validateDay = (value: string) => {
    const numValue = parseInt(value);
    if (value === "") return "";
    if (isNaN(numValue) || numValue < 1 || numValue > 31) return dateValues.day;
    return String(numValue).padStart(2, '0');
  };

  const validateYear = (value: string) => {
    const numValue = parseInt(value);
    if (value === "") return "";
    if (isNaN(numValue) || numValue < 1900 || numValue > 2100) return dateValues.year;
    return String(numValue);
  };

  // Handle input changes
  const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    // Allow typing
    setDateValues(prev => ({ ...prev, month: input }));
    
    // Show suggestions when typing
    if (input && !disabled) {
      setMonthOpen(true);
    }
    
    // Handle validation on blur
    const newMonth = validateMonth(input);
    if (newMonth !== input) {
      setDateValues(prev => ({ ...prev, month: newMonth }));
    }
    
    updateDateValue({ ...dateValues, month: newMonth });
  };

  const handleDayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDay = validateDay(e.target.value);
    setDateValues({ ...dateValues, day: newDay });
    updateDateValue({ ...dateValues, day: newDay });
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    // Allow typing
    setDateValues(prev => ({ ...prev, year: input }));
    
    // Show suggestions when typing
    if (input && !disabled) {
      setYearOpen(true);
    }
    
    // Handle validation on blur
    const newYear = validateYear(input);
    if (newYear !== input) {
      setDateValues(prev => ({ ...prev, year: newYear }));
    }
    
    updateDateValue({ ...dateValues, year: newYear });
  };

  // Create the ISO formatted date string and send it to the parent component
  const updateDateValue = (newValues: { month: string; day: string; year: string }) => {
    if (newValues.month && newValues.day && newValues.year) {
      try {
        const dateString = `${newValues.year}-${newValues.month}-${newValues.day}`;
        const date = parse(dateString, "yyyy-MM-dd", new Date());
        
        if (isValid(date)) {
          onChange(format(date, "yyyy-MM-dd"));
        }
      } catch (error) {
        console.error("Error formatting date:", error);
      }
    } else if (!newValues.month && !newValues.day && !newValues.year) {
      // If all fields are empty, clear the date
      onChange("");
    }
  };

  // Handle suggestion selection
  const selectMonth = (value: string) => {
    setDateValues(prev => ({ ...prev, month: value }));
    updateDateValue({ ...dateValues, month: value });
    setMonthOpen(false);
  };

  const selectYear = (value: string) => {
    setDateValues(prev => ({ ...prev, year: value }));
    updateDateValue({ ...dateValues, year: value });
    setYearOpen(false);
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className="relative">
        <Input
          className="w-16"
          placeholder="MM"
          value={dateValues.month}
          onChange={handleMonthChange}
          maxLength={2}
          disabled={disabled}
          onFocus={() => !disabled && setMonthOpen(true)}
          onClick={() => !disabled && setMonthOpen(true)}
        />
        <Popover open={monthOpen && !disabled} onOpenChange={setMonthOpen}>
          <PopoverTrigger className="sr-only">
            <span>Month</span>
          </PopoverTrigger>
          <PopoverContent className="p-0 w-40 max-h-60 overflow-auto" align="start">
            <div className="grid gap-1">
              {getFilteredMonths().map((month) => (
                <button
                  key={month.value}
                  onClick={() => selectMonth(month.value)}
                  className="px-2 py-1 text-left hover:bg-accent rounded-sm flex items-center"
                >
                  <span className="mr-2">{month.value}</span>
                  <span>{month.label}</span>
                </button>
              ))}
              {getFilteredMonths().length === 0 && (
                <div className="px-2 py-1 text-muted-foreground">No matches</div>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>
      
      <span className="text-gray-500">/</span>
      
      <Input
        className="w-16"
        placeholder="DD"
        value={dateValues.day}
        onChange={handleDayChange}
        maxLength={2}
        disabled={disabled}
      />
      
      <span className="text-gray-500">/</span>
      
      <div className="relative">
        <Input
          className="w-20"
          placeholder="YYYY"
          value={dateValues.year}
          onChange={handleYearChange}
          maxLength={4}
          disabled={disabled}
          onFocus={() => !disabled && setYearOpen(true)}
          onClick={() => !disabled && setYearOpen(true)}
        />
        <Popover open={yearOpen && !disabled} onOpenChange={setYearOpen}>
          <PopoverTrigger className="sr-only">
            <span>Year</span>
          </PopoverTrigger>
          <PopoverContent className="p-0 w-24 max-h-60 overflow-auto" align="start">
            <div className="grid gap-1">
              {getFilteredYears().map((year) => (
                <button
                  key={year.value}
                  onClick={() => selectYear(year.value)}
                  className="px-2 py-1 text-left hover:bg-accent rounded-sm"
                >
                  {year.value}
                </button>
              ))}
              {getFilteredYears().length === 0 && (
                <div className="px-2 py-1 text-muted-foreground">No matches</div>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}