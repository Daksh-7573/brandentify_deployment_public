import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, Check, Sparkles } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

const INDUSTRIES = [
  'Technology', 'Healthcare', 'Finance', 'Education', 'Manufacturing',
  'Retail', 'Real Estate', 'Marketing', 'Consulting', 'Entertainment',
  'Energy', 'Transportation', 'Legal', 'Hospitality', 'Agriculture'
];

const DOMAINS = {
  'Technology': ['Software Development', 'Data Science', 'AI/ML', 'Cybersecurity', 'Cloud Computing', 'DevOps'],
  'Healthcare': ['Clinical Care', 'Medical Research', 'Healthcare IT', 'Pharmaceuticals', 'Medical Devices'],
  'Finance': ['Investment Banking', 'Financial Planning', 'Accounting', 'Risk Management', 'Insurance'],
  'Education': ['K-12 Education', 'Higher Education', 'EdTech', 'Training & Development', 'Curriculum Design'],
  'Marketing': ['Digital Marketing', 'Content Marketing', 'Brand Strategy', 'SEO/SEM', 'Social Media'],
  'default': ['Business Development', 'Product Management', 'Operations', 'Sales', 'Customer Success']
};

// Step 1: Essentials Schema
const essentialsSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  title: z.string().min(2, 'Title is required'),
  location: z.string().optional(),
  industry: z.string().min(1, 'Please select an industry'),
  domain: z.string().optional(),
});

// Step 2: Brand Voice Schema
const brandVoiceSchema = z.object({
  aboutMe: z.string().max(1000, 'About Me must be 350 words or less').optional(),
  whatIOffer: z.string().max(750, 'What I Offer must be 250 words or less').optional(),
});

// Combined schema for all steps
const profileWizardSchema = essentialsSchema.merge(brandVoiceSchema);

type ProfileWizardFormData = z.infer<typeof profileWizardSchema>;

interface ProfileWizardProps {
  isOpen: boolean;
  mode: 'onboarding' | 'edit';
  userId: number;
  initialData?: Partial<ProfileWizardFormData>;
  onComplete: () => void;
  onClose?: () => void;
}

