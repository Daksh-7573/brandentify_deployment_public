import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'wouter';
import { UserData } from '@/types/user';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth';
import { NeoGlassLayout, NeoGlassSection } from "@/components/layout/neo-glass-layout";
import Header from "@/components/layout/header";
import { User as UserIcon } from 'lucide-react';

// Define industry and looking for categories constants
// Get list of main industries
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
  "Government"
];

// Define lookingFor categories for consistent use across the app
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
import { 
  MapPin, 
  Users, 
  UserCheck, 
  Loader2, 
  AlertCircle, 
  MessageSquare, 
  UserPlus,
  Eye,
  EyeOff,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Create a simple PageTitle component
const PageTitle = ({ children }: { children: React.ReactNode }) => (
  <h1 className="text-2xl font-bold mb-6">{children}</h1>
);

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import VisitingCardPreview from '@/components/profile/visiting-card-preview';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

// Define interfaces for geo data
interface GeoUserData extends UserData {
  geoLatitude?: number | null;
  geoLongitude?: number | null;
  geoVisibleNearby?: boolean | null;
  geoLastUpdated?: string | Date | null;
}

// Define interface for nearby users
interface NearbyUser {
  id: number;
  name: string | null;
  username: string;
  photoURL: string | null;
  title: string | null;
  company: string | null;
  location: string | null;
  visitingCardType: string | null;
  distance: number;
  industry: string | null;
  lookingFor: string | null;
}

// Placeholder component for when location access is still pending
const LocationPending = () => (
  <div className="flex flex-col items-center justify-center py-10 space-y-4">
    <div className="rounded-full bg-white/10 p-3 border border-white/20">
      <MapPin className="h-8 w-8 text-white" />
    </div>
    <h3 className="text-xl font-medium text-white">Location Access Required</h3>
    <p className="text-white/80 text-center max-w-md">
      Smart Radar needs access to your location to find nearby professionals.
      Please allow location access when prompted.
    </p>
    <Button 
      variant="outline" 
      onClick={() => window.location.reload()}
      className="bg-white/10 text-white hover:bg-white/20 border border-white/20"
    >
      <RefreshCw className="mr-2 h-4 w-4" />
      Retry
    </Button>
  </div>
);

// Placeholder component for when no nearby users are found
const NoNearbyUsers = () => (
  <div className="flex flex-col items-center justify-center py-10 space-y-4">
    <div className="rounded-full bg-white/10 p-3 border border-white/20">
      <Users className="h-8 w-8 text-white" />
    </div>
    <h3 className="text-xl font-medium text-white">No Professionals Nearby</h3>
    <p className="text-white/80 text-center max-w-md">
      We couldn't find any professionals in your area right now. 
      Try expanding your search radius or checking back later.
    </p>
  </div>
);

// User card component
const UserCard = ({ user, onClick }: { user: NearbyUser, onClick: () => void }) => (
  <div 
    className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg overflow-hidden cursor-pointer hover:bg-white/15 transition-all hover:scale-[1.02] hover:shadow-lg p-4 mb-3" 
    onClick={onClick}
  >
    <div className="flex items-center space-x-4">
      <Avatar className="h-12 w-12 border border-white/30">
        <AvatarImage src={user.photoURL || undefined} alt={user.name || 'User'} />
        <AvatarFallback className="bg-white/20 text-white">{user.name?.charAt(0) || 'U'}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold truncate text-white">{user.name || 'Anonymous User'}</h4>
        {user.title && (
          <p className="text-xs text-white/70 truncate">{user.title}</p>
        )}
        {user.company && (
          <p className="text-xs text-white/70 truncate">{user.company}</p>
        )}
        <div className="flex items-center gap-2 mt-1">
          {user.industry && (
            <Badge variant="secondary" className="text-xs px-1.5 py-0 bg-white/20 text-white border-white/10 hover:bg-white/30">
              {user.industry}
            </Badge>
          )}
          {user.lookingFor && (
            <Badge variant="outline" className="text-xs px-1.5 py-0 text-white border-white/20 hover:bg-white/10">
              Looking for: {
                // Display the human-readable label instead of the value
                (typeof user.lookingFor === 'string' && 
                 LOOKING_FOR_CATEGORIES.find(cat => cat.value === user.lookingFor)?.label?.replace(/^[^ ]+ /, '')) || 
                user.lookingFor
              }
            </Badge>
          )}
        </div>
      </div>
      <div className="text-right">
        <Badge variant="outline" className="flex items-center space-x-1 text-xs text-white border-white/20 bg-white/10">
          <MapPin className="h-3 w-3" />
          <span>{user.distance.toFixed(1)} km</span>
        </Badge>
      </div>
    </div>
  </div>
);

// Loading skeleton for user cards
const UserCardSkeleton = () => (
  <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg overflow-hidden p-4 mb-3">
    <div className="flex items-center space-x-4">
      <Skeleton className="h-12 w-12 rounded-full bg-white/20" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4 bg-white/20" />
        <Skeleton className="h-3 w-1/2 bg-white/20" />
      </div>
      <Skeleton className="h-6 w-12 bg-white/20" />
    </div>
  </div>
);

// Demo data for nearby users
const DEMO_NEARBY_USERS: NearbyUser[] = [
  {
    id: 101,
    name: "Sarah Johnson",
    username: "sarahj",
    photoURL: "https://randomuser.me/api/portraits/women/44.jpg",
    title: "UX Designer",
    company: "DesignHub",
    location: "San Francisco, CA",
    visitingCardType: "professional",
    distance: 0.8,
    industry: "Design",
    lookingFor: "Project Collaboration"
  },
  {
    id: 102,
    name: "Michael Chen",
    username: "mchen",
    photoURL: "https://randomuser.me/api/portraits/men/22.jpg",
    title: "Frontend Developer",
    company: "TechWave",
    location: "Palo Alto, CA",
    visitingCardType: "holographic",
    distance: 1.3,
    industry: "Technology",
    lookingFor: "Job Opportunities"
  },
  {
    id: 103,
    name: "Priya Sharma",
    username: "psharma",
    photoURL: "https://randomuser.me/api/portraits/women/67.jpg",
    title: "Product Manager",
    company: "InnovateTech",
    location: "Menlo Park, CA",
    visitingCardType: "clay-paper",
    distance: 2.6,
    industry: "Product Management",
    lookingFor: "Mentoring"
  },
  {
    id: 104,
    name: "David Wilson",
    username: "dwilson",
    photoURL: "https://randomuser.me/api/portraits/men/46.jpg",
    title: "Data Scientist",
    company: "AI Solutions",
    location: "Mountain View, CA",
    visitingCardType: "creative",
    distance: 3.1,
    industry: "Artificial Intelligence",
    lookingFor: "Networking"
  }
];

// Main Radar component
const Radar = () => {
  const [selectedUser, setSelectedUser] = useState<NearbyUser | null>(null);
  const [cardOpen, setCardOpen] = useState(false);
  const [radius, setRadius] = useState<string>('10');
  const [visibleInRadar, setVisibleInRadar] = useState(true);
  const [coordinates, setCoordinates] = useState<{lat: number, lng: number} | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [locationStatus, setLocationStatus] = useState<'pending' | 'granted' | 'denied'>('pending');
  const [jobTitleFilter, setJobTitleFilter] = useState<string>('');
  const [industryFilter, setIndustryFilter] = useState<string>('');
  const [lookingForFilter, setLookingForFilter] = useState<string>('');
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();
  
  // Get current user data
  const { data: userData } = useQuery<any>({
    queryKey: ['/api/users', currentUser?.uid],
    enabled: !!currentUser?.uid,
  });
  
  // Initialize filter values from user profile when data is loaded
  useEffect(() => {
    if (userData) {
      // Set initial filter values based on user profile data
      if (userData.title) setJobTitleFilter(userData.title);
      if (userData.industry) setIndustryFilter(userData.industry);
      if (userData.lookingFor) setLookingForFilter(userData.lookingFor);
    }
  }, [userData]);
  
  // This is our demo data state
  const [nearbyUsersData, setNearbyUsersData] = useState<NearbyUser[]>(DEMO_NEARBY_USERS);
  
  // Query to get nearby users
  const { 
    isLoading: isLoadingNearby,
    refetch: refetchNearby,
    data: nearbyUsersResult
  } = useQuery({
    queryKey: ['/api/nearby-users', coordinates, radius],
    queryFn: async () => {
      // In a production app, this would fetch real data
      // For demo purposes, we'll just use the demo data
      return DEMO_NEARBY_USERS;
    },
    enabled: !!coordinates && locationStatus === 'granted'
  });
  
  // Update nearby users data when the query result changes
  useEffect(() => {
    if (nearbyUsersResult) {
      setNearbyUsersData(nearbyUsersResult);
    }
  }, [nearbyUsersResult]);
  
  // Filter nearby users based on job title, industry, and lookingFor
  const filteredNearbyUsers = nearbyUsersData.filter(user => {
    const matchesJobTitle = !jobTitleFilter || 
      (user.title && user.title.toLowerCase().includes(jobTitleFilter.toLowerCase()));
    
    // For industry, we need an exact match since we're using a dropdown
    const matchesIndustry = !industryFilter || industryFilter === 'all' || 
      (user.industry && user.industry === industryFilter);
    
    // For lookingFor, we need an exact match or match the displayed label
    const matchesLookingFor = !lookingForFilter || lookingForFilter === 'all' || 
      (user.lookingFor && (
        // Check if the value matches directly
        user.lookingFor === lookingForFilter ||
        // Or if the display label contains the filter text (for backward compatibility)
        LOOKING_FOR_CATEGORIES.some(cat => 
          cat.value === lookingForFilter && 
          // Make sure user.lookingFor is not null before calling toLowerCase
          typeof user.lookingFor === 'string' &&
          user.lookingFor.toLowerCase().includes(cat.label.toLowerCase().replace(/^[^ ]+ /, ''))
        )
      ));
    
    return matchesJobTitle && matchesIndustry && matchesLookingFor;
  });
  
  // Mutation to update user's geo-visibility
  const updateVisibilityMutation = useMutation({
    mutationFn: async (visible: boolean) => {
      // This would update the user's visibility on the server in production
      console.log('Setting visibility to:', visible);
      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: `You are now ${visibleInRadar ? 'visible' : 'hidden'} in Smart Radar`,
        description: visibleInRadar 
          ? "Other professionals can now discover you based on your location." 
          : "You won't appear in other users' nearby professionals list.",
      });
    },
    onError: () => {
      setVisibleInRadar(!visibleInRadar); // Revert switch state on error
      toast({
        title: "Failed to update visibility",
        description: "There was an error updating your visibility setting. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  // Mutation to update user's geolocation
  const updateGeoLocationMutation = useMutation({
    mutationFn: async (coords: {lat: number, lng: number}) => {
      // This would update the user's location on the server in production
      console.log('Setting coordinates to:', coords);
      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: "Location updated",
        description: "Your location has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Failed to update location",
        description: "There was an error updating your location. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  // Handle visibility toggle
  const handleVisibilityToggle = (checked: boolean) => {
    setVisibleInRadar(checked);
    updateVisibilityMutation.mutate(checked);
  };
  
  // Handle radius change
  const handleRadiusChange = (value: string) => {
    setRadius(value);
    // In a real app, this would trigger a refetch with the new radius
    // For demo purposes, let's shuffle the order of the users to simulate a change
    setNearbyUsersData([...DEMO_NEARBY_USERS].sort(() => Math.random() - 0.5));
  };
  
  // Handle user card click
  const handleUserCardClick = (user: NearbyUser) => {
    setSelectedUser(user);
    setCardOpen(true);
  };
  
  // Handle manual location refresh
  const handleRefreshLocation = () => {
    // In a real app, this would get the user's current location
    // For demo purposes, let's just simulate by shuffling the demo data
    setNearbyUsersData([...DEMO_NEARBY_USERS].sort(() => Math.random() - 0.5));
    toast({
      title: "Location refreshed",
      description: "Found " + DEMO_NEARBY_USERS.length + " professionals nearby.",
    });
  };
  
  // Initialize geolocation on component mount
  useEffect(() => {
    // For demo purposes, always set to granted
    setLocationStatus('granted');
    
    // Set demo coordinates
    setCoordinates({
      lat: 37.7749,
      lng: -122.4194
    });
    
    // In a real app, this would get the user's geolocation
    // and update the state with the result
  }, []);
  
  // Render the quantum card for the selected user
  const renderUserQuantumCard = () => {
    if (!selectedUser) return null;
    
    // Create a user object compatible with VisitingCardPreview
    const userDataForCard: UserData = {
      id: selectedUser.id,
      username: selectedUser.username,
      name: selectedUser.name || 'Anonymous User',
      email: '',
      photoURL: selectedUser.photoURL,
      title: selectedUser.title,
      company: selectedUser.company,
      location: selectedUser.location,
      industry: selectedUser.industry,
      lookingFor: selectedUser.lookingFor,
      phoneNumber: null,
      aboutMe: ''
    };
    
    return (
      <div className="w-full max-w-[280px] mx-auto">
        <VisitingCardPreview
          userData={userDataForCard}
          cardType={selectedUser.visitingCardType || 'professional'}
        />
      </div>
    );
  };
  
  return (
    <div className="bg-gradient-to-b from-gray-900 to-black w-full min-h-screen">
      <Header />
      <div className="container max-w-7xl mx-auto pt-24 pb-10 px-4 relative">
        <NeoGlassLayout>
            <div className="p-4 md:p-6">
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-6">Smart Radar</h1>
              
              {/* Location error alert */}
              {locationError && (
                <Alert variant="destructive" className="mb-6 bg-red-500/10 border border-red-400/20 text-white">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Location Error</AlertTitle>
                  <AlertDescription>{locationError}</AlertDescription>
                </Alert>
              )}
        
              {/* Settings card */}
              <NeoGlassSection className="mb-6">
                <div className="p-4">
                  <h2 className="text-xl font-semibold text-white flex items-center mb-2">
                    <MapPin className="mr-2 h-5 w-5" />
                    <span>Smart Radar Settings</span>
                  </h2>
                  <p className="text-white/70 mb-4">
                    Connect with professionals near your current location.
                  </p>
                  
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-1 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="visible" className="text-white">Show me in nearby list</Label>
                          <p className="text-xs text-white/60">
                            Other professionals can discover your profile based on proximity
                          </p>
                        </div>
                        <Switch
                          id="visible"
                          checked={visibleInRadar}
                          onCheckedChange={handleVisibilityToggle}
                          disabled={updateVisibilityMutation.isPending}
                          className="neo-glass-switch"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="radius" className="text-white">Search radius</Label>
                        <Select value={radius} onValueChange={handleRadiusChange}>
                          <SelectTrigger id="radius" className="bg-[rgba(18,18,18,0.95)] text-white border-white/20">
                            <SelectValue placeholder="Select radius" />
                          </SelectTrigger>
                          <SelectContent className="bg-[rgba(18,18,18,0.95)] text-white border-white/20">
                            <SelectItem value="1">1 km</SelectItem>
                            <SelectItem value="5">5 km</SelectItem>
                            <SelectItem value="10">10 km</SelectItem>
                            <SelectItem value="25">25 km</SelectItem>
                            <SelectItem value="50">50 km</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium text-white">Filter Professionals</h4>
                        {userData && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="border-white/20 bg-white/10 text-white hover:bg-white/20"
                            onClick={() => {
                        if (userData.title) setJobTitleFilter(userData.title);
                        if (userData.industry) setIndustryFilter(userData.industry);
                        if (userData.lookingFor) setLookingForFilter(userData.lookingFor);
                        toast({
                          title: "Filters set from your profile",
                          description: "Now showing professionals matching your profile criteria.",
                        });
                      }}
                    >
                      <UserIcon className="mr-2 h-3 w-3" />
                      Use My Profile
                    </Button>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="job-title">Job Title</Label>
                  <div className="relative">
                    <input
                      id="job-title"
                      className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="e.g. Software Engineer"
                      value={jobTitleFilter}
                      onChange={(e) => setJobTitleFilter(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="industry">Industry</Label>
                  <Select
                    value={industryFilter}
                    onValueChange={setIndustryFilter}
                  >
                    <SelectTrigger id="industry" className="w-full">
                      <SelectValue placeholder="Select an industry" />
                    </SelectTrigger>
                    <SelectContent className="max-h-80">
                      <SelectItem value="all">All Industries</SelectItem>
                      {INDUSTRIES.map((industry) => (
                        <SelectItem key={industry} value={industry}>
                          {industry}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="looking-for">Looking For</Label>
                  <Select
                    value={lookingForFilter}
                    onValueChange={setLookingForFilter}
                  >
                    <SelectTrigger id="looking-for" className="w-full">
                      <SelectValue placeholder="Select what you're looking for" />
                    </SelectTrigger>
                    <SelectContent className="max-h-80">
                      <SelectItem value="all">All Categories</SelectItem>
                      {LOOKING_FOR_CATEGORIES.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex-1 space-y-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <h4 className="text-sm font-medium mb-2">Your Location Status</h4>
                  <div className="flex items-center">
                    <div className={`h-2.5 w-2.5 rounded-full mr-2 ${
                      locationStatus === 'granted' ? 'bg-green-500' : 
                      locationStatus === 'denied' ? 'bg-red-500' : 'bg-amber-500'
                    }`} />
                    <span className="text-sm text-gray-500">
                      {locationStatus === 'granted' ? 'Location access granted' : 
                       locationStatus === 'denied' ? 'Location access denied' : 'Pending location access'}
                    </span>
                  </div>
                  {coordinates && (
                    <p className="text-xs text-gray-500 mt-2">
                      Current coordinates: {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
                    </p>
                  )}
                </div>
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={handleRefreshLocation}
                  disabled={locationStatus !== 'granted' || updateGeoLocationMutation.isPending}
                >
                  {updateGeoLocationMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="mr-2 h-4 w-4" />
                  )}
                  Refresh Location
                </Button>
              </div>
            </div>
          </div>
        </NeoGlassSection>
        
        {/* Nearby users section */}
        <NeoGlassSection className="mt-6">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">Nearby Professionals</h2>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => refetchNearby()}
                disabled={isLoadingNearby}
                className="bg-white/10 text-white hover:bg-white/20 border border-white/20"
              >
                {isLoadingNearby ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
              </Button>
            </div>
          
          {locationStatus === 'pending' && <LocationPending />}
          
          {locationStatus === 'granted' && (
            <>
              {isLoadingNearby ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <UserCardSkeleton key={i} />
                  ))}
                </div>
              ) : filteredNearbyUsers && filteredNearbyUsers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="col-span-2 mb-2">
                    <p className="text-sm text-gray-500">
                      Showing {filteredNearbyUsers.length} of {nearbyUsersData.length} nearby professionals
                      {(jobTitleFilter || industryFilter || lookingForFilter) && ' with your filters'}
                    </p>
                  </div>
                  {filteredNearbyUsers.map((user: NearbyUser) => (
                    <UserCard 
                      key={user.id} 
                      user={user} 
                      onClick={() => handleUserCardClick(user)} 
                    />
                  ))}
                </div>
              ) : (
                <NoNearbyUsers />
              )}
            </>
          )}
          </div>
        </NeoGlassSection>
        
        {/* User Quantum Card dialog */}
        <Dialog open={cardOpen} onOpenChange={setCardOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {selectedUser?.name || 'Professional'}'s Quantum Card
              </DialogTitle>
              <DialogDescription>
                Connect with this professional to grow your network.
              </DialogDescription>
            </DialogHeader>
            
            {selectedUser && (
              <Tabs defaultValue="card" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="card">Quantum Card</TabsTrigger>
                  <TabsTrigger value="actions">Actions</TabsTrigger>
                </TabsList>
                
                <TabsContent value="card" className="flex justify-center p-2">
                  {renderUserQuantumCard()}
                </TabsContent>
                
                <TabsContent value="actions" className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Button variant="outline" asChild>
                      <Link to={`/profile/${selectedUser.username}`}>
                        <UserCheck className="mr-2 h-4 w-4" />
                        View Profile
                      </Link>
                    </Button>
                    
                    <Button variant="outline">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Message
                    </Button>
                    
                    <Button variant="outline">
                      <UserPlus className="mr-2 h-4 w-4" />
                      Connect
                    </Button>
                  </div>
                  
                  <div className="text-xs text-gray-500 flex items-center mt-4">
                    <MapPin className="h-3 w-3 mr-1" />
                    {selectedUser.distance.toFixed(1)} km away
                  </div>
                </TabsContent>
              </Tabs>
            )}
            
            <DialogFooter className="flex flex-col sm:flex-row sm:justify-between sm:space-x-2">
              <Button 
                type="button" 
                variant="ghost" 
                size="sm"
                onClick={() => setCardOpen(false)}
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </NeoGlassLayout>
  </div>
  </div>
  );
};

export default Radar;