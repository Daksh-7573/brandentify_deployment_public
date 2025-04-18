import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { User } from "@shared/schema";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue,
  SelectGroup
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import MuskAvatar from "@/components/musk/musk-avatar";
import confetti from "canvas-confetti";

// Add a type declaration for canvas-confetti
declare module 'canvas-confetti';

// Common constants for industry, domains and lookingFor options
const INDUSTRIES = [
  "Technology",
  "Healthcare",
  "Finance",
  "Education",
  "Manufacturing",
  "Retail",
  "Media & Entertainment",
  "Construction",
  "Transportation",
  "Energy",
  "Hospitality",
  "Agriculture",
  "Telecommunications",
  "Real Estate",
  "Consulting",
  "Pharmaceuticals",
  "Legal Services",
  "Marketing & Advertising",
  "Aerospace",
  "Automotive",
  "Biotechnology",
  "Nonprofit",
  "Government",
  "Food & Beverage",
  "Fashion",
  "Arts & Design",
];

// Domains based on industry selection
const INDUSTRY_DOMAINS: {[key: string]: string[]} = {
  "Technology": [
    "Artificial Intelligence & Machine Learning",
    "Blockchain & Cryptocurrency",
    "Cloud Computing & SaaS",
    "Cybersecurity",
    "Data Science & Analytics",
    "DevOps & Infrastructure",
    "E-commerce Technology",
    "Enterprise Software",
    "Gaming & Entertainment",
    "Hardware & IoT",
    "Mobile Development",
    "Quantum Computing",
    "Robotics & Automation",
    "Software Development",
    "Web3 & Decentralized Tech",
  ],
  "Healthcare": [
    "Biotechnology",
    "Digital Health",
    "Healthcare IT",
    "Medical Devices",
    "Pharmaceuticals",
    "Research & Development",
    "Telemedicine",
    "Healthcare Services",
    "Mental Health",
    "Public Health",
  ],
  "Finance": [
    "Banking",
    "Financial Services",
    "FinTech",
    "Investment Management",
    "Insurance",
    "Wealth Management",
    "Payments & Transactions",
    "Cryptocurrency & DeFi",
    "Lending & Credit",
    "Regulatory Compliance",
  ],
  "Education": [
    "EdTech",
    "Higher Education",
    "K-12 Education",
    "Professional Development",
    "Online Learning",
    "Educational Content",
    "Tutoring & Coaching",
    "Educational Administration",
    "Research & Development",
  ],
  // We can add more domains as needed
};

// Looking for categories
const LOOKING_FOR = [
  // Career & Job Seeking category
  { value: "job_opportunities", label: "💼 Job Opportunities" },
  { value: "job_seekers", label: "💼 Job Seekers / Candidates" },
  { value: "internships", label: "💼 Internships" },
  { value: "interns", label: "💼 Interns" },
  { value: "mentors", label: "💼 Career Mentors" },
  { value: "mentees", label: "💼 Career Mentees" },
  
  // Business & Investment category
  { value: "business_partners", label: "🤝 Business Partners" },
  { value: "investors", label: "💰 Investors" },
  { value: "startup_funding", label: "🚀 Startup Funding" },
  { value: "accelerators", label: "🚀 Accelerators/Incubators" },
  
  // Service-based category
  { value: "clients", label: "🎯 Clients for My Services" },
  { value: "service_providers", label: "🛠️ Service Providers" },
  { value: "vendors", label: "📦 Vendors/Suppliers" },
  
  // Knowledge & Growth category
  { value: "networking", label: "🌐 Professional Networking" },
  { value: "communities", label: "👥 Communities" },
  { value: "industry_insights", label: "📊 Industry Insights" },
  { value: "learning_opportunities", label: "📚 Learning Opportunities" },
  
  // Collaboration category
  { value: "freelancers", label: "🔄 Freelancers" },
  { value: "co_founders", label: "👯 Co-Founders" },
  { value: "project_collaborators", label: "🤲 Project Collaborators" },
  { value: "remote_workers", label: "🏠 Remote Workers" },
];

interface BrandStoryBuilderProps {
  user: User | null;
  userData: any;
  onClose: () => void;
  isOpen: boolean;
}

interface StepProps {
  currentStep: number;
  setCurrentStep: (step: number) => void;
  user: User | null;
  userData: any;
  updateFormData: (data: any) => void;
  formData: any;
  nextStep: () => void;
  prevStep: () => void;
  complete: () => void;
}

