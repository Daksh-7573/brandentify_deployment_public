import React, { useState, useEffect } from "react";
import { Mail, Phone, Globe, Briefcase, MapPin, Building, Book, User, X, Save, Link2, Check, AlertCircle, ChevronDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { UserData } from "@/types/user";
import { INDUSTRIES, INDUSTRY_DOMAINS } from "@shared/constants";

interface EditPersonalInfoProps {
  userData: UserData;
  onCancel: () => void;
  onSave: () => void;
}

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

const EditPersonalInfoNew: React.FC<EditPersonalInfoProps> = ({ userData, onCancel, onSave }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isJobTitleDropdownOpen, setIsJobTitleDropdownOpen] = useState(false);

  // Fetch job titles from backend
  const { data: jobTitlesData, isLoading: jobTitlesLoading } = useQuery({
    queryKey: ['/api/job-titles'],
    queryFn: async () => {
      const response = await fetch('/api/job-titles');
      if (!response.ok) throw new Error('Failed to fetch job titles');
      return response.json();
    },
  });

  // Form state
  const [name, setName] = useState(userData.name || "");
  const [jobTitle, setJobTitle] = useState(userData.title || "");
  const [selectedJobTitleFromDropdown, setSelectedJobTitleFromDropdown] = useState(""); // Separate dropdown value
  const [location, setLocation] = useState(userData.location || "");
  const [industry, setIndustry] = useState(userData.industry || "");
  const [domain, setDomain] = useState(userData.domain || "");
  const [aboutMe, setAboutMe] = useState(userData.aboutMe || "");
  const [lookingFor, setLookingFor] = useState(userData.lookingFor || "");

  // Brand name and phone number fields removed per user request

  const handleSave = async () => {
    console.log("[DEBUG] ========== HANDLE SAVE CALLED ==========");
    console.log("[DEBUG] userData.id:", userData.id);
    console.log("[DEBUG] Current form values:", {
      name, jobTitle, location, industry, domain, aboutMe, lookingFor
    });
    
    setIsLoading(true);
    try {
      const updateData = {
        name: name.trim(),
        title: jobTitle.trim() || null,
        location: location.trim() || null,
        industry: industry || null,
        domain: domain || null,
        aboutMe: aboutMe.trim() || null,
        lookingFor: lookingFor.trim() || null,
      };

      console.log("[DEBUG] Sending PUT request to:", `/api/users/${userData.id}`);
      console.log("[DEBUG] Update data:", updateData);
      
      const response = await apiRequest("PUT", `/api/users/${userData.id}`, updateData);
      console.log("[DEBUG] API response:", response);

      // Invalidate queries to refresh data - use the correct query keys that match profile page
      await queryClient.invalidateQueries({ queryKey: ['/api/users', userData.username] });
      await queryClient.invalidateQueries({ queryKey: ['/api/users'] });

      toast({
        title: "Profile Updated",
        description: "Your profile information has been successfully updated.",
        variant: "default",
      });

      // Only call onSave after successful save to close the dialog
      onSave();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Direct save handler that bypasses all event handling issues
  const handleSaveProfile = React.useCallback(async () => {
    console.log("[SAVE] ========== PROFILE SAVE STARTED ==========");
    console.log("[SAVE] userData.id:", userData.id);
    console.log("[SAVE] Current form values:", {
      name, jobTitle, location, industry, domain, aboutMe, lookingFor
    });
    console.log("[SAVE] Original userData:", userData);
    
    // Force immediate execution without waiting for validation
    console.log("[SAVE] FORCING IMMEDIATE SAVE OPERATION");
    
    // Validate required fields
    if (!name.trim()) {
      toast({
        title: "Validation Error",
        description: "Full Name is required.",
        variant: "destructive",
      });
      return;
    }

    // Brand name validation removed per user request
    
    setIsLoading(true);
    
    const updateData = {
      name: name.trim(),
      title: jobTitle.trim() || null,
      location: location.trim() || null,
      industry: industry || null,
      domain: domain || null,
      aboutMe: aboutMe.trim() || null,
      lookingFor: lookingFor.trim() || null,
    };

    console.log("[SAVE] Making API call to:", `/api/users/${userData.id}`);
    console.log("[SAVE] Update data:", updateData);
    console.log("[SAVE] JSON stringified data:", JSON.stringify(updateData));
    
    try {
      const response = await fetch(`/api/users/${userData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      console.log("[SAVE] Response status:", response.status);
      console.log("[SAVE] Response headers:", response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API call failed: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log("[SAVE] API response:", result);

      // Invalidate queries to refresh data - use the correct query keys that match profile page
      await queryClient.invalidateQueries({ queryKey: ['/api/users', userData.username] });
      await queryClient.invalidateQueries({ queryKey: ['/api/users'] });

      toast({
        title: "Profile Updated",
        description: "Your profile information has been successfully updated.",
        variant: "default",
      });

      console.log("[SAVE] Calling onSave callback");
      onSave();
      console.log("[SAVE] ========== PROFILE SAVE COMPLETED ==========");
    } catch (error) {
      console.error('[SAVE] Error updating profile:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [name, jobTitle, location, industry, domain, aboutMe, lookingFor, userData.id, userData.username, queryClient, toast, onSave]);

  return (
    <div className="space-y-6 p-6 neo-glass-card backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-2xl shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-white/10 backdrop-blur-sm">
            <User className="h-5 w-5 text-white" />
          </div>
          <h2 className="text-xl font-semibold text-white">Edit Profile Information</h2>
        </div>
      </div>

      {/* Form Fields */}
      <div className="space-y-6">
        {/* Full Name */}
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium text-white flex items-center gap-2">
            <User className="h-4 w-4" />
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

        {/* Brand Name field removed per user request */}

        {/* Email field removed per user request */}

        {/* Phone Number field removed per user request */}

        {/* Job Title */}
        <div className="space-y-2">
          <label htmlFor="jobTitle" className="text-sm font-medium text-white flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            Job Title
          </label>
          <div className="space-y-3">
            {/* Dropdown for quick selection - keeps its own value */}
            <div className="relative">
              <select
                id="jobTitleDropdown"
                value={selectedJobTitleFromDropdown}
                onChange={(e) => {
                  setSelectedJobTitleFromDropdown(e.target.value);
                }}
                disabled={jobTitlesLoading}
                className="bg-[rgba(18,18,18,0.95)] backdrop-blur-md text-white border-white/20 shadow-md transition-all hover:border-white/30 w-full h-12 px-3 pr-10 rounded-md border appearance-none cursor-pointer focus:border-white/50 focus:ring-2 focus:ring-white/30 focus:outline-none text-sm leading-relaxed"
                style={{ lineHeight: '1.5', paddingTop: '0.75rem', paddingBottom: '0.75rem' }}
              >
                <option value="">Select from common job titles</option>
                {jobTitlesData?.jobTitles?.map((title: string) => (
                  <option key={title} value={title} className="bg-gray-800 text-white">
                    {title}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/70 pointer-events-none" />
            </div>
            
            {/* Text input for custom job title - independent value */}
            <input
              id="jobTitle"
              type="text"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="Enter your custom job title"
              className="bg-[rgba(18,18,18,0.95)] backdrop-blur-md text-white border-white/20 shadow-md transition-all hover:border-white/30 w-full h-10 px-3 rounded-md border placeholder-white/50 focus:border-white/50 focus:ring-2 focus:ring-white/30 focus:outline-none"
            />
            
            {/* Help text explaining the functionality */}
            <p className="text-xs text-white/60 mt-2">
              The dropdown and text field work independently. Select from common titles or create your own custom title.
            </p>
            
            {/* Display current selections */}
            {(selectedJobTitleFromDropdown || jobTitle) && (
              <div className="mt-2 p-2 bg-white/5 rounded-md border border-white/10">
                <p className="text-xs text-white/70 mb-1">Current selections:</p>
                {selectedJobTitleFromDropdown && (
                  <p className="text-sm text-white/90">Dropdown: {selectedJobTitleFromDropdown}</p>
                )}
                {jobTitle && (
                  <p className="text-sm text-white/90">Custom: {jobTitle}</p>
                )}
              </div>
            )}
          </div>
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
              onChange={(e) => {
                setIndustry(e.target.value);
                // Reset domain when industry changes
                if (e.target.value !== industry) {
                  setDomain('');
                }
              }}
              className="bg-[rgba(18,18,18,0.95)] backdrop-blur-md text-white border-white/20 shadow-md transition-all hover:border-white/30 w-full h-12 px-3 pr-10 rounded-md border appearance-none cursor-pointer focus:border-white/50 focus:ring-2 focus:ring-white/30 focus:outline-none text-sm leading-relaxed"
              style={{ lineHeight: '1.5', paddingTop: '0.75rem', paddingBottom: '0.75rem' }}
            >
              <option value="">Select your industry</option>
              {INDUSTRIES.map((ind) => (
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

        {/* Domain/Specialty - Dynamic based on selected industry */}
        {industry && INDUSTRY_DOMAINS[industry] && (
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
                className="bg-[rgba(18,18,18,0.95)] backdrop-blur-md text-white border-white/20 shadow-md transition-all hover:border-white/30 w-full h-12 px-3 pr-10 rounded-md border appearance-none cursor-pointer focus:border-white/50 focus:ring-2 focus:ring-white/30 focus:outline-none text-sm leading-relaxed"
                style={{ lineHeight: '1.5', paddingTop: '0.75rem', paddingBottom: '0.75rem' }}
              >
                <option value="">Select your domain specialty</option>
                {INDUSTRY_DOMAINS[industry].map((dom) => (
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
        )}

        {/* Professional Overview */}
        <div className="space-y-2">
          <label htmlFor="aboutMe" className="text-sm font-medium text-white flex items-center gap-2">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
            </svg>
            Professional Overview
          </label>
          <textarea
            id="aboutMe"
            value={aboutMe}
            onChange={(e) => setAboutMe(e.target.value)}
            placeholder="Write a brief introduction about yourself"
            rows={4}
            className="!bg-[rgba(18,18,18,0.95)] !backdrop-blur-md !text-white !border-white/20 shadow-md transition-all hover:!border-white/30 w-full min-h-[80px] px-3 py-3 rounded-md border !placeholder-white/50 focus:!border-white/50 focus:ring-2 focus:ring-white/30 focus:outline-none resize-none"
            style={{ 
              backgroundColor: 'rgba(18,18,18,0.95) !important', 
              color: 'white !important',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.2) !important'
            }}
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
            className="!bg-[rgba(18,18,18,0.95)] !backdrop-blur-md !text-white !border-white/20 shadow-md transition-all hover:!border-white/30 w-full min-h-[80px] px-3 py-3 rounded-md border !placeholder-white/50 focus:!border-white/50 focus:ring-2 focus:ring-white/30 focus:outline-none resize-none"
            style={{ 
              backgroundColor: 'rgba(18,18,18,0.95) !important', 
              color: 'white !important',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.2) !important'
            }}
          />
        </div>



        {/* Profile URL field removed per user request */}
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-3 justify-end pt-6 border-t border-white/10">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="neo-glass-button flex items-center gap-2 py-2.5 px-6 text-white bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 rounded-lg transition-all duration-200 backdrop-blur-sm"
        >
          <X className="h-4 w-4" />
          Cancel
        </button>
        <button 
          type="button"
          onClick={async (e) => {
            console.log("[BUTTON] Save button clicked!", e);
            console.log("[BUTTON] Starting direct save operation");
            
            e.preventDefault();
            e.stopPropagation();
            
            if (isLoading) return;
            
            setIsLoading(true);
            
            try {
              const updateData = {
                name: name.trim(),
                title: jobTitle.trim() || null,
                location: location.trim() || null,
                industry: industry || null,
                domain: domain || null,
                aboutMe: aboutMe.trim() || null,
                lookingFor: lookingFor.trim() || null,
              };

              console.log("[BUTTON] Making direct API call with data:", updateData);
              
              const response = await fetch(`/api/users/${userData.id}`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(updateData),
              });

              console.log("[BUTTON] Response status:", response.status);

              if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`API call failed: ${response.status} - ${errorText}`);
              }

              const result = await response.json();
              console.log("[BUTTON] API response:", result);

              // Invalidate queries to refresh data
              await queryClient.invalidateQueries({ queryKey: ['/api/users', userData.username] });
              await queryClient.invalidateQueries({ queryKey: ['/api/users'] });

              toast({
                title: "Profile Updated",
                description: "Your profile information has been successfully updated.",
                variant: "default",
              });

              console.log("[BUTTON] Calling parent onSave callback");
              onSave();
              
            } catch (error) {
              console.error('[BUTTON] Error updating profile:', error);
              toast({
                title: "Update Failed",
                description: "Failed to update profile. Please try again.",
                variant: "destructive",
              });
            } finally {
              setIsLoading(false);
            }
          }}
          disabled={isLoading}
          className="neo-glass-button flex items-center gap-2 py-2.5 px-6 text-white bg-gradient-to-r from-blue-500/20 to-purple-500/20 hover:from-blue-500/30 hover:to-purple-500/30 border border-white/20 hover:border-white/30 rounded-lg transition-all duration-200 backdrop-blur-sm shadow-lg"
        >
          {isLoading ? (
            <>
              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save Changes
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default EditPersonalInfoNew;