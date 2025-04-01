import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

// Common country codes
const countryCodes = [
  { code: "+1", country: "US/CA" },
  { code: "+44", country: "UK" },
  { code: "+91", country: "IN" },
  { code: "+61", country: "AU" },
  { code: "+49", country: "DE" },
  { code: "+33", country: "FR" },
  { code: "+86", country: "CN" },
  { code: "+81", country: "JP" },
  { code: "+82", country: "KR" },
  { code: "+55", country: "BR" },
  { code: "+52", country: "MX" },
  { code: "+27", country: "ZA" },
  { code: "+65", country: "SG" },
  { code: "+971", country: "UAE" },
];

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function PhoneInput({
  value,
  onChange,
  placeholder = "Mobile number",
  disabled = false,
}: PhoneInputProps) {
  // Extract country code and number from the combined value
  const extractCountryCode = (phoneNumber: string) => {
    for (const country of countryCodes) {
      if (phoneNumber.startsWith(country.code)) {
        return {
          countryCode: country.code,
          number: phoneNumber.substring(country.code.length).trim(),
        };
      }
    }
    // Default to +1 if no country code is found
    return { countryCode: "+1", number: phoneNumber };
  };

  const { countryCode, number } = extractCountryCode(value);
  const [selectedCountryCode, setSelectedCountryCode] = useState(countryCode);
  const [phoneNumber, setPhoneNumber] = useState(number);

  const handleCountryCodeChange = (code: string) => {
    setSelectedCountryCode(code);
    onChange(`${code}${phoneNumber}`);
  };

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newNumber = e.target.value.replace(/[^0-9]/g, "");
    setPhoneNumber(newNumber);
    onChange(`${selectedCountryCode}${newNumber}`);
  };

  return (
    <div className="flex">
      <Select
        disabled={disabled}
        value={selectedCountryCode}
        onValueChange={handleCountryCodeChange}
      >
        <SelectTrigger className="w-[90px] rounded-r-none border-r-0 flex-shrink-0">
          <SelectValue placeholder="+1" />
        </SelectTrigger>
        <SelectContent>
          {countryCodes.map((country) => (
            <SelectItem key={country.code} value={country.code}>
              {country.code} {country.country}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input
        className="rounded-l-none"
        type="tel"
        placeholder={placeholder}
        value={phoneNumber}
        onChange={handlePhoneNumberChange}
        disabled={disabled}
      />
    </div>
  );
}