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
import { queryClient, apiRequest } from "@/lib/queryClient";
import { calculateOverallProfileCompletion } from "@/lib/profile-utils";
import { useState, useEffect } from "react";
import { Camera, FileText, Edit, Loader2, FolderIcon } from "lucide-react";
import PersonalInfoIcon from "@/components/icons/personal-info-icon";
import { useProfilePicture } from "@/hooks/use-profile-picture";
import { ProfilePictureDialog } from "@/components/profile/profile-picture-dialog";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
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
  const { profilePictureUrl, isUploading, openProfilePictureDialog, uploadProgress } = useProfilePicture(user.uid);
  
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
                    onClick={() => setLocation('/career-capsule')}
                    className="neo-glass-button flex items-center gap-1 py-1.5 px-3 whitespace-nowrap"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Career Capsule</span>
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
                    
                    <div className="text-center mt-4">
                      <h2 className="text-xl font-bold text-white">{userData?.name}</h2>
                      <p className="text-white/80 text-sm">{userData?.title || "Add your job title"}</p>
                      <p className="text-white/60 text-xs mt-1">{userData?.location || "Add your location"}</p>
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
    </div>
  );
}