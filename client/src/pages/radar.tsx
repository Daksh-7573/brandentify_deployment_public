import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'wouter';
import { UserData } from '@/types/user';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth';
import DashboardLayout from "@/components/layout/dashboard-layout";
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
}

// Type definition for useQuery userData result
interface UserDataResult extends UserData {
  id: number;
  geoLatitude?: number | null;
  geoLongitude?: number | null;
  geoVisibleNearby?: boolean | null;
  geoLastUpdated?: string | Date | null;
}

// Placeholder component for when location access is still pending
const LocationPending = () => (
  <div className="flex flex-col items-center justify-center py-10 space-y-4">
    <div className="rounded-full bg-amber-100 p-3">
      <MapPin className="h-8 w-8 text-amber-600" />
    </div>
    <h3 className="text-xl font-medium">Location Access Required</h3>
    <p className="text-gray-500 text-center max-w-md">
      Smart Radar needs access to your location to find nearby professionals.
      Please allow location access when prompted.
    </p>
    <Button variant="outline" onClick={() => window.location.reload()}>
      <RefreshCw className="mr-2 h-4 w-4" />
      Retry
    </Button>
  </div>
);

// Placeholder component for when no nearby users are found
const NoNearbyUsers = () => (
  <div className="flex flex-col items-center justify-center py-10 space-y-4">
    <div className="rounded-full bg-gray-100 p-3">
      <Users className="h-8 w-8 text-gray-500" />
    </div>
    <h3 className="text-xl font-medium">No Professionals Nearby</h3>
    <p className="text-gray-500 text-center max-w-md">
      We couldn't find any professionals in your area right now. 
      Try expanding your search radius or checking back later.
    </p>
  </div>
);

// User card component
const UserCard = ({ user, onClick }: { user: NearbyUser, onClick: () => void }) => (
  <Card className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow" onClick={onClick}>
    <CardContent className="p-4">
      <div className="flex items-center space-x-4">
        <Avatar className="h-12 w-12 border">
          <AvatarImage src={user.photoURL || undefined} alt={user.name || 'User'} />
          <AvatarFallback>{user.name?.charAt(0) || 'U'}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold truncate">{user.name || 'Anonymous User'}</h4>
          {user.title && (
            <p className="text-xs text-gray-500 truncate">{user.title}</p>
          )}
          {user.company && (
            <p className="text-xs text-gray-500 truncate">{user.company}</p>
          )}
        </div>
        <div className="text-right">
          <Badge variant="outline" className="flex items-center space-x-1 text-xs">
            <MapPin className="h-3 w-3" />
            <span>{user.distance.toFixed(1)} km</span>
          </Badge>
        </div>
      </div>
    </CardContent>
  </Card>
);

