import React, { useState } from "react";
import { Mail, Phone, Globe, Briefcase, MapPin, Building, Book } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

const industries = [
  "Technology",
  "Healthcare",
  "Finance",
  "Education",
  "Manufacturing",
  "Retail",
  "Media",
  "Hospitality",
  "Government",
  "Consulting",
  "Non-profit",
  "Other"
];

const domains = [
  "Software Development",
  "Data Science",
  "Design",
  "Marketing",
  "Sales",
  "Customer Service",
  "Human Resources",
  "Finance",
  "Operations",
  "Research",
  "Product Management",
  "Other"
];

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
  
  const [name, setName] = useState(userData.name || "");
  const [phoneCountryCode, setPhoneCountryCode] = useState(countryCode);
  const [phoneNumber, setPhoneNumber] = useState(number);
  const [jobTitle, setJobTitle] = useState(userData.title || "");
  const [location, setLocation] = useState(userData.location || "");
  const [aboutMe, setAboutMe] = useState(userData.aboutMe || "");
  const [industry, setIndustry] = useState(userData.industry || "");
  const [domain, setDomain] = useState(userData.domain || "");
  const [lookingFor, setLookingFor] = useState(userData.lookingFor || "");
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
          name: name.trim() || null,
          phoneNumber: formattedPhoneNumber,
          title: jobTitle.trim() || null,
          location: location.trim() || null,
          aboutMe: aboutMe.trim() || null,
          industry: industry || null,
          domain: domain || null,
          lookingFor: lookingFor.trim() || null
        }
      });
      
      // Invalidate related queries to refetch the updated data
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userData.id}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/users/by-username', userData.username] });
      queryClient.invalidateQueries({ queryKey: ['/api/users', userData.username] });
      
      toast({
        title: "Personal information updated",
        description: "Your profile information has been saved successfully.",
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
    <div className="w-full space-y-4 max-h-[70vh] overflow-y-auto pr-2">
      {/* Full Name */}
      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium flex items-center gap-2">
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          Full Name
        </label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your full name"
        />
      </div>
      
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
          <Briefcase className="h-4 w-4" />
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
          <MapPin className="h-4 w-4" />
          Location
        </label>
        <Input
          id="location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Your location (e.g. San Francisco, CA)"
        />
      </div>

      {/* Industry */}
      <div className="space-y-2">
        <label htmlFor="industry" className="text-sm font-medium flex items-center gap-2">
          <Building className="h-4 w-4" />
          Industry
        </label>
        <Select value={industry} onValueChange={setIndustry}>
          <SelectTrigger id="industry">
            <SelectValue placeholder="Select your industry" />
          </SelectTrigger>
          <SelectContent>
            {industries.map((ind) => (
              <SelectItem key={ind} value={ind}>{ind}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Domain/Specialty */}
      <div className="space-y-2">
        <label htmlFor="domain" className="text-sm font-medium flex items-center gap-2">
          <Book className="h-4 w-4" />
          Domain/Specialty
        </label>
        <Select value={domain} onValueChange={setDomain}>
          <SelectTrigger id="domain">
            <SelectValue placeholder="Select your domain" />
          </SelectTrigger>
          <SelectContent>
            {domains.map((dom) => (
              <SelectItem key={dom} value={dom}>{dom}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {/* About Me */}
      <div className="space-y-2">
        <label htmlFor="aboutMe" className="text-sm font-medium flex items-center gap-2">
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
          </svg>
          About Me
        </label>
        <Textarea
          id="aboutMe"
          value={aboutMe}
          onChange={(e) => setAboutMe(e.target.value)}
          placeholder="Write a brief introduction about yourself"
          rows={4}
        />
      </div>

      {/* Looking For */}
      <div className="space-y-2">
        <label htmlFor="lookingFor" className="text-sm font-medium flex items-center gap-2">
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20v-8m0 0V4m0 8h8m-8 0H4"></path>
          </svg>
          Looking For
        </label>
        <Textarea
          id="lookingFor"
          value={lookingFor}
          onChange={(e) => setLookingFor(e.target.value)}
          placeholder="What are you looking for professionally? (e.g. collaborations, new opportunities, etc.)"
          rows={3}
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
          Your profile URL is based on your name and cannot be changed
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