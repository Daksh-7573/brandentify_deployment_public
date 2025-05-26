import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CountryCodeSelectProps {
  value: string;
  onChange: (value: string) => void;
}

// Common country codes
const countryCodes = [
  { code: "+1", country: "USA/Canada" },
  { code: "+44", country: "UK" },
  { code: "+91", country: "India" },
  { code: "+61", country: "Australia" },
  { code: "+49", country: "Germany" },
  { code: "+33", country: "France" },
  { code: "+81", country: "Japan" },
  { code: "+86", country: "China" },
  { code: "+65", country: "Singapore" },
  { code: "+971", country: "UAE" },
];

const CountryCodeSelect: React.FC<CountryCodeSelectProps> = ({ value, onChange }) => {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[110px]">
        <SelectValue placeholder="Code" />
      </SelectTrigger>
      <SelectContent>
        {countryCodes.map((country) => (
          <SelectItem key={country.code} value={country.code}>
            {country.code} {country.country}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default CountryCodeSelect;