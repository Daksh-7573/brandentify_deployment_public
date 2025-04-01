import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

// Country codes with unique IDs to avoid React key warnings
const countryCodes = [
  // Featured countries (as per request)
  { id: "in", code: "+91", country: "India" },
  { id: "us", code: "+1", country: "USA/Canada" },
  { id: "au", code: "+61", country: "Australia" },
  { id: "nz", code: "+64", country: "New Zealand" },
  
  // Europe
  { id: "uk", code: "+44", country: "UK" },
  { id: "de", code: "+49", country: "Germany" },
  { id: "fr", code: "+33", country: "France" },
  { id: "it", code: "+39", country: "Italy" },
  { id: "es", code: "+34", country: "Spain" },
  { id: "nl", code: "+31", country: "Netherlands" },
  { id: "be", code: "+32", country: "Belgium" },
  { id: "ch", code: "+41", country: "Switzerland" },
  { id: "at", code: "+43", country: "Austria" },
  { id: "se", code: "+46", country: "Sweden" },
  { id: "no", code: "+47", country: "Norway" },
  { id: "dk", code: "+45", country: "Denmark" },
  { id: "fi", code: "+358", country: "Finland" },
  { id: "pl", code: "+48", country: "Poland" },
  { id: "pt", code: "+351", country: "Portugal" },
  
  // Asia
  { id: "cn", code: "+86", country: "China" },
  { id: "jp", code: "+81", country: "Japan" },
  { id: "kr", code: "+82", country: "South Korea" },
  { id: "sg", code: "+65", country: "Singapore" },
  { id: "th", code: "+66", country: "Thailand" },
  { id: "my", code: "+60", country: "Malaysia" },
  { id: "ph", code: "+63", country: "Philippines" },
  { id: "vn", code: "+84", country: "Vietnam" },
  { id: "id", code: "+62", country: "Indonesia" },
  { id: "ae", code: "+971", country: "UAE" },
  { id: "sa", code: "+966", country: "Saudi Arabia" },
  { id: "pk", code: "+92", country: "Pakistan" },
  { id: "bd", code: "+880", country: "Bangladesh" },
  { id: "lk", code: "+94", country: "Sri Lanka" },
  { id: "np", code: "+977", country: "Nepal" },
  
  // Others
  { id: "br", code: "+55", country: "Brazil" },
  { id: "mx", code: "+52", country: "Mexico" },
  { id: "za", code: "+27", country: "South Africa" },
  { id: "eg", code: "+20", country: "Egypt" },
  { id: "ng", code: "+234", country: "Nigeria" },
  { id: "ru", code: "+7", country: "Russia" },
  { id: "ua", code: "+380", country: "Ukraine" },
  { id: "il", code: "+972", country: "Israel" },
  { id: "tr", code: "+90", country: "Turkey" },
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
        <SelectTrigger className="w-[100px] rounded-r-none border-r-0 flex-shrink-0">
          <SelectValue placeholder="+1" />
        </SelectTrigger>
        <SelectContent className="max-h-[240px]">
          <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground bg-muted/50">Featured</div>
          {countryCodes.slice(0, 4).map((country) => (
            <SelectItem key={country.id} value={country.code}>
              {country.code} {country.country}
            </SelectItem>
          ))}
          
          <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground bg-muted/50">Europe</div>
          {countryCodes.slice(4, 19).map((country) => (
            <SelectItem key={country.id} value={country.code}>
              {country.code} {country.country}
            </SelectItem>
          ))}
          
          <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground bg-muted/50">Asia</div>
          {countryCodes.slice(19, 34).map((country) => (
            <SelectItem key={country.id} value={country.code}>
              {country.code} {country.country}
            </SelectItem>
          ))}
          
          <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground bg-muted/50">Others</div>
          {countryCodes.slice(34).map((country) => (
            <SelectItem key={country.id} value={country.code}>
              {country.code} {country.country}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input
        className="rounded-l-none flex-1"
        type="tel"
        inputMode="tel"
        placeholder={placeholder}
        value={phoneNumber}
        onChange={handlePhoneNumberChange}
        disabled={disabled}
      />
    </div>
  );
}