export function ProfileWizard({
  isOpen,
  mode,
  userId,
  initialData,
  onComplete,
  onClose
}: ProfileWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const form = useForm<ProfileWizardFormData>({
    resolver: zodResolver(profileWizardSchema),
    defaultValues: {
      name: initialData?.name || '',
      title: initialData?.title || '',
      location: initialData?.location || '',
      industry: initialData?.industry || '',
      domain: initialData?.domain || '',
      aboutMe: initialData?.aboutMe || '',
      whatIOffer: initialData?.whatIOffer || '',
    },
  });

  const selectedIndustry = form.watch('industry');
  const availableDomains = DOMAINS[selectedIndustry as keyof typeof DOMAINS] || DOMAINS.default;

  // Reset domain when industry changes
  useEffect(() => {
    if (selectedIndustry && !availableDomains.includes(form.getValues('domain') || '')) {
      form.setValue('domain', '');
    }
  }, [selectedIndustry, availableDomains, form]);

  const totalSteps = mode === 'onboarding' ? 4 : 2; // In edit mode, show only first 2 steps
  const progress = (currentStep / totalSteps) * 100;

  const handleNext = async () => {
    let isValid = false;

    if (currentStep === 1) {
      isValid = await form.trigger(['name', 'title', 'location', 'industry', 'domain']);
    } else if (currentStep === 2) {
      isValid = await form.trigger(['aboutMe', 'whatIOffer']);
    } else {
      isValid = true;
    }

    if (isValid) {
      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1);
      } else {
        await handleSubmit();
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSaving(true);
    try {
      const values = form.getValues();
      
      // Update user profile
      await apiRequest({
        url: `/api/users/${userId}`,
        method: 'PATCH',
        data: {
          name: values.name,
          title: values.title,
          location: values.location,
          industry: values.industry,
          domain: values.domain,
          aboutMe: values.aboutMe,
          whatIOffer: values.whatIOffer,
        }
      });

      // If in onboarding mode, mark profile as at least 50% complete
      if (mode === 'onboarding') {
        await apiRequest({
          url: `/api/users/${userId}/onboarding`,
          method: 'PATCH',
          data: {
            onboardingStep: 'profile'
          }
        });
      }

      toast({
        title: mode === 'onboarding' ? 'Profile created!' : 'Profile updated!',
        description: mode === 'onboarding' 
          ? 'Your profile is ready. Get ready for your first quest!' 
          : 'Your changes have been saved.',
      });

      onComplete();
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to save profile. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-white flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-400" />
              Essential Information
            </h3>
            <p className="text-gray-400 text-sm">Tell us about yourself and your professional background</p>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300">Full Name *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="John Doe"
                      className="bg-white/10 border-white/20 text-white"
                      data-testid="input-name"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300">Job Title *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Senior Software Engineer"
                      className="bg-white/10 border-white/20 text-white"
                      data-testid="input-title"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300">Location</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="San Francisco, CA"
                      className="bg-white/10 border-white/20 text-white"
                      data-testid="input-location"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="industry"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300">Industry *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-white/10 border-white/20 text-white" data-testid="select-industry">
                        <SelectValue placeholder="Select your industry" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-gray-900 border-white/20">
                      {INDUSTRIES.map((industry) => (
                        <SelectItem key={industry} value={industry} className="text-white">
                          {industry}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedIndustry && (
              <FormField
                control={form.control}
                name="domain"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">Domain/Specialization</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-white/10 border-white/20 text-white" data-testid="select-domain">
                          <SelectValue placeholder="Select your domain" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-gray-900 border-white/20">
                        {availableDomains.map((domain) => (
                          <SelectItem key={domain} value={domain} className="text-white">
                            {domain}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-white flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-400" />
              Your Brand Voice
            </h3>
            <p className="text-gray-400 text-sm">Share your story and what makes you unique</p>

            <FormField
              control={form.control}
              name="aboutMe"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300">About Me</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Tell your professional story... (max 350 words)"
                      className="bg-white/10 border-white/20 text-white min-h-[120px]"
                      data-testid="textarea-about"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="whatIOffer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300">What I Offer</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Describe your skills and services... (max 250 words)"
                      className="bg-white/10 border-white/20 text-white min-h-[100px]"
                      data-testid="textarea-offer"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-white flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-green-400" />
              Experience (Optional)
            </h3>
            <p className="text-gray-400 text-sm">You can add work experience later from your profile</p>
            <div className="p-6 rounded-lg bg-white/5 border border-white/10 text-center">
              <p className="text-gray-300">Skip for now - you'll unlock this after completing your profile</p>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-white flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-yellow-400" />
              Showcase Projects (Optional)
            </h3>
            <p className="text-gray-400 text-sm">You can add projects later from your profile</p>
            <div className="p-6 rounded-lg bg-white/5 border border-white/10 text-center">
              <p className="text-gray-300">Skip for now - you'll unlock this after completing your profile</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={mode === 'edit' ? onClose : undefined}>
      <DialogContent 
        className="max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-gray-900/95 via-black/95 to-gray-800/95 border border-white/20 backdrop-blur-xl"
        data-testid="profile-wizard"
      >
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
            {mode === 'onboarding' ? 'Complete Your Profile' : 'Edit Profile'}
          </DialogTitle>
          <div className="mt-4">
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-gray-400 mt-2">
              Step {currentStep} of {totalSteps}
            </p>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form className="space-y-6 mt-4">
            {renderStepContent()}

            <div className="flex justify-between gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 1}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                data-testid="button-back"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back
              </Button>

              <Button
                type="button"
                onClick={handleNext}
                disabled={isSaving}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
                data-testid="button-next"
              >
                {isSaving ? (
                  'Saving...'
                ) : currentStep === totalSteps ? (
                  <>
                    <Check className="h-4 w-4 mr-1" />
                    Complete
                  </>
                ) : (
                  <>
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
