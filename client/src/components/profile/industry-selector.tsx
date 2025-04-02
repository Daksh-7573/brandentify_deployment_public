import React from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface IndustrySelectorProps {
  value: string;
  onChange: (value: string) => void;
}

/**
 * Standalone Industry Selector component that's separately maintained
 * to ensure it renders properly in forms
 */
export function IndustrySelector({ value, onChange }: IndustrySelectorProps) {
  return (
    <div className="rounded-md p-4 my-4 border-2 border-blue-400 bg-blue-50 shadow-md">
      <h3 className="font-bold text-blue-800 mb-3 text-center text-lg">Industry Selection*</h3>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="industry-select" className="text-right font-bold text-blue-800">
          Select:
        </Label>
        <div className="col-span-3">
          <Select
            value={value}
            onValueChange={onChange}
          >
            <SelectTrigger 
              id="industry-select" 
              className="w-full bg-white border-blue-400 shadow-sm"
            >
              <SelectValue placeholder="Choose an industry category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Technology">Technology</SelectItem>
              <SelectItem value="Healthcare">Healthcare</SelectItem>
              <SelectItem value="Finance">Finance</SelectItem>
              <SelectItem value="Education">Education</SelectItem>
              <SelectItem value="Manufacturing">Manufacturing</SelectItem>
              <SelectItem value="Retail">Retail</SelectItem>
              <SelectItem value="Media">Media</SelectItem>
              <SelectItem value="Consulting">Consulting</SelectItem>
              <SelectItem value="Government">Government</SelectItem>
              <SelectItem value="Non-profit">Non-profit</SelectItem>
              <SelectItem value="Entertainment">Entertainment</SelectItem>
              <SelectItem value="Transportation">Transportation</SelectItem>
              <SelectItem value="Energy">Energy</SelectItem>
              <SelectItem value="Real Estate">Real Estate</SelectItem>
              <SelectItem value="Telecommunications">Telecommunications</SelectItem>
              <SelectItem value="Agriculture">Agriculture</SelectItem>
              <SelectItem value="Construction">Construction</SelectItem>
              <SelectItem value="Hospitality">Hospitality</SelectItem>
              <SelectItem value="Legal Services">Legal Services</SelectItem>
              <SelectItem value="Biotechnology">Biotechnology</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-blue-600 mt-1">This field is required for analyzing career patterns</p>
        </div>
      </div>
    </div>
  );
}