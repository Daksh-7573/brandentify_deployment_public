import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import Header from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import WorkExperience from "@/components/profile/work-experience";
import Education from "@/components/profile/education";
import Skills from "@/components/profile/skills";
import Projects from "@/components/profile/projects";
import Services from "@/components/profile/services-new";
import PersonalInfoSection from "@/components/profile/personal-info-section";
import EditPersonalInfo from "@/components/profile/edit-personal-info";
import MuskButton from "@/components/musk/musk-button";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, AlertCircle } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { calculateOverallProfileCompletion } from "@/lib/profile-utils";
import { useState, useEffect } from "react";
import { Camera, FileText, Edit, Loader2, FolderIcon, Mail, Phone, Globe, Briefcase, MapPin, Book, Building } from "lucide-react";
import PersonalInfoIcon from "@/components/icons/personal-info-icon";
import { useProfilePicture } from "@/hooks/use-profile-picture";
import { ProfilePictureDialog } from "@/components/profile/profile-picture-dialog";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
  SelectSeparator
} from "@/components/ui/select";
import { JobTitleCombobox } from "@/components/ui/job-title-combobox";
import { ProfilePageSkeleton } from "@/components/ui/skeleton-loaders";
import { NeoGlassLayout, NeoGlassSection } from "@/components/layout/neo-glass-layout";

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
  { value: "hiring_freelancers", label: "💰 Hiring Freelancers" }
];

export interface IndustryDomainMap {
  [key: string]: string[];
}

export const INDUSTRY_DOMAINS: IndustryDomainMap = {
  "Technology": [
    "Software Development", 
    "IT Services", 
    "Hardware", 
    "Cloud Computing", 
    "AI/Machine Learning", 
    "Cybersecurity", 
    "Data Science", 
    "DevOps",
    "Blockchain",
    "IoT"
  ],
  "Finance": [
    "Banking", 
    "Investment Banking", 
    "Venture Capital", 
    "Private Equity", 
    "Financial Services", 
    "Insurance", 
    "FinTech", 
    "Accounting",
    "Wealth Management",
    "Risk Management"
  ],
  "Healthcare": [
    "Hospital Management", 
    "Medical Devices", 
    "Pharmaceuticals", 
    "Biotechnology", 
    "Healthcare IT", 
    "Mental Health", 
    "Telehealth", 
    "Public Health",
    "Health Insurance",
    "Elder Care"
  ],
  // More industries...
};

export const INDUSTRIES = [
  "Technology",
  "Finance",
  "Healthcare",
  "Education",
  "Consulting",
  "Marketing",
  "Media",
  "Entertainment",
  "Retail",
  "Manufacturing",
  "Energy",
  "Transportation",
  "Real Estate",
  "Hospitality",
  "Agriculture",
  "Construction",
  "Nonprofit",
  "Government"
];

