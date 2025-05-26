import React, { useState } from "react";
import { Mail, Phone, Globe, Briefcase, MapPin, Building, Book } from "lucide-react";
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
    <div className="w-full space-y-6 max-h-[70vh] overflow-y-auto pr-2 neo-glass-card">
      {/* Full Name */}
      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium text-white flex items-center gap-2">
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          Full Name
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your full name"
          className="bg-[rgba(18,18,18,0.95)] backdrop-blur-md text-white border-white/20 shadow-md transition-all duration-300 hover:border-white/30 hover:shadow-lg w-full h-10 px-3 rounded-md border placeholder-white/50 focus:border-white/50 focus:ring-2 focus:ring-white/30 focus:outline-none focus:shadow-xl"
        />
      </div>
      
      {/* Email (read-only) */}
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium text-white flex items-center gap-2">
          <Mail className="h-4 w-4" />
          Email
        </label>
        <input
          id="email"
          type="email"
          value={userData.email}
          disabled
          readOnly
          className="bg-[rgba(18,18,18,0.95)] backdrop-blur-md text-white/70 border-white/20 shadow-md w-full h-10 px-3 rounded-md border cursor-not-allowed opacity-70"
        />
        <p className="text-xs text-white/50">Email cannot be changed</p>
      </div>
      
      {/* Phone Number */}
      <div className="space-y-2">
        <label htmlFor="phoneNumber" className="text-sm font-medium text-white flex items-center gap-2">
          <Phone className="h-4 w-4" />
          Phone Number
        </label>
        <div className="flex gap-2">
          <CountryCodeSelect 
            value={phoneCountryCode} 
            onChange={setPhoneCountryCode} 
          />
          <input
            id="phoneNumber"
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="Your phone number"
            className="bg-[rgba(18,18,18,0.95)] backdrop-blur-md text-white border-white/20 shadow-md transition-all hover:border-white/30 w-full h-10 px-3 rounded-md border placeholder-white/50 focus:border-white/50 focus:ring-2 focus:ring-white/30 focus:outline-none"
          />
        </div>
      </div>
      
      {/* Job Title */}
      <div className="space-y-2">
        <label htmlFor="jobTitle" className="text-sm font-medium text-white flex items-center gap-2">
          <Briefcase className="h-4 w-4" />
          Job Title
        </label>
        <input
          id="jobTitle"
          type="text"
          value={jobTitle}
          onChange={(e) => setJobTitle(e.target.value)}
          placeholder="Your professional title (e.g. Senior Developer)"
          className="bg-[rgba(18,18,18,0.95)] backdrop-blur-md text-white border-white/20 shadow-md transition-all hover:border-white/30 w-full h-10 px-3 rounded-md border placeholder-white/50 focus:border-white/50 focus:ring-2 focus:ring-white/30 focus:outline-none"
        />
      </div>
      
      {/* Location */}
      <div className="space-y-2">
        <label htmlFor="location" className="text-sm font-medium text-white flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          Location
        </label>
        <input
          id="location"
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Your location (e.g. San Francisco, CA)"
          className="bg-[rgba(18,18,18,0.95)] backdrop-blur-md text-white border-white/20 shadow-md transition-all hover:border-white/30 w-full h-10 px-3 rounded-md border placeholder-white/50 focus:border-white/50 focus:ring-2 focus:ring-white/30 focus:outline-none"
        />
      </div>

      {/* Industry */}
      <div className="space-y-2">
        <label htmlFor="industry" className="text-sm font-medium text-white flex items-center gap-2">
          <Building className="h-4 w-4" />
          Industry
        </label>
        <div className="relative">
          <select
            id="industry"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            className="bg-[rgba(18,18,18,0.95)] backdrop-blur-md text-white border-white/20 shadow-md transition-all hover:border-white/30 w-full h-10 px-3 pr-10 rounded-md border appearance-none cursor-pointer focus:border-white/50 focus:ring-2 focus:ring-white/30 focus:outline-none"
          >
            <option value="">Select your industry</option>
            {industries.map((ind) => (
              <option key={ind} value={ind} className="bg-gray-800 text-white">
                {ind}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg className="h-4 w-4 text-white/70" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>

      {/* Domain/Specialty */}
      <div className="space-y-2">
        <label htmlFor="domain" className="text-sm font-medium text-white flex items-center gap-2">
          <Book className="h-4 w-4" />
          Domain/Specialty
        </label>
        <div className="relative">
          <select
            id="domain"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            className="bg-[rgba(18,18,18,0.95)] backdrop-blur-md text-white border-white/20 shadow-md transition-all hover:border-white/30 w-full h-10 px-3 pr-10 rounded-md border appearance-none cursor-pointer focus:border-white/50 focus:ring-2 focus:ring-white/30 focus:outline-none"
          >
            <option value="">Select your domain</option>
            {domains.map((dom) => (
              <option key={dom} value={dom} className="bg-gray-800 text-white">
                {dom}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg className="h-4 w-4 text-white/70" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>
      
      {/* About Me */}
      <div className="space-y-2">
        <label htmlFor="aboutMe" className="text-sm font-medium text-white flex items-center gap-2">
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
          </svg>
          About Me
        </label>
        <textarea
          id="aboutMe"
          value={aboutMe}
          onChange={(e) => setAboutMe(e.target.value)}
          placeholder="Write a brief introduction about yourself"
          rows={4}
          className="bg-[rgba(18,18,18,0.95)] backdrop-blur-md text-white border-white/20 shadow-md transition-all hover:border-white/30 w-full min-h-[80px] px-3 py-3 rounded-md border placeholder-white/50 focus:border-white/50 focus:ring-2 focus:ring-white/30 focus:outline-none resize-none"
        />
      </div>

      {/* Looking For */}
      <div className="space-y-2">
        <label htmlFor="lookingFor" className="text-sm font-medium text-white flex items-center gap-2">
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20v-8m0 0V4m0 8h8m-8 0H4"></path>
          </svg>
          Looking For
        </label>
        <textarea
          id="lookingFor"
          value={lookingFor}
          onChange={(e) => setLookingFor(e.target.value)}
          placeholder="What are you looking for professionally? (e.g. collaborations, new opportunities, etc.)"
          rows={3}
          className="bg-[rgba(18,18,18,0.95)] backdrop-blur-md text-white border-white/20 shadow-md transition-all hover:border-white/30 w-full min-h-[80px] px-3 py-3 rounded-md border placeholder-white/50 focus:border-white/50 focus:ring-2 focus:ring-white/30 focus:outline-none resize-none"
        />
      </div>
      
      {/* Profile URL (read-only) */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-white flex items-center gap-2">
          <Globe className="h-4 w-4" />
          Profile URL
        </label>
        <div className="text-sm border rounded-md p-3 bg-[rgba(18,18,18,0.95)] backdrop-blur-md text-white/70 border-white/20 shadow-md">
          brandentifier.com/@{userData.name ? userData.name.replace(/\s+/g, '') : userData.username}
        </div>
        <p className="text-xs text-white/50">
          Your profile URL is based on your name and cannot be changed
        </p>
      </div>
      
      {/* Action Buttons */}
      <div className="flex space-x-2 justify-end pt-4">
        <button
          onClick={onCancel}
          disabled={isLoading}
          className="neo-glass-button flex items-center gap-2 py-2 px-4"
        >
          Cancel
        </button>
        <button 
          onClick={handleSave}
          disabled={isLoading}
          className="neo-glass-button flex items-center gap-2 py-2 px-4"
        >
          {isLoading ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
};

export default EditPersonalInfo;