const BrandStoryBuilder = ({ user, userData, onClose, isOpen }: BrandStoryBuilderProps) => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);
  const confettiRef = useRef<HTMLDivElement>(null);

  // Steps in the brand story building process
  const steps = [
    "All About Me",
    "Skills",
    "Services",
    "Work Experience",
    "Education",
    "Projects",
    "Review",
  ];

  useEffect(() => {
    // Initialize form data with user data when it loads
    if (user) {
      setFormData({
        name: user.name || "",
        title: user.title || "",
        location: user.location || "",
        industry: user.industry || "",
        domain: user.domain || "",
        lookingFor: user.lookingFor || "",
        aboutMe: user.aboutMe || "",
        skills: userData?.skills || [],
        services: userData?.services || [],
        experiences: userData?.experiences || [],
        educations: userData?.educations || [],
        projects: userData?.projects || [],
      });
    }
  }, [user, userData]);

  // Calculate progress
  useEffect(() => {
    if (isOpen) {
      setProgress(Math.round((currentStep / (steps.length - 1)) * 100));
    }
  }, [currentStep, steps.length, isOpen]);

  // Handle form data updates
  const updateFormData = (data: any) => {
    setFormData((prev: any) => ({
      ...prev,
      ...data,
    }));
  };

  // Update user profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('PUT', `/api/users/${user?.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${user?.id}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/users/${user?.id}/skills`] });
      queryClient.invalidateQueries({ queryKey: [`/api/users/${user?.id}/experiences`] });
      queryClient.invalidateQueries({ queryKey: [`/api/users/${user?.id}/educations`] });
      queryClient.invalidateQueries({ queryKey: [`/api/users/${user?.id}/projects`] });
      queryClient.invalidateQueries({ queryKey: [`/api/users/${user?.id}/services`] });
      
      // Show confetti animation
      if (confettiRef.current) {
        const rect = confettiRef.current.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;
        
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { x: x / window.innerWidth, y: y / window.innerHeight }
        });
      }
      
      toast({
        title: "Success!",
        description: "Your brand story has been updated successfully.",
      });
      
      setTimeout(() => {
        onClose();
      }, 1500);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "There was an error updating your profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Navigation functions
  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const completeStoryBuilder = () => {
    setIsSubmitting(true);
    
    // Extract basic profile fields
    const profileData = {
      name: formData.name,
      title: formData.title,
      location: formData.location,
      industry: formData.industry,
      domain: formData.domain,
      lookingFor: formData.lookingFor,
      aboutMe: formData.aboutMe,
    };
    
    // Update the profile
    updateProfileMutation.mutate(profileData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <div ref={confettiRef} className="absolute top-0 left-0 w-full h-full pointer-events-none" />
        
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <MuskAvatar size="md" withSparks={true} />
            <div>
              <DialogTitle className="text-xl font-bold">
                Build Your Brand Story with Musk
              </DialogTitle>
              <DialogDescription>
                Let's craft a compelling narrative of your professional journey together.
              </DialogDescription>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2.5 mt-4">
            <div 
              className="bg-primary h-2.5 rounded-full transition-all duration-300 ease-in-out" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          
          {/* Step Indicators */}
          <div className="flex justify-between mt-2 px-1 overflow-x-auto pb-2">
            {steps.map((step, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`flex flex-col items-center min-w-[80px] transition-colors ${
                  index === currentStep
                    ? "text-primary"
                    : index < currentStep
                    ? "text-gray-500"
                    : "text-gray-400"
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs mb-1 ${
                    index === currentStep
                      ? "bg-primary text-white"
                      : index < currentStep
                      ? "bg-gray-200 text-gray-700"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {index + 1}
                </div>
                <span className="text-xs whitespace-nowrap">{step}</span>
              </button>
            ))}
          </div>
        </DialogHeader>

        {/* Step Content */}
        <div className="py-4">
          {currentStep === 0 && (
            <AllAboutMeStep
              currentStep={currentStep}
              setCurrentStep={setCurrentStep}
              user={user}
              userData={userData}
              updateFormData={updateFormData}
              formData={formData}
              nextStep={nextStep}
              prevStep={prevStep}
              complete={completeStoryBuilder}
            />
          )}
          
          {currentStep === 1 && (
            <SkillsStep
              currentStep={currentStep}
              setCurrentStep={setCurrentStep}
              user={user}
              userData={userData}
              updateFormData={updateFormData}
              formData={formData}
              nextStep={nextStep}
              prevStep={prevStep}
              complete={completeStoryBuilder}
            />
          )}
          
          {currentStep === 2 && (
            <ServicesStep
              currentStep={currentStep}
              setCurrentStep={setCurrentStep}
              user={user}
              userData={userData}
              updateFormData={updateFormData}
              formData={formData}
              nextStep={nextStep}
              prevStep={prevStep}
              complete={completeStoryBuilder}
            />
          )}
          
          {currentStep === 3 && (
            <WorkExperienceStep
              currentStep={currentStep}
              setCurrentStep={setCurrentStep}
              user={user}
              userData={userData}
              updateFormData={updateFormData}
              formData={formData}
              nextStep={nextStep}
              prevStep={prevStep}
              complete={completeStoryBuilder}
            />
          )}
          
          {currentStep === 4 && (
            <EducationStep
              currentStep={currentStep}
              setCurrentStep={setCurrentStep}
              user={user}
              userData={userData}
              updateFormData={updateFormData}
              formData={formData}
              nextStep={nextStep}
              prevStep={prevStep}
              complete={completeStoryBuilder}
            />
          )}
          
          {currentStep === 5 && (
            <ProjectsStep
              currentStep={currentStep}
              setCurrentStep={setCurrentStep}
              user={user}
              userData={userData}
              updateFormData={updateFormData}
              formData={formData}
              nextStep={nextStep}
              prevStep={prevStep}
              complete={completeStoryBuilder}
            />
          )}
          
          {currentStep === 6 && (
            <ReviewStep
              currentStep={currentStep}
              setCurrentStep={setCurrentStep}
              user={user}
              userData={userData}
              updateFormData={updateFormData}
              formData={formData}
              nextStep={nextStep}
              prevStep={prevStep}
              complete={completeStoryBuilder}
            />
          )}
        </div>

        <DialogFooter className="flex justify-between mt-6 gap-2">
          {currentStep > 0 && (
            <Button 
              variant="outline" 
              onClick={prevStep}
              disabled={isSubmitting}
            >
              Back
            </Button>
          )}
          
          {currentStep === 0 && (
            <Button 
              variant="outline" 
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          )}
          
          <div className="flex-1"></div>
          
          {currentStep < steps.length - 1 ? (
            <Button onClick={nextStep} disabled={isSubmitting}>
              Continue
            </Button>
          ) : (
            <Button 
              onClick={completeStoryBuilder} 
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? "Saving..." : "Complete Your Story"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// All About Me Step (combines Personal and Professional Identity)
const AllAboutMeStep = ({ nextStep, prevStep, user, updateFormData, formData }: StepProps) => {
  const [name, setName] = useState(formData.name || "");
  const [title, setTitle] = useState(formData.title || "");
  const [location, setLocation] = useState(formData.location || "");
  const [industry, setIndustry] = useState(formData.industry || "");
  const [domain, setDomain] = useState(formData.domain || "");
  const [lookingFor, setLookingFor] = useState(formData.lookingFor || "");
  const [aboutMe, setAboutMe] = useState(formData.aboutMe || "");
  
  const handleNext = () => {
    updateFormData({ 
      name, 
      title, 
      location,
      industry,
      domain,
      lookingFor,
      aboutMe
    });
    nextStep();
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <div className="mt-1">
          <MuskAvatar size="sm" withSparks={true} />
        </div>
        <div className="bg-gray-50 rounded-lg p-4 rounded-tl-none">
          <h3 className="font-medium text-lg text-gray-900">Tell me all about you</h3>
          <p className="text-gray-600 mt-2">
            Let's build your complete professional profile. These details help people understand who you are and what you're looking for.
          </p>
        </div>
      </div>
      
      {/* Personal Information Section */}
      <div>
        <h3 className="font-medium text-gray-900 mb-4">Personal Information</h3>
        <div className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Full Name</Label>
            <Input 
              id="name" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="John Doe"
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="title">Professional Title</Label>
            <Input 
              id="title" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="Senior Software Engineer"
            />
            <p className="text-xs text-gray-500">Your current job title or professional role</p>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="location">Location</Label>
            <Input 
              id="location" 
              value={location} 
              onChange={(e) => setLocation(e.target.value)} 
              placeholder="San Francisco, CA, USA"
            />
            <p className="text-xs text-gray-500">City, State/Province, Country</p>
          </div>
        </div>
      </div>
      
      {/* Professional Identity Section */}
      <div>
        <h3 className="font-medium text-gray-900 mb-4">Professional Identity</h3>
        <div className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="industry">Industry</Label>
            <Select 
              value={industry} 
              onValueChange={(value) => {
                setIndustry(value);
                // Reset domain when industry changes
                setDomain("");
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your industry" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {INDUSTRIES.map((ind) => (
                    <SelectItem key={ind} value={ind}>{ind}</SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">The general sector you work in</p>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="domain">Domain Specialty</Label>
            <Select 
              value={domain} 
              onValueChange={setDomain}
              disabled={!industry || !INDUSTRY_DOMAINS[industry]}
            >
              <SelectTrigger>
                <SelectValue placeholder={industry ? "Select your domain specialty" : "Select an industry first"} />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {industry && INDUSTRY_DOMAINS[industry]?.map((dom) => (
                    <SelectItem key={dom} value={dom}>{dom}</SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">Your specific area of expertise within your industry</p>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="lookingFor">Looking For</Label>
            <Select value={lookingFor} onValueChange={setLookingFor}>
              <SelectTrigger>
                <SelectValue placeholder="What are you looking for?" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {LOOKING_FOR.map((option) => (
                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">What you're primarily seeking on the platform</p>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="aboutMe">About Me</Label>
            <Textarea 
              id="aboutMe" 
              value={aboutMe} 
              onChange={(e) => setAboutMe(e.target.value)} 
              placeholder="Share a brief summary of your professional background, interests, and goals"
              className="min-h-[120px]"
            />
            <p className="text-xs text-gray-500">A brief overview of your professional background, expertise, and goals</p>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button onClick={handleNext} className="mt-4">Continue</Button>
      </div>
    </div>
  );
};

// Skills Step
const SkillsStep = ({ nextStep, prevStep, userData, updateFormData, formData }: StepProps) => {
  const [skills, setSkills] = useState<string[]>(formData.skills || []);
  const [newSkill, setNewSkill] = useState("");
  
  const handleAddSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      const updatedSkills = [...skills, newSkill.trim()];
      setSkills(updatedSkills);
      setNewSkill("");
    }
  };
  
  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };
  
  const handleNext = () => {
    updateFormData({ skills });
    nextStep();
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <div className="mt-1">
          <MuskAvatar size="sm" withSparks={true} />
        </div>
        <div className="bg-gray-50 rounded-lg p-4 rounded-tl-none">
          <h3 className="font-medium text-lg text-gray-900">What are your key skills?</h3>
          <p className="text-gray-600 mt-2">
            Add the skills that showcase your expertise. These will help potential connections, clients, 
            and employers understand your capabilities.
          </p>
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="flex gap-2">
          <Input 
            value={newSkill} 
            onChange={(e) => setNewSkill(e.target.value)}
            placeholder="Add a skill (e.g., JavaScript, Project Management, Content Writing)"
            onKeyDown={(e) => e.key === 'Enter' && handleAddSkill()}
          />
          <Button onClick={handleAddSkill} type="button">Add</Button>
        </div>
        
        <div className="flex flex-wrap gap-2 mt-4">
          {skills.map((skill, index) => (
            <Badge key={index} variant="secondary" className="px-3 py-1 text-sm">
              {skill}
              <button 
                onClick={() => handleRemoveSkill(skill)} 
                className="ml-2 text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </Badge>
          ))}
          {skills.length === 0 && (
            <p className="text-gray-500 text-sm">No skills added yet. Add some skills to showcase your expertise.</p>
          )}
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button onClick={handleNext} className="mt-4">Continue</Button>
      </div>
    </div>
  );
};

// Services Step
const ServicesStep = ({ nextStep, prevStep, updateFormData, formData }: StepProps) => {
  const [services, setServices] = useState<string[]>(formData.services || []);
  const [newService, setNewService] = useState("");
  
  const handleAddService = () => {
    if (newService.trim() && !services.includes(newService.trim())) {
      const updatedServices = [...services, newService.trim()];
      setServices(updatedServices);
      setNewService("");
    }
  };
  
  const handleRemoveService = (serviceToRemove: string) => {
    setServices(services.filter(service => service !== serviceToRemove));
  };
  
  const handleNext = () => {
    updateFormData({ services });
    nextStep();
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <div className="mt-1">
          <MuskAvatar size="sm" withSparks={true} />
        </div>
        <div className="bg-gray-50 rounded-lg p-4 rounded-tl-none">
          <h3 className="font-medium text-lg text-gray-900">What services do you offer?</h3>
          <p className="text-gray-600 mt-2">
            If you provide services, list them here. This helps potential clients understand what they can hire you for.
            (Skip this section if not applicable)
          </p>
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="flex gap-2">
          <Input 
            value={newService} 
            onChange={(e) => setNewService(e.target.value)}
            placeholder="Add a service (e.g., Web Development, Consulting, Copywriting)"
            onKeyDown={(e) => e.key === 'Enter' && handleAddService()}
          />
          <Button onClick={handleAddService} type="button">Add</Button>
        </div>
        
        <div className="flex flex-wrap gap-2 mt-4">
          {services.map((service, index) => (
            <Badge key={index} variant="secondary" className="px-3 py-1 text-sm">
              {service}
              <button 
                onClick={() => handleRemoveService(service)} 
                className="ml-2 text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </Badge>
          ))}
          {services.length === 0 && (
            <p className="text-gray-500 text-sm">No services added yet. Add services if you're offering any professional services.</p>
          )}
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button onClick={handleNext} className="mt-4">Continue</Button>
      </div>
    </div>
  );
};

// Work Experience Step
const WorkExperienceStep = ({ nextStep, prevStep, updateFormData, formData }: StepProps) => {
  const [experiences, setExperiences] = useState<any[]>(formData.experiences || []);
  
  // Fields for new experience
  const [company, setCompany] = useState("");
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [description, setDescription] = useState("");
  const [currentlyWorking, setCurrentlyWorking] = useState(false);
  
  const handleAddExperience = () => {
    if (company && title && startDate) {
      const newExperience = {
        company,
        title,
        startDate,
        endDate: currentlyWorking ? "Present" : endDate,
        currentlyWorking,
        description
      };
      
      setExperiences([...experiences, newExperience]);
      
      // Reset form
      setCompany("");
      setTitle("");
      setStartDate("");
      setEndDate("");
      setDescription("");
      setCurrentlyWorking(false);
    }
  };
  
  const handleRemoveExperience = (index: number) => {
    const updatedExperiences = [...experiences];
    updatedExperiences.splice(index, 1);
    setExperiences(updatedExperiences);
  };
  
  const handleNext = () => {
    updateFormData({ experiences });
    nextStep();
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <div className="mt-1">
          <MuskAvatar size="sm" withSparks={true} />
        </div>
        <div className="bg-gray-50 rounded-lg p-4 rounded-tl-none">
          <h3 className="font-medium text-lg text-gray-900">Tell us about your work experience</h3>
          <p className="text-gray-600 mt-2">
            Add your relevant work experiences. Start with your most recent position and work backwards.
          </p>
        </div>
      </div>
      
      {/* List of existing experiences */}
      {experiences.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-medium text-gray-800">Your Experiences</h4>
          {experiences.map((exp, index) => (
            <div key={index} className="border rounded-lg p-4 relative">
              <button 
                onClick={() => handleRemoveExperience(index)}
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
              <div className="space-y-1">
                <h5 className="font-medium">{exp.title}</h5>
                <p className="text-gray-600">{exp.company}</p>
                <p className="text-sm text-gray-500">
                  {exp.startDate} - {exp.currentlyWorking ? "Present" : exp.endDate}
                </p>
                <p className="text-sm mt-2">{exp.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Form to add new experience */}
      <div className="border rounded-lg p-4">
        <h4 className="font-medium text-gray-800 mb-4">Add Work Experience</h4>
        <div className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="company">Company</Label>
            <Input 
              id="company" 
              value={company} 
              onChange={(e) => setCompany(e.target.value)} 
              placeholder="Company or Organization"
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="title">Job Title</Label>
            <Input 
              id="title" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="Your role or position"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input 
                id="startDate" 
                type="month"
                value={startDate} 
                onChange={(e) => setStartDate(e.target.value)} 
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input 
                id="endDate" 
                type="month"
                value={endDate} 
                onChange={(e) => setEndDate(e.target.value)}
                disabled={currentlyWorking} 
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <input 
              type="checkbox" 
              id="currentlyWorking" 
              checked={currentlyWorking}
              onChange={(e) => setCurrentlyWorking(e.target.checked)}
              className="rounded border-gray-300"
            />
            <Label htmlFor="currentlyWorking" className="cursor-pointer">I currently work here</Label>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description" 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              placeholder="Describe your responsibilities, achievements, and the skills you developed"
              className="min-h-[120px]"
            />
          </div>
          
          <Button onClick={handleAddExperience} type="button" className="w-full">
            Add Experience
          </Button>
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button onClick={handleNext} className="mt-4">Continue</Button>
      </div>
    </div>
  );
};

// Education Step
const EducationStep = ({ nextStep, prevStep, updateFormData, formData }: StepProps) => {
  const [educations, setEducations] = useState<any[]>(Array.isArray(formData.educations) ? formData.educations : []);
  
  // Fields for new education
  const [institution, setInstitution] = useState("");
  const [degree, setDegree] = useState("");
  const [field, setField] = useState("");
  const [startYear, setStartYear] = useState("");
  const [endYear, setEndYear] = useState("");
  const [description, setDescription] = useState("");
  const [currentlyStudying, setCurrentlyStudying] = useState(false);
  
  const handleAddEducation = () => {
    if (institution && degree && startYear) {
      const newEducation = {
        institution,
        degree,
        field,
        startYear,
        endYear: currentlyStudying ? "Present" : endYear,
        currentlyStudying,
        description
      };
      
      setEducations([...educations, newEducation]);
      
      // Reset form
      setInstitution("");
      setDegree("");
      setField("");
      setStartYear("");
      setEndYear("");
      setDescription("");
      setCurrentlyStudying(false);
    }
  };
  
  const handleRemoveEducation = (index: number) => {
    const updatedEducations = [...educations];
    updatedEducations.splice(index, 1);
    setEducations(updatedEducations);
  };
  
  const handleNext = () => {
    updateFormData({ educations });
    nextStep();
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <div className="mt-1">
          <MuskAvatar size="sm" withSparks={true} />
        </div>
        <div className="bg-gray-50 rounded-lg p-4 rounded-tl-none">
          <h3 className="font-medium text-lg text-gray-900">What's your educational background?</h3>
          <p className="text-gray-600 mt-2">
            Add your academic qualifications, certifications, and other educational experiences.
          </p>
        </div>
      </div>
      
      {/* List of existing educations */}
      {educations.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-medium text-gray-800">Your Education</h4>
          {educations.map((edu, index) => (
            <div key={index} className="border rounded-lg p-4 relative">
              <button 
                onClick={() => handleRemoveEducation(index)}
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
              <div className="space-y-1">
                <h5 className="font-medium">{edu.degree} {edu.field && `in ${edu.field}`}</h5>
                <p className="text-gray-600">{edu.institution}</p>
                <p className="text-sm text-gray-500">
                  {edu.startYear} - {edu.currentlyStudying ? "Present" : edu.endYear}
                </p>
                <p className="text-sm mt-2">{edu.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Form to add new education */}
      <div className="border rounded-lg p-4">
        <h4 className="font-medium text-gray-800 mb-4">Add Education</h4>
        <div className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="institution">Institution</Label>
            <Input 
              id="institution" 
              value={institution} 
              onChange={(e) => setInstitution(e.target.value)} 
              placeholder="University, College, or School"
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="degree">Degree</Label>
            <Input 
              id="degree" 
              value={degree} 
              onChange={(e) => setDegree(e.target.value)} 
              placeholder="Bachelor's, Master's, PhD, Certificate, etc."
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="field">Field of Study</Label>
            <Input 
              id="field" 
              value={field} 
              onChange={(e) => setField(e.target.value)} 
              placeholder="Computer Science, Business, etc."
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="startYear">Start Year</Label>
              <Input 
                id="startYear" 
                type="number"
                value={startYear} 
                onChange={(e) => setStartYear(e.target.value)} 
                placeholder="YYYY"
                min="1900"
                max="2099"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="endYear">End Year</Label>
              <Input 
                id="endYear" 
                type="number"
                value={endYear} 
                onChange={(e) => setEndYear(e.target.value)}
                disabled={currentlyStudying}
                placeholder="YYYY"
                min="1900"
                max="2099"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <input 
              type="checkbox" 
              id="currentlyStudying" 
              checked={currentlyStudying}
              onChange={(e) => setCurrentlyStudying(e.target.checked)}
              className="rounded border-gray-300"
            />
            <Label htmlFor="currentlyStudying" className="cursor-pointer">I'm currently studying here</Label>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="eduDescription">Description (Optional)</Label>
            <Textarea 
              id="eduDescription" 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              placeholder="Add details about your coursework, achievements, thesis, etc."
              className="min-h-[80px]"
            />
          </div>
          
          <Button onClick={handleAddEducation} type="button" className="w-full">
            Add Education
          </Button>
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button onClick={handleNext} className="mt-4">Continue</Button>
      </div>
    </div>
  );
};

// Projects Step
const ProjectsStep = ({ nextStep, prevStep, updateFormData, formData }: StepProps) => {
  const [projects, setProjects] = useState<any[]>(Array.isArray(formData.projects) ? formData.projects : []);
  
  // Fields for new project
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [projectUrl, setProjectUrl] = useState("");
  const [category, setCategory] = useState("");
  
  const handleAddProject = () => {
    if (title && description) {
      const newProject = {
        title,
        description,
        startDate,
        projectUrl,
        category
      };
      
      setProjects([...projects, newProject]);
      
      // Reset form
      setTitle("");
      setDescription("");
      setStartDate("");
      setProjectUrl("");
      setCategory("");
    }
  };
  
  const handleRemoveProject = (index: number) => {
    const updatedProjects = [...projects];
    updatedProjects.splice(index, 1);
    setProjects(updatedProjects);
  };
  
  const handleNext = () => {
    updateFormData({ projects });
    nextStep();
  };
  
  // Project categories
  const PROJECT_CATEGORIES = [
    "Web Development",
    "Mobile App",
    "UI/UX Design",
    "Data Science",
    "Machine Learning",
    "Research",
    "Writing",
    "Marketing",
    "Business",
    "Art & Design",
    "Open Source",
    "Personal",
    "Client Work",
    "Other"
  ];
  
  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <div className="mt-1">
          <MuskAvatar size="sm" withSparks={true} />
        </div>
        <div className="bg-gray-50 rounded-lg p-4 rounded-tl-none">
          <h3 className="font-medium text-lg text-gray-900">Showcase your projects</h3>
          <p className="text-gray-600 mt-2">
            Add projects you've worked on to showcase your skills and achievements.
          </p>
        </div>
      </div>
      
      {/* List of existing projects */}
      {projects.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-medium text-gray-800">Your Projects</h4>
          {projects.map((project, index) => (
            <div key={index} className="border rounded-lg p-4 relative">
              <button 
                onClick={() => handleRemoveProject(index)}
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <h5 className="font-medium">{project.title}</h5>
                  {project.category && (
                    <Badge variant="outline" className="ml-2">{project.category}</Badge>
                  )}
                </div>
                <p className="text-sm text-gray-500">{project.startDate}</p>
                <p className="text-sm mt-2">{project.description}</p>
                {project.projectUrl && (
                  <a 
                    href={project.projectUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline block mt-2"
                  >
                    {project.projectUrl}
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Form to add new project */}
      <div className="border rounded-lg p-4">
        <h4 className="font-medium text-gray-800 mb-4">Add Project</h4>
        <div className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Project Title</Label>
            <Input 
              id="title" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="Name of your project"
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select project category" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {PROJECT_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="startDate">Date</Label>
            <Input 
              id="startDate" 
              type="month"
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value)} 
            />
            <p className="text-xs text-gray-500">When was this project completed or started?</p>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="projectUrl">Project URL (Optional)</Label>
            <Input 
              id="projectUrl" 
              value={projectUrl} 
              onChange={(e) => setProjectUrl(e.target.value)} 
              placeholder="https://example.com/my-project"
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description" 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              placeholder="Describe the project, your role, technologies used, and outcomes"
              className="min-h-[120px]"
            />
          </div>
          
          <Button onClick={handleAddProject} type="button" className="w-full">
            Add Project
          </Button>
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button onClick={handleNext} className="mt-4">Continue</Button>
      </div>
    </div>
  );
};

// Review Step
const ReviewStep = ({ complete, prevStep, formData }: StepProps) => {
  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <div className="mt-1">
          <MuskAvatar size="sm" withSparks={true} />
        </div>
        <div className="bg-gray-50 rounded-lg p-4 rounded-tl-none">
          <h3 className="font-medium text-lg text-gray-900">Almost there!</h3>
          <p className="text-gray-600 mt-2">
            Let's review what you've shared before completing your brand story.
          </p>
        </div>
      </div>
      
      <div className="space-y-6">
        {/* Personal Info Review */}
        <div className="border rounded-lg p-4">
          <h4 className="font-medium text-gray-800 mb-3">Personal Information</h4>
          <div className="space-y-2">
            <div className="grid grid-cols-[100px_1fr] gap-2">
              <span className="text-gray-500">Name:</span>
              <span>{formData.name}</span>
            </div>
            <div className="grid grid-cols-[100px_1fr] gap-2">
              <span className="text-gray-500">Title:</span>
              <span>{formData.title}</span>
            </div>
            <div className="grid grid-cols-[100px_1fr] gap-2">
              <span className="text-gray-500">Location:</span>
              <span>{formData.location}</span>
            </div>
            <div className="grid grid-cols-[100px_1fr] gap-2">
              <span className="text-gray-500">Industry:</span>
              <span>{formData.industry}</span>
            </div>
            <div className="grid grid-cols-[100px_1fr] gap-2">
              <span className="text-gray-500">Domain:</span>
              <span>{formData.domain}</span>
            </div>
            <div className="grid grid-cols-[100px_1fr] gap-2">
              <span className="text-gray-500">Looking For:</span>
              <span>
                {LOOKING_FOR.find(item => item.value === formData.lookingFor)?.label || formData.lookingFor}
              </span>
            </div>
          </div>
        </div>
        
        {/* About Me Review */}
        <div className="border rounded-lg p-4">
          <h4 className="font-medium text-gray-800 mb-3">About Me</h4>
          <p className="text-gray-700">{formData.aboutMe}</p>
        </div>
        
        {/* Skills Review */}
        <div className="border rounded-lg p-4">
          <h4 className="font-medium text-gray-800 mb-3">Skills</h4>
          <div className="flex flex-wrap gap-2">
            {Array.isArray(formData.skills) && formData.skills.length > 0 ? (
              formData.skills.map((skill: string, index: number) => (
                <Badge key={index} variant="secondary">{skill}</Badge>
              ))
            ) : (
              <p className="text-gray-500">No skills added</p>
            )}
          </div>
        </div>
        
        {/* Services Review */}
        <div className="border rounded-lg p-4">
          <h4 className="font-medium text-gray-800 mb-3">Services</h4>
          <div className="flex flex-wrap gap-2">
            {Array.isArray(formData.services) && formData.services.length > 0 ? (
              formData.services.map((service: string, index: number) => (
                <Badge key={index} variant="secondary">{service}</Badge>
              ))
            ) : (
              <p className="text-gray-500">No services added</p>
            )}
          </div>
        </div>
        
        {/* Work Experience Review */}
        <div className="border rounded-lg p-4">
          <h4 className="font-medium text-gray-800 mb-3">Work Experience</h4>
          {Array.isArray(formData.experiences) && formData.experiences.length > 0 ? (
            <div className="space-y-4">
              {formData.experiences.map((exp: any, index: number) => (
                <div key={index} className="border-b pb-3 last:border-b-0 last:pb-0">
                  <h5 className="font-medium">{exp.title}</h5>
                  <p className="text-gray-600">{exp.company}</p>
                  <p className="text-sm text-gray-500">
                    {exp.startDate} - {exp.currentlyWorking ? "Present" : exp.endDate}
                  </p>
                  <p className="text-sm mt-2">{exp.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No work experience added</p>
          )}
        </div>
        
        {/* Education Review */}
        <div className="border rounded-lg p-4">
          <h4 className="font-medium text-gray-800 mb-3">Education</h4>
          {Array.isArray(formData.educations) && formData.educations.length > 0 ? (
            <div className="space-y-4">
              {formData.educations.map((edu: any, index: number) => (
                <div key={index} className="border-b pb-3 last:border-b-0 last:pb-0">
                  <h5 className="font-medium">{edu.degree} {edu.field && `in ${edu.field}`}</h5>
                  <p className="text-gray-600">{edu.institution}</p>
                  <p className="text-sm text-gray-500">
                    {edu.startYear} - {edu.currentlyStudying ? "Present" : edu.endYear}
                  </p>
                  <p className="text-sm mt-2">{edu.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No education added</p>
          )}
        </div>
        
        {/* Projects Review */}
        <div className="border rounded-lg p-4">
          <h4 className="font-medium text-gray-800 mb-3">Projects</h4>
          {Array.isArray(formData.projects) && formData.projects.length > 0 ? (
            <div className="space-y-4">
              {formData.projects.map((project: any, index: number) => (
                <div key={index} className="border-b pb-3 last:border-b-0 last:pb-0">
                  <div className="flex items-center justify-between">
                    <h5 className="font-medium">{project.title}</h5>
                    {project.category && (
                      <Badge variant="outline" className="ml-2">{project.category}</Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">{project.startDate}</p>
                  <p className="text-sm mt-2">{project.description}</p>
                  {project.projectUrl && (
                    <a 
                      href={project.projectUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline block mt-2"
                    >
                      {project.projectUrl}
                    </a>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No projects added</p>
          )}
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button 
          onClick={complete} 
          className="mt-4 bg-green-600 hover:bg-green-700"
        >
          Complete Your Story
        </Button>
      </div>
    </div>
  );
};

export default BrandStoryBuilder;