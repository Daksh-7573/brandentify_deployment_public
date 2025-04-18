import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'wouter';
import { User } from '@/types/user';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { FileText, Camera, ArrowRight, ArrowLeft, Check, Upload, Save, Home } from 'lucide-react';
import { LOOKING_FOR_CATEGORIES, INDUSTRIES } from '@/lib/constants';
import MuskAvatar from '@/components/musk/musk-avatar';
import { Progress } from '@/components/ui/progress';
import confetti from 'canvas-confetti';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface BrandStoryBuilderProps {
  user: User | null;
  userData: any;
  onClose: () => void;
  isOpen: boolean;
}

// Define steps
const STEPS = [
  {
    id: 'all-about-me',
    title: 'All About Me',
    subtitle: 'Who are you... and where are you going?',
    emoji: '👋',
  },
  {
    id: 'what-im-good-at',
    title: 'What I\'m Good At',
    subtitle: 'Flex your skill muscles.',
    emoji: '💪',
  },
  {
    id: 'what-i-offer',
    title: 'What I Offer',
    subtitle: 'How can others benefit from your brilliance?',
    emoji: '🎁',
  },
  {
    id: 'showcase',
    title: 'Showcase',
    subtitle: 'Show. Don\'t just tell.',
    emoji: '✨',
  },
  {
    id: 'career-path',
    title: 'Career Path',
    subtitle: 'Let\'s map the trail behind your current shine.',
    emoji: '🚀',
  },
  {
    id: 'academic-background',
    title: 'Academic Background',
    subtitle: 'Where did your journey begin?',
    emoji: '🎓',
  },
  {
    id: 'personal-information',
    title: 'Personal Information',
    subtitle: 'Just so we can keep in touch (and so can others).',
    emoji: '📱',
  },
];

