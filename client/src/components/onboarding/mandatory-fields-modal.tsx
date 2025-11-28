import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, CheckCircle2 } from 'lucide-react';

const LOOKING_FOR_OPTIONS = [
  { value: 'job_opportunities', label: 'Job Opportunities' },
  { value: 'networking', label: 'Networking' },
  { value: 'mentorship', label: 'Mentorship' },
  { value: 'collaboration', label: 'Collaboration' },
  { value: 'investment', label: 'Investment' },
  { value: 'learning', label: 'Learning' },
  { value: 'career_advice', label: 'Career Advice' },
  { value: 'business_partnerships', label: 'Business Partnerships' }
];

const INDUSTRIES = [
  'Technology', 'Finance', 'Healthcare', 'Education', 'Manufacturing', 'Retail',
  'Media & Entertainment', 'Telecommunications', 'Energy', 'Transportation',
  'Hospitality', 'Real Estate', 'Construction', 'Agriculture', 'Automotive',
  'Consulting', 'Law', 'Marketing', 'Design', 'Other'
];

interface MandatoryFieldsModalProps {
  isOpen: boolean;
  userData?: any;
  onComplete?: () => void;
}

export function MandatoryFieldsModal({ isOpen, userData, onComplete }: MandatoryFieldsModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [skipCount, setSkipCount] = useState(0);
  
  const [formData, setFormData] = useState({
    title: userData?.title || '',
    industry: userData?.industry || '',
    location: userData?.location || '',
    lookingFor: userData?.lookingFor || ''
  });

  // Check if all mandatory fields are filled
  const isMandatoryFieldsFilled = formData.title && formData.industry && formData.location && formData.lookingFor;

  const handleSave = async () => {
    if (!isMandatoryFieldsFilled) {
      toast({
        title: 'Complete all fields',
        description: 'Please fill in all mandatory fields to continue.',
        variant: 'destructive'
      });
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`/api/users/${user?.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          industry: formData.industry,
          location: formData.location,
          lookingFor: formData.lookingFor
        })
      });

      if (!response.ok) throw new Error('Failed to save profile');

      toast({
        title: 'Profile updated',
        description: 'Your mandatory profile details have been saved!'
      });

      onComplete?.();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    if (skipCount < 2) {
      setSkipCount(skipCount + 1);
      toast({
        title: 'Skipped',
        description: `You can skip ${2 - skipCount} more times. You'll see this again next time you login.`
      });
    }
  };

  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-md bg-gradient-to-b from-gray-900 to-black border border-white/10">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white">Complete Your Profile</DialogTitle>
          <DialogDescription className="text-gray-300">
            Let's add your essential professional details to get started
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Step 1: Title */}
          <div className="space-y-2">
            <Label className="text-white flex items-center gap-2">
              <span className="text-lg">💼</span> Job Title
              <span className="text-red-400">*</span>
            </Label>
            <Input
              placeholder="e.g., Product Manager, Software Engineer"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="bg-white/5 border-white/20 text-white placeholder:text-gray-500"
            />
          </div>

          {/* Step 2: Industry */}
          <div className="space-y-2">
            <Label className="text-white flex items-center gap-2">
              <span className="text-lg">🏢</span> Industry
              <span className="text-red-400">*</span>
            </Label>
            <Select value={formData.industry} onValueChange={(value) => setFormData({ ...formData, industry: value })}>
              <SelectTrigger className="bg-white/5 border-white/20 text-white">
                <SelectValue placeholder="Select your industry" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-white/20">
                {INDUSTRIES.map((industry) => (
                  <SelectItem key={industry} value={industry} className="text-white">
                    {industry}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Step 3: Location */}
          <div className="space-y-2">
            <Label className="text-white flex items-center gap-2">
              <span className="text-lg">📍</span> Location
              <span className="text-red-400">*</span>
            </Label>
            <Input
              placeholder="e.g., San Francisco, CA"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="bg-white/5 border-white/20 text-white placeholder:text-gray-500"
            />
          </div>

          {/* Step 4: Looking For */}
          <div className="space-y-2">
            <Label className="text-white flex items-center gap-2">
              <span className="text-lg">🎯</span> What are you looking for?
              <span className="text-red-400">*</span>
            </Label>
            <Select value={formData.lookingFor} onValueChange={(value) => setFormData({ ...formData, lookingFor: value })}>
              <SelectTrigger className="bg-white/5 border-white/20 text-white">
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-white/20">
                {LOOKING_FOR_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value} className="text-white">
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Progress indicator */}
          <div className="flex gap-2 pt-2">
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className={`h-1 flex-1 rounded-full transition-all ${
                  [formData.title, formData.industry, formData.location, formData.lookingFor][step - 1]
                    ? 'bg-green-500'
                    : 'bg-white/10'
                }`}
              />
            ))}
          </div>
        </div>

        <DialogFooter className="flex gap-2 sm:flex-row">
          {skipCount < 2 && (
            <Button
              variant="ghost"
              onClick={handleSkip}
              className="text-gray-400 hover:text-gray-300 hover:bg-white/5"
            >
              Skip for now
            </Button>
          )}
          <Button
            onClick={handleSave}
            disabled={!isMandatoryFieldsFilled || isLoading}
            className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Complete Profile
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
