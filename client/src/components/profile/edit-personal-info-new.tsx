import React, { useState, useEffect } from "react";
import { Mail, Phone, Globe, Briefcase, MapPin, Building, Book, User, X, Save, Link2, Check, AlertCircle, ChevronDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { UserData } from "@/types/user";
import { INDUSTRIES, INDUSTRY_DOMAINS } from "@shared/constants";
import { LOOKING_FOR_OPTIONS } from "@/lib/constants";
import { useAuth } from "@/hooks/use-auth";
import LocationAutocomplete from "@/components/ui/location-autocomplete";

interface EditPersonalInfoProps {
  userData: UserData;
  userIdentifier: string;
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

const EditPersonalInfoNew: React.FC<EditPersonalInfoProps> = ({ userData, userIdentifier, onCancel, onSave }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  // Form state
  const [name, setName] = useState(userData.name || "");
  const [jobTitle, setJobTitle] = useState(userData.title || "");
  const [company, setCompany] = useState(userData.company || "");
  const [location, setLocation] = useState(userData.location || "");
  const [industry, setIndustry] = useState(userData.industry || "");
  const [domain, setDomain] = useState(userData.domain || "");
  // Convert database value to display value for lookingFor
  const convertDbToDisplayValue = (dbValue: string) => {
    return LOOKING_FOR_OPTIONS[dbValue as keyof typeof LOOKING_FOR_OPTIONS] || dbValue;
  };

  const [lookingFor, setLookingFor] = useState(userData.lookingFor || "");
  
  // New branding fields state
  const [tagline, setTagline] = useState(userData.tagline || "");
  const [visionStatement, setVisionStatement] = useState(userData.visionStatement || "");
  const [missionStatement, setMissionStatement] = useState(userData.missionStatement || "");
  const [coreValues, setCoreValues] = useState<string[]>(userData.coreValues || []);
  const [uniqueValueProposition, setUniqueValueProposition] = useState(userData.uniqueValueProposition || "");
  const [primaryAudience, setPrimaryAudience] = useState<string[]>(userData.primaryAudience || []);
  const [secondaryAudience, setSecondaryAudience] = useState<string[]>(userData.secondaryAudience || []);
  
  // Temporary input state for comma-separated fields
  const [coreValuesInput, setCoreValuesInput] = useState("");
  const [primaryAudienceInput, setPrimaryAudienceInput] = useState("");
  const [secondaryAudienceInput, setSecondaryAudienceInput] = useState("");


  // Sync form state when userData changes (e.g., after refresh or cache update)
  useEffect(() => {
    console.log('[EDIT FORM] Syncing form state with userData:', userData);
    setName(userData.name || "");
    setJobTitle(userData.title || "");
    setCompany(userData.company || "");
    setLocation(userData.location || "");
    setIndustry(userData.industry || "");
    setDomain(userData.domain || "");
    setLookingFor(userData.lookingFor || "");
    
    // Sync branding fields
    setTagline(userData.tagline || "");
    setVisionStatement(userData.visionStatement || "");
    setMissionStatement(userData.missionStatement || "");
    setCoreValues(userData.coreValues || []);
    setUniqueValueProposition(userData.uniqueValueProposition || "");
    setPrimaryAudience(userData.primaryAudience || []);
    setSecondaryAudience(userData.secondaryAudience || []);
    
    // CRITICAL FIX: Also sync the input strings for array fields
    // Without this, the inputs show as empty and onBlur clears the arrays
    setCoreValuesInput(userData.coreValues ? userData.coreValues.join(", ") : "");
    setPrimaryAudienceInput(userData.primaryAudience ? userData.primaryAudience.join(", ") : "");
    setSecondaryAudienceInput(userData.secondaryAudience ? userData.secondaryAudience.join(", ") : "");
  }, [userData]);

  // Brand name and phone number fields removed per user request

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
          <input
            id="jobTitle"
            type="text"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            placeholder="Enter your job title"
            className="bg-[rgba(18,18,18,0.95)] backdrop-blur-md text-white border-white/20 shadow-md transition-all duration-300 hover:border-white/30 hover:shadow-lg w-full h-10 px-3 rounded-md border placeholder-white/50 focus:border-white/50 focus:ring-2 focus:ring-white/30 focus:outline-none focus:shadow-xl"
          />
        </div>

        {/* Company Name */}
        <div className="space-y-2">
          <label htmlFor="company" className="text-sm font-medium text-white flex items-center gap-2">
            <Building className="h-4 w-4" />
            Company Name
          </label>
          <input
            id="company"
            type="text"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="Enter your company name"
            className="bg-[rgba(18,18,18,0.95)] backdrop-blur-md text-white border-white/20 shadow-md transition-all duration-300 hover:border-white/30 hover:shadow-lg w-full h-10 px-3 rounded-md border placeholder-white/50 focus:border-white/50 focus:ring-2 focus:ring-white/30 focus:outline-none focus:shadow-xl"
          />
        </div>

        {/* Location */}
        <div className="space-y-2">
          <label htmlFor="location" className="text-sm font-medium text-white flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Location
          </label>
          <LocationAutocomplete
            value={location}
            onChange={setLocation}
            placeholder="Your location (e.g. San Francisco, CA)"
            className="h-10"
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

        {/* Looking For */}
        <div className="space-y-2">
          <label htmlFor="lookingFor" className="text-sm font-medium text-white flex items-center gap-2">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20v-8m0 0V4m0 8h8m-8 0H4"></path>
            </svg>
            Looking For
          </label>
          <div className="relative">
            <select
              id="lookingFor"
              value={lookingFor}
              onChange={(e) => {
                const selectedValue = e.target.value;
                console.log("[DROPDOWN] Raw selected value:", selectedValue);
                console.log("[DROPDOWN] Selected value type:", typeof selectedValue);
                
                // Validate that the selected value is a valid database key
                const validKeys = Object.keys(LOOKING_FOR_OPTIONS);
                if (selectedValue && !validKeys.includes(selectedValue)) {
                  console.error("[DROPDOWN] CRITICAL: Invalid value detected:", selectedValue);
                  console.log("[DROPDOWN] Valid options:", validKeys);
                  // Don't set invalid values
                  return;
                }
                
                console.log("[DROPDOWN] Setting valid value:", selectedValue);
                setLookingFor(selectedValue);
              }}
              className="!bg-[rgba(18,18,18,0.95)] !backdrop-blur-md !text-white !border-white/20 shadow-md transition-all hover:!border-white/30 w-full px-3 py-3 rounded-md border !placeholder-white/50 focus:!border-white/50 focus:ring-2 focus:ring-white/30 focus:outline-none appearance-none cursor-pointer"
              style={{ 
                backgroundColor: 'rgba(18,18,18,0.95) !important', 
                color: 'white !important',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.2) !important'
              }}
            >
              <option value="" className="bg-[#1a1a1a] text-white">Select what you're looking for...</option>
              {Object.entries(LOOKING_FOR_OPTIONS).map(([value, label]) => (
                <option key={value} value={value} className="bg-[#1a1a1a] text-white">
                  {label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50 pointer-events-none" />
          </div>
        </div>

        {/* Tagline / Personal Motto */}
        <div className="space-y-2">
          <label htmlFor="tagline" className="text-sm font-medium text-white flex items-center gap-2">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            Tagline / Personal Motto
          </label>
          <p className="text-xs text-white/60 -mt-1">(e.g., "Empowering ideas through innovation") (max 80 characters)</p>
          <input
            id="tagline"
            type="text"
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            placeholder="Enter your personal motto"
            maxLength={80}
            className="!bg-[rgba(18,18,18,0.95)] !backdrop-blur-md !text-white !border-white/20 shadow-md transition-all hover:!border-white/30 w-full px-3 py-3 rounded-md border !placeholder-white/50 focus:!border-white/50 focus:ring-2 focus:ring-white/30 focus:outline-none"
            style={{ 
              backgroundColor: 'rgba(18,18,18,0.95) !important', 
              color: 'white !important',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.2) !important'
            }}
            data-testid="input-tagline"
          />
          <p className="text-xs text-white/40 -mt-1 text-right">{tagline.length}/80 characters</p>
        </div>

        {/* Vision Statement */}
        <div className="space-y-2">
          <label htmlFor="visionStatement" className="text-sm font-medium text-white flex items-center gap-2">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M12 16v-4m0-4h.01"></path>
            </svg>
            Vision Statement
          </label>
          <p className="text-xs text-white/60 -mt-1">(Where you want to go long-term) (max 120 characters)</p>
          <textarea
            id="visionStatement"
            value={visionStatement}
            onChange={(e) => setVisionStatement(e.target.value)}
            placeholder="Describe your long-term vision"
            rows={3}
            maxLength={120}
            className="!bg-[rgba(18,18,18,0.95)] !backdrop-blur-md !text-white !border-white/20 shadow-md transition-all hover:!border-white/30 w-full px-3 py-3 rounded-md border !placeholder-white/50 focus:!border-white/50 focus:ring-2 focus:ring-white/30 focus:outline-none resize-none"
            style={{ 
              backgroundColor: 'rgba(18,18,18,0.95) !important', 
              color: 'white !important',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.2) !important'
            }}
            data-testid="textarea-vision-statement"
          />
          <p className="text-xs text-white/40 -mt-1 text-right">{visionStatement.length}/120 characters</p>
        </div>

        {/* Mission Statement */}
        <div className="space-y-2">
          <label htmlFor="missionStatement" className="text-sm font-medium text-white flex items-center gap-2">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
            </svg>
            Mission Statement
          </label>
          <p className="text-xs text-white/60 -mt-1">(What you stand for, how you create impact) (max 120 characters)</p>
          <textarea
            id="missionStatement"
            value={missionStatement}
            onChange={(e) => setMissionStatement(e.target.value)}
            placeholder="Describe your mission and how you create impact"
            rows={3}
            maxLength={120}
            className="!bg-[rgba(18,18,18,0.95)] !backdrop-blur-md !text-white !border-white/20 shadow-md transition-all hover:!border-white/30 w-full px-3 py-3 rounded-md border !placeholder-white/50 focus:!border-white/50 focus:ring-2 focus:ring-white/30 focus:outline-none resize-none"
            style={{ 
              backgroundColor: 'rgba(18,18,18,0.95) !important', 
              color: 'white !important',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.2) !important'
            }}
            data-testid="textarea-mission-statement"
          />
          <p className="text-xs text-white/40 -mt-1 text-right">{missionStatement.length}/120 characters</p>
        </div>

        {/* Core Values */}
        <div className="space-y-2">
          <label htmlFor="coreValues" className="text-sm font-medium text-white flex items-center gap-2">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
              <path d="M2 17l10 5 10-5M2 12l10 5 10-5"></path>
            </svg>
            Core Values
          </label>
          <p className="text-xs text-white/60 -mt-1">(3–5 keywords: Integrity, Innovation, Consistency, etc.) Press Enter to add (max 5)</p>
          <div className="space-y-2">
            <input
              id="coreValues"
              type="text"
              value={coreValuesInput}
              onChange={(e) => setCoreValuesInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  const trimmedValue = coreValuesInput.trim();
                  if (trimmedValue && coreValues.length < 5 && !coreValues.includes(trimmedValue)) {
                    setCoreValues([...coreValues, trimmedValue]);
                    setCoreValuesInput("");
                  }
                }
              }}
              placeholder="Type a value and press Enter (e.g., Integrity)"
              className="!bg-[rgba(18,18,18,0.95)] !backdrop-blur-md !text-white !border-white/20 shadow-md transition-all hover:!border-white/30 w-full px-3 py-3 rounded-md border !placeholder-white/50 focus:!border-white/50 focus:ring-2 focus:ring-white/30 focus:outline-none"
              style={{ 
                backgroundColor: 'rgba(18,18,18,0.95) !important', 
                color: 'white !important',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.2) !important'
              }}
              data-testid="input-core-values"
            />
            {coreValues.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {coreValues.map((value, index) => (
                  <span key={index} className="bg-white/10 border border-white/20 px-3 py-1 rounded-full text-sm text-white flex items-center gap-2">
                    {value}
                    <button
                      type="button"
                      onClick={() => setCoreValues(coreValues.filter((_, i) => i !== index))}
                      className="hover:text-red-400"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Unique Value Proposition */}
        <div className="space-y-2">
          <label htmlFor="uniqueValueProposition" className="text-sm font-medium text-white flex items-center gap-2">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
            Unique Value Proposition (UVP)
          </label>
          <p className="text-xs text-white/60 -mt-1">(What sets you apart from others in your space) (max 150 characters)</p>
          <textarea
            id="uniqueValueProposition"
            value={uniqueValueProposition}
            onChange={(e) => setUniqueValueProposition(e.target.value)}
            placeholder="What makes you unique?"
            rows={2}
            maxLength={150}
            className="!bg-[rgba(18,18,18,0.95)] !backdrop-blur-md !text-white !border-white/20 shadow-md transition-all hover:!border-white/30 w-full px-3 py-3 rounded-md border !placeholder-white/50 focus:!border-white/50 focus:ring-2 focus:ring-white/30 focus:outline-none resize-none"
            style={{ 
              backgroundColor: 'rgba(18,18,18,0.95) !important', 
              color: 'white !important',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.2) !important'
            }}
            data-testid="textarea-unique-value-proposition"
          />
          <p className="text-xs text-white/40 -mt-1 text-right">{uniqueValueProposition.length}/150 characters</p>
        </div>

        {/* Primary Audience */}
        <div className="space-y-2">
          <label htmlFor="primaryAudience" className="text-sm font-medium text-white flex items-center gap-2">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            Primary Audience
          </label>
          <p className="text-xs text-white/60 -mt-1">(Employers, clients, investors, community, etc.) Press Enter to add (max 5)</p>
          <div className="space-y-2">
            <input
              id="primaryAudience"
              type="text"
              value={primaryAudienceInput}
              onChange={(e) => setPrimaryAudienceInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  const trimmedValue = primaryAudienceInput.trim();
                  if (trimmedValue && primaryAudience.length < 5 && !primaryAudience.includes(trimmedValue)) {
                    setPrimaryAudience([...primaryAudience, trimmedValue]);
                    setPrimaryAudienceInput("");
                  }
                }
              }}
              placeholder="Type an audience and press Enter (e.g., Employers)"
              className="!bg-[rgba(18,18,18,0.95)] !backdrop-blur-md !text-white !border-white/20 shadow-md transition-all hover:!border-white/30 w-full px-3 py-3 rounded-md border !placeholder-white/50 focus:!border-white/50 focus:ring-2 focus:ring-white/30 focus:outline-none"
              style={{ 
                backgroundColor: 'rgba(18,18,18,0.95) !important', 
                color: 'white !important',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.2) !important'
              }}
              data-testid="input-primary-audience"
            />
            {primaryAudience.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {primaryAudience.map((audience, index) => (
                  <span key={index} className="bg-white/10 border border-white/20 px-3 py-1 rounded-full text-sm text-white flex items-center gap-2">
                    {audience}
                    <button
                      type="button"
                      onClick={() => setPrimaryAudience(primaryAudience.filter((_, i) => i !== index))}
                      className="hover:text-red-400"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Secondary Audience */}
        <div className="space-y-2">
          <label htmlFor="secondaryAudience" className="text-sm font-medium text-white flex items-center gap-2">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            Secondary Audience
          </label>
          <p className="text-xs text-white/60 -mt-1">(Peers, industry networks, collaborators) Press Enter to add (max 5)</p>
          <div className="space-y-2">
            <input
              id="secondaryAudience"
              type="text"
              value={secondaryAudienceInput}
              onChange={(e) => setSecondaryAudienceInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  const trimmedValue = secondaryAudienceInput.trim();
                  if (trimmedValue && secondaryAudience.length < 5 && !secondaryAudience.includes(trimmedValue)) {
                    setSecondaryAudience([...secondaryAudience, trimmedValue]);
                    setSecondaryAudienceInput("");
                  }
                }
              }}
              placeholder="Type an audience and press Enter (e.g., Peers)"
              className="!bg-[rgba(18,18,18,0.95)] !backdrop-blur-md !text-white !border-white/20 shadow-md transition-all hover:!border-white/30 w-full px-3 py-3 rounded-md border !placeholder-white/50 focus:!border-white/50 focus:ring-2 focus:ring-white/30 focus:outline-none"
              style={{ 
                backgroundColor: 'rgba(18,18,18,0.95) !important', 
                color: 'white !important',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.2) !important'
              }}
              data-testid="input-secondary-audience"
            />
            {secondaryAudience.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {secondaryAudience.map((audience, index) => (
                  <span key={index} className="bg-white/10 border border-white/20 px-3 py-1 rounded-full text-sm text-white flex items-center gap-2">
                    {audience}
                    <button
                      type="button"
                      onClick={() => setSecondaryAudience(secondaryAudience.filter((_, i) => i !== index))}
                      className="hover:text-red-400"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
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
              console.log("[SAVE DEBUG] Current field values:");
              console.log("  - tagline:", tagline);
              console.log("  - visionStatement:", visionStatement);
              console.log("  - missionStatement:", missionStatement);
              console.log("  - coreValues:", coreValues);
              console.log("  - uniqueValueProposition:", uniqueValueProposition);
              console.log("  - primaryAudience:", primaryAudience);
              console.log("  - secondaryAudience:", secondaryAudience);
              
              const updateData = {
                name: name.trim(),
                title: jobTitle.trim() || null,
                company: company.trim() || null,
                location: location.trim() || null,
                industry: industry || null,
                domain: domain || null,
                lookingFor: lookingFor.trim() || null,
                // New branding fields
                tagline: tagline.trim() || null,
                visionStatement: visionStatement.trim() || null,
                missionStatement: missionStatement.trim() || null,
                coreValues: coreValues.length > 0 ? coreValues : null,
                uniqueValueProposition: uniqueValueProposition.trim() || null,
                primaryAudience: primaryAudience.length > 0 ? primaryAudience : null,
                secondaryAudience: secondaryAudience.length > 0 ? secondaryAudience : null,
              };
              
              console.log("[SAVE DEBUG] Prepared updateData:", JSON.stringify(updateData, null, 2));

              // Validate and ensure lookingFor value is correct
              const validLookingForValues = Object.keys(LOOKING_FOR_OPTIONS);
              const isValidLookingFor = lookingFor && validLookingForValues.includes(lookingFor);
              
              console.log("[BUTTON] Job title:", jobTitle);
              console.log("[BUTTON] Raw lookingFor state value:", lookingFor);
              console.log("[BUTTON] lookingFor type:", typeof lookingFor);
              console.log("[BUTTON] Valid lookingFor values:", validLookingForValues);
              console.log("[BUTTON] Is lookingFor valid?", isValidLookingFor);
              
              // Critical fix: Only send valid database values
              if (isValidLookingFor) {
                updateData.lookingFor = lookingFor; // Keep the valid value
                console.log("[BUTTON] Using valid lookingFor value:", lookingFor);
              } else if (lookingFor) {
                console.error("[BUTTON] CRITICAL: Invalid lookingFor detected, blocking save:", lookingFor);
                alert("Invalid dropdown value detected. Please select a valid option.");
                return;
              } else {
                updateData.lookingFor = null;
                console.log("[BUTTON] No lookingFor selected, setting to null");
              }
              
              console.log("[BUTTON] Final validated data:", updateData);
              
              const response = await apiRequest("PUT", `/api/users/${userData.id}`, updateData);

              console.log("[BUTTON] Response status:", response.status);

              if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`API call failed: ${response.status} - ${errorText}`);
              }

              console.log("[BUTTON] API response:", response);

              // Create the updated user data object for immediate cache update
              const updatedUserData = {
                ...userData,
                ...updateData
              };

              console.log("[BUTTON] Updating cache immediately with:", updatedUserData);

              // Immediately update the cache with the new data using the correct query key
              queryClient.setQueryData(['/api/users', userIdentifier], updatedUserData);

              console.log("[BUTTON] Cache updated immediately, now invalidating for fresh data");

              // Invalidate queries to ensure fresh data from server matches what we just set
              await queryClient.invalidateQueries({ queryKey: ['/api/users', userIdentifier] });
              
              // Also invalidate any other potential query keys for safety
              await queryClient.invalidateQueries({ queryKey: [`/api/users/${userData.id}`] });
              await queryClient.invalidateQueries({ queryKey: [`/api/users/${userData.username}`] });
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