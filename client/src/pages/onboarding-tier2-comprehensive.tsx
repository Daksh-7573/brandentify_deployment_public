import { useState, useEffect, useContext } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { NeoGlassSection } from "@/components/ui/neo-glass/index";
import backgroundImage from "@assets/Brandentifier Landing_1751376023002.png";
import { X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { INDUSTRIES, INDUSTRY_DOMAINS } from '@shared/constants';
import { LOOKING_FOR_OPTIONS } from "@/lib/constants";
import LocationAutocomplete from "@/components/ui/location-autocomplete";
import { AuthContext } from "@/context/simple-auth-context";

interface OnboardingTier2ComprehensiveProps {
  onComplete: (data: {
    name: string;
    company?: string;
    location?: string;
    lookingFor?: string;
    tagline?: string;
    visionStatement?: string;
    missionStatement?: string;
    coreValues?: string[];
    uniqueValueProposition?: string;
    primaryAudience?: string[];
    secondaryAudience?: string[];
  }) => void;
  onBack: () => void;
}

export default function OnboardingTier2Comprehensive({
  onComplete,
  onBack
}: OnboardingTier2ComprehensiveProps) {
  const { user } = useContext(AuthContext);
  
  // Profile fields - auto-fetch name from Google
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [lookingFor, setLookingFor] = useState("");

  // Auto-fetch name from Google authentication
  useEffect(() => {
    if (user?.name && !name) {
      setName(user.name);
    }
  }, [user]);

  // Branding fields
  const [tagline, setTagline] = useState("");
  const [visionStatement, setVisionStatement] = useState("");
  const [missionStatement, setMissionStatement] = useState("");
  const [coreValues, setCoreValues] = useState<string[]>([]);
  const [uniqueValueProposition, setUniqueValueProposition] = useState("");
  const [primaryAudience, setPrimaryAudience] = useState<string[]>([]);
  const [secondaryAudience, setSecondaryAudience] = useState<string[]>([]);

  // Temporary input states for array fields
  const [coreValuesInput, setCoreValuesInput] = useState("");
  const [primaryAudienceInput, setPrimaryAudienceInput] = useState("");
  const [secondaryAudienceInput, setSecondaryAudienceInput] = useState("");

  const handleContinue = () => {
    if (name.trim()) {
      onComplete({
        name,
        company: company.trim() || undefined,
        location: location.trim() || undefined,
        lookingFor: lookingFor || undefined,
        tagline: tagline.trim() || undefined,
        visionStatement: visionStatement.trim() || undefined,
        missionStatement: missionStatement.trim() || undefined,
        coreValues: coreValues.length > 0 ? coreValues : undefined,
        uniqueValueProposition: uniqueValueProposition.trim() || undefined,
        primaryAudience: primaryAudience.length > 0 ? primaryAudience : undefined,
        secondaryAudience: secondaryAudience.length > 0 ? secondaryAudience : undefined
      });
    }
  };

  const isValid = name.trim();

  return (
    <div
      className="fixed inset-0 w-full h-full responsive-background"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Glass UI overlay */}
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900/80 via-black/70 to-gray-800/80 backdrop-blur-sm"></div>

      <div className="relative z-10 w-full h-full flex items-center justify-center p-4 overflow-y-auto py-8">
        <div className="w-full max-w-4xl my-auto">
          <NeoGlassSection className="p-8 sm:p-12">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
                📋 Complete Your Profile
              </h1>

              <p className="text-lg text-white/80 max-w-2xl mx-auto mb-2">
                Build your professional brand identity
              </p>

              <p className="text-white/60 max-w-2xl mx-auto text-sm">
                Fill in your profile details and brand positioning to stand out
              </p>
            </div>

            {/* Form - 2 Column Layout */}
            <div className="space-y-8 mb-8">
              {/* Profile Information Section */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4 pb-2 border-b border-white/20">
                  📌 Profile Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div className="space-y-2">
                    <Label className="text-white font-medium">
                      Full Name <span className="text-red-400">*</span>
                    </Label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your full name"
                      className="bg-[rgba(18,18,18,0.95)] backdrop-blur-md text-white border-white/20 shadow-md transition-all hover:border-white/30 placeholder:text-white/50 focus:border-white/50 focus:ring-2 focus:ring-white/30 focus:outline-none"
                      data-testid="input-name"
                    />
                  </div>

                  {/* Company Name */}
                  <div className="space-y-2">
                    <Label className="text-white font-medium">Company Name</Label>
                    <Input
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="Your company name"
                      className="bg-[rgba(18,18,18,0.95)] backdrop-blur-md text-white border-white/20 shadow-md transition-all hover:border-white/30 placeholder:text-white/50 focus:border-white/50 focus:ring-2 focus:ring-white/30 focus:outline-none"
                      data-testid="input-company"
                    />
                  </div>

                  {/* Location */}
                  <div className="space-y-2">
                    <Label className="text-white font-medium">Location</Label>
                    <LocationAutocomplete
                      value={location}
                      onChange={setLocation}
                      placeholder="Your location (e.g. San Francisco, CA)"
                      className="bg-[rgba(18,18,18,0.95)] backdrop-blur-md text-white border-white/20 shadow-md transition-all hover:border-white/30 placeholder:text-white/50 focus:border-white/50 focus:ring-2 focus:ring-white/30 focus:outline-none"
                    />
                  </div>

                  {/* Looking For */}
                  <div className="space-y-2">
                    <Label className="text-white font-medium">I Am Looking For</Label>
                    <Select value={lookingFor} onValueChange={setLookingFor}>
                      <SelectTrigger
                        className="bg-[rgba(18,18,18,0.95)] backdrop-blur-md text-white border-white/20 shadow-md transition-all hover:border-white/30 focus:border-white/50 focus:ring-2 focus:ring-white/30 focus:outline-none"
                        data-testid="select-looking-for"
                      >
                        <SelectValue placeholder="Select what you're looking for" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-900/95 border-white/20 backdrop-blur-xl">
                        {Object.entries(LOOKING_FOR_OPTIONS).map(([value, label]) => (
                          <SelectItem
                            key={value}
                            value={value}
                            className="text-white hover:bg-white/10 focus:bg-white/20 cursor-pointer"
                          >
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Branding Section */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4 pb-2 border-b border-white/20">
                  ✨ Brand Positioning
                </h3>
                <div className="space-y-4">
                  {/* Tagline */}
                  <div className="space-y-2">
                    <Label className="text-white font-medium">
                      Tagline / Personal Motto
                    </Label>
                    <p className="text-white/50 text-xs -mt-1">
                      E.g., "Empowering ideas through innovation" (max 80 characters)
                    </p>
                    <Input
                      value={tagline}
                      onChange={(e) => setTagline(e.target.value)}
                      placeholder="Enter your personal motto"
                      maxLength={80}
                      className="bg-[rgba(18,18,18,0.95)] backdrop-blur-md text-white border-white/20 shadow-md transition-all hover:border-white/30 placeholder:text-white/50 focus:border-white/50 focus:ring-2 focus:ring-white/30 focus:outline-none"
                      data-testid="input-tagline"
                    />
                    <p className="text-white/40 text-xs text-right">{tagline.length}/80</p>
                  </div>

                  {/* Vision Statement */}
                  <div className="space-y-2">
                    <Label className="text-white font-medium">Vision Statement</Label>
                    <p className="text-white/50 text-xs -mt-1">
                      Where you want to go long-term (max 200 characters)
                    </p>
                    <Textarea
                      value={visionStatement}
                      onChange={(e) => setVisionStatement(e.target.value)}
                      placeholder="Describe your long-term vision"
                      maxLength={200}
                      rows={3}
                      className="bg-[rgba(18,18,18,0.95)] backdrop-blur-md text-white border-white/20 shadow-md transition-all hover:border-white/30 placeholder:text-white/50 focus:border-white/50 focus:ring-2 focus:ring-white/30 focus:outline-none resize-none"
                      data-testid="textarea-vision"
                    />
                    <p className="text-white/40 text-xs text-right">{visionStatement.length}/200</p>
                  </div>

                  {/* Mission Statement */}
                  <div className="space-y-2">
                    <Label className="text-white font-medium">Mission Statement</Label>
                    <p className="text-white/50 text-xs -mt-1">
                      What you stand for, how you create impact (max 220 characters)
                    </p>
                    <Textarea
                      value={missionStatement}
                      onChange={(e) => setMissionStatement(e.target.value)}
                      placeholder="Describe your mission and impact"
                      maxLength={220}
                      rows={3}
                      className="bg-[rgba(18,18,18,0.95)] backdrop-blur-md text-white border-white/20 shadow-md transition-all hover:border-white/30 placeholder:text-white/50 focus:border-white/50 focus:ring-2 focus:ring-white/30 focus:outline-none resize-none"
                      data-testid="textarea-mission"
                    />
                    <p className="text-white/40 text-xs text-right">{missionStatement.length}/220</p>
                  </div>

                  {/* Core Values */}
                  <div className="space-y-2">
                    <Label className="text-white font-medium">Core Values</Label>
                    <p className="text-white/50 text-xs -mt-1">
                      3-5 keywords (e.g., Integrity, Innovation). Press Enter to add (max 5)
                    </p>
                    <Input
                      value={coreValuesInput}
                      onChange={(e) => setCoreValuesInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const value = coreValuesInput.trim();
                          if (value && coreValues.length < 5 && !coreValues.includes(value)) {
                            setCoreValues([...coreValues, value]);
                            setCoreValuesInput("");
                          }
                        }
                      }}
                      placeholder="Type a value and press Enter"
                      className="bg-[rgba(18,18,18,0.95)] backdrop-blur-md text-white border-white/20 shadow-md transition-all hover:border-white/30 placeholder:text-white/50 focus:border-white/50 focus:ring-2 focus:ring-white/30 focus:outline-none"
                      data-testid="input-core-values"
                    />
                    {coreValues.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {coreValues.map((value, index) => (
                          <span
                            key={index}
                            className="bg-white/10 border border-white/20 px-3 py-1 rounded-full text-sm text-white flex items-center gap-2"
                          >
                            {value}
                            <button
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

                  {/* Unique Value Proposition */}
                  <div className="space-y-2">
                    <Label className="text-white font-medium">Unique Value Proposition (UVP)</Label>
                    <p className="text-white/50 text-xs -mt-1">
                      What sets you apart (max 150 characters)
                    </p>
                    <Textarea
                      value={uniqueValueProposition}
                      onChange={(e) => setUniqueValueProposition(e.target.value)}
                      placeholder="What makes you unique?"
                      maxLength={150}
                      rows={2}
                      className="bg-[rgba(18,18,18,0.95)] backdrop-blur-md text-white border-white/20 shadow-md transition-all hover:border-white/30 placeholder:text-white/50 focus:border-white/50 focus:ring-2 focus:ring-white/30 focus:outline-none resize-none"
                      data-testid="textarea-uvp"
                    />
                    <p className="text-white/40 text-xs text-right">{uniqueValueProposition.length}/150</p>
                  </div>

                  {/* Primary Audience */}
                  <div className="space-y-2">
                    <Label className="text-white font-medium">Primary Audience</Label>
                    <p className="text-white/50 text-xs -mt-1">
                      E.g., Employers, clients, investors. Press Enter to add (max 5)
                    </p>
                    <Input
                      value={primaryAudienceInput}
                      onChange={(e) => setPrimaryAudienceInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const value = primaryAudienceInput.trim();
                          if (value && primaryAudience.length < 5 && !primaryAudience.includes(value)) {
                            setPrimaryAudience([...primaryAudience, value]);
                            setPrimaryAudienceInput("");
                          }
                        }
                      }}
                      placeholder="Type an audience and press Enter"
                      className="bg-[rgba(18,18,18,0.95)] backdrop-blur-md text-white border-white/20 shadow-md transition-all hover:border-white/30 placeholder:text-white/50 focus:border-white/50 focus:ring-2 focus:ring-white/30 focus:outline-none"
                      data-testid="input-primary-audience"
                    />
                    {primaryAudience.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {primaryAudience.map((audience, index) => (
                          <span
                            key={index}
                            className="bg-white/10 border border-white/20 px-3 py-1 rounded-full text-sm text-white flex items-center gap-2"
                          >
                            {audience}
                            <button
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

                  {/* Secondary Audience */}
                  <div className="space-y-2">
                    <Label className="text-white font-medium">Secondary Audience</Label>
                    <p className="text-white/50 text-xs -mt-1">
                      E.g., Peers, collaborators, networks. Press Enter to add (max 5)
                    </p>
                    <Input
                      value={secondaryAudienceInput}
                      onChange={(e) => setSecondaryAudienceInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const value = secondaryAudienceInput.trim();
                          if (value && secondaryAudience.length < 5 && !secondaryAudience.includes(value)) {
                            setSecondaryAudience([...secondaryAudience, value]);
                            setSecondaryAudienceInput("");
                          }
                        }
                      }}
                      placeholder="Type an audience and press Enter"
                      className="bg-[rgba(18,18,18,0.95)] backdrop-blur-md text-white border-white/20 shadow-md transition-all hover:border-white/30 placeholder:text-white/50 focus:border-white/50 focus:ring-2 focus:ring-white/30 focus:outline-none"
                      data-testid="input-secondary-audience"
                    />
                    {secondaryAudience.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {secondaryAudience.map((audience, index) => (
                          <span
                            key={index}
                            className="bg-white/10 border border-white/20 px-3 py-1 rounded-full text-sm text-white flex items-center gap-2"
                          >
                            {audience}
                            <button
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
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between items-center">
              <Button
                onClick={onBack}
                variant="ghost"
                className="text-white/70 hover:text-white hover:bg-white/10"
                data-testid="button-back"
              >
                ← Back
              </Button>

              <Button
                onClick={handleContinue}
                disabled={!isValid}
                size="lg"
                className={`px-8 py-6 text-lg font-semibold transition-all duration-300 ${
                  isValid
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-xl hover:shadow-2xl transform hover:scale-105'
                    : 'bg-white/10 text-white/40 cursor-not-allowed'
                }`}
                data-testid="button-continue-tier2"
              >
                Continue →
              </Button>
            </div>

            {/* Time Indicator */}
            <div className="text-center mt-6 text-white/50 text-sm">
              Step 3 of 5 · Building your professional identity
            </div>
          </NeoGlassSection>
        </div>
      </div>
    </div>
  );
}
