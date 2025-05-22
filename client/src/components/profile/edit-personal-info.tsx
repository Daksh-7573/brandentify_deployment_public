import React, { useState } from "react";
import { Mail, Phone, Globe } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useQueryClient } from "@tanstack/react-query";
import CountryCodeSelect from "./country-code-select";
import { UserData } from "@/types/user";

interface EditPersonalInfoProps {
  userData: UserData;
  onCancel: () => void;
  onSave: () => void;
}

const EditPersonalInfo: React.FC<EditPersonalInfoProps> = ({ 
  userData, 
  onCancel,
  onSave
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Parse existing phone number into country code and number parts
  const parsePhoneNumber = (phoneNumber: string | null) => {
    if (!phoneNumber) return { countryCode: "+1", number: "" };
    
    // Simple parsing logic - assumes format is "+XX XXXXXXXXXX"
    const parts = phoneNumber.split(" ");
    if (parts.length >= 2) {
      return {
        countryCode: parts[0],
        number: parts.slice(1).join(" ")
      };
    }
    
    // Default if format is different
    return { countryCode: "+1", number: phoneNumber };
  };
  
  const { countryCode, number } = parsePhoneNumber(userData.phoneNumber);
  
  const [phoneCountryCode, setPhoneCountryCode] = useState(countryCode);
  const [phoneNumber, setPhoneNumber] = useState(number);
  const [jobTitle, setJobTitle] = useState(userData.title || "");
  const [location, setLocation] = useState(userData.location || "");
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSave = async () => {
    try {
      setIsLoading(true);
      
      // Format the phone number
      const formattedPhoneNumber = phoneNumber.trim() 
        ? `${phoneCountryCode} ${phoneNumber.trim()}`
        : null;
      
      // Update user data via API
      await apiRequest({
        url: `/api/users/${userData.id}`,
        method: 'PUT',
        data: {
          phoneNumber: formattedPhoneNumber,
          title: jobTitle.trim() || null,
          location: location.trim() || null
        }
      });
      
      // Invalidate related queries to refetch the updated data
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userData.id}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/users/by-username', userData.username] });
      
      toast({
        title: "Personal information updated",
        description: "Your contact information has been saved successfully.",
      });
      
      onSave();
    } catch (error) {
      console.error("Error updating personal information:", error);
      toast({
        title: "Update failed",
        description: "There was an error updating your information. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="w-full space-y-4">
      {/* Email (read-only) */}
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
          <Mail className="h-4 w-4" />
          Email
        </label>
        <Input
          id="email"
          value={userData.email}
          disabled
          readOnly
        />
        <p className="text-xs text-muted-foreground">Email cannot be changed</p>
      </div>
      
      {/* Phone Number */}
      <div className="space-y-2">
        <label htmlFor="phoneNumber" className="text-sm font-medium flex items-center gap-2">
          <Phone className="h-4 w-4" />
          Phone Number
        </label>
        <div className="flex gap-2">
          <CountryCodeSelect 
            value={phoneCountryCode} 
            onChange={setPhoneCountryCode} 
          />
          <Input
            id="phoneNumber"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="Your phone number"
          />
        </div>
      </div>
      
      {/* Job Title */}
      <div className="space-y-2">
        <label htmlFor="jobTitle" className="text-sm font-medium flex items-center gap-2">
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
          </svg>
          Job Title
        </label>
        <Input
          id="jobTitle"
          value={jobTitle}
          onChange={(e) => setJobTitle(e.target.value)}
          placeholder="Your professional title (e.g. Senior Developer)"
        />
      </div>
      
      {/* Location */}
      <div className="space-y-2">
        <label htmlFor="location" className="text-sm font-medium flex items-center gap-2">
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
          Location
        </label>
        <Input
          id="location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Your location (e.g. San Francisco, CA)"
        />
      </div>
      
      {/* Profile URL (read-only) */}
      <div className="space-y-2">
        <label className="text-sm font-medium flex items-center gap-2">
          <Globe className="h-4 w-4" />
          Profile URL
        </label>
        <div className="text-sm border rounded-md p-2 bg-muted/20">
          brandentifier.com/@{userData.name ? userData.name.replace(/\s+/g, '') : userData.username}
        </div>
        <p className="text-xs text-muted-foreground">
          Your profile URL is based on your username and cannot be changed
        </p>
      </div>
      
      {/* Action Buttons */}
      <div className="flex justify-end gap-2 pt-2">
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSave}
          disabled={isLoading}
        >
          {isLoading ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
};

export default EditPersonalInfo;