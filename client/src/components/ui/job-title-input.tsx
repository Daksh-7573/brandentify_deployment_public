import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface JobTitleInputProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

const jobTitlePrefixes = [
  'Student',
  'Junior',
  'Senior',
  'Lead',
  'Principal',
  'Director',
  'Vice President',
  'Chief',
  'Head of',
  'Manager',
  'Associate',
  'Assistant',
  'Executive',
  'Consultant',
  'Specialist',
  'Coordinator',
  'Analyst',
  'Intern',
  'Freelance',
  'Contract'
];

export function JobTitleInput({ value = '', onChange, placeholder = 'e.g., Product Manager', className = '', disabled = false }: JobTitleInputProps) {
  const [prefix, setPrefix] = useState('');
  const [titleText, setTitleText] = useState('');

  // Parse the initial value to extract prefix and title
  useEffect(() => {
    if (value) {
      // Find the longest matching prefix at the beginning of the value
      const matchingPrefix = jobTitlePrefixes.find(p => 
        value.toLowerCase().startsWith(p.toLowerCase() + ' ')
      );
      
      if (matchingPrefix) {
        setPrefix(matchingPrefix);
        setTitleText(value.substring(matchingPrefix.length + 1).trim());
      } else {
        setPrefix('');
        setTitleText(value);
      }
    } else {
      setPrefix('');
      setTitleText('');
    }
  }, [value]);

  // Update the combined value when prefix or title changes
  const updateCombinedValue = (newPrefix: string, newTitle: string) => {
    const combined = newPrefix && newTitle 
      ? `${newPrefix} ${newTitle}`.trim()
      : newTitle.trim();
    onChange(combined);
  };

  const handlePrefixChange = (newPrefix: string) => {
    setPrefix(newPrefix);
    updateCombinedValue(newPrefix, titleText);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitleText(newTitle);
    updateCombinedValue(prefix, newTitle);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Prefix Dropdown */}
        <div className="space-y-1">
          <Label className="text-sm text-gray-600">Title Prefix (Optional)</Label>
          <Select 
            value={prefix} 
            onValueChange={handlePrefixChange}
            disabled={disabled}
          >
            <SelectTrigger className="bg-white/50">
              <SelectValue placeholder="Select prefix..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">No prefix</SelectItem>
              {jobTitlePrefixes.map((prefixOption) => (
                <SelectItem key={prefixOption} value={prefixOption}>
                  {prefixOption}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Title Text Input */}
        <div className="space-y-1">
          <Label className="text-sm text-gray-600">Job Title</Label>
          <Input
            value={titleText}
            onChange={handleTitleChange}
            placeholder={placeholder}
            className="bg-white/50"
            disabled={disabled}
          />
        </div>
      </div>
      
      {/* Preview of combined title */}
      {(prefix || titleText) && (
        <div className="text-sm text-gray-500 mt-2">
          <span className="font-medium">Preview:</span> {prefix && titleText ? `${prefix} ${titleText}` : titleText}
        </div>
      )}
    </div>
  );
}