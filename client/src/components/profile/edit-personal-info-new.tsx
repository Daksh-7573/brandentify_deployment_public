import React, { useState, useEffect } from "react";
import { Mail, Phone, Globe, Briefcase, MapPin, Building, Book, User, X, Save, Link2, Check, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useQueryClient } from "@tanstack/react-query";
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

  // Form state
  const [name, setName] = useState(userData.name || "");
  const [jobTitle, setJobTitle] = useState(userData.title || "");
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

      // Invalidate queries to refresh data
      await queryClient.invalidateQueries({ queryKey: [`/api/users/${userData.username}`] });
      await queryClient.invalidateQueries({ queryKey: [`/api/users/${userData.id}`] });

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
    
    try {
      const response = await fetch(`/api/users/${userData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API call failed: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log("[SAVE] API response:", result);

      // Invalidate queries to refresh data
      await queryClient.invalidateQueries({ queryKey: [`/api/users/${userData.username}`] });
      await queryClient.invalidateQueries({ queryKey: [`/api/users/${userData.id}`] });

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

        {/* Phone Number field removed per user request */}

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



        {/* Profile URL (read-only) */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-white flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Profile URL
          </label>
          <input
            type="text"
            value={`${window.location.origin}/profile/${userData.username}`}
            disabled
            readOnly
            className="bg-[rgba(18,18,18,0.95)] backdrop-blur-md text-white/70 border-white/20 shadow-md w-full h-10 px-3 rounded-md border cursor-not-allowed opacity-70"
          />
          <p className="text-xs text-white/50">
            Your profile URL is based on your name and cannot be changed
          </p>
        </div>
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
          onClick={handleSaveProfile}
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