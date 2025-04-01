import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { format, isValid, parse } from "date-fns";

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
    const newMonth = validateMonth(e.target.value);
    setDateValues({ ...dateValues, month: newMonth });
    updateDateValue({ ...dateValues, month: newMonth });
  };

  const handleDayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDay = validateDay(e.target.value);
    setDateValues({ ...dateValues, day: newDay });
    updateDateValue({ ...dateValues, day: newDay });
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newYear = validateYear(e.target.value);
    setDateValues({ ...dateValues, year: newYear });
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

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Input
        className="w-16"
        placeholder="MM"
        value={dateValues.month}
        onChange={handleMonthChange}
        maxLength={2}
        disabled={disabled}
      />
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
      <Input
        className="w-20"
        placeholder="YYYY"
        value={dateValues.year}
        onChange={handleYearChange}
        maxLength={4}
        disabled={disabled}
      />
    </div>
  );
}