import React, { useState } from "react";
import { Mail, Phone, Globe, Briefcase } from "lucide-react";
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
  const [company, setCompany] = useState(userData.company || "");
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
          company: company.trim() || null
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
      
      {/* Company */}
      <div className="space-y-2">
        <label htmlFor="company" className="text-sm font-medium flex items-center gap-2">
          <Briefcase className="h-4 w-4" />
          Company / Organization
        </label>
        <Input
          id="company"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          placeholder="Your current company or organization"
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