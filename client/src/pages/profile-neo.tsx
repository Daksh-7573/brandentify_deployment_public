import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import Header from "@/components/layout/header";
import backgroundImage from "@assets/Brandentifier Landing_1751376023002.png";
import { Button } from "@/components/ui/button";
import WorkExperience from "@/components/profile/work-experience";
import Education from "@/components/profile/education";
import Skills from "@/components/profile/skills";
import ProjectsFixed from "@/components/profile/projects-fixed";
import Services from "@/components/profile/services-fixed";
import PersonalInfoSection from "@/components/profile/personal-info-section";
import EditPersonalInfoNew from "@/components/profile/edit-personal-info-new";
import MuskButton from "@/components/musk/musk-button";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, AlertCircle } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { calculateOverallProfileCompletion } from "@/lib/profile-utils";
import { useState, useEffect } from "react";
import { Camera, FileText, Edit, Loader2, FolderIcon, Mail, Phone, Globe, Briefcase, MapPin, Book, Building, User2, CreditCard } from "lucide-react";
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
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

import { NeoGlassLayout, NeoGlassSection } from "@/components/layout/neo-glass-layout";
import AppShell from "@/components/layout/app-shell";
import { SkillsListSkeleton, EducationItemSkeleton, ExperienceItemSkeleton, ProfileCardSkeleton } from "@/components/ui/skeleton-components";
import { PremiumBadge } from "@/components/ui/premium-badge";
import { ProfileDataProvider } from "@/contexts/profile-data-context";

// Define "I am looking for" categories - matching the form constants with icons
const LOOKING_FOR_CATEGORIES = [
  { value: "job_opportunities", label: "Job Opportunities", icon: "💼" },
  { value: "networking", label: "Networking", icon: "🤝" },
  { value: "mentorship", label: "Mentorship", icon: "🎯" },
  { value: "collaboration", label: "Collaboration", icon: "👥" },
  { value: "investment", label: "Investment", icon: "💰" },
  { value: "learning", label: "Learning", icon: "📚" },
  { value: "career_advice", label: "Career Advice", icon: "💡" },
  { value: "business_partnerships", label: "Business Partnerships", icon: "🚀" }
];

import { INDUSTRY_DOMAINS, INDUSTRIES } from '@shared/constants';

