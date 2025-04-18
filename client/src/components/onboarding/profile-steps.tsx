import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { JobTitleCombobox } from "@/components/ui/job-title-combobox";
import { 
  ArrowLeft, 
  ArrowRight, 
  User, 
  Briefcase, 
  Sparkles, 
  Code, 
  GraduationCap, 
  Folder, 
  Phone, 
  FileText
} from "lucide-react";
import { INDUSTRIES, INDUSTRY_DOMAINS } from "@/pages/profile";
import { calculateOverallProfileCompletion } from "@/lib/profile-utils";
import { useProfilePicture } from "@/hooks/use-profile-picture";
import { ProfilePictureDialog } from "@/components/profile/profile-picture-dialog";
import { Camera } from "lucide-react";

// Define "I am looking for" categories
const LOOKING_FOR_CATEGORIES = [
  // Career & Job Seeking category
  { value: "job_opportunities", label: "💼 Job Opportunities" },
  { value: "job_seekers", label: "💼 Job Seekers / Candidates" },
  { value: "internships", label: "💼 Internships" },
  { value: "interns", label: "💼 Interns" },
  { value: "mentors", label: "💼 Career Mentors" },
  { value: "mentees", label: "💼 Career Mentees" },
  
  // Business & Investment category  
  { value: "investors", label: "🚀 Investors" },
  { value: "startups", label: "🚀 Startups" },
  { value: "co_founders", label: "🚀 Co-Founders" },
  { value: "business_partners", label: "🚀 Business Partners" },
  { value: "advisors", label: "🚀 Legal/Financial Advisors" },
  { value: "tech_partners", label: "🚀 Technical Partners" },
  
  // Learning & Upskilling category
  { value: "skill_trainers", label: "🎓 Skill Trainers" },
  { value: "learners", label: "🎓 Students/Learners" },
  { value: "study_groups", label: "🎓 Study Groups" },
  
  // Networking & Collaborations category
  { value: "industry_experts", label: "🤝 Industry Experts" },
  { value: "share_expertise", label: "🤝 Sharing My Expertise" },
  
  // Freelance & Side Hustle category
  { value: "freelance_gigs", label: "💰 Freelance Gigs" },
  { value: "hiring_freelancers", label: "💰 Hiring Freelancers" },
];

// Define steps
const steps = [
  {
    id: 1,
    title: "All About Me",
    description: "Tell us who you are and what you do",
    icon: <User className="h-6 w-6 text-primary" />,
    mandatory: true
  },
  {
    id: 2,
    title: "What I'm Good At",
    description: "Showcase your skills to stand out",
    icon: <Sparkles className="h-6 w-6 text-primary" />,
    mandatory: true
  },
  {
    id: 3,
    title: "What I Offer",
    description: "Services you provide professionally",
    icon: <Briefcase className="h-6 w-6 text-primary" />,
    mandatory: false
  },
  {
    id: 4,
    title: "Showcase",
    description: "Highlight your best projects",
    icon: <Folder className="h-6 w-6 text-primary" />,
    mandatory: false
  },
  {
    id: 5,
    title: "Career Path",
    description: "Your professional journey",
    icon: <FileText className="h-6 w-6 text-primary" />,
    mandatory: false
  },
  {
    id: 6,
    title: "Academic Background",
    description: "Your education and training",
    icon: <GraduationCap className="h-6 w-6 text-primary" />,
    mandatory: false
  },
  {
    id: 7,
    title: "Personal Information",
    description: "Contact details for connections",
    icon: <Phone className="h-6 w-6 text-primary" />,
    mandatory: true
  }
];

// Create fun, motivational step messages
const stepMessages = [
  "Let's make your profile shine! ✨ Tell us about yourself.",
  "Your skills are your superpowers! 💪 What are you great at?",
  "Share what services you offer - be the solution others are looking for! 🛠️",
  "Show off your amazing work! 🚀 Your projects speak volumes about your talents.",
  "Your career journey tells a story. 📈 Share your professional experience!",
  "Knowledge is power! 🎓 Tell us about your educational background.",
  "Almost there! 🏁 Just a few more details to complete your profile."
];