const BrandStoryBuilder: React.FC<BrandStoryBuilderProps> = ({ 
  user, 
  userData, 
  onClose, 
  isOpen 
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<any>({});
  const [isUploading, setIsUploading] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [justCompleted, setJustCompleted] = useState<number | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  // Initialize form data with user data
  useEffect(() => {
    if (userData) {
      setFormData({
        name: userData.name || '',
        title: userData.title || '',
        location: userData.location || '',
        industry: userData.industry || '',
        lookingFor: userData.lookingFor || '',
        aboutMe: userData.aboutMe || '',
        // Additional fields will be initialized as we implement each step
      });
    }
  }, [userData]);

  useEffect(() => {
    // Calculate progress percentage based on current step
    setProgressPercent(((currentStep + 1) / STEPS.length) * 100);
  }, [currentStep]);

  // Show confetti when a step is completed
  useEffect(() => {
    if (justCompleted !== null) {
      // Trigger confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      
      // Reset after animation
      const timer = setTimeout(() => {
        setJustCompleted(null);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [justCompleted]);

  const updateUser = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest(`/api/users/${userData.id}`, {
        method: 'PATCH',
        data
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users', userData.id] });
      toast({
        title: "Profile updated!",
        description: "Your brand story is getting stronger.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error updating profile",
        description: "Please try again.",
        variant: "destructive",
      });
      console.error("Error updating profile:", error);
    }
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNextStep = () => {
    // Save the current step data
    updateUser.mutate(formData);
    
    // Trigger confetti
    setJustCompleted(currentStep);
    
    // Move to next step
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Complete the process
      handleComplete();
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    // Final save
    updateUser.mutate(formData);
    
    // Show success toast
    toast({
      title: "Profile complete!",
      description: "Your brand story is now live.",
    });
    
    // Trigger massive confetti for completion
    confetti({
      particleCount: 200,
      spread: 100,
      origin: { y: 0.6 }
    });
    
    // Close the builder
    onClose();
  };

  const jumpToStep = (index: number) => {
    // Save current progress first
    updateUser.mutate(formData);
    setCurrentStep(index);
  };

  const handleUploadCV = () => {
    // To be implemented: CV upload and parsing functionality
    setIsUploading(true);
    
    setTimeout(() => {
      setIsUploading(false);
      toast({
        title: "CV uploaded",
        description: "Your CV has been processed. We've filled in many of your details for you.",
      });
      
      // For demo: Update form data as if CV was parsed
      setFormData(prev => ({
        ...prev,
        title: prev.title || "Software Engineer",
        industry: prev.industry || "Technology: Software Development",
        // Additional fields would be populated here
      }));
    }, 2000);
  };

  // Render specific step based on currentStep
  const renderStep = () => {
    const step = STEPS[currentStep];
    
    switch (step.id) {
      case 'all-about-me':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <MuskAvatar size="lg" />
              <div className="mt-4 text-lg text-primary">
                "{step.subtitle}"
              </div>
            </div>
            
            <div className="space-y-4">
              {/* Profile Picture Upload */}
              <div className="flex flex-col items-center gap-4">
                <div className="relative group">
                  <div className="h-32 w-32 overflow-hidden rounded-full bg-white ring-4 ring-primary/20 flex items-center justify-center">
                    <img 
                      className="h-full w-full object-cover" 
                      src={userData?.photoURL || user?.photoURL || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"} 
                      alt="User profile"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80";
                      }}
                    />
                  </div>
                  <button 
                    className="absolute bottom-0 right-0 bg-primary hover:bg-primary/90 text-white p-2 rounded-full shadow-md"
                    aria-label="Change profile picture"
                  >
                    <Camera size={20} />
                  </button>
                </div>
                <p className="text-sm text-muted-foreground">Your face = your brand. Pick a good one or go bold.</p>
              </div>
              
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="font-medium">Your name</Label>
                <Input 
                  id="name" 
                  value={formData.name || ''}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter your full name"
                  className="bg-white"
                />
              </div>
              
              {/* Job Title */}
              <div className="space-y-2">
                <Label htmlFor="title" className="font-medium">I am:</Label>
                <Input 
                  id="title" 
                  value={formData.title || ''}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter something cool (e.g., Senior DevOps Engineer)"
                  className="bg-white"
                />
                <p className="text-xs text-muted-foreground">This is your professional tagline</p>
              </div>
              
              {/* Looking For */}
              <div className="space-y-2">
                <Label htmlFor="lookingFor" className="font-medium">Looking for:</Label>
                <Select 
                  value={formData.lookingFor || ''} 
                  onValueChange={(value) => handleInputChange('lookingFor', value)}
                >
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="What are you looking for?" />
                  </SelectTrigger>
                  <SelectContent>
                    {LOOKING_FOR_CATEGORIES.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.icon} {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Let others know what you're currently seeking
                </p>
              </div>
              
              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="location" className="font-medium">Location:</Label>
                <Input 
                  id="location" 
                  value={formData.location || ''}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="City, Country"
                  className="bg-white"
                />
              </div>
              
              {/* Industry */}
              <div className="space-y-2">
                <Label htmlFor="industry" className="font-medium">Industry:</Label>
                <Select 
                  value={formData.industry || ''} 
                  onValueChange={(value) => handleInputChange('industry', value)}
                >
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Select your industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {INDUSTRIES.map((industry) => (
                      <SelectItem key={industry.value} value={industry.value}>
                        {industry.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* About Me */}
              <div className="space-y-2">
                <Label htmlFor="aboutMe" className="font-medium">What I'm All About:</Label>
                <Textarea 
                  id="aboutMe" 
                  value={formData.aboutMe || ''}
                  onChange={(e) => handleInputChange('aboutMe', e.target.value)}
                  placeholder="Tell us about yourself, your passion, and what drives you."
                  className="h-32 bg-white"
                />
              </div>
            </div>
            
            {/* Encouragement Toast */}
            <div className="bg-primary/10 text-primary-foreground p-3 rounded-md text-sm flex items-center gap-2">
              <div className="bg-primary text-white rounded-full p-1 flex items-center justify-center">
                <Check size={16} />
              </div>
              <div>
                🔥 92% of top profiles have this section filled right.
              </div>
            </div>
          </div>
        );
      
      case 'what-im-good-at':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <MuskAvatar size="lg" />
              <div className="mt-4 text-lg text-primary">
                "{step.subtitle}"
              </div>
            </div>
            
            <div className="space-y-4">
              <p className="text-sm text-center text-muted-foreground mb-6">
                Let's add your skills. These are what make you stand out.
              </p>
              
              {/* Skills section will be implemented here */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-center">Skills section coming soon</p>
                <p className="text-xs text-center text-muted-foreground mt-2">This step will allow you to add and manage your technical and soft skills</p>
              </div>
              
              {/* Placeholder for skills UI */}
              <div className="flex flex-wrap gap-2 my-4">
                <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">React.js</div>
                <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">Node.js</div>
                <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">TypeScript</div>
                <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">UI/UX Design</div>
                <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">+ Add Skill</div>
              </div>
            </div>
          </div>
        );
      
      // Other steps will be implemented as we continue development
      default:
        return (
          <div className="text-center p-8">
            <div className="text-center mb-8">
              <MuskAvatar size="lg" />
              <div className="mt-4 text-lg text-primary">
                "{step.subtitle}"
              </div>
            </div>
            <p className="text-muted-foreground">
              This step is coming soon! We're working on implementing {step.title}.
            </p>
          </div>
        );
    }
  };

  // If not open, don't render anything
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center overflow-y-auto">
      <div className="w-full max-w-4xl p-4">
        <Card className="border-2 border-primary/10 shadow-lg">
          <CardHeader className="border-b">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-2xl font-bold text-primary">
                  Your Brand Story Builder
                </CardTitle>
                <CardDescription>
                  Let's build your brand. One spark at a time.
                </CardDescription>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setLocation('/profile')}
                className="rounded-full"
              >
                <Home size={20} />
              </Button>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full mt-4">
              <div className="flex justify-between text-sm mb-1">
                <span>Progress</span>
                <span>{Math.round(progressPercent)}%</span>
              </div>
              <Progress value={progressPercent} className="h-2" />
            </div>
            
            {/* Steps Navigation */}
            <div className="flex items-center justify-between mt-4 overflow-x-auto py-2">
              <ScrollArea className="w-full whitespace-nowrap">
                <div className="flex space-x-1">
                  {STEPS.map((step, index) => (
                    <Button
                      key={step.id}
                      variant={currentStep === index ? "default" : "outline"}
                      size="sm"
                      className={`px-2 py-1 text-xs flex items-center gap-1 ${
                        currentStep === index ? "bg-primary text-white" : ""
                      }`}
                      onClick={() => jumpToStep(index)}
                    >
                      <span>{step.emoji}</span>
                      <span className="hidden sm:inline">{step.title}</span>
                      {index < currentStep && <Check size={12} className="text-green-500" />}
                    </Button>
                  ))}
                </div>
              </ScrollArea>
            </div>
            
            {/* CV Upload Option */}
            {currentStep === 0 && (
              <div className="mt-4 flex justify-center">
                <Button 
                  variant="outline"
                  className="text-xs flex items-center gap-2"
                  onClick={handleUploadCV}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <>Uploading... <span className="animate-spin">⏳</span></>
                  ) : (
                    <><Upload size={14} /> Upload CV to help fill this faster</>
                  )}
                </Button>
              </div>
            )}
          </CardHeader>
          
          <CardContent className="pt-6 pb-4">
            {renderStep()}
          </CardContent>
          
          <CardFooter className="flex justify-between border-t pt-4">
            <Button
              variant="outline"
              onClick={handlePrevStep}
              disabled={currentStep === 0}
              className="flex items-center gap-2"
            >
              <ArrowLeft size={16} /> Previous
            </Button>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  updateUser.mutate(formData);
                  onClose();
                }}
              >
                <Save size={16} className="mr-2" /> Save & Exit
              </Button>
              
              <Button
                onClick={handleNextStep}
                className="flex items-center gap-2"
              >
                {currentStep === STEPS.length - 1 ? 'Complete' : 'Next'} <ArrowRight size={16} />
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default BrandStoryBuilder;