export default function ProfileNeo() {
  const { user, isAuthenticated, isLoading, signOut } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // ALL STATE HOOKS MUST BE DECLARED BEFORE ANY EARLY RETURNS
  const [showEditPersonalInfoDialog, setShowEditPersonalInfoDialog] = useState(false);
  const [dialogKey, setDialogKey] = useState(0);
  const [showLookingForDialog, setShowLookingForDialog] = useState(false);
  const [selectedLookingFor, setSelectedLookingFor] = useState<string | null>(null);
  const [industryValue, setIndustryValue] = useState<string | null>(null);
  const [domainValue, setDomainValue] = useState<string | null>(null);
  const [showIndustryDialog, setShowIndustryDialog] = useState(false);
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  
  // Get the correct user identifier for API calls
  const userIdentifier = user?.id?.toString() || localStorage.getItem('userId') || user?.username || user?.uid || '';

  // ALL QUERY/MUTATION HOOKS MUST BE DECLARED BEFORE ANY EARLY RETURNS
  const { data: userData, isLoading: isUserDataLoading, error: userDataError } = useQuery({
    queryKey: ['/api/users', userIdentifier],
    queryFn: async () => {
      if (!userIdentifier) throw new Error('No user identifier available');
      const response = await fetch(`/api/users/${userIdentifier}`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        credentials: 'include',
      });
      if (!response.ok) throw new Error(`Failed to fetch user data: ${response.status}`);
      return response.json();
    },
    enabled: !!userIdentifier,
    staleTime: 1000 * 60 * 60,
  });

  const { data: userPreferences } = useQuery({
    queryKey: ['/api/user-preferences', userIdentifier],
    enabled: !!userIdentifier && !!userData,
  });

  const { isUploading, uploadProgress, updateProfilePicture } = useProfilePicture(userIdentifier);

  const updateLookingForMutation = useMutation({
    mutationFn: async (lookingFor: string | null) => {
      const res = await apiRequest("PATCH", `/api/users/${userIdentifier}`, { lookingFor });
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Looking for updated", description: "Your preference has been updated." });
      setShowLookingForDialog(false);
      queryClient.setQueryData(['/api/users', userIdentifier], (oldData: any) => 
        oldData ? { ...oldData, lookingFor: selectedLookingFor } : oldData
      );
    },
    onError: () => {
      toast({ title: "Update failed", description: "Something went wrong.", variant: "destructive" });
    }
  });

  const updateIndustryMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("PATCH", `/api/users/${userIdentifier}`, {
        industry: industryValue,
        domain: domainValue
      });
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Industry preferences updated", description: "Your preferences have been updated." });
      setShowIndustryDialog(false);
      queryClient.setQueryData(['/api/users', userIdentifier], (oldData: any) => 
        oldData ? { ...oldData, industry: industryValue, domain: domainValue } : oldData
      );
    },
    onError: () => {
      toast({ title: "Update failed", description: "Something went wrong.", variant: "destructive" });
    }
  });

  // ALL EFFECTS MUST BE DECLARED BEFORE ANY EARLY RETURNS
  useEffect(() => {
    if (showEditPersonalInfoDialog) {
      setDialogKey(prev => prev + 1);
    }
  }, [showEditPersonalInfoDialog]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation('/auth');
    }
  }, [isAuthenticated, isLoading, setLocation]);

  useEffect(() => {
    if (userData) {
      setSelectedLookingFor(userData.lookingFor);
      setIndustryValue(userData.industry);
      setDomainValue(userData.domain);
    }
  }, [userData]);

  // NOW we can have early returns after all hooks are declared
  if (isLoading || isUserDataLoading || !userData) {
    return (
      <AppShell>
        <div className="container mx-auto px-4 py-6">
          <ProfileCardSkeleton />
        </div>
      </AppShell>
    );
  }

  // Derived values (not hooks, safe after early return)
  const profilePictureUrl = userData?.photoURL || null;
  const refreshUserData = () => {
    queryClient.refetchQueries({ queryKey: ['/api/users', userIdentifier], exact: true });
  };
  const profileCompletion = calculateOverallProfileCompletion(userData);
  const portfolioDataMissing = !userData?.hasPortfolio;
  const lookingForCategory = LOOKING_FOR_CATEGORIES.find(cat => cat.value === userData?.lookingFor);
  const lookingForLabel = lookingForCategory?.label || "Not specified";
  const lookingForIcon = lookingForCategory?.icon || "";
  
  const handleSubmitLookingFor = () => {
    updateLookingForMutation.mutate(selectedLookingFor);
  };
  
  const handleSubmitIndustryPreferences = () => {
    updateIndustryMutation.mutate();
  };
  
  return (
    <ProfileDataProvider userId={userIdentifier}>
    <div 
      className="flex h-screen flex-col responsive-background"
      style={{ 
        backgroundImage: `url(${backgroundImage})`
      }}
    >
      {/* Glass UI overlay to maintain design consistency */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900/80 via-black/70 to-gray-800/80 backdrop-blur-sm"></div>
      
      <div className="relative z-10 w-full h-full overflow-auto">
        <Header />
        <NeoGlassLayout className="mt-3 mx-3 sm:mx-6">
            {/* Profile Header */}
            <div className="mb-6 sm:mb-8">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Profile</h1>
                  <p className="text-white/80 mt-1 text-sm sm:text-base">
                    Manage your professional information and career details
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row md:flex-row items-start sm:items-center md:items-center gap-2 sm:gap-3 md:gap-4 mt-4 md:mt-0 w-full sm:w-auto">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 md:gap-4 w-full sm:w-auto">
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
                      
                      // Redirect to portfolio builder page
                      setLocation('/portfolio-builder');
                    }}
                    id="portfolio-btn"
                    className="neo-glass-button flex items-center gap-1 py-2 px-3 text-xs sm:text-sm whitespace-nowrap min-h-[40px] flex-1 sm:flex-none justify-center"
                  >
                    <User2 className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>Portfolio</span>
                  </button>
                  {/* Resume button - Hidden temporarily */}
                  {/* <button 
                    onClick={() => setLocation('/resume-builder')}
                    className="neo-glass-button flex items-center gap-1 py-2 px-3 text-xs sm:text-sm whitespace-nowrap min-h-[40px] flex-1 sm:flex-none justify-center"
                  >
                    <FileText className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>Resume</span>
                  </button> */}
                  <button 
                    onClick={() => setLocation('/quantum-card')}
                    className="neo-glass-button flex items-center gap-1 py-2 px-3 text-xs sm:text-sm whitespace-nowrap min-h-[40px] flex-1 sm:flex-none justify-center"
                  >
                    <CreditCard className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>Quantum Card</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Personal Info Section */}
            <NeoGlassSection className="mb-6">
              <div className="p-3 sm:p-4 md:p-6">
                <div className="flex flex-col md:flex-row gap-4 sm:gap-6">
                  {/* Profile Image */}
                  <div className="flex-shrink-0 flex flex-col items-center">
                    <div className="relative group">
                      <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full overflow-hidden border-2 border-white/20 bg-black/30">
                        <img 
                          key={profilePictureUrl || 'fallback'} // Force re-render when URL changes
                          src={profilePictureUrl || "https://api.dicebear.com/7.x/initials/svg?seed=" + userData?.name} 
                          alt={userData?.name || "Profile"} 
                          className="w-full h-full object-cover block"
                          style={{ 
                            display: 'block',
                            visibility: 'visible',
                            opacity: 1,
                            backgroundColor: 'transparent'
                          }}
                          onLoad={(e) => {
                            console.log('[PROFILE PICTURE DEBUG] ✅ Image loaded successfully');
                            console.log('[PROFILE PICTURE DEBUG] Final src:', e.currentTarget.src?.substring(0, 100) + '...');
                            console.log('[PROFILE PICTURE DEBUG] Image source type:', profilePictureUrl?.startsWith('data:') ? 'BASE64' : 'URL');
                            console.log('[PROFILE PICTURE DEBUG] Image size:', profilePictureUrl?.length || 'N/A');
                            console.log('[PROFILE PICTURE DEBUG] Image dimensions:', e.currentTarget.naturalWidth + 'x' + e.currentTarget.naturalHeight);
                          }}
                          onError={(e) => {
                            console.error('[PROFILE PICTURE DEBUG] ❌ Image failed to load, falling back to default');
                            console.error('[PROFILE PICTURE DEBUG] Attempted src:', e.currentTarget.src?.substring(0, 100) + '...');
                            console.error('[PROFILE PICTURE DEBUG] Failed source type:', profilePictureUrl?.startsWith('data:') ? 'BASE64' : 'URL');
                            console.error('[PROFILE PICTURE DEBUG] Failed source length:', profilePictureUrl?.length || 'N/A');
                            // Set fallback image on error
                            e.currentTarget.src = "https://api.dicebear.com/7.x/initials/svg?seed=" + (userData?.name || "User");
                          }}
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
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          console.log("Camera button clicked - opening dialog");
                          setShowProfileDialog(true);
                        }}
                        className="absolute bottom-0 right-0 sm:bottom-1 sm:right-1 p-2 sm:p-3 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm text-white hover:bg-white/20 transition-all cursor-pointer z-10 min-w-[32px] min-h-[32px] flex items-center justify-center"
                        title="Change profile picture"
                      >
                        <Camera className="h-4 w-4 sm:h-5 sm:w-5" />
                      </button>
                    </div>
                    
                    <div className="text-center mt-3 sm:mt-4">
                      <div className="flex items-center justify-center gap-2 flex-wrap">
                        <h2 className="text-lg sm:text-xl font-bold text-white">{userData?.name}</h2>
                      </div>
                      
                      {/* Edit Profile Button */}
                      <button
                        onClick={() => {
                          console.log("Edit Profile Information button clicked!");
                          setShowEditPersonalInfoDialog(true);
                        }}
                        className="mt-3 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm hover:bg-white/20 transition-all duration-300 backdrop-blur-sm flex items-center gap-2 mx-auto"
                      >
                        <Edit className="h-4 w-4" />
                        Edit Profile Information
                      </button>
                      
                      {/* Brand Name & Public URL section removed per user request */}
                    </div>
                  </div>
                  
                  {/* Profile Info & Stats */}
                  <div className="flex-1">
                    <div className="space-y-4">
                      {/* Job Title and Location */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium mb-2 text-white">Job Title</h4>
                          <p className="text-sm text-white/80">
                            {userData?.title && userData?.company 
                              ? `${userData.title} at ${userData.company}`
                              : userData?.title || 'Not specified'}
                          </p>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2 text-white">Location</h4>
                          <p className="text-sm text-white/80">{userData?.location || 'Not specified'}</p>
                        </div>
                      </div>
                      
                      {/* Industry & Domain */}
                      <div>
                        <div className="mb-2">
                          <h3 className="font-medium text-white">Industry & Domain</h3>
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
                        <div className="mb-2">
                          <h3 className="font-medium text-white">I am looking for</h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {userData?.lookingFor ? (
                            <span className="px-2 py-1 text-xs rounded-full bg-white/10 border border-white/20 text-white flex items-center gap-1">
                              <span className="text-sm">{lookingForIcon}</span>
                              {lookingForLabel}
                            </span>
                          ) : (
                            <span className="text-white/60 text-sm">
                              Specify what you're looking for to help others connect with you.
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Tagline / Personal Motto */}
                      <div>
                        <div className="mb-2">
                          <h3 className="font-medium text-white">Tagline / Personal Motto</h3>
                        </div>
                        <p className="text-white/80 text-sm break-all italic">
                          {userData?.tagline ? `"${userData.tagline}"` : 'Not specified'}
                        </p>
                      </div>

                      {/* Vision Statement */}
                      <div>
                        <div className="mb-2">
                          <h3 className="font-medium text-white">Vision Statement</h3>
                        </div>
                        <p className="text-white/80 text-sm break-all">{userData?.visionStatement || 'Not specified'}</p>
                      </div>

                      {/* Mission Statement */}
                      <div>
                        <div className="mb-2">
                          <h3 className="font-medium text-white">Mission Statement</h3>
                        </div>
                        <p className="text-white/80 text-sm break-all">{userData?.missionStatement || 'Not specified'}</p>
                      </div>

                      {/* Core Values */}
                      <div>
                        <div className="mb-2">
                          <h3 className="font-medium text-white">Core Values</h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {userData?.coreValues && userData.coreValues.length > 0 ? (
                            userData.coreValues.map((value: string, index: number) => (
                              <span key={index} className="px-3 py-1 text-xs rounded-full bg-white/10 border border-white/20 text-white">
                                {value}
                              </span>
                            ))
                          ) : (
                            <p className="text-white/80 text-sm">Not specified</p>
                          )}
                        </div>
                      </div>

                      {/* Unique Value Proposition */}
                      <div>
                        <div className="mb-2">
                          <h3 className="font-medium text-white">Unique Value Proposition</h3>
                        </div>
                        <p className="text-white/80 text-sm break-all">{userData?.uniqueValueProposition || 'Not specified'}</p>
                      </div>

                      {/* Primary Audience */}
                      <div>
                        <div className="mb-2">
                          <h3 className="font-medium text-white">Primary Audience</h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {userData?.primaryAudience && userData.primaryAudience.length > 0 ? (
                            userData.primaryAudience.map((audience: string, index: number) => (
                              <span key={index} className="px-3 py-1 text-xs rounded-full bg-white/10 border border-white/20 text-white">
                                {audience}
                              </span>
                            ))
                          ) : (
                            <p className="text-white/80 text-sm">Not specified</p>
                          )}
                        </div>
                      </div>

                      {/* Secondary Audience */}
                      <div>
                        <div className="mb-2">
                          <h3 className="font-medium text-white">Secondary Audience</h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {userData?.secondaryAudience && userData.secondaryAudience.length > 0 ? (
                            userData.secondaryAudience.map((audience: string, index: number) => (
                              <span key={index} className="px-3 py-1 text-xs rounded-full bg-white/10 border border-white/20 text-white">
                                {audience}
                              </span>
                            ))
                          ) : (
                            <p className="text-white/80 text-sm">Not specified</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </NeoGlassSection>
            

            
            {/* Specific Services as a separate section */}
            <Services />
            
            {/* 3. What I'm Good At (Skills) */}
            <NeoGlassSection className="mb-6">
              <Skills />
            </NeoGlassSection>
            
            {/* 4. Specific Services are included in the Services component */}
            
            {/* 5. Project Showcase */}
            <NeoGlassSection className="mb-6">
              <ProjectsFixed />
            </NeoGlassSection>
            
            {/* 6. Career Path (Work Experience) */}
            <NeoGlassSection className="mb-6">
              <WorkExperience />
            </NeoGlassSection>
            
            {/* 7. Academic Background (Education) */}
            <NeoGlassSection className="mb-6">
              <Education />
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
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-transparent border-none shadow-none p-0 m-0">
          {isUserDataLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
          ) : userData ? (
            <EditPersonalInfoNew
              key={`edit-personal-info-${userData.id}-${dialogKey}`}
              userData={{
                id: userData.id || 0,
                username: userData.username || '',
                name: userData.name || '',
                email: userData.email || '',
                phoneNumber: userData.phoneNumber || '',
                title: userData.title || '',
                company: userData.company || '',
                location: userData.location || '',
                industry: userData.industry || '',
                domain: userData.domain || '',
                aboutMe: userData.aboutMe || '',
                lookingFor: userData.lookingFor || '',
                photoURL: userData.photoURL || '',
                tagline: userData.tagline || '',
                visionStatement: userData.visionStatement || '',
                missionStatement: userData.missionStatement || '',
                coreValues: userData.coreValues || [],
                uniqueValueProposition: userData.uniqueValueProposition || '',
                primaryAudience: userData.primaryAudience || [],
                secondaryAudience: userData.secondaryAudience || []
              }}
              userIdentifier={userIdentifier}
              onCancel={() => setShowEditPersonalInfoDialog(false)}
              onSave={async () => {
                console.log("[DEBUG] onSave called from profile dialog");
                // The actual save happens inside EditPersonalInfoNew component
                // We'll close the dialog after save completes successfully
                await new Promise(resolve => setTimeout(resolve, 100)); // Small delay to ensure save completes
                setShowEditPersonalInfoDialog(false);
              }}
            />
          ) : (
            <div className="p-8 text-white text-center space-y-4">
              <AlertCircle className="h-12 w-12 mx-auto text-red-400" />
              <div>
                <h3 className="text-lg font-semibold mb-2">Unable to load user data</h3>
                {userDataError ? (
                  <div className="text-sm text-gray-300 space-y-2">
                    <p>Error: {userDataError.message}</p>
                    <div className="text-xs text-gray-400 bg-gray-800/50 p-3 rounded">
                      <p><strong>Debug Info:</strong></p>
                      <p>User ID: {userIdentifier || 'Not available'}</p>
                      <p>Auth User ID: {user?.id || 'N/A'}</p>
                      <p>Auth Username: {user?.username || 'N/A'}</p>
                      <p>Auth UID: {user?.uid || 'N/A'}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-300">Please try again or contact support if the issue persists.</p>
                )}
              </div>
              <Button 
                variant="outline" 
                onClick={() => {
                  console.log('[RETRY] Manually retrying user data fetch');
                  // Force refetch by invalidating the query
                  queryClient.invalidateQueries({ queryKey: ['/api/users', userIdentifier] });
                }}
                className="mx-auto"
                data-testid="button-retry-user-data"
              >
                Try Again
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
      {/* Add Profile Picture Dialog component */}
      <ProfilePictureDialog 
        userId={userIdentifier}
        open={showProfileDialog}
        onOpenChange={(open) => {
          setShowProfileDialog(open);
          // Don't call refreshUserData here - let the mutation handle cache updates
        }}
        currentPhotoURL={profilePictureUrl}
        onSave={updateProfilePicture}
      />
    </div>
    </ProfileDataProvider>
  );
}