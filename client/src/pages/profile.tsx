import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import WorkExperience from "@/components/profile/work-experience-new";
import Education from "@/components/profile/education-new";
import Skills from "@/components/profile/skills";
import ResumeUpload from "@/components/profile/resume-upload";
import LinkedInImport from "@/components/profile/linkedin-import";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useState, useEffect } from "react";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function Profile() {
  const { user, isAuthenticated, isLoading, isDemoMode } = useAuth();
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  
  // State for edit dialogs
  const [showEditBasicInfo, setShowEditBasicInfo] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    location: ''
  });
  
  // Get user ID (use demo ID if in demo mode)
  const userId = isDemoMode ? 1 : (user?.uid ? parseInt(user.uid) : 1);
  
  // Also fetch current user data for the profile
  const { data: userData, isLoading: isLoadingUser } = useQuery<any>({
    queryKey: [`/api/users/${userId}`],
    enabled: !!userId && isAuthenticated,
    staleTime: 1000, // Consider data stale after 1 second to force refresh
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  // Fetch user skills for the badges
  const { data: skills = [], isLoading: isLoadingSkills } = useQuery<any[]>({
    queryKey: [`/api/users/${userId}/skills`],
    enabled: !!userId && isAuthenticated,
    staleTime: 1000, // Consider data stale after 1 second to force refresh
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
  
  // Mutation for updating user basic info
  const updateUserMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest('PUT', `/api/users/${userId}`, data);
      return await res.json();
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}`] });
      toast({
        title: "Profile updated",
        description: "Your profile information has been updated successfully",
      });
      setShowEditBasicInfo(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error updating profile",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // List of popular cities for location suggestions
  const popularLocations = [
    "New York, NY, USA",
    "San Francisco, CA, USA",
    "Los Angeles, CA, USA",
    "Chicago, IL, USA",
    "Seattle, WA, USA",
    "Austin, TX, USA",
    "Boston, MA, USA",
    "Denver, CO, USA",
    "Atlanta, GA, USA",
    "Portland, OR, USA",
    "Washington, DC, USA",
    "San Diego, CA, USA",
    "Miami, FL, USA",
    "Dallas, TX, USA",
    "Houston, TX, USA",
    "Phoenix, AZ, USA",
    "London, UK",
    "Toronto, Canada",
    "Vancouver, Canada",
    "Sydney, Australia",
    "Berlin, Germany",
    "Paris, France",
    "Amsterdam, Netherlands",
    "Tokyo, Japan",
    "Singapore",
    "Hong Kong",
    "Dublin, Ireland",
    "Stockholm, Sweden",
    "Zurich, Switzerland",
    "Mumbai, India",
    "Bangalore, India",
  ];
  
  // State for location suggestions
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([]);
  
  // Initialize form data when user data changes
  useEffect(() => {
    if (userData) {
      setFormData({
        name: userData.name || '',
        title: userData.title || '',
        location: userData.location || ''
      });
    }
  }, [userData]);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Handle location suggestions
    if (name === 'location' && value.trim()) {
      // Filter locations that match the input value
      const inputValue = value.toLowerCase();
      const filtered = popularLocations.filter(location => 
        location.toLowerCase().includes(inputValue)
      );
      setLocationSuggestions(filtered.slice(0, 5)); // Limit to 5 suggestions
    } else if (name === 'location' && !value.trim()) {
      setLocationSuggestions([]);
    }
  };
  
  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion: string) => {
    setFormData(prev => ({
      ...prev,
      location: suggestion
    }));
    setLocationSuggestions([]);
  };
  
  // Reset suggestions when dialog closes
  useEffect(() => {
    if (!showEditBasicInfo) {
      setLocationSuggestions([]);
    }
  }, [showEditBasicInfo]);
  
  // Event handler for location suggestion div to prevent bubbling
  const handleSuggestionClick = (event: React.MouseEvent) => {
    // Prevent event bubbling to keep dropdown open until selection
    event.stopPropagation();
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserMutation.mutate(formData);
  };

  // Redirect to landing if not authenticated
  if (!isLoading && !isAuthenticated) {
    setLocation('/');
    return null;
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Edit Basic Info Dialog */}
      <Dialog open={showEditBasicInfo} onOpenChange={setShowEditBasicInfo}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Profile Info</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Your name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="title">Job Title</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Your job title"
                />
              </div>
              <div className="grid gap-2 relative">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="Your location"
                  autoComplete="off"
                />
                {locationSuggestions.length > 0 && (
                  <div 
                    className="absolute top-full left-0 right-0 z-10 bg-white border border-gray-200 rounded-md shadow-md mt-1 max-h-60 overflow-auto"
                    onClick={handleSuggestionClick}
                  >
                    {locationSuggestions.map((suggestion, index) => (
                      <div 
                        key={index}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => handleSuggestionSelect(suggestion)}
                      >
                        {suggestion}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowEditBasicInfo(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={updateUserMutation.isPending}
              >
                {updateUserMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Top Navigation */}
      <Header />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar activePage="profile" />

        {/* Center content */}
        <div className="flex-1 overflow-auto p-6 bg-gray-50">
          <div className="mx-auto max-w-3xl">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-semibold text-gray-900">Profile</h1>
              <div className="text-right">
                <p className="text-sm text-gray-500">Profile Completion</p>
                <div className="flex items-center mt-1">
                  <div className="w-36 bg-gray-200 rounded-full h-2.5 mr-2">
                    <div id="profile-completion-bar" className="bg-primary h-2.5 rounded-full" style={{ width: '65%' }}></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">65%</span>
                </div>
              </div>
            </div>
            
            {/* Profile Header */}
            <Card className="mb-6 overflow-hidden">
              <div className="h-32 bg-gradient-to-r from-primary to-purple-600"></div>
              <CardContent className="relative pt-16 pb-4">
                <div className="absolute -top-16 left-1/2 sm:left-6 transform -translate-x-1/2 sm:translate-x-0">
                  <div className="h-24 w-24 overflow-hidden rounded-full bg-white ring-4 ring-white flex items-center justify-center">
                    <img 
                      className="h-full w-full object-cover" 
                      src={user?.photoURL || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"} 
                      alt="User profile"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80";
                      }}
                    />
                  </div>
                </div>
                <div className="pl-0 sm:pl-32 mt-12 sm:mt-2">
                  <div className="flex justify-between items-center group">
                    <h2 className="text-xl font-bold text-gray-900">{userData?.name || user?.name || 'User'}</h2>
                    <button 
                      onClick={() => setShowEditBasicInfo(true)}
                      className="text-sm text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      Edit
                    </button>
                  </div>
                  <p className="text-sm text-gray-500">{userData?.title || user?.title || 'Professional'}</p>
                  <p className="text-sm text-gray-500 mt-1">{userData?.location || user?.location || 'Location not specified'}</p>
                </div>
                <div className="mt-4 pl-0 md:pl-32 flex flex-wrap gap-2">
                  {isLoadingSkills ? (
                    <p className="text-sm text-gray-500">Loading skills...</p>
                  ) : skills && skills.length > 0 ? (
                    skills.map((skill: any) => (
                      <Badge 
                        key={skill.id} 
                        variant="outline" 
                        className="bg-blue-100 text-blue-800 hover:bg-blue-100"
                      >
                        {skill.name}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No skills added yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* Profile Import Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="md:col-span-1">
                <ResumeUpload />
              </div>
              <div className="md:col-span-1">
                <LinkedInImport />
              </div>
            </div>
            
            {/* Work Experience */}
            <WorkExperience />
            
            {/* Education */}
            <Education />
            
            {/* Skills */}
            <Skills />
            
            {/* Action Buttons */}
            <div className="flex justify-between mb-6">
              <Button 
                variant="outline" 
                className="px-6"
                onClick={() => {
                  // Invalidate all queries to force fresh refetches
                  console.log("Manual refresh triggered");
                  
                  // Refresh all profile data queries
                  queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/experiences`] });
                  queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/educations`] });
                  queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/skills`] });
                  queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}`] });
                  
                  // Show toast notification
                  window.alert("Profile data refreshed. If you still don't see your updated profile data, please try uploading your resume or LinkedIn profile again.");
                }}
              >
                <i className="fas fa-sync-alt mr-2"></i>
                Refresh Data
              </Button>
              
              <Button className="px-6">
                Save Profile
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
