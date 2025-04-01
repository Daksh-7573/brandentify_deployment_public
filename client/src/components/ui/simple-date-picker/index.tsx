import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { format, isValid, parse } from "date-fns";
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
  const [monthDropdownOpen, setMonthDropdownOpen] = useState(false);
  const [yearDropdownOpen, setYearDropdownOpen] = useState(false);
  
  const monthRef = useRef<HTMLDivElement>(null);
  const yearRef = useRef<HTMLDivElement>(null);
  
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

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (monthRef.current && !monthRef.current.contains(event.target as Node)) {
        setMonthDropdownOpen(false);
      }
      if (yearRef.current && !yearRef.current.contains(event.target as Node)) {
        setYearDropdownOpen(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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
    setDateValues(prev => ({ ...prev, month: input }));
    
    // Show suggestions when typing
    if (!disabled) {
      setMonthDropdownOpen(true);
    }
    
    // Handle validation and update date value
    const newMonth = validateMonth(input);
    updateDateValue({ ...dateValues, month: newMonth });
  };

  const handleDayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    setDateValues(prev => ({ ...prev, day: input }));
    
    const newDay = validateDay(input);
    updateDateValue({ ...dateValues, day: newDay });
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    setDateValues(prev => ({ ...prev, year: input }));
    
    // Show suggestions when typing
    if (!disabled) {
      setYearDropdownOpen(true);
    }
    
    // Handle validation and update date value
    const newYear = validateYear(input);
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
  const selectMonth = (value: string, label: string) => {
    setDateValues(prev => ({ ...prev, month: value }));
    updateDateValue({ ...dateValues, month: value });
    setMonthDropdownOpen(false);
  };

  const selectYear = (value: string) => {
    setDateValues(prev => ({ ...prev, year: value }));
    updateDateValue({ ...dateValues, year: value });
    setYearDropdownOpen(false);
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className="relative" ref={monthRef}>
        <Input
          className="w-16"
          placeholder="MM"
          value={dateValues.month}
          onChange={handleMonthChange}
          onFocus={() => !disabled && setMonthDropdownOpen(true)}
          onBlur={() => setTimeout(() => setMonthDropdownOpen(false), 200)}
          maxLength={2}
          disabled={disabled}
        />
        {monthDropdownOpen && !disabled && (
          <div className="absolute z-50 w-40 max-h-60 overflow-auto bg-white border border-gray-200 rounded-md shadow-md mt-1">
            <div className="grid gap-1 p-1">
              {getFilteredMonths().map((month) => (
                <button
                  key={month.value}
                  type="button"
                  onClick={() => selectMonth(month.value, month.label)}
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
          </div>
        )}
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
      
      <div className="relative" ref={yearRef}>
        <Input
          className="w-20"
          placeholder="YYYY"
          value={dateValues.year}
          onChange={handleYearChange}
          onFocus={() => !disabled && setYearDropdownOpen(true)}
          onBlur={() => setTimeout(() => setYearDropdownOpen(false), 200)}
          maxLength={4}
          disabled={disabled}
        />
        {yearDropdownOpen && !disabled && (
          <div className="absolute z-50 w-24 max-h-60 overflow-auto bg-white border border-gray-200 rounded-md shadow-md mt-1">
            <div className="grid gap-1 p-1">
              {getFilteredYears().map((year) => (
                <button
                  key={year.value}
                  type="button"
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
          </div>
        )}
      </div>
    </div>
  );
}