type FormData = {
  // Step 1: All About Me
  name: string;
  photoURL: string | null;
  title: string;
  location: string;
  industry: string;
  domain: string;
  lookingFor: string;
  aboutMe: string;
  
  // Step 2: Skills
  skills: Array<{name: string, level: string, category: string}>;
  
  // Step 3: Services
  services: Array<{title: string, description: string, rate: string, rateUnit: string}>;
  
  // Step 4: Projects
  projects: Array<{
    title: string, 
    description: string, 
    startDate: string, 
    projectUrl: string, 
    category: string,
    thumbnailUrl: string
  }>;
  
  // Step 5: Work Experience
  experiences: Array<{
    company: string,
    title: string,
    startDate: string,
    endDate: string,
    current: boolean,
    location: string,
    description: string
  }>;
  
  // Step 6: Education
  educations: Array<{
    institution: string,
    degree: string,
    field: string,
    startDate: string,
    endDate: string,
    current: boolean,
    description: string
  }>;
  
  // Step 7: Personal Information
  email: string;
  phoneNumber: string;
};

export interface ProfileStepsProps {
  isEditing?: boolean;
  onComplete?: () => void;
}

export default function ProfileSteps({ isEditing = false, onComplete }: ProfileStepsProps) {
  const { user, isAuthenticated, isDemoMode } = useAuth();
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Get user ID
  const userId = user?.uid || (isDemoMode ? 1 : null);
  
  // State for current step
  const [currentStep, setCurrentStep] = useState(1);
  const [showProfilePictureDialog, setShowProfilePictureDialog] = useState(false);
  const [selectedIndustry, setSelectedIndustry] = useState<string>('');
  const [selectedDomain, setSelectedDomain] = useState<string>('');
  
  // Form data state
  const [formData, setFormData] = useState<FormData>({
    name: '',
    photoURL: null,
    title: '',
    location: '',
    industry: '',
    domain: '',
    lookingFor: '',
    aboutMe: '',
    skills: [],
    services: [],
    projects: [],
    experiences: [],
    educations: [],
    email: '',
    phoneNumber: '',
  });
  
  // Profile picture update mutation
  const profilePictureMutation = useProfilePicture(userId);
  
  // Fetch user data
  const { data: userData, isLoading: isLoadingUser } = useQuery<any>({
    queryKey: [`/api/users/${userId}`],
    enabled: !!userId && isAuthenticated,
    staleTime: 1000,
    refetchOnMount: true
  });
  
  // Fetch user skills
  const { data: skills = [], isLoading: isLoadingSkills } = useQuery<any[]>({
    queryKey: [`/api/users/${userData?.id}/skills`],
    enabled: !!userData?.id && isAuthenticated
  });
  
  // Fetch user services
  const { data: services = [], isLoading: isLoadingServices } = useQuery<any[]>({
    queryKey: ['/api/users', userData?.id, 'services'],
    enabled: !!userData?.id && isAuthenticated
  });
  
  // Fetch user projects
  const { data: projects = [], isLoading: isLoadingProjects } = useQuery<any[]>({
    queryKey: [`/api/users/${userData?.id}/projects`],
    enabled: !!userData?.id && isAuthenticated
  });
  
  // Fetch user experiences
  const { data: experiences = [], isLoading: isLoadingExperiences } = useQuery<any[]>({
    queryKey: [`/api/users/${userData?.id}/experiences`],
    enabled: !!userData?.id && isAuthenticated
  });
  
  // Fetch user educations
  const { data: educations = [], isLoading: isLoadingEducations } = useQuery<any[]>({
    queryKey: [`/api/users/${userData?.id}/educations`],
    enabled: !!userData?.id && isAuthenticated
  });
  
  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest('PUT', `/api/users/${userId}`, data);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}`] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error updating profile",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Use effect to populate form with existing data when editing
  useEffect(() => {
    if (userData && isEditing) {
      setFormData(prevData => ({
        ...prevData,
        name: userData.name || '',
        photoURL: userData.photoURL || null,
        title: userData.title || '',
        location: userData.location || '',
        industry: userData.industry?.split(': ')[0] || '',
        domain: userData.industry?.includes(': ') ? userData.industry.split(': ')[1] : '',
        lookingFor: userData.lookingFor || '',
        aboutMe: userData.aboutMe || '',
        email: userData.email || '',
        phoneNumber: userData.phoneNumber || '',
        skills: skills || [],
        services: services || [],
        projects: projects || [],
        experiences: experiences || [],
        educations: educations || [],
      }));
      
      // Set industry and domain for select components
      if (userData.industry) {
        if (userData.industry.includes(': ')) {
          setSelectedIndustry(userData.industry.split(': ')[0]);
          setSelectedDomain(userData.industry.split(': ')[1]);
        } else {
          setSelectedIndustry(userData.industry);
        }
      }
    }
  }, [userData, skills, services, projects, experiences, educations, isEditing]);
  
  // Handle form input changes for basic fields
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle industry change
  const handleIndustryChange = (value: string) => {
    setSelectedIndustry(value);
    setSelectedDomain('');
    setFormData(prev => ({ 
      ...prev, 
      industry: value,
      domain: '' 
    }));
  };
  
  // Handle domain change
  const handleDomainChange = (value: string) => {
    setSelectedDomain(value);
    setFormData(prev => ({ 
      ...prev, 
      domain: value,
      industry: selectedIndustry ? 
        (value ? `${selectedIndustry}: ${value}` : selectedIndustry) : 
        prev.industry 
    }));
  };
  
  // Handle looking for change
  const handleLookingForChange = (value: string) => {
    setFormData(prev => ({ ...prev, lookingFor: value }));
  };
  
  // Handle next step
  const handleNextStep = async () => {
    // Validate current step
    if (!validateCurrentStep()) {
      return;
    }
    
    // Save data if on a mandatory step
    if (steps[currentStep - 1].mandatory) {
      await saveCurrentStepData();
    }
    
    // Move to next step
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    } else {
      // Complete onboarding
      if (onComplete) {
        onComplete();
      } else {
        setLocation('/profile');
      }
    }
  };
  
  // Handle previous step
  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };
  
  // Handle direct jump to step
  const jumpToStep = (stepNumber: number) => {
    if (stepNumber >= 1 && stepNumber <= steps.length) {
      setCurrentStep(stepNumber);
      window.scrollTo(0, 0);
    }
  };
  
  // Validate current step
  const validateCurrentStep = (): boolean => {
    const currentStepInfo = steps[currentStep - 1];
    
    // If step is not mandatory, no validation needed
    if (!currentStepInfo.mandatory) {
      return true;
    }
    
    switch (currentStep) {
      case 1: // All About Me
        if (!formData.name) {
          toast({
            title: "Name is required",
            description: "Please enter your name to continue",
            variant: "destructive",
          });
          return false;
        }
        if (!formData.title) {
          toast({
            title: "Job title is required",
            description: "Please enter your job title or role to continue",
            variant: "destructive",
          });
          return false;
        }
        if (!formData.location) {
          toast({
            title: "Location is required",
            description: "Please enter your location to continue",
            variant: "destructive",
          });
          return false;
        }
        if (!formData.industry) {
          toast({
            title: "Industry is required",
            description: "Please select your industry to continue",
            variant: "destructive",
          });
          return false;
        }
        if (!formData.lookingFor) {
          toast({
            title: "Looking for is required",
            description: "Please select what you're looking for to continue",
            variant: "destructive",
          });
          return false;
        }
        return true;
        
      case 2: // What I'm Good At
        if (formData.skills.length === 0) {
          toast({
            title: "Skills are required",
            description: "Please add at least one skill to continue",
            variant: "destructive",
          });
          return false;
        }
        return true;
        
      case 7: // Personal Information
        if (!formData.email) {
          toast({
            title: "Email is required",
            description: "Please enter your email to continue",
            variant: "destructive",
          });
          return false;
        }
        if (!formData.phoneNumber) {
          toast({
            title: "Phone number is required",
            description: "Please enter your phone number to continue",
            variant: "destructive",
          });
          return false;
        }
        return true;
        
      default:
        return true;
    }
  };
  
  // Save current step data
  const saveCurrentStepData = async () => {
    try {
      switch (currentStep) {
        case 1: // All About Me
          await updateUserMutation.mutateAsync({
            name: formData.name,
            title: formData.title,
            location: formData.location,
            industry: formData.industry && formData.domain ? 
              `${formData.industry}: ${formData.domain}` : formData.industry,
            lookingFor: formData.lookingFor,
            aboutMe: formData.aboutMe
          });
          break;
          
        case 2: // What I'm Good At
          // Skills saving logic will be implemented
          break;
          
        case 7: // Personal Information
          await updateUserMutation.mutateAsync({
            email: formData.email,
            phoneNumber: formData.phoneNumber
          });
          break;
          
        default:
          break;
      }
    } catch (error) {
      console.error("Error saving data:", error);
      toast({
        title: "Error saving data",
        description: "There was an error saving your data. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Calculate total completion percentage
  const calculateCompletionPercentage = (): number => {
    // Count mandatory steps as 60% of total, optional as 40%
    const mandatorySteps = steps.filter(step => step.mandatory).length;
    const optionalSteps = steps.length - mandatorySteps;
    
    // Calculate completed mandatory steps
    let completedMandatory = 0;
    
    // Step 1: All About Me
    if (formData.name && formData.title && formData.location && formData.industry && formData.lookingFor) {
      completedMandatory++;
    }
    
    // Step 2: What I'm Good At
    if (formData.skills.length > 0) {
      completedMandatory++;
    }
    
    // Step 7: Personal Information
    if (formData.email && formData.phoneNumber) {
      completedMandatory++;
    }
    
    // Calculate completed optional steps
    let completedOptional = 0;
    
    // Step 3: What I Offer
    if (formData.services.length > 0) {
      completedOptional++;
    }
    
    // Step 4: Showcase
    if (formData.projects.length > 0) {
      completedOptional++;
    }
    
    // Step 5: Career Path
    if (formData.experiences.length > 0) {
      completedOptional++;
    }
    
    // Step 6: Academic Background
    if (formData.educations.length > 0) {
      completedOptional++;
    }
    
    // Calculate percentages
    const mandatoryPercentage = (completedMandatory / mandatorySteps) * 60;
    const optionalPercentage = (completedOptional / optionalSteps) * 40;
    
    return Math.round(mandatoryPercentage + optionalPercentage);
  };
  
  // Render step content based on current step
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return renderAllAboutMeStep();
      case 2:
        return renderSkillsStep();
      case 3:
        return renderServicesStep();
      case 4:
        return renderProjectsStep();
      case 5:
        return renderExperiencesStep();
      case 6:
        return renderEducationsStep();
      case 7:
        return renderPersonalInfoStep();
      default:
        return null;
    }
  };
  
  // Step 1: All About Me
  const renderAllAboutMeStep = () => {
    return (
      <div className="space-y-6">
        {/* Profile Picture */}
        <div className="flex flex-col items-center space-y-4 mb-6">
          <div className="relative group">
            <div className="h-24 w-24 overflow-hidden rounded-full bg-white ring-4 ring-white flex items-center justify-center">
              <img 
                className="h-full w-full object-cover" 
                src={formData.photoURL || user?.photoURL || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"} 
                alt="User profile"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80";
                }}
              />
            </div>
            {/* Camera button for profile picture update */}
            <button 
              onClick={() => setShowProfilePictureDialog(true)}
              className="absolute bottom-0 right-0 bg-primary hover:bg-primary/90 text-white p-1.5 rounded-full opacity-100 transition-opacity"
              aria-label="Change profile picture"
            >
              <Camera size={16} />
            </button>
          </div>
          <p className="text-sm text-gray-500">
            Professional photo (recommended: 400x400px)
          </p>
        </div>
        
        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="name">Name <span className="text-red-500">*</span></Label>
          <Input
            id="name"
            name="name"
            placeholder="Your full name"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
        </div>
        
        {/* Job Title */}
        <div className="space-y-2">
          <Label htmlFor="title">Job Title/Role <span className="text-red-500">*</span></Label>
          <JobTitleCombobox 
            value={formData.title}
            onChange={(value) => setFormData(prev => ({ ...prev, title: value }))}
          />
        </div>
        
        {/* Location */}
        <div className="space-y-2">
          <Label htmlFor="location">Location <span className="text-red-500">*</span></Label>
          <Input
            id="location"
            name="location"
            placeholder="City, State, Country"
            value={formData.location}
            onChange={handleInputChange}
            required
          />
        </div>
        
        {/* Industry */}
        <div className="space-y-2">
          <Label htmlFor="industry">Industry <span className="text-red-500">*</span></Label>
          <Select 
            value={selectedIndustry} 
            onValueChange={handleIndustryChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select an industry" />
            </SelectTrigger>
            <SelectContent>
              {INDUSTRIES.map((industry) => (
                <SelectItem key={industry} value={industry}>
                  {industry}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Domain (only shown if industry is selected) */}
        {selectedIndustry && INDUSTRY_DOMAINS[selectedIndustry] && (
          <div className="space-y-2">
            <Label htmlFor="domain">Domain (Specialized Area)</Label>
            <Select 
              value={selectedDomain} 
              onValueChange={handleDomainChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a domain" />
              </SelectTrigger>
              <SelectContent>
                {INDUSTRY_DOMAINS[selectedIndustry].map((domain) => (
                  <SelectItem key={domain} value={domain}>
                    {domain}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        
        {/* Looking For */}
        <div className="space-y-2">
          <Label htmlFor="lookingFor">Looking For <span className="text-red-500">*</span></Label>
          <Select 
            value={formData.lookingFor} 
            onValueChange={handleLookingForChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="What are you looking for?" />
            </SelectTrigger>
            <SelectContent>
              {LOOKING_FOR_CATEGORIES.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* About Me */}
        <div className="space-y-2">
          <Label htmlFor="aboutMe">About Me</Label>
          <Textarea
            id="aboutMe"
            name="aboutMe"
            placeholder="Tell us about yourself, your expertise, and what you're passionate about"
            value={formData.aboutMe}
            onChange={handleInputChange}
            rows={5}
          />
        </div>
        
        {/* Profile Picture Dialog */}
        <ProfilePictureDialog
          open={showProfilePictureDialog}
          onOpenChange={setShowProfilePictureDialog}
          onUpload={async (file) => {
            if (file && userId) {
              try {
                const uploadResult = await profilePictureMutation.mutateAsync({ file });
                setFormData(prev => ({ ...prev, photoURL: uploadResult.photoURL }));
                toast({
                  title: "Profile picture updated",
                  description: "Your profile picture has been updated successfully",
                });
              } catch (error) {
                toast({
                  title: "Error updating profile picture",
                  description: "There was an error uploading your profile picture. Please try again.",
                  variant: "destructive",
                });
              }
            }
          }}
        />
      </div>
    );
  };
  
  // Step 2: Skills (placeholder)
  const renderSkillsStep = () => {
    return (
      <div className="space-y-6">
        <p className="text-gray-500">Skills section will be implemented</p>
        <p>We'll use the existing skills component but integrate it into this flow</p>
      </div>
    );
  };
  
  // Step 3: Services (placeholder)
  const renderServicesStep = () => {
    return (
      <div className="space-y-6">
        <p className="text-gray-500">Services section will be implemented</p>
        <p>We'll use the existing services component but integrate it into this flow</p>
      </div>
    );
  };
  
  // Step 4: Projects (placeholder)
  const renderProjectsStep = () => {
    return (
      <div className="space-y-6">
        <p className="text-gray-500">Projects section will be implemented</p>
        <p>We'll use the existing projects component but integrate it into this flow</p>
      </div>
    );
  };
  
  // Step 5: Experiences (placeholder)
  const renderExperiencesStep = () => {
    return (
      <div className="space-y-6">
        <p className="text-gray-500">Experiences section will be implemented</p>
        <p>We'll use the existing work experience component but integrate it into this flow</p>
      </div>
    );
  };
  
  // Step 6: Educations (placeholder)
  const renderEducationsStep = () => {
    return (
      <div className="space-y-6">
        <p className="text-gray-500">Educations section will be implemented</p>
        <p>We'll use the existing education component but integrate it into this flow</p>
      </div>
    );
  };
  
  // Step 7: Personal Information
  const renderPersonalInfoStep = () => {
    return (
      <div className="space-y-6">
        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="your.email@example.com"
            value={formData.email}
            onChange={handleInputChange}
            required
          />
        </div>
        
        {/* Phone Number */}
        <div className="space-y-2">
          <Label htmlFor="phoneNumber">Phone Number <span className="text-red-500">*</span></Label>
          <Input
            id="phoneNumber"
            name="phoneNumber"
            type="tel"
            placeholder="+1 (123) 456-7890"
            value={formData.phoneNumber}
            onChange={handleInputChange}
            required
          />
        </div>
      </div>
    );
  };
  
  // Render the progress indicator
  const renderProgressIndicator = () => {
    const completionPercentage = calculateCompletionPercentage();
    
    return (
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <p className="text-sm font-medium">Profile Completion</p>
          <p className="text-sm font-medium">{completionPercentage}%</p>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-primary h-2.5 rounded-full" 
            style={{ width: `${completionPercentage}%` }}
          ></div>
        </div>
      </div>
    );
  };
  
  // Render the steps tabs
  const renderStepsTabs = () => {
    return (
      <div className="flex overflow-x-auto space-x-2 mb-6 pb-2">
        {steps.map((step) => (
          <Button
            key={step.id}
            variant={currentStep === step.id ? "default" : "outline"}
            size="sm"
            className={`flex items-center gap-2 whitespace-nowrap ${step.mandatory ? 'border-primary/30' : ''}`}
            onClick={() => jumpToStep(step.id)}
          >
            {step.icon}
            <span>{step.title}</span>
            {step.mandatory && <span className="text-xs text-red-500">*</span>}
          </Button>
        ))}
      </div>
    );
  };
  
  return (
    <div className="container max-w-3xl py-8">
      {/* Progress and steps */}
      {renderProgressIndicator()}
      {renderStepsTabs()}
      
      {/* Current step */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {steps[currentStep - 1].icon}
            <span>Step {currentStep}: {steps[currentStep - 1].title}</span>
            {steps[currentStep - 1].mandatory && 
              <span className="text-sm text-red-500 font-normal">(Required)</span>
            }
          </CardTitle>
          <CardDescription>
            {stepMessages[currentStep - 1]}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {renderStepContent()}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePreviousStep}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button onClick={handleNextStep}>
            {currentStep === steps.length ? 'Complete' : 'Next'}
            {currentStep !== steps.length && <ArrowRight className="ml-2 h-4 w-4" />}
          </Button>
        </CardFooter>
      </Card>
      
      {/* Skip this step button for non-mandatory steps */}
      {!steps[currentStep - 1].mandatory && currentStep !== steps.length && (
        <div className="text-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentStep(currentStep + 1)}
          >
            Skip this step (you can come back later)
          </Button>
        </div>
      )}
    </div>
  );
}