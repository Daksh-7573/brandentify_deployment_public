import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { NeoGlassSection } from "@/components/ui/neo-glass/index";
import backgroundImage from "@assets/Brandentifier Landing_1751376023002.png";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { INDUSTRIES, INDUSTRY_DOMAINS } from '@shared/constants';

interface OnboardingQuickSetupProps {
  userName?: string;
  selectedGoal?: string;
  onComplete: (data: { title: string; industry: string; domain?: string }) => void;
  onBack: () => void;
}

export default function OnboardingQuickSetup({ 
  userName, 
  selectedGoal,
  onComplete, 
  onBack 
}: OnboardingQuickSetupProps) {
  const [title, setTitle] = useState<string>("");
  const [industry, setIndustry] = useState<string>("");
  const [domain, setDomain] = useState<string>("");

  // Get available domains based on selected industry
  const availableDomains = industry && INDUSTRY_DOMAINS[industry] 
    ? INDUSTRY_DOMAINS[industry] 
    : [];

  // Reset domain when industry changes
  useEffect(() => {
    setDomain("");
  }, [industry]);

  const handleContinue = () => {
    if (title && industry) {
      onComplete({ 
        title, 
        industry, 
        domain: domain || undefined 
      });
    }
  };

  const isValid = title.trim() && industry;

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
        <div className="w-full max-w-2xl my-auto">
          <NeoGlassSection className="p-8 sm:p-12">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
                🚀 Quick Setup
              </h1>
              
              <p className="text-lg text-white/80 max-w-xl mx-auto mb-2">
                Tell us about your professional focus
              </p>
              
              <p className="text-white/60 max-w-xl mx-auto text-sm">
                This helps us create role-specific quests tailored to your career
              </p>
            </div>

            {/* Form */}
            <div className="space-y-6 mb-8">
              {/* Role/Title */}
              <div className="space-y-2">
                <Label htmlFor="title" className="text-white font-medium">
                  Your Role <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Product Manager, Software Engineer"
                  className="neo-glass-input bg-[rgba(18,18,18,0.95)] text-white border-white/20"
                  data-testid="input-role"
                />
                <p className="text-white/50 text-xs">
                  What's your current or target job title?
                </p>
              </div>

              {/* Industry */}
              <div className="space-y-2">
                <Label htmlFor="industry" className="text-white font-medium">
                  Industry <span className="text-red-400">*</span>
                </Label>
                <Select value={industry} onValueChange={setIndustry}>
                  <SelectTrigger 
                    className="bg-[rgba(18,18,18,0.95)] backdrop-blur-md text-white border-white/20 shadow-md transition-all hover:border-white/30 focus:border-white/50 focus:ring-2 focus:ring-white/30 focus:outline-none"
                    data-testid="select-industry"
                  >
                    <SelectValue placeholder="Select your industry" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900/95 border-white/20 backdrop-blur-xl">
                    {INDUSTRIES.map((ind) => (
                      <SelectItem 
                        key={ind} 
                        value={ind}
                        className="text-white hover:bg-white/10 focus:bg-white/20 cursor-pointer"
                      >
                        {ind}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-white/50 text-xs">
                  Which industry do you work in?
                </p>
              </div>

              {/* Domain (optional, shown if industry selected) */}
              {industry && availableDomains.length > 0 && (
                <div className="space-y-2">
                  <Label htmlFor="domain" className="text-white font-medium">
                    Domain (Optional)
                  </Label>
                  <Select value={domain} onValueChange={setDomain}>
                    <SelectTrigger 
                      className="bg-[rgba(18,18,18,0.95)] backdrop-blur-md text-white border-white/20 shadow-md transition-all hover:border-white/30 focus:border-white/50 focus:ring-2 focus:ring-white/30 focus:outline-none"
                      data-testid="select-domain"
                    >
                      <SelectValue placeholder="Select your specialization" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900/95 border-white/20 backdrop-blur-xl max-h-60">
                      {availableDomains.map((dom) => (
                        <SelectItem 
                          key={dom} 
                          value={dom}
                          className="text-white hover:bg-white/10 focus:bg-white/20 cursor-pointer"
                        >
                          {dom}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-white/50 text-xs">
                    Narrow down your area of expertise
                  </p>
                </div>
              )}

              {/* Value Preview */}
              <div className="bg-blue-500/10 border border-blue-400/30 rounded-lg p-4 mt-6">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">💡</div>
                  <div>
                    <div className="text-white font-medium mb-1">Why this matters:</div>
                    <div className="text-white/80 text-sm">
                      Your AI coach will create quests like:
                    </div>
                    <div className="mt-2 space-y-1.5 text-white/70 text-sm">
                      {title && industry ? (
                        <>
                          <div className="flex items-start gap-2">
                            <span className="text-green-400 mt-0.5">🎯</span>
                            <span>"Write a LinkedIn post about {title.toLowerCase()} best practices in {industry.toLowerCase()}"</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="text-green-400 mt-0.5">🎯</span>
                            <span>"Connect with 3 senior {title.toLowerCase()}s in the {industry.toLowerCase()} sector"</span>
                          </div>
                        </>
                      ) : (
                        <div className="text-white/50 italic">
                          Fill in your role and industry to see personalized quest examples
                        </div>
                      )}
                    </div>
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
                data-testid="button-continue-setup"
              >
                Continue →
              </Button>
            </div>

            {/* Time Indicator */}
            <div className="text-center mt-6 text-white/50 text-sm">
              Step 2 of 5 · ~2 minutes
            </div>
          </NeoGlassSection>
        </div>
      </div>
    </div>
  );
}