export default function ProfileNeo() {
  const { user, signOut } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // State variables
  const [showEditPersonalInfoDialog, setShowEditPersonalInfoDialog] = useState(false);
  const [showEditAboutDialog, setShowEditAboutDialog] = useState(false);
  const [aboutMe, setAboutMe] = useState<string | null>(null);
  const [showLookingForDialog, setShowLookingForDialog] = useState(false);
  const [selectedLookingFor, setSelectedLookingFor] = useState<string | null>(null);
  const [industryValue, setIndustryValue] = useState<string | null>(null);
  const [domainValue, setDomainValue] = useState<string | null>(null);
  const [showIndustryDialog, setShowIndustryDialog] = useState(false);
  
  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      setLocation('/auth');
    }
  }, [user, setLocation]);
  
  if (!user) {
    return null;
  }
  
  // Get user profile data
  const { data: userData, isLoading: isUserDataLoading } = useQuery({
    queryKey: ['/api/users', user.uid],
  });
  
  // Query for user's industries and domain preferences
  const { data: userPreferences, isLoading: isPreferencesLoading } = useQuery({
    queryKey: ['/api/user-preferences', user.uid],
  });
  
  // Profile picture functionality
  const { 
    profilePictureUrl, 
    isUploading, 
    uploadProgress, 
    openProfilePictureDialog,
    showProfilePictureDialog,
    closeProfilePictureDialog,
    updateProfilePicture
  } = useProfilePicture(user.uid);
  
  // Update about me mutation
  const updateAboutMeMutation = useMutation({
    mutationFn: async (newAbout: string) => {
      const res = await apiRequest("PATCH", `/api/users/${user.uid}`, {
        about: newAbout
      });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "About me updated",
        description: "Your professional summary has been updated successfully."
      });
      setShowEditAboutDialog(false);
      queryClient.invalidateQueries({ queryKey: ['/api/users', user.uid] });
    },
    onError: (error) => {
      toast({
        title: "Update failed",
        description: "Something went wrong while updating your about me.",
        variant: "destructive"
      });
      console.error("Error updating about me:", error);
    }
  });
  
  // Update looking for
  const updateLookingForMutation = useMutation({
    mutationFn: async (lookingFor: string | null) => {
      const res = await apiRequest("PATCH", `/api/users/${user.uid}`, {
        lookingFor
      });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Looking for updated",
        description: "Your 'I am looking for' preference has been updated."
      });
      setShowLookingForDialog(false);
      queryClient.invalidateQueries({ queryKey: ['/api/users', user.uid] });
    },
    onError: (error) => {
      toast({
        title: "Update failed",
        description: "Something went wrong while updating your preference.",
        variant: "destructive"
      });
      console.error("Error updating looking for:", error);
    }
  });
  
  // Update industry and domain preferences
  const updateIndustryMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("PATCH", `/api/users/${user.uid}`, {
        industry: industryValue,
        domain: domainValue
      });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Industry preferences updated",
        description: "Your industry and domain preferences have been updated."
      });
      setShowIndustryDialog(false);
      queryClient.invalidateQueries({ queryKey: ['/api/users', user.uid] });
    },
    onError: (error) => {
      toast({
        title: "Update failed",
        description: "Something went wrong while updating your preferences.",
        variant: "destructive"
      });
      console.error("Error updating industry preferences:", error);
    }
  });
  
  // Effect to set initial values
  useEffect(() => {
    if (userData) {
      setAboutMe(userData.about);
      setSelectedLookingFor(userData.lookingFor);
      setIndustryValue(userData.industry);
      setDomainValue(userData.domain);
    }
  }, [userData]);
  
  // If loading, show skeleton
  if (isUserDataLoading) {
    return (
      <div className="flex h-screen flex-col">
        <Header />
        <div className="flex flex-1 overflow-hidden pt-16">
          <div className="flex-1 overflow-auto">
            <NeoGlassLayout className="mt-3 mx-6">
              <ProfilePageSkeleton />
            </NeoGlassLayout>
          </div>
        </div>
      </div>
    );
  }
  
  const profileCompletion = calculateOverallProfileCompletion(userData);
  const portfolioDataMissing = !userData?.hasPortfolio;
  
  // Find looking for category label
  const lookingForLabel = LOOKING_FOR_CATEGORIES.find(cat => cat.value === userData?.lookingFor)?.label || "Not specified";

  const handleSubmitAboutMe = () => {
    updateAboutMeMutation.mutate(aboutMe || "");
  };
  
  const handleSubmitLookingFor = () => {
    updateLookingForMutation.mutate(selectedLookingFor);
  };
  
  const handleSubmitIndustryPreferences = () => {
    updateIndustryMutation.mutate();
  };
  
  return (
    <div className="flex h-screen flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden pt-16"> {/* Added padding-top for fixed header */}
        {/* Main content area */}
        <div className="flex-1 overflow-auto">
          <NeoGlassLayout className="mt-3 mx-6"> {/* Matching Industry Pulse layout with reduced top margin */}
            {/* Profile Header */}
            <div className="mb-8">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight text-white">Profile</h1>
                  <p className="text-white/80 mt-1">
                    Manage your professional information and career details
                  </p>
                </div>
                <div className="flex items-center gap-4 mt-4 md:mt-0">
                  <button 
                    onClick={() => {
                      // Create a loading state in the button
                      const btn = document.getElementById('portfolio-btn');
                      if (btn) {
                        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
                        btn.classList.add('opacity-80');
                      }
                      
                      // Pre-create empty portfolio in the background
                      fetch('/api/portfolios', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                          userId: userData?.id,
                          layout: 'professional',
                          isPublished: false,
                          publicUrl: null
                        })
                      }).catch(err => console.log("Portfolio creation attempted - ignoring error if already exists"));
                      
                      // Redirect to portfolio edit page
                      setLocation('/portfolio/edit');
                    }}
                    id="portfolio-btn"
                    className="neo-glass-button flex items-center gap-1 py-1.5 px-3 whitespace-nowrap"
                  >
                    <span>Portfolio</span>
                  </button>
                  <button 
                    onClick={() => setLocation('/resume-builder')}
                    className="neo-glass-button flex items-center gap-1 py-1.5 px-3 whitespace-nowrap"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Resume Builder</span>
                  </button>
                  <button 
                    onClick={() => setLocation('/quantum-card')}
                    className="neo-glass-button flex items-center gap-1 py-1.5 px-3 whitespace-nowrap"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Quantum Card</span>
                  </button>
                </div>
              </div>
            </div>
            
            {/* Personal Info Section */}
            <NeoGlassSection className="mb-6">
              <div className="p-4">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Profile Image */}
                  <div className="flex-shrink-0 flex flex-col items-center">
                    <div className="relative group">
                      <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-white/20 bg-black/30 backdrop-blur-md">
                        <img 
                          src={profilePictureUrl || "https://api.dicebear.com/7.x/initials/svg?seed=" + userData?.name} 
                          alt={userData?.name || "Profile"} 
                          className="w-full h-full object-cover"
                        />
                        {isUploading && (
                          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 text-white">
                            <div className="w-16 h-4 bg-gray-700 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-white" 
                                style={{ width: `${uploadProgress}%` }}
                              ></div>
                            </div>
                            <span className="text-xs mt-1">{uploadProgress}%</span>
                          </div>
                        )}
                      </div>
                      <button 
                        onClick={openProfilePictureDialog}
                        className="absolute bottom-1 right-1 p-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm text-white hover:bg-white/20 transition-all"
                      >
                        <Camera className="h-4 w-4" />
                      </button>
                    </div>
                    
                    <div className="text-center mt-4 relative">
                      <div 
                        className="relative cursor-pointer" 
                        onMouseEnter={() => {
                          const editBtn = document.getElementById('edit-personal-info');
                          if (editBtn) editBtn.style.opacity = '1';
                        }}
                        onMouseLeave={() => {
                          const editBtn = document.getElementById('edit-personal-info');
                          if (editBtn) editBtn.style.opacity = '0';
                        }}
                      >
                        <h2 className="text-xl font-bold text-white">{userData?.name}</h2>
                        <p className="text-white/80 text-sm">{userData?.title || "Add your job title"}</p>
                        <p className="text-white/60 text-xs mt-1">{userData?.location || "Add your location"}</p>
                        
                        <button
                          id="edit-personal-info"
                          onClick={() => setShowEditPersonalInfoDialog(true)}
                          className="absolute top-0 right-0 p-1.5 rounded-full bg-black/40 text-white/80 hover:text-white hover:bg-black/60 transition-colors"
                          title="Edit Personal Information"
                          style={{ opacity: 0, transition: 'opacity 0.2s ease' }}
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Profile Info & Stats */}
                  <div className="flex-1">
                    <div className="space-y-4">
                      {/* About Me */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-lg font-medium text-white">About Me</h3>
                          <button
                            onClick={() => setShowEditAboutDialog(true)}
                            className="text-white/60 hover:text-white transition-colors"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                        </div>
                        <p className="text-white/80 text-sm">
                          {userData?.about || "Add a professional summary to introduce yourself to other professionals."}
                        </p>
                      </div>
                      
                      {/* Industry & Domain */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-lg font-medium text-white">Industry & Domain</h3>
                          <button
                            onClick={() => setShowIndustryDialog(true)}
                            className="text-white/60 hover:text-white transition-colors"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {userData?.industry ? (
                            <span className="px-2 py-1 text-xs rounded-full bg-white/10 border border-white/20 text-white">
                              {userData.industry}
                            </span>
                          ) : null}
                          
                          {userData?.domain ? (
                            <span className="px-2 py-1 text-xs rounded-full bg-white/10 border border-white/20 text-white">
                              {userData.domain}
                            </span>
                          ) : null}
                          
                          {!userData?.industry && !userData?.domain && (
                            <span className="text-white/60 text-sm">
                              Add your industry and specialization to improve connections.
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* Looking For */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-lg font-medium text-white">I am looking for</h3>
                          <button
                            onClick={() => setShowLookingForDialog(true)}
                            className="text-white/60 hover:text-white transition-colors"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {userData?.lookingFor ? (
                            <span className="px-2 py-1 text-xs rounded-full bg-white/10 border border-white/20 text-white">
                              {lookingForLabel}
                            </span>
                          ) : (
                            <span className="text-white/60 text-sm">
                              Specify what you're looking for to help others connect with you.
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </NeoGlassSection>
            
            {/* Professional Overview - Connected with Personal Details */}
            <NeoGlassSection className="mb-6">
              <div className="p-4">
                <div className="flex flex-row items-center justify-between space-y-0 pb-4 mb-4 border-b border-gray-800">
                  <div>
                    <h2 className="text-xl font-bold text-white">Professional Overview</h2>
                    <p className="text-sm text-gray-300">General description of your expertise</p>
                  </div>
                  {userData?.whatIOffer ? (
                    <Button
                      variant="ghost"
                      className="neo-glass-button flex items-center gap-1 py-1.5 px-3 whitespace-nowrap"
                      onClick={() => {/* Add edit functionality */}}
                    >
                      <Edit className="h-3.5 w-3.5" />
                      <span>Edit</span>
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      className="neo-glass-button flex items-center gap-1 py-1.5 px-3 whitespace-nowrap"
                      onClick={() => {/* Add edit functionality */}}
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Add Overview</span>
                    </Button>
                  )}
                </div>
                
                {userData?.whatIOffer ? (
                  <div className="transition-all">
                    <p className="text-sm text-gray-300 whitespace-pre-line">{userData.whatIOffer}</p>
                  </div>
                ) : (
                  <div className="py-6 text-center">
                    <AlertCircle className="mx-auto h-10 w-10 text-gray-400/50" />
                    <p className="mt-2 text-gray-400">
                      Add a general description of your professional expertise.
                    </p>
                  </div>
                )}
              </div>
            </NeoGlassSection>
            
            {/* Specific Services as a separate section */}
            <NeoGlassSection className="mb-6">
              <Services userFirebaseId={user.uid} userNumericId={userData?.id} />
            </NeoGlassSection>
            
            {/* 3. What I'm Good At (Skills) */}
            <NeoGlassSection className="mb-6">
              <Skills userFirebaseId={user.uid} userNumericId={userData?.id} />
            </NeoGlassSection>
            
            {/* 4. Specific Services are included in the Services component */}
            
            {/* 5. Project Showcase */}
            <NeoGlassSection className="mb-6">
              <Projects userFirebaseId={user.uid} userNumericId={userData?.id} />
            </NeoGlassSection>
            
            {/* 6. Career Path (Work Experience) */}
            <NeoGlassSection className="mb-6">
              <WorkExperience userFirebaseId={user.uid} userNumericId={userData?.id} />
            </NeoGlassSection>
            
            {/* 7. Academic Background (Education) */}
            <NeoGlassSection className="mb-6">
              <Education userFirebaseId={user.uid} userNumericId={userData?.id} />
            </NeoGlassSection>
            
            {/* Account Actions */}
            <NeoGlassSection className="mb-6">
              <div className="p-4">
                <h3 className="text-lg font-medium text-white mb-4">Account Actions</h3>
                <div className="flex flex-wrap gap-4">
                  <button
                    onClick={() => signOut()}
                    className="neo-glass-button flex items-center gap-1 py-1.5 px-3 whitespace-nowrap"
                  >
                    <i className="fas fa-sign-out-alt"></i>
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </NeoGlassSection>
          </NeoGlassLayout>
        </div>
      </div>
      
      {/* Edit About Me Dialog */}
      <Dialog open={showEditAboutDialog} onOpenChange={setShowEditAboutDialog}>
        <DialogContent className="neo-glass-card border-0 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Edit Professional Summary</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="about" className="text-white">About Me</Label>
              <Textarea
                id="about"
                value={aboutMe || ""}
                onChange={(e) => setAboutMe(e.target.value)}
                placeholder="Write a short professional summary..."
                className="bg-black/80 border-white/20 text-white resize-none h-32"
              />
              <p className="text-xs text-white/60">
                Share your professional background, expertise, and what motivates you. 
                This helps others understand your career focus.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button 
              onClick={() => setShowEditAboutDialog(false)}
              variant="outline"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmitAboutMe}
              className="bg-white text-black hover:bg-white/90"
              disabled={updateAboutMeMutation.isPending}
            >
              {updateAboutMeMutation.isPending ? 
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : 
                "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Looking For Dialog */}
      <Dialog open={showLookingForDialog} onOpenChange={setShowLookingForDialog}>
        <DialogContent className="neo-glass-card border-0 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">What are you looking for?</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="lookingFor" className="text-white">I am looking for</Label>
              <Select
                value={selectedLookingFor || ""}
                onValueChange={setSelectedLookingFor}
              >
                <SelectTrigger className="bg-black/80 border-white/20 text-white">
                  <SelectValue placeholder="Select what you're looking for" />
                </SelectTrigger>
                <SelectContent className="bg-black/90 border-white/20 text-white max-h-80">
                  <SelectGroup>
                    <SelectLabel className="text-white/60">Career & Job Seeking</SelectLabel>
                    {LOOKING_FOR_CATEGORIES.slice(0, 6).map(category => (
                      <SelectItem key={category.value} value={category.value} className="text-white hover:bg-white/10">
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                  
                  <SelectSeparator className="bg-white/10" />
                  
                  <SelectGroup>
                    <SelectLabel className="text-white/60">Business & Investment</SelectLabel>
                    {LOOKING_FOR_CATEGORIES.slice(6, 12).map(category => (
                      <SelectItem key={category.value} value={category.value} className="text-white hover:bg-white/10">
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                  
                  <SelectSeparator className="bg-white/10" />
                  
                  <SelectGroup>
                    <SelectLabel className="text-white/60">Learning & Networking</SelectLabel>
                    {LOOKING_FOR_CATEGORIES.slice(12, 17).map(category => (
                      <SelectItem key={category.value} value={category.value} className="text-white hover:bg-white/10">
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                  
                  <SelectSeparator className="bg-white/10" />
                  
                  <SelectGroup>
                    <SelectLabel className="text-white/60">Freelance & Side Hustle</SelectLabel>
                    {LOOKING_FOR_CATEGORIES.slice(17).map(category => (
                      <SelectItem key={category.value} value={category.value} className="text-white hover:bg-white/10">
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <p className="text-xs text-white/60">
                This helps others understand what you're seeking and improves matching for networking opportunities.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button 
              onClick={() => setShowLookingForDialog(false)}
              variant="outline"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmitLookingFor}
              className="bg-white text-black hover:bg-white/90"
              disabled={updateLookingForMutation.isPending}
            >
              {updateLookingForMutation.isPending ? 
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : 
                "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Industry and Domain Dialog */}
      <Dialog open={showIndustryDialog} onOpenChange={setShowIndustryDialog}>
        <DialogContent className="neo-glass-card border-0 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Industry & Domain</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="industry" className="text-white">Industry</Label>
              <Select 
                value={industryValue || ""}
                onValueChange={(value) => {
                  setIndustryValue(value);
                  // Reset domain when industry changes
                  setDomainValue(null);
                }}
              >
                <SelectTrigger className="bg-black/80 border-white/20 text-white">
                  <SelectValue placeholder="Select your industry" />
                </SelectTrigger>
                <SelectContent className="bg-black/90 border-white/20 text-white">
                  {INDUSTRIES.map(industry => (
                    <SelectItem key={industry} value={industry} className="text-white hover:bg-white/10">
                      {industry}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {industryValue && INDUSTRY_DOMAINS[industryValue] && (
              <div className="space-y-2">
                <Label htmlFor="domain" className="text-white">Domain</Label>
                <Select 
                  value={domainValue || ""}
                  onValueChange={setDomainValue}
                >
                  <SelectTrigger className="bg-black/80 border-white/20 text-white">
                    <SelectValue placeholder="Select your domain" />
                  </SelectTrigger>
                  <SelectContent className="bg-black/90 border-white/20 text-white">
                    {INDUSTRY_DOMAINS[industryValue].map(domain => (
                      <SelectItem key={domain} value={domain} className="text-white hover:bg-white/10">
                        {domain}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-white/60">
                  Specify your area of specialization within your industry.
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button 
              onClick={() => setShowIndustryDialog(false)}
              variant="outline"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmitIndustryPreferences}
              className="bg-white text-black hover:bg-white/90"
              disabled={updateIndustryMutation.isPending}
            >
              {updateIndustryMutation.isPending ? 
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : 
                "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Personal Info Dialog */}
      <Dialog open={showEditPersonalInfoDialog} onOpenChange={setShowEditPersonalInfoDialog}>
        <DialogContent className="bg-zinc-900/90 border border-white/10 shadow-xl max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white text-xl">Edit Personal Information</DialogTitle>
            <p className="text-white/70 text-sm mt-1">
              Update your profile details
            </p>
          </DialogHeader>
          
          {isUserDataLoading && (
            <div className="flex items-center justify-center p-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
          )}
          
          {!isUserDataLoading && (
            <div className="w-full space-y-4 mt-4 px-1">
              {/* Name */}
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium text-white flex items-center gap-2">
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                    <path d="M7.5 0.875C5.49797 0.875 3.875 2.49797 3.875 4.5C3.875 6.15288 4.98124 7.54738 6.49373 7.96351C5.2997 8.24035 4.27557 8.89088 3.51333 9.77542C2.62779 10.8034 2.12516 12.0768 2.07552 13.3824C2.07142 13.458 2.07982 13.5342 2.10036 13.6069C2.12091 13.6796 2.15317 13.7472 2.19555 13.8059C2.23793 13.8646 2.28963 13.9134 2.34798 13.9495C2.40634 13.9857 2.47048 14.0084 2.53679 14.0165C2.60309 14.0247 2.67071 14.0181 2.73483 13.9971C2.79895 13.9761 2.85773 13.9412 2.90828 13.8941C2.95883 13.8469 3.00012 13.79 3.03011 13.7267C3.06011 13.6634 3.07826 13.5949 3.0842 13.5251C3.138 12.0492 3.69078 10.9225 4.54571 10.1229C5.39452 9.32964 6.53176 8.9375 7.5 8.9375C8.46824 8.9375 9.60548 9.32964 10.4543 10.1229C11.3092 10.9225 11.862 12.0492 11.9158 13.5251C11.9232 13.6389 11.967 13.7437 12.0403 13.825C12.1137 13.9062 12.2131 13.9588 12.3222 13.9739C12.4313 13.989 12.5429 13.9652 12.636 13.9072C12.7292 13.8493 12.7978 13.761 12.829 13.6559C12.8603 13.5509 12.8525 13.4369 12.8068 13.3371C12.7612 13.2373 12.6799 13.1582 12.5778 13.1144C12.4756 13.0706 12.3598 13.0651 12.2534 13.0991C12.2255 13.108 12.198 13.1185 12.1709 13.1305C12.1179 12.0798 11.6782 10.9328 10.8849 10.0336C10.1592 9.20742 9.18834 8.61863 8.12832 8.41365C9.30031 7.84017 10.125 6.30183 10.125 4.5C10.125 2.49797 8.50203 0.875 6.5 0.875H7.5Z" fill="currentColor" />
                  </svg>
                  Full Name
                </label>
                <Input
                  id="name"
                  defaultValue={userData?.name || ""}
                  placeholder="Your full name"
                  className="bg-black/20 border-white/20 text-white"
                />
              </div>
              
              {/* Email (read-only) */}
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-white flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </label>
                <Input
                  id="email"
                  defaultValue={userData?.email || ""}
                  disabled
                  readOnly
                  className="bg-black/30 border-white/10 text-white/70"
                />
                <p className="text-xs text-white/50">Email cannot be changed</p>
              </div>
              
              {/* Phone Number */}
              <div className="space-y-2">
                <label htmlFor="phoneNumber" className="text-sm font-medium text-white flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Phone Number
                </label>
                <Input
                  id="phoneNumber"
                  defaultValue={userData?.phoneNumber || ""}
                  placeholder="Your phone number"
                  className="bg-black/20 border-white/20 text-white"
                />
              </div>
              
              {/* Job Title */}
              <div className="space-y-2">
                <label htmlFor="jobTitle" className="text-sm font-medium text-white flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  Job Title
                </label>
                <Input
                  id="jobTitle"
                  defaultValue={userData?.title || ""}
                  placeholder="Your professional title (e.g. Senior Developer)"
                  className="bg-black/20 border-white/20 text-white"
                />
              </div>
              
              {/* Location */}
              <div className="space-y-2">
                <label htmlFor="location" className="text-sm font-medium text-white flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Location
                </label>
                <Input
                  id="location"
                  defaultValue={userData?.location || ""}
                  placeholder="Your location (e.g. San Francisco, CA)"
                  className="bg-black/20 border-white/20 text-white"
                />
              </div>
            
              {/* Industry */}
              <div className="space-y-2">
                <label htmlFor="industry" className="text-sm font-medium text-white flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  Industry
                </label>
                <Select defaultValue={userData?.industry || ""}>
                  <SelectTrigger id="industry" className="bg-black/20 border-white/20 text-white">
                    <SelectValue placeholder="Select your industry" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-white/20 text-white">
                    {INDUSTRIES.map((ind) => (
                      <SelectItem key={ind} value={ind}>{ind}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            
              {/* Domain/Specialty */}
              <div className="space-y-2">
                <label htmlFor="domain" className="text-sm font-medium text-white flex items-center gap-2">
                  <Book className="h-4 w-4" />
                  Domain/Specialty
                </label>
                <Select defaultValue={userData?.domain || ""}>
                  <SelectTrigger id="domain" className="bg-black/20 border-white/20 text-white">
                    <SelectValue placeholder="Select your domain" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-white/20 text-white">
                    {["Software Development", "Data Science", "Design", "Marketing", "Sales", "Customer Service", "Human Resources", "Finance", "Operations", "Research", "Product Management", "Other"].map((dom) => (
                      <SelectItem key={dom} value={dom}>{dom}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* About Me */}
              <div className="space-y-2">
                <label htmlFor="aboutMe" className="text-sm font-medium text-white flex items-center gap-2">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                  </svg>
                  About Me
                </label>
                <Textarea
                  id="aboutMe"
                  defaultValue={userData?.aboutMe || ""}
                  placeholder="Write a brief introduction about yourself"
                  rows={4}
                  className="bg-black/20 border-white/20 text-white"
                />
              </div>
            
              {/* Looking For */}
              <div className="space-y-2">
                <label htmlFor="lookingFor" className="text-sm font-medium text-white flex items-center gap-2">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 20v-8m0 0V4m0 8h8m-8 0H4"></path>
                  </svg>
                  Looking For
                </label>
                <Textarea
                  id="lookingFor"
                  defaultValue={userData?.lookingFor || ""}
                  placeholder="What are you looking for professionally? (e.g. collaborations, new opportunities, etc.)"
                  rows={3}
                  className="bg-black/20 border-white/20 text-white"
                />
              </div>
              
              {/* Profile URL (read-only) */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-white flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Profile URL
                </label>
                <div className="text-sm border rounded-md p-2 bg-black/20 border-white/10 text-white/80">
                  brandentifier.com/@{userData?.name ? userData.name.replace(/\s+/g, '') : userData?.username}
                </div>
                <p className="text-xs text-white/50">
                  Your profile URL is based on your name and cannot be changed
                </p>
              </div>
              
              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowEditPersonalInfoDialog(false)}
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={() => {
                    setShowEditPersonalInfoDialog(false);
                    queryClient.invalidateQueries({ queryKey: ['/api/users', user.uid] });
                    toast({
                      title: "Personal information updated",
                      description: "Your profile information has been updated successfully.",
                    });
                  }}
                  className="bg-white text-black hover:bg-white/90"
                >
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      {/* Add Profile Picture Dialog component */}
      <ProfilePictureDialog 
        userId={user.uid}
        open={showProfilePictureDialog}
        onOpenChange={closeProfilePictureDialog}
        currentPhotoURL={profilePictureUrl}
        onSave={updateProfilePicture}
      />
    </div>
  );
}