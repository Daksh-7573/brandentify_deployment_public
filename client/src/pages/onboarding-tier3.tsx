import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { NeoGlassSection } from "@/components/ui/neo-glass/index";
import backgroundImage from "@assets/Brandentifier Landing_1751376023002.png";
import { X, Plus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface OnboardingTier3Props {
  onComplete: (data: { skills: Array<{ name: string; level: string }>, whatIOffer?: string }) => void;
  onBack: () => void;
  onSkip: () => void;
}

const SKILL_LEVELS = ["Beginner", "Intermediate", "Advanced", "Expert"];

export default function OnboardingTier3({ 
  onComplete, 
  onBack,
  onSkip
}: OnboardingTier3Props) {
  const [skills, setSkills] = useState<Array<{ name: string; level: string }>>([
    { name: "", level: "Intermediate" }
  ]);
  const [whatIOffer, setWhatIOffer] = useState("");

  const addSkill = () => {
    if (skills.length < 10) {
      setSkills([...skills, { name: "", level: "Intermediate" }]);
    }
  };

  const removeSkill = (index: number) => {
    if (skills.length > 1) {
      setSkills(skills.filter((_, i) => i !== index));
    }
  };

  const updateSkill = (index: number, field: 'name' | 'level', value: string) => {
    const newSkills = [...skills];
    newSkills[index][field] = value;
    setSkills(newSkills);
  };

  const handleContinue = () => {
    const validSkills = skills.filter(s => s.name.trim());
    onComplete({ 
      skills: validSkills,
      whatIOffer: whatIOffer.trim() || undefined
    });
  };

  const hasValidSkill = skills.some(s => s.name.trim());

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
        <div className="w-full max-w-3xl my-auto">
          <NeoGlassSection className="p-8 sm:p-12">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
                🎯 Skills & Services
              </h1>
              
              <p className="text-lg text-white/80 max-w-xl mx-auto mb-2">
                Showcase your expertise and offerings
              </p>
              
              <p className="text-white/60 max-w-xl mx-auto text-sm">
                Add your key skills and services you provide to potential connections
              </p>
            </div>

            {/* Form */}
            <div className="space-y-8 mb-8">
              {/* Skills Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-white font-medium text-lg">
                    Skills <span className="text-white/60 text-sm font-normal">(Add at least 1)</span>
                  </Label>
                  <Button
                    onClick={addSkill}
                    disabled={skills.length >= 10}
                    variant="ghost"
                    size="sm"
                    className="text-blue-400 hover:text-blue-300 hover:bg-white/10"
                    data-testid="button-add-skill"
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add Skill
                  </Button>
                </div>

                <div className="space-y-3">
                  {skills.map((skill, index) => (
                    <div key={index} className="flex gap-3 items-start">
                      <div className="flex-1">
                        <Input
                          value={skill.name}
                          onChange={(e) => updateSkill(index, 'name', e.target.value)}
                          placeholder="e.g., Project Management, Python, UI/UX Design"
                          className="neo-glass-input bg-[rgba(18,18,18,0.95)] text-white border-white/20"
                          data-testid={`input-skill-name-${index}`}
                        />
                      </div>
                      <div className="w-40">
                        <Select 
                          value={skill.level} 
                          onValueChange={(value) => updateSkill(index, 'level', value)}
                        >
                          <SelectTrigger 
                            className="bg-[rgba(18,18,18,0.95)] backdrop-blur-md text-white border-white/20 shadow-md transition-all hover:border-white/30 focus:border-white/50 focus:ring-2 focus:ring-white/30 focus:outline-none"
                            data-testid={`select-skill-level-${index}`}
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-900/95 border-white/20 backdrop-blur-xl">
                            {SKILL_LEVELS.map((level) => (
                              <SelectItem 
                                key={level} 
                                value={level}
                                className="text-white hover:bg-white/10 focus:bg-white/20 cursor-pointer"
                              >
                                {level}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      {skills.length > 1 && (
                        <Button
                          onClick={() => removeSkill(index)}
                          variant="ghost"
                          size="sm"
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10 px-2"
                          data-testid={`button-remove-skill-${index}`}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-white/50 text-xs">
                  Add up to 10 skills. Choose the proficiency level for each.
                </p>
              </div>

              {/* Services Section */}
              <div className="space-y-2">
                <Label htmlFor="whatIOffer" className="text-white font-medium">
                  Services <span className="text-white/60 text-sm font-normal">(Optional)</span>
                </Label>
                <Textarea
                  id="whatIOffer"
                  value={whatIOffer}
                  onChange={(e) => setWhatIOffer(e.target.value)}
                  placeholder="Describe the services, expertise, or value you provide to clients or employers..."
                  className="neo-glass-input bg-[rgba(18,18,18,0.95)] text-white border-white/20 min-h-32 resize-y"
                  maxLength={500}
                  data-testid="textarea-services"
                />
                <p className="text-white/50 text-xs">
                  {whatIOffer.length}/500 characters · Describe your services and what you bring to the table
                </p>
              </div>

              {/* Value Preview */}
              <div className="bg-purple-500/10 border border-purple-400/30 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">✨</div>
                  <div>
                    <div className="text-white font-medium mb-1">Why this matters:</div>
                    <div className="text-white/80 text-sm">
                      Skills and services help you:
                    </div>
                    <div className="mt-2 space-y-1.5 text-white/70 text-sm">
                      <div className="flex items-start gap-2">
                        <span className="text-purple-400 mt-0.5">🎯</span>
                        <span>Get matched with relevant opportunities and connections</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-purple-400 mt-0.5">🎯</span>
                        <span>Showcase your unique value to potential clients and employers</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-purple-400 mt-0.5">🎯</span>
                        <span>Build credibility and establish your professional brand</span>
                      </div>
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

              <div className="flex gap-3">
                <Button
                  onClick={onSkip}
                  variant="ghost"
                  className="text-white/70 hover:text-white hover:bg-white/10"
                  data-testid="button-skip-tier2"
                >
                  Skip for now
                </Button>

                <Button
                  onClick={handleContinue}
                  disabled={!hasValidSkill}
                  size="lg"
                  className={`px-8 py-6 text-lg font-semibold transition-all duration-300 ${
                    hasValidSkill
                      ? 'bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white shadow-xl hover:shadow-2xl transform hover:scale-105' 
                      : 'bg-white/10 text-white/40 cursor-not-allowed'
                  }`}
                  data-testid="button-continue-tier2"
                >
                  Continue →
                </Button>
              </div>
            </div>

            {/* Time Indicator */}
            <div className="text-center mt-6 text-white/50 text-sm">
              Step 4 of 5 · ~5 minutes
            </div>
          </NeoGlassSection>
        </div>
      </div>
    </div>
  );
}
