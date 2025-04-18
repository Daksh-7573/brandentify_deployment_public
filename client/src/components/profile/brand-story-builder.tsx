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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
    "Basic Info",
    "Professional Identity",
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
            <BasicInfoStep
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
            <ProfessionalIdentityStep
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
          
          {currentStep === 3 && (
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
          
          {currentStep === 4 && (
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
          
          {currentStep === 5 && (
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
          
          {currentStep === 6 && (
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
          
          {currentStep === 7 && (
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

// Introduction Step
const IntroductionStep = ({ nextStep, user, formData }: StepProps) => {
  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <div className="mt-1">
          <MuskAvatar size="sm" withSparks={true} />
        </div>
        <div className="bg-gray-50 rounded-lg p-4 rounded-tl-none">
          <h3 className="font-medium text-lg text-gray-900">Hi {user?.name || "there"}!</h3>
          <p className="text-gray-600 mt-2">
            I'm Musk, your AI career assistant. Together, we're going to craft your professional brand story step by step.
          </p>
          <p className="text-gray-600 mt-2">
            This guided experience will help you complete your profile and present yourself in the best possible light to potential 
            connections, employers, and clients.
          </p>
        </div>
      </div>
      
      <div className="flex items-start gap-4">
        <div className="mt-1">
          <MuskAvatar size="sm" withSparks={true} />
        </div>
        <div className="bg-gray-50 rounded-lg p-4 rounded-tl-none">
          <h3 className="font-medium text-lg text-gray-900">Here's what we'll cover:</h3>
          <ul className="list-disc pl-5 mt-2 space-y-2 text-gray-600">
            <li>Your basic information and professional identity</li>
            <li>Your skills and expertise</li>
            <li>Services you offer (if applicable)</li>
            <li>Your work experience and education</li>
            <li>Projects you've worked on</li>
          </ul>
          <p className="text-gray-600 mt-3">
            You can navigate between steps using the indicators at the top, and your progress will be 
            saved automatically. Ready to get started?
          </p>
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button onClick={nextStep} className="mt-4 px-6">Let's Begin</Button>
      </div>
    </div>
  );
};

// Basic Info Step
const BasicInfoStep = ({ nextStep, prevStep, user, updateFormData, formData }: StepProps) => {
  const [name, setName] = useState(formData.name || "");
  const [title, setTitle] = useState(formData.title || "");
  const [location, setLocation] = useState(formData.location || "");
  
  const handleNext = () => {
    updateFormData({ name, title, location });
    nextStep();
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <div className="mt-1">
          <MuskAvatar size="sm" withSparks={true} />
        </div>
        <div className="bg-gray-50 rounded-lg p-4 rounded-tl-none">
          <h3 className="font-medium text-lg text-gray-900">Let's start with the basics</h3>
          <p className="text-gray-600 mt-2">
            These fundamental details help people identify you and understand your role at a glance.
          </p>
        </div>
      </div>
      
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
  );
};

// Professional Identity Step
const ProfessionalIdentityStep = ({ nextStep, prevStep, updateFormData, formData }: StepProps) => {
  const [industry, setIndustry] = useState(formData.industry || "");
  const [domain, setDomain] = useState(formData.domain || "");
  const [lookingFor, setLookingFor] = useState(formData.lookingFor || "");
  const [aboutMe, setAboutMe] = useState(formData.aboutMe || "");
  
  // Import the industry domains and categories from the same constants used in the Profile page
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
  
  const handleNext = () => {
    updateFormData({ industry, domain, lookingFor, aboutMe });
    nextStep();
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <div className="mt-1">
          <MuskAvatar size="sm" withSparks={true} />
        </div>
        <div className="bg-gray-50 rounded-lg p-4 rounded-tl-none">
          <h3 className="font-medium text-lg text-gray-900">Tell me about your professional identity</h3>
          <p className="text-gray-600 mt-2">
            This helps us connect you with the right people and opportunities in your field.
          </p>
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="industry">Industry</Label>
          <Select 
            value={industry} 
            onValueChange={setIndustry}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select your industry" />
            </SelectTrigger>
            <SelectContent>
              {INDUSTRIES.map((ind) => (
                <SelectItem key={ind} value={ind}>{ind}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="domain">Domain/Specialization</Label>
          <Select 
            value={domain} 
            onValueChange={setDomain}
            disabled={!industry}
          >
            <SelectTrigger>
              <SelectValue placeholder={industry ? "Select your domain" : "Select an industry first"} />
            </SelectTrigger>
            <SelectContent>
              {industry && INDUSTRY_DOMAINS[industry as keyof typeof INDUSTRY_DOMAINS]?.map((dom) => (
                <SelectItem key={dom} value={dom}>{dom}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="lookingFor">What are you looking for?</Label>
          <Select 
            value={lookingFor} 
            onValueChange={setLookingFor}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select what you're looking for" />
            </SelectTrigger>
            <SelectContent>
              {LOOKING_FOR.map((option) => (
                <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="aboutMe">About Me</Label>
          <Textarea 
            id="aboutMe" 
            value={aboutMe} 
            onChange={(e) => setAboutMe(e.target.value)} 
            placeholder="Tell others a bit about yourself, your background, and what drives you professionally..."
            rows={5}
          />
          <p className="text-xs text-gray-500">A brief professional bio (350 words max)</p>
        </div>
      </div>
    </div>
  );
};

// Skills Step
const SkillsStep = ({ nextStep, prevStep, userData, updateFormData, formData }: StepProps) => {
  const [skills, setSkills] = useState<any[]>(formData.skills || []);
  const [newSkill, setNewSkill] = useState("");
  const [skillLevel, setSkillLevel] = useState("Intermediate");
  
  const addSkill = () => {
    if (!newSkill.trim()) return;
    
    const skillExists = skills.some(skill => 
      skill.name.toLowerCase() === newSkill.toLowerCase()
    );
    
    if (skillExists) {
      // Could show a toast here
      return;
    }
    
    setSkills(prev => [
      ...prev, 
      { 
        id: Date.now(), // Temporary ID
        name: newSkill.trim(),
        level: skillLevel,
        proficiency: skillLevel === "Beginner" ? 25 : skillLevel === "Intermediate" ? 50 : 75
      }
    ]);
    
    setNewSkill("");
  };
  
  const removeSkill = (skillId: number) => {
    setSkills(prev => prev.filter(skill => skill.id !== skillId));
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
          <h3 className="font-medium text-lg text-gray-900">What skills do you bring to the table?</h3>
          <p className="text-gray-600 mt-2">
            Add your professional skills and expertise. These help others understand your capabilities
            and are essential for being discovered.
          </p>
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="flex gap-2">
          <div className="flex-1">
            <Input 
              value={newSkill} 
              onChange={(e) => setNewSkill(e.target.value)} 
              placeholder="Add a skill (e.g. JavaScript, Project Management)"
              onKeyDown={(e) => e.key === 'Enter' && addSkill()}
            />
          </div>
          
          <Select value={skillLevel} onValueChange={setSkillLevel}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Beginner">Beginner</SelectItem>
              <SelectItem value="Intermediate">Intermediate</SelectItem>
              <SelectItem value="Advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
          
          <Button onClick={addSkill}>Add</Button>
        </div>
        
        <div className="mt-4">
          <Label className="mb-2 block">Your Skills</Label>
          
          {skills.length === 0 ? (
            <div className="text-center p-6 border border-dashed rounded-md text-gray-500">
              You haven't added any skills yet. Add your skills to complete your profile.
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {skills.map(skill => (
                <Badge 
                  key={skill.id} 
                  variant="outline" 
                  className="px-3 py-1 flex items-center gap-2 group"
                >
                  <span>{skill.name}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                    skill.level === "Beginner" 
                      ? "bg-blue-100 text-blue-800" 
                      : skill.level === "Intermediate" 
                        ? "bg-green-100 text-green-800"
                        : "bg-purple-100 text-purple-800"
                  }`}>
                    {skill.level}
                  </span>
                  <button 
                    onClick={() => removeSkill(skill.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity ml-1 text-gray-400 hover:text-red-500"
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Services Step
const ServicesStep = ({ nextStep, prevStep, updateFormData, formData }: StepProps) => {
  // Initialize with empty array as a fallback if services is undefined or not an array
  const [servicesList, setServicesList] = useState<any[]>(Array.isArray(formData.services) ? formData.services : []);
  
  const handleNext = () => {
    updateFormData({ services: servicesList });
    nextStep();
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <div className="mt-1">
          <MuskAvatar size="sm" withSparks={true} />
        </div>
        <div className="bg-gray-50 rounded-lg p-4 rounded-tl-none">
          <h3 className="font-medium text-lg text-gray-900">Do you offer any professional services?</h3>
          <p className="text-gray-600 mt-2">
            If you're a freelancer, consultant, or offer any professional services, showcase them here.
            This is optional - you can skip this step if it doesn't apply to you.
          </p>
        </div>
      </div>
      
      <div className="space-y-4">
        {servicesList.length === 0 ? (
          <div className="text-center p-6 border border-dashed rounded-md text-gray-500">
            You haven't added any services yet. You can add services from your profile page later.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {servicesList.map(service => (
              <div 
                key={service.id} 
                className="border rounded-lg p-4 hover:border-primary transition-colors"
              >
                <h3 className="font-medium">{service.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                <div className="flex justify-between items-center mt-2">
                  <Badge variant="outline" className="bg-primary-50">
                    {service.category}
                  </Badge>
                  <p className="text-sm font-medium">
                    {service.priceUsd && `$${service.priceUsd}`} 
                    {service.isHourly ? '/hr' : ''}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="mt-4 text-center">
          <Button variant="outline" onClick={nextStep}>
            {servicesList.length === 0 ? "Skip this step" : "Continue"}
          </Button>
        </div>
      </div>
    </div>
  );
};

// Work Experience Step
const WorkExperienceStep = ({ nextStep, prevStep, updateFormData, formData }: StepProps) => {
  // Initialize with empty array as a fallback if experiences is undefined or not an array
  const [experienceList, setExperienceList] = useState<any[]>(Array.isArray(formData.experiences) ? formData.experiences : []);
  
  const handleNext = () => {
    updateFormData({ experiences: experienceList });
    nextStep();
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <div className="mt-1">
          <MuskAvatar size="sm" withSparks={true} />
        </div>
        <div className="bg-gray-50 rounded-lg p-4 rounded-tl-none">
          <h3 className="font-medium text-lg text-gray-900">Tell me about your work experience</h3>
          <p className="text-gray-600 mt-2">
            Add your professional experience to showcase your career journey. This helps connections
            understand your background and expertise.
          </p>
        </div>
      </div>
      
      <div className="space-y-4">
        {experienceList.length === 0 ? (
          <div className="text-center p-6 border border-dashed rounded-md text-gray-500">
            You haven't added any work experiences yet. You can add them from your profile page later.
          </div>
        ) : (
          <div className="space-y-4">
            {experienceList.map(exp => (
              <div 
                key={exp.id} 
                className="border rounded-lg p-4 hover:border-primary transition-colors"
              >
                <div className="flex justify-between">
                  <h3 className="font-medium">{exp.title}</h3>
                  <p className="text-sm text-gray-500">
                    {exp.startDate} - {exp.endDate || 'Present'}
                  </p>
                </div>
                <p className="text-sm font-medium text-gray-700 mt-1">{exp.company}</p>
                <p className="text-sm text-gray-600 mt-1">{exp.location}</p>
                <p className="text-sm text-gray-600 mt-2">{exp.description}</p>
              </div>
            ))}
          </div>
        )}
        
        <div className="mt-4 text-center">
          <Button variant="outline" onClick={nextStep}>
            {experienceList.length === 0 ? "Skip this step" : "Continue"}
          </Button>
        </div>
      </div>
    </div>
  );
};

// Education Step
const EducationStep = ({ nextStep, prevStep, updateFormData, formData }: StepProps) => {
  // Initialize with empty array as a fallback if educations is undefined or not an array
  const [educationList, setEducationList] = useState<any[]>(Array.isArray(formData.educations) ? formData.educations : []);
  
  const handleNext = () => {
    updateFormData({ educations: educationList });
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
            Add your education history to complete your professional profile. This helps establish
            your academic credentials and areas of study.
          </p>
        </div>
      </div>
      
      <div className="space-y-4">
        {educationList.length === 0 ? (
          <div className="text-center p-6 border border-dashed rounded-md text-gray-500">
            You haven't added any education entries yet. You can add them from your profile page later.
          </div>
        ) : (
          <div className="space-y-4">
            {educationList.map(edu => (
              <div 
                key={edu.id} 
                className="border rounded-lg p-4 hover:border-primary transition-colors"
              >
                <div className="flex justify-between">
                  <h3 className="font-medium">{edu.degree}</h3>
                  <p className="text-sm text-gray-500">
                    {edu.startDate} - {edu.endDate || 'Present'}
                  </p>
                </div>
                <p className="text-sm font-medium text-gray-700 mt-1">{edu.institution}</p>
                <p className="text-sm text-gray-600 mt-1">{edu.location}</p>
              </div>
            ))}
          </div>
        )}
        
        <div className="mt-4 text-center">
          <Button variant="outline" onClick={nextStep}>
            {educationList.length === 0 ? "Skip this step" : "Continue"}
          </Button>
        </div>
      </div>
    </div>
  );
};

// Projects Step
const ProjectsStep = ({ nextStep, prevStep, updateFormData, formData }: StepProps) => {
  // Initialize with empty array as a fallback if projects is undefined or not an array
  const [projectList, setProjectList] = useState<any[]>(Array.isArray(formData.projects) ? formData.projects : []);
  
  const handleNext = () => {
    updateFormData({ projects: projectList });
    nextStep();
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <div className="mt-1">
          <MuskAvatar size="sm" withSparks={true} />
        </div>
        <div className="bg-gray-50 rounded-lg p-4 rounded-tl-none">
          <h3 className="font-medium text-lg text-gray-900">Tell me about your projects</h3>
          <p className="text-gray-600 mt-2">
            Showcase the projects you've worked on to demonstrate your capabilities and achievements.
            These provide tangible examples of your skills in action.
          </p>
        </div>
      </div>
      
      <div className="space-y-4">
        {projectList.length === 0 ? (
          <div className="text-center p-6 border border-dashed rounded-md text-gray-500">
            You haven't added any projects yet. You can add them from your profile page later.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projectList.map(project => (
              <div 
                key={project.id} 
                className="border rounded-lg overflow-hidden hover:border-primary transition-colors"
              >
                {project.thumbnailUrl && (
                  <div className="h-40 overflow-hidden">
                    <img 
                      src={project.thumbnailUrl} 
                      alt={project.title}
                      className="w-full h-full object-cover" 
                    />
                  </div>
                )}
                <div className="p-4">
                  <h3 className="font-medium">{project.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{project.category}</p>
                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">{project.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="mt-4 text-center">
          <Button variant="outline" onClick={nextStep}>
            {projectList.length === 0 ? "Skip this step" : "Continue"}
          </Button>
        </div>
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
          <h3 className="font-medium text-lg text-gray-900">Great job! Let's review your brand story</h3>
          <p className="text-gray-600 mt-2">
            Review the information you've provided before finalizing your profile. You can always come back
            and make changes later.
          </p>
        </div>
      </div>
      
      <div className="space-y-4">
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid grid-cols-3 gap-2">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="professional">Professional Identity</TabsTrigger>
            <TabsTrigger value="skills">Skills & Experience</TabsTrigger>
          </TabsList>
          
          <TabsContent value="basic" className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-x-6 gap-y-3">
              <div>
                <h4 className="text-sm font-medium text-gray-500">Name</h4>
                <p className="text-gray-900">{formData.name || "Not provided"}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Title</h4>
                <p className="text-gray-900">{formData.title || "Not provided"}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Location</h4>
                <p className="text-gray-900">{formData.location || "Not provided"}</p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="professional" className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-x-6 gap-y-3">
              <div>
                <h4 className="text-sm font-medium text-gray-500">Industry</h4>
                <p className="text-gray-900">{formData.industry || "Not provided"}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Domain</h4>
                <p className="text-gray-900">{formData.domain || "Not provided"}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Looking For</h4>
                <p className="text-gray-900">{formData.lookingFor || "Not provided"}</p>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-500">About Me</h4>
              <p className="text-gray-900 whitespace-pre-line mt-1">
                {formData.aboutMe || "Not provided"}
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="skills" className="space-y-4 pt-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500">Skills</h4>
              {formData.skills?.length > 0 ? (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.skills.map((skill: any) => (
                    <Badge 
                      key={skill.id} 
                      variant="outline" 
                      className="px-3 py-1"
                    >
                      {skill.name} · {skill.level}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic mt-1">No skills added</p>
              )}
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-500">Work Experience</h4>
              {formData.experiences?.length > 0 ? (
                <div className="space-y-2 mt-2">
                  {formData.experiences.map((exp: any) => (
                    <div key={exp.id} className="text-sm">
                      <p className="font-medium">{exp.title} at {exp.company}</p>
                      <p className="text-gray-500">{exp.startDate} - {exp.endDate || 'Present'}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic mt-1">No experience added</p>
              )}
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-500">Education</h4>
              {formData.educations?.length > 0 ? (
                <div className="space-y-2 mt-2">
                  {formData.educations.map((edu: any) => (
                    <div key={edu.id} className="text-sm">
                      <p className="font-medium">{edu.degree} at {edu.institution}</p>
                      <p className="text-gray-500">{edu.startDate} - {edu.endDate || 'Present'}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic mt-1">No education added</p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      <div className="flex items-start gap-4">
        <div className="mt-1">
          <MuskAvatar size="sm" withSparks={true} />
        </div>
        <div className="bg-green-50 rounded-lg p-4 rounded-tl-none border border-green-100">
          <h3 className="font-medium text-green-800">Ready to save your brand story?</h3>
          <p className="text-green-700 mt-2">
            Click "Complete Your Story" to save your profile. I'll help you keep your profile
            updated and optimized over time!
          </p>
        </div>
      </div>
    </div>
  );
};

export default BrandStoryBuilder;