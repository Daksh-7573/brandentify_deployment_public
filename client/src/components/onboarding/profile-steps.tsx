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
import { Slider } from "@/components/ui/slider";
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
  skills: Array<{name: string, level: string, category: string, proficiency: number}>;
  
  // Step 3: Services
  services: Array<{title: string, description: string, currency: string, rate: string, rateUnit: string}>;
  
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
  
  // State for Skills step
  const [newSkillName, setNewSkillName] = useState<string>('');
  const [newSkillLevel, setNewSkillLevel] = useState<string>('Intermediate');
  // Category field removed as it's not needed
  const [proficiencyValue, setProficiencyValue] = useState<number>(50);
  
  // State for Services step
  const [serviceFormData, setServiceFormData] = useState({
    title: '',
    description: '',
    currency: 'USD', // Default currency is USD
    rate: '',
    rateUnit: 'hr' // Default rate unit is per hour
  });
  
  // State for Projects step
  const [projectFormData, setProjectFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    projectUrl: '',
    category: 'Web Development',
    thumbnailUrl: '',
  });
  
  // State for Experiences step
  const [experienceFormData, setExperienceFormData] = useState({
    company: '',
    title: '',
    startDate: '',
    endDate: '',
    current: false,
    location: '',
    description: ''
  });
  
  // State for Education step
  const [educationFormData, setEducationFormData] = useState({
    institution: '',
    degree: '',
    field: '',
    startDate: '',
    endDate: '',
    current: false,
    description: ''
  });
  
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
  
  // Step 2: Skills
  const renderSkillsStep = () => {
    // Add new skill
    const addSkill = () => {
      if (!newSkillName) {
        toast({
          title: "Skill name required",
          description: "Please enter a skill name",
          variant: "destructive",
        });
        return;
      }
      
      const newSkill = {
        name: newSkillName,
        level: newSkillLevel,
        category: '', // Empty category since it's no longer used
        proficiency: proficiencyValue
      };
      
      setFormData(prev => ({
        ...prev,
        skills: [...(prev.skills || []), newSkill]
      }));
      
      // Reset form
      setNewSkillName('');
      setProficiencyValue(50);
    };
    
    // Remove skill
    const removeSkill = (index: number) => {
      setFormData(prev => ({
        ...prev,
        skills: (prev.skills || []).filter((_, i) => i !== index)
      }));
    };
    
    // Get color based on proficiency
    const getColor = (proficiency: number) => {
      if (proficiency < 33) return 'bg-red-500';
      if (proficiency < 66) return 'bg-yellow-500';
      return 'bg-green-500';
    };
    
    const skillsCategories = [
      { value: 'Technical', label: 'Technical' },
      { value: 'Soft', label: 'Soft Skills' },
      { value: 'Domain', label: 'Domain Knowledge' },
      { value: 'Tools', label: 'Tools & Software' },
      { value: 'Languages', label: 'Languages' },
      { value: 'Certifications', label: 'Certifications' },
    ];
    
    const skillLevels = [
      { value: 'Beginner', label: 'Beginner' },
      { value: 'Intermediate', label: 'Intermediate' },
      { value: 'Advanced', label: 'Advanced' },
      { value: 'Expert', label: 'Expert' },
    ];
    
    return (
      <div className="space-y-6">
        {/* Add new skill form */}
        <div className="p-4 border rounded-lg bg-gray-50">
          <h3 className="text-sm font-medium mb-3">Add a new skill</h3>
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="skillName">Skill Name <span className="text-red-500">*</span></Label>
              <Input
                id="skillName"
                placeholder="e.g. JavaScript, Project Management, Data Analysis"
                value={newSkillName}
                onChange={(e) => setNewSkillName(e.target.value)}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="skillLevel">Proficiency Level <span className="text-red-500">*</span></Label>
              <Select
                value={newSkillLevel}
                onValueChange={(value) => {
                  setNewSkillLevel(value);
                  // Automatically set a matching proficiency value based on level
                  if (value === 'Beginner') setProficiencyValue(25);
                  else if (value === 'Intermediate') setProficiencyValue(50);
                  else if (value === 'Advanced') setProficiencyValue(75);
                  else if (value === 'Expert') setProficiencyValue(100);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a level" />
                </SelectTrigger>
                <SelectContent>
                  {skillLevels.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <div className="flex justify-between">
                <Label htmlFor="proficiency">Proficiency Percentage <span className="text-xs text-gray-500">(two-way sync with level)</span></Label>
                <span className="text-sm text-gray-500">{proficiencyValue}%</span>
              </div>
              <div className="mb-2 flex justify-between text-xs text-gray-600">
                <span>Beginner</span>
                <span>Intermediate</span>
                <span>Advanced</span>
                <span>Expert</span>
              </div>
              <Slider
                value={[proficiencyValue]}
                onValueChange={(values) => {
                  const value = values[0];
                  setProficiencyValue(value);
                  
                  // Also update the proficiency level based on the slider value
                  let level = 'Intermediate';
                  if (value <= 25) level = 'Beginner';
                  else if (value <= 50) level = 'Intermediate';
                  else if (value <= 75) level = 'Advanced';
                  else level = 'Expert';
                  
                  setNewSkillLevel(level);
                }}
                max={100}
                step={1}
              />
            </div>
            
            <Button type="button" onClick={addSkill} className="w-full">
              Add Skill
            </Button>
          </div>
        </div>
        
        {/* Skills list */}
        {formData.skills && formData.skills.length > 0 ? (
          <div>
            <h3 className="text-sm font-medium mb-3">Your Skills</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {formData.skills.map((skill, index) => (
                <div 
                  key={index} 
                  className="border bg-white rounded-lg p-4 transition-all hover:shadow-md hover:border-primary/30"
                >
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium text-base line-clamp-2 flex-1">{skill.name}</h3>
                    <button 
                      onClick={() => removeSkill(index)} 
                      className="text-gray-400 hover:text-red-500 focus:outline-none rounded-full p-1 hover:bg-gray-100"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 6h18"></path>
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                      </svg>
                    </button>
                  </div>
                  <div className="mt-2">
                    <div className="flex flex-wrap gap-2 mb-2">
                      <span className="inline-block text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                        {skill.level || 'No level set'}
                      </span>
                      {skill.category && (
                        <span className="inline-block text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                          {skill.category}
                        </span>
                      )}
                    </div>
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-gray-500">Proficiency Percentage</span>
                        <span>{skill.proficiency || 0}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div 
                          className={`${getColor(skill.proficiency || 0)} h-1.5 rounded-full`} 
                          style={{ width: `${skill.proficiency || 0}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-10 border border-dashed rounded-lg">
            <div className="text-4xl mb-3">💪</div>
            <h3 className="font-medium text-gray-900 mb-1">No skills added yet</h3>
            <p className="text-sm text-gray-500 mb-4">Share your expertise to stand out</p>
          </div>
        )}
      </div>
    );
  };
  
  // Step 3: Services
  const renderServicesStep = () => {
    // Add new service
    const addService = () => {
      if (!serviceFormData.title) {
        toast({
          title: "Service title required",
          description: "Please enter a title for your service",
          variant: "destructive",
        });
        return;
      }
      
      setFormData(prev => {
        // Make sure prev.services is an array before spreading
        const currentServices = Array.isArray(prev.services) ? prev.services : [];
        return {
          ...prev,
          services: [...currentServices, serviceFormData]
        };
      });
      
      // Reset form
      setServiceFormData({
        title: '',
        description: '',
        currency: 'USD',
        rate: '',
        rateUnit: 'hr'
      });
    };
    
    // Remove service
    const removeService = (index: number) => {
      setFormData(prev => {
        // Make sure prev.services is an array before filtering
        const currentServices = Array.isArray(prev.services) ? prev.services : [];
        return {
          ...prev,
          services: currentServices.filter((_, i) => i !== index)
        };
      });
    };
    
    const rateUnits = [
      { value: 'hr', label: 'Per Hour' },
      { value: 'day', label: 'Per Day' },
      { value: 'week', label: 'Per Week' },
      { value: 'month', label: 'Per Month' },
      { value: 'project', label: 'Per Project' },
    ];
    
    const currencies = [
      { value: 'USD', label: 'USD ($)' },
      { value: 'EUR', label: 'EUR (€)' },
      { value: 'GBP', label: 'GBP (£)' },
      { value: 'CAD', label: 'CAD (C$)' },
      { value: 'AUD', label: 'AUD (A$)' },
      { value: 'JPY', label: 'JPY (¥)' },
      { value: 'INR', label: 'INR (₹)' },
      { value: 'BRL', label: 'BRL (R$)' },
      { value: 'CNY', label: 'CNY (¥)' },
      { value: 'RUB', label: 'RUB (₽)' },
    ];
    
    return (
      <div className="space-y-6">
        {/* Add new service form */}
        <div className="p-4 border rounded-lg bg-gray-50">
          <h3 className="text-sm font-medium mb-3">Add a service you offer</h3>
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="serviceTitle">Service Title</Label>
              <Input
                id="serviceTitle"
                placeholder="e.g. Website Development, UI/UX Design, Marketing Consultation"
                value={serviceFormData.title}
                onChange={(e) => setServiceFormData(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="serviceDescription">Description</Label>
              <Textarea
                id="serviceDescription"
                placeholder="Describe what your service includes and what clients can expect"
                value={serviceFormData.description}
                onChange={(e) => setServiceFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="serviceCurrency">Currency</Label>
              <Select
                value={serviceFormData.currency}
                onValueChange={(value) => setServiceFormData(prev => ({ ...prev, currency: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((currency) => (
                    <SelectItem key={currency.value} value={currency.value}>
                      {currency.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="serviceRate">Rate</Label>
                <Input
                  id="serviceRate"
                  placeholder="e.g. 50"
                  value={serviceFormData.rate}
                  onChange={(e) => setServiceFormData(prev => ({ ...prev, rate: e.target.value }))}
                  type="text"
                  inputMode="decimal"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="serviceRateUnit">Rate Unit</Label>
                <Select
                  value={serviceFormData.rateUnit}
                  onValueChange={(value) => setServiceFormData(prev => ({ ...prev, rateUnit: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a rate unit" />
                  </SelectTrigger>
                  <SelectContent>
                    {rateUnits.map((unit) => (
                      <SelectItem key={unit.value} value={unit.value}>
                        {unit.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <Button type="button" onClick={addService} className="w-full">
              Add Service
            </Button>
          </div>
        </div>
        
        {/* Services list */}
        {formData.services && formData.services.length > 0 ? (
          <div>
            <h3 className="text-sm font-medium mb-3">Your Services</h3>
            <div className="grid gap-4">
              {formData.services.map((service, index) => (
                <div 
                  key={index} 
                  className="border bg-white rounded-lg p-4 transition-all hover:shadow-md hover:border-primary/30"
                >
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium text-base flex-1">{service.title}</h3>
                    <button 
                      onClick={() => removeService(index)} 
                      className="text-gray-400 hover:text-red-500 focus:outline-none rounded-full p-1 hover:bg-gray-100"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 6h18"></path>
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                      </svg>
                    </button>
                  </div>
                  
                  {service.description && (
                    <p className="text-sm text-gray-600 mt-1 line-clamp-3">{service.description}</p>
                  )}
                  
                  {service.rate && (
                    <div className="mt-2">
                      <span className="inline-block text-sm font-medium text-primary">
                        {getCurrencySymbol(service.currency)}{service.rate} {getRateUnitLabel(service.rateUnit)}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-10 border border-dashed rounded-lg">
            <div className="text-4xl mb-3">🛠️</div>
            <h3 className="font-medium text-gray-900 mb-1">No services added yet</h3>
            <p className="text-sm text-gray-500 mb-4">Add services you provide to potential clients</p>
          </div>
        )}
      </div>
    );
  };
  
  // Helper function to get rate unit label
  const getRateUnitLabel = (unit: string) => {
    switch (unit) {
      case 'hr': return 'per hour';
      case 'day': return 'per day';
      case 'week': return 'per week';
      case 'month': return 'per month';
      case 'project': return 'per project';
      default: return '';
    }
  };
  
  // Helper function to get currency symbol
  const getCurrencySymbol = (currency: string) => {
    switch (currency) {
      case 'USD': return '$';
      case 'EUR': return '€';
      case 'GBP': return '£';
      case 'CAD': return 'C$';
      case 'AUD': return 'A$';
      case 'JPY': return '¥';
      case 'INR': return '₹';
      case 'BRL': return 'R$';
      case 'CNY': return '¥';
      case 'RUB': return '₽';
      default: return '$'; // Default to USD symbol
    }
  };
  
  // Step 4: Projects
  const renderProjectsStep = () => {
    // Add new project
    const addProject = () => {
      if (!projectFormData.title) {
        toast({
          title: "Project title required",
          description: "Please enter a title for your project",
          variant: "destructive",
        });
        return;
      }
      
      setFormData(prev => {
        // Make sure prev.projects is an array before spreading
        const currentProjects = Array.isArray(prev.projects) ? prev.projects : [];
        return {
          ...prev,
          projects: [...currentProjects, projectFormData]
        };
      });
      
      // Reset form
      setProjectFormData({
        title: '',
        description: '',
        startDate: '',
        projectUrl: '',
        category: 'Web Development',
        thumbnailUrl: '',
      });
    };
    
    // Remove project
    const removeProject = (index: number) => {
      setFormData(prev => {
        // Make sure prev.projects is an array before filtering
        const currentProjects = Array.isArray(prev.projects) ? prev.projects : [];
        return {
          ...prev,
          projects: currentProjects.filter((_, i) => i !== index)
        };
      });
    };
    
    const projectCategories = [
      { value: 'Web Development', label: 'Web Development' },
      { value: 'Mobile App', label: 'Mobile App' },
      { value: 'UI/UX Design', label: 'UI/UX Design' },
      { value: 'Data Science', label: 'Data Science' },
      { value: 'Machine Learning', label: 'Machine Learning' },
      { value: 'IoT', label: 'IoT' },
      { value: 'Blockchain', label: 'Blockchain' },
      { value: 'Game Development', label: 'Game Development' },
      { value: 'Other', label: 'Other' },
    ];
    
    return (
      <div className="space-y-6">
        {/* Add new project form */}
        <div className="p-4 border rounded-lg bg-gray-50">
          <h3 className="text-sm font-medium mb-3">Add a new project</h3>
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="projectTitle">Project Title</Label>
              <Input
                id="projectTitle"
                placeholder="e.g. E-commerce Website, Mobile App, Data Visualization"
                value={projectFormData.title}
                onChange={(e) => setProjectFormData(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="projectDescription">Description</Label>
              <Textarea
                id="projectDescription"
                placeholder="Describe the project, its purpose, and your role"
                value={projectFormData.description}
                onChange={(e) => setProjectFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="projectCategory">Category</Label>
                <Select
                  value={projectFormData.category}
                  onValueChange={(value) => setProjectFormData(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {projectCategories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="projectStartDate">Date</Label>
                <Input
                  id="projectStartDate"
                  type="date"
                  value={projectFormData.startDate}
                  onChange={(e) => setProjectFormData(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="projectUrl">Project URL</Label>
              <Input
                id="projectUrl"
                placeholder="https://example.com"
                value={projectFormData.projectUrl}
                onChange={(e) => setProjectFormData(prev => ({ ...prev, projectUrl: e.target.value }))}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="thumbnailUrl">Thumbnail URL</Label>
              <Input
                id="thumbnailUrl"
                placeholder="https://example.com/image.jpg"
                value={projectFormData.thumbnailUrl}
                onChange={(e) => setProjectFormData(prev => ({ ...prev, thumbnailUrl: e.target.value }))}
              />
              <p className="text-xs text-gray-500">Add a URL for a project thumbnail image</p>
            </div>
            
            <Button type="button" onClick={addProject} className="w-full">
              Add Project
            </Button>
          </div>
        </div>
        
        {/* Projects list */}
        {formData.projects && formData.projects.length > 0 ? (
          <div>
            <h3 className="text-sm font-medium mb-3">Your Projects</h3>
            <div className="grid gap-4">
              {formData.projects.map((project, index) => (
                <div 
                  key={index} 
                  className="border bg-white rounded-lg p-4 transition-all hover:shadow-md hover:border-primary/30"
                >
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium text-base flex-1">{project.title}</h3>
                    <button 
                      onClick={() => removeProject(index)} 
                      className="text-gray-400 hover:text-red-500 focus:outline-none rounded-full p-1 hover:bg-gray-100"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 6h18"></path>
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                      </svg>
                    </button>
                  </div>
                  
                  {project.description && (
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{project.description}</p>
                  )}
                  
                  <div className="mt-2 flex flex-wrap gap-2">
                    {project.category && (
                      <span className="inline-block text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                        {project.category}
                      </span>
                    )}
                    {project.startDate && (
                      <span className="inline-block text-xs bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full">
                        {new Date(project.startDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  
                  {project.projectUrl && (
                    <a 
                      href={project.projectUrl}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline mt-2 inline-block"
                    >
                      View Project
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-10 border border-dashed rounded-lg">
            <div className="text-4xl mb-3">🚀</div>
            <h3 className="font-medium text-gray-900 mb-1">No projects added yet</h3>
            <p className="text-sm text-gray-500 mb-4">Showcase your best work to stand out</p>
          </div>
        )}
      </div>
    );
  };
  
  // Step 5: Experiences
  const renderExperiencesStep = () => {
    // Add new experience
    const addExperience = () => {
      if (!experienceFormData.company || !experienceFormData.title) {
        toast({
          title: "Missing information",
          description: "Please enter both company name and job title",
          variant: "destructive",
        });
        return;
      }
      
      setFormData(prev => {
        // Make sure prev.experiences is an array before spreading
        const currentExperiences = Array.isArray(prev.experiences) ? prev.experiences : [];
        return {
          ...prev,
          experiences: [...currentExperiences, experienceFormData]
        };
      });
      
      // Reset form
      setExperienceFormData({
        company: '',
        title: '',
        startDate: '',
        endDate: '',
        current: false,
        location: '',
        description: ''
      });
    };
    
    // Remove experience
    const removeExperience = (index: number) => {
      setFormData(prev => {
        // Make sure prev.experiences is an array before filtering
        const currentExperiences = Array.isArray(prev.experiences) ? prev.experiences : [];
        return {
          ...prev,
          experiences: currentExperiences.filter((_, i) => i !== index)
        };
      });
    };
    
    // Handle current job checkbox
    const handleCurrentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const checked = e.target.checked;
      setExperienceFormData(prev => ({ 
        ...prev, 
        current: checked,
        endDate: checked ? '' : prev.endDate
      }));
    };
    
    const formatDateForDisplay = (dateString: string) => {
      if (!dateString) return '';
      
      try {
        const date = new Date(dateString);
        return date.toLocaleDateString('default', { month: 'short', year: 'numeric' });
      } catch (error) {
        return dateString;
      }
    };
    
    return (
      <div className="space-y-6">
        {/* Add new experience form */}
        <div className="p-4 border rounded-lg bg-gray-50">
          <h3 className="text-sm font-medium mb-3">Add work experience</h3>
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="companyName">Company</Label>
              <Input
                id="companyName"
                placeholder="Company or Organization Name"
                value={experienceFormData.company}
                onChange={(e) => setExperienceFormData(prev => ({ ...prev, company: e.target.value }))}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="jobTitle">Job Title</Label>
              <Input
                id="jobTitle"
                placeholder="Your role or position"
                value={experienceFormData.title}
                onChange={(e) => setExperienceFormData(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="month"
                  value={experienceFormData.startDate}
                  onChange={(e) => setExperienceFormData(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>
              
              <div className="grid gap-2">
                <Label 
                  htmlFor="endDate" 
                  className={experienceFormData.current ? "text-gray-400" : ""}
                >
                  End Date
                </Label>
                <Input
                  id="endDate"
                  type="month"
                  value={experienceFormData.endDate}
                  onChange={(e) => setExperienceFormData(prev => ({ ...prev, endDate: e.target.value }))}
                  disabled={experienceFormData.current}
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="currentPosition"
                checked={experienceFormData.current}
                onChange={handleCurrentChange}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <Label 
                htmlFor="currentPosition" 
                className="text-sm font-normal"
              >
                I currently work here
              </Label>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="jobLocation">Location</Label>
              <Input
                id="jobLocation"
                placeholder="City, Country"
                value={experienceFormData.location}
                onChange={(e) => setExperienceFormData(prev => ({ ...prev, location: e.target.value }))}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="jobDescription">Description</Label>
              <Textarea
                id="jobDescription"
                placeholder="Describe your responsibilities and achievements"
                value={experienceFormData.description}
                onChange={(e) => setExperienceFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>
            
            <Button type="button" onClick={addExperience} className="w-full">
              Add Experience
            </Button>
          </div>
        </div>
        
        {/* Experiences list */}
        {formData.experiences && formData.experiences.length > 0 ? (
          <div>
            <h3 className="text-sm font-medium mb-3">Your Work Experience</h3>
            <div className="grid gap-4">
              {formData.experiences.map((exp, index) => (
                <div 
                  key={index} 
                  className="border bg-white rounded-lg p-4 transition-all hover:shadow-md hover:border-primary/30"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-base">{exp.title}</h3>
                      <p className="text-sm text-gray-600">{exp.company}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDateForDisplay(exp.startDate)} - {exp.current ? 'Present' : formatDateForDisplay(exp.endDate)}
                        {exp.location ? ` • ${exp.location}` : ''}
                      </p>
                    </div>
                    <button 
                      onClick={() => removeExperience(index)} 
                      className="text-gray-400 hover:text-red-500 focus:outline-none rounded-full p-1 hover:bg-gray-100"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 6h18"></path>
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                      </svg>
                    </button>
                  </div>
                  
                  {exp.description && (
                    <p className="text-sm text-gray-600 mt-2 line-clamp-3">{exp.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-10 border border-dashed rounded-lg">
            <div className="text-4xl mb-3">💼</div>
            <h3 className="font-medium text-gray-900 mb-1">No work experience added yet</h3>
            <p className="text-sm text-gray-500 mb-4">Share your professional journey</p>
          </div>
        )}
      </div>
    );
  };
  
  // Step 6: Educations
  const renderEducationsStep = () => {
    
    // Add new education
    const addEducation = () => {
      if (!educationFormData.institution || !educationFormData.degree) {
        toast({
          title: "Missing information",
          description: "Please enter both institution name and degree",
          variant: "destructive",
        });
        return;
      }
      
      setFormData(prev => {
        // Make sure prev.educations is an array before spreading
        const currentEducations = Array.isArray(prev.educations) ? prev.educations : [];
        return {
          ...prev,
          educations: [...currentEducations, educationFormData]
        };
      });
      
      // Reset form
      setEducationFormData({
        institution: '',
        degree: '',
        field: '',
        startDate: '',
        endDate: '',
        current: false,
        description: ''
      });
    };
    
    // Remove education
    const removeEducation = (index: number) => {
      setFormData(prev => {
        // Make sure prev.educations is an array before filtering
        const currentEducations = Array.isArray(prev.educations) ? prev.educations : [];
        return {
          ...prev,
          educations: currentEducations.filter((_, i) => i !== index)
        };
      });
    };
    
    // Handle current education checkbox
    const handleCurrentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const checked = e.target.checked;
      setEducationFormData(prev => ({ 
        ...prev, 
        current: checked,
        endDate: checked ? '' : prev.endDate
      }));
    };
    
    const formatDateForDisplay = (dateString: string) => {
      if (!dateString) return '';
      
      try {
        const date = new Date(dateString);
        return date.toLocaleDateString('default', { month: 'short', year: 'numeric' });
      } catch (error) {
        return dateString;
      }
    };
    
    // List of common degrees
    const degreeOptions = [
      { value: 'High School Diploma', label: 'High School Diploma' },
      { value: 'Associate\'s Degree', label: 'Associate\'s Degree' },
      { value: 'Bachelor\'s Degree', label: 'Bachelor\'s Degree' },
      { value: 'Master\'s Degree', label: 'Master\'s Degree' },
      { value: 'MBA', label: 'MBA' },
      { value: 'Ph.D.', label: 'Ph.D.' },
      { value: 'M.D.', label: 'M.D.' },
      { value: 'J.D.', label: 'J.D.' },
      { value: 'Certificate', label: 'Certificate' },
      { value: 'Diploma', label: 'Diploma' },
      { value: 'Other', label: 'Other' },
    ];
    
    return (
      <div className="space-y-6">
        {/* Add new education form */}
        <div className="p-4 border rounded-lg bg-gray-50">
          <h3 className="text-sm font-medium mb-3">Add education</h3>
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="institution">Institution</Label>
              <Input
                id="institution"
                placeholder="School, College or University Name"
                value={educationFormData.institution}
                onChange={(e) => setEducationFormData(prev => ({ ...prev, institution: e.target.value }))}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="degree">Degree</Label>
                <Select
                  value={educationFormData.degree}
                  onValueChange={(value) => setEducationFormData(prev => ({ ...prev, degree: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select degree type" />
                  </SelectTrigger>
                  <SelectContent>
                    {degreeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="field">Field of Study</Label>
                <Input
                  id="field"
                  placeholder="e.g. Computer Science, Business"
                  value={educationFormData.field}
                  onChange={(e) => setEducationFormData(prev => ({ ...prev, field: e.target.value }))}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="eduStartDate">Start Date</Label>
                <Input
                  id="eduStartDate"
                  type="month"
                  value={educationFormData.startDate}
                  onChange={(e) => setEducationFormData(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>
              
              <div className="grid gap-2">
                <Label 
                  htmlFor="eduEndDate" 
                  className={educationFormData.current ? "text-gray-400" : ""}
                >
                  End Date
                </Label>
                <Input
                  id="eduEndDate"
                  type="month"
                  value={educationFormData.endDate}
                  onChange={(e) => setEducationFormData(prev => ({ ...prev, endDate: e.target.value }))}
                  disabled={educationFormData.current}
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="currentEducation"
                checked={educationFormData.current}
                onChange={handleCurrentChange}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <Label 
                htmlFor="currentEducation" 
                className="text-sm font-normal"
              >
                I'm currently studying here
              </Label>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="eduDescription">Description</Label>
              <Textarea
                id="eduDescription"
                placeholder="Describe your studies, achievements, activities"
                value={educationFormData.description}
                onChange={(e) => setEducationFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>
            
            <Button type="button" onClick={addEducation} className="w-full">
              Add Education
            </Button>
          </div>
        </div>
        
        {/* Educations list */}
        {formData.educations && formData.educations.length > 0 ? (
          <div>
            <h3 className="text-sm font-medium mb-3">Your Education</h3>
            <div className="grid gap-4">
              {formData.educations.map((edu, index) => (
                <div 
                  key={index} 
                  className="border bg-white rounded-lg p-4 transition-all hover:shadow-md hover:border-primary/30"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-base">{edu.degree}{edu.field ? `, ${edu.field}` : ''}</h3>
                      <p className="text-sm text-gray-600">{edu.institution}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDateForDisplay(edu.startDate)} - {edu.current ? 'Present' : formatDateForDisplay(edu.endDate)}
                      </p>
                    </div>
                    <button 
                      onClick={() => removeEducation(index)} 
                      className="text-gray-400 hover:text-red-500 focus:outline-none rounded-full p-1 hover:bg-gray-100"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 6h18"></path>
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                      </svg>
                    </button>
                  </div>
                  
                  {edu.description && (
                    <p className="text-sm text-gray-600 mt-2 line-clamp-3">{edu.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-10 border border-dashed rounded-lg">
            <div className="text-4xl mb-3">🎓</div>
            <h3 className="font-medium text-gray-900 mb-1">No education added yet</h3>
            <p className="text-sm text-gray-500 mb-4">Share your academic background</p>
          </div>
        )}
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