// Loading skeleton for user cards
const UserCardSkeleton = () => (
  <Card>
    <CardContent className="p-4">
      <div className="flex items-center space-x-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
        <Skeleton className="h-6 w-12" />
      </div>
    </CardContent>
  </Card>
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
    distance: 0.8
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
    distance: 1.3
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
    distance: 2.6
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
    distance: 3.1
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
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();
  
  // Get current user data
  const { data: userData } = useQuery<UserDataResult>({
    queryKey: ['/api/users', currentUser?.uid],
    enabled: !!currentUser?.uid,
  });
  
  // This is our demo data state
  const [nearbyUsersData, setNearbyUsersData] = useState<NearbyUser[]>(DEMO_NEARBY_USERS);
  
  // Query to get nearby users
  const { 
    isLoading: isLoadingNearby,
    refetch: refetchNearby,
    data: nearbyUsersResult
  } = useQuery({
    queryKey: ['/api/nearby-users', coordinates, radius, userData?.id],
    queryFn: async () => {
      if (!coordinates) return [];
      
      // Use real API endpoint with geolocation parameters
      const params = new URLSearchParams({
        latitude: coordinates.lat.toString(),
        longitude: coordinates.lng.toString(),
        radius: radius
      });
      
      // Add userId if available
      if (userData && 'id' in userData && userData.id) {
        params.append('userId', userData.id.toString());
      }
      
      const response = await fetch(`/api/nearby-users?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch nearby users');
      }
      return await response.json();
    },
    // Fallback to demo data when in development or demo mode
    enabled: !!coordinates && locationStatus === 'granted',
    // Don't auto-refetch too often since geolocation doesn't change that much
    refetchInterval: 5 * 60 * 1000 // 5 minutes
  });
  
  // Update nearby users data when the query result changes
  useEffect(() => {
    if (nearbyUsersResult) {
      // If we got results, use them; otherwise fall back to demo data in development
      if (nearbyUsersResult.length > 0) {
        setNearbyUsersData(nearbyUsersResult);
      } else if (process.env.NODE_ENV === 'development' || !userData) {
        // Fall back to demo data only in development or when not logged in
        setNearbyUsersData(DEMO_NEARBY_USERS);
      } else {
        // In production with no results, show empty state
        setNearbyUsersData([]);
      }
    }
  }, [nearbyUsersResult, userData]);
  
  // Mutation to update user's geo-visibility
  const updateVisibilityMutation = useMutation({
    mutationFn: async (visible: boolean) => {
      if (!userData || !('id' in userData) || !userData.id) {
        throw new Error('User not logged in');
      }
      
      const response = await apiRequest(`/api/users/${userData.id}/radar-visibility`, 'POST', {
        userId: userData.id,
        visible: visible
      });
      
      if (!response.ok) {
        throw new Error('Failed to update visibility');
      }
      
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: `You are now ${visibleInRadar ? 'visible' : 'hidden'} in Smart Radar`,
        description: visibleInRadar 
          ? "Other professionals can now discover you based on your location." 
          : "You won't appear in other users' nearby professionals list.",
      });
      
      // Invalidate the user data query to refresh the visibility state
      queryClient.invalidateQueries({ queryKey: ['/api/users', currentUser?.uid] });
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
      if (!userData || !('id' in userData) || !userData.id) {
        throw new Error('User not logged in');
      }
      
      const response = await apiRequest(`/api/users/${userData.id}/geolocation`, 'POST', {
        userId: userData.id,
        latitude: coords.lat,
        longitude: coords.lng,
        geoVisibleNearby: visibleInRadar
      });
      
      if (!response.ok) {
        throw new Error('Failed to update location');
      }
      
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Location updated",
        description: "Your location has been updated successfully.",
      });
      
      // Refresh the nearby users after updating location
      refetchNearby();
      
      // Invalidate the user data query to get the updated location
      queryClient.invalidateQueries({ queryKey: ['/api/users', currentUser?.uid] });
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
    // Trigger a refetch with the new radius
    refetchNearby();
  };
  
  // Handle user card click
  const handleUserCardClick = (user: NearbyUser) => {
    setSelectedUser(user);
    setCardOpen(true);
  };
  
  // Get the user's current location
  const getUserLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      setLocationStatus('denied');
      return;
    }
    
    // Show loading state
    const geoLoading = toast({
      title: "Getting your location...",
      description: "Please wait while we access your location.",
    });
    
    navigator.geolocation.getCurrentPosition(
      // Success callback
      (position) => {
        const { latitude, longitude } = position.coords;
        // Update UI with the current location
        setCoordinates({ lat: latitude, lng: longitude });
        setLocationStatus('granted');
        setLocationError(null);
        
        // Update toast to success
        toast({
          title: "Location detected",
          description: `Your location has been detected at coordinates: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
        });
        
        // Update the server with the new coordinates if user is logged in
        if (userData?.id) {
          updateGeoLocationMutation.mutate({ lat: latitude, lng: longitude });
        }
      },
      // Error callback
      (error) => {
        console.error("Error getting location", error);
        // Set appropriate error message based on the error code
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError("You denied the request for geolocation");
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError("Location information is unavailable");
            break;
          case error.TIMEOUT:
            setLocationError("The request to get your location timed out");
            break;
          default:
            setLocationError("An unknown error occurred while getting your location");
        }
        setLocationStatus('denied');
        
        // Update toast to error
        toast({
          title: "Location error",
          description: "Failed to get your location. Please check your browser permissions.",
          variant: "destructive"
        });
      },
      // Options
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };
  
  // Handle manual location refresh
  const handleRefreshLocation = () => {
    getUserLocation();
  };
  
  // Initialize geolocation on component mount
  useEffect(() => {
    // Get real geolocation if supported
    if (navigator.geolocation) {
      // Try to get user's location
      getUserLocation();
    } else {
      // Fallback to demo coordinates if geolocation not supported
      setLocationStatus('denied');
      setLocationError("Geolocation is not supported by your browser");
      // Use demo coordinates as fallback
      setCoordinates({
        lat: 37.7749,  // San Francisco coordinates
        lng: -122.4194
      });
    }
    
    // Set visibility status based on user data if available
    if (userData) {
      setVisibleInRadar(userData.geoVisibleNearby !== false);
    }
  }, [userData]);
  
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
      industry: null,
      lookingFor: null,
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
    <DashboardLayout hideRightSidebar={true}>
      <div className="container max-w-5xl mx-auto py-8 px-4">
        <PageTitle>Smart Radar</PageTitle>
        
        {/* Location error alert */}
        {locationError && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Location Error</AlertTitle>
            <AlertDescription>{locationError}</AlertDescription>
          </Alert>
        )}
        
        {/* Settings card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="mr-2 h-5 w-5" />
              <span>Smart Radar Settings</span>
            </CardTitle>
            <CardDescription>
              Connect with professionals near your current location.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="visible">Show me in nearby list</Label>
                    <p className="text-xs text-gray-500">
                      Other professionals can discover your profile based on proximity
                    </p>
                  </div>
                  <Switch
                    id="visible"
                    checked={visibleInRadar}
                    onCheckedChange={handleVisibilityToggle}
                    disabled={updateVisibilityMutation.isPending}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="radius">Search radius</Label>
                  <Select value={radius} onValueChange={handleRadiusChange}>
                    <SelectTrigger id="radius">
                      <SelectValue placeholder="Select radius" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 km</SelectItem>
                      <SelectItem value="5">5 km</SelectItem>
                      <SelectItem value="10">10 km</SelectItem>
                      <SelectItem value="25">25 km</SelectItem>
                      <SelectItem value="50">50 km</SelectItem>
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
          </CardContent>
        </Card>
        
        {/* Nearby users section */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Nearby Professionals</h2>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => refetchNearby()}
              disabled={isLoadingNearby}
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
              ) : nearbyUsersData && nearbyUsersData.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {nearbyUsersData.map((user: NearbyUser) => (
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
    </DashboardLayout>
  );
};

export default Radar;