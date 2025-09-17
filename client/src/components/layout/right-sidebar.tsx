import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import SkillBar from "@/components/common/skill-bar";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";
import { Skill } from "@shared/schema";
import { calculateOverallProfileCompletion } from "@/lib/profile-utils";
import NowboardPanelSimple from "@/components/nowboard/nowboard-panel-simple";

export default function RightSidebar() {
  const { user, isDemoMode } = useAuth();
  
  // Get the JWT user ID for API queries
  const userId = isDemoMode ? 1 : user?.id;
  
  // Use TanStack Query to fetch and cache user data
  const { data: userData } = useQuery({
    queryKey: [`/api/users/${userId}`],
    queryFn: async () => {
      if (!userId) return null;
      
      console.log(`RightSidebar: Fetching user data with JWT ID: ${userId}`);
      const response = await apiRequest('GET', `/api/users/${userId}`);
      
      if (response.status === 404) {
        console.error(`User with ID ${userId} not found in backend`);
        return null;
      }
      
      const data = await response.json();
      console.log("RightSidebar: Fetched user data:", data);
      return data;
    },
    enabled: !!userId, // Only run query if userId exists
    staleTime: 10000 // Consider data fresh for 10 seconds
  });
  
  // Use the same JWT user ID for all API calls
  const userNumericId = userId;

  // Determine which photo URL to use (prioritize userData if available)
  const photoURL = userData?.photoURL || user?.photoURL;
  const displayName = userData?.name || user?.name || 'User';
  const userTitle = userData?.title || '';

  // Fetch user's skills to check if any exist
  const { data: skills = [] } = useQuery<Skill[]>({
    queryKey: [`/api/users/${userNumericId}/skills`],
    queryFn: async () => {
      if (!userNumericId) return [];
      const response = await apiRequest('GET', `/api/users/${userNumericId}/skills`);
      return await response.json();
    },
    enabled: !!userNumericId
  });

  // Fetch user experiences
  const { data: experiences = [] } = useQuery({
    queryKey: [`/api/users/${userNumericId}/experiences`],
    queryFn: async () => {
      if (!userNumericId) return [];
      // Use the numeric user ID for the experiences API
      const response = await apiRequest('GET', `/api/users/${userNumericId}/experiences`);
      console.log(`RightSidebar: Fetching experiences with numeric userId: ${userNumericId}`);
      return await response.json();
    },
    enabled: !!userNumericId
  });
  
  // Fetch user education
  const { data: educations = [] } = useQuery({
    queryKey: [`/api/users/${userNumericId}/educations`],
    queryFn: async () => {
      if (!userNumericId) return [];
      const response = await apiRequest('GET', `/api/users/${userNumericId}/educations`);
      return await response.json();
    },
    enabled: !!userNumericId
  });
  
  // Fetch user projects
  const { data: projects = [] } = useQuery({
    queryKey: [`/api/users/${userNumericId}/projects`],
    queryFn: async () => {
      if (!userNumericId) return [];
      const response = await apiRequest('GET', `/api/users/${userNumericId}/projects`);
      return await response.json();
    },
    enabled: !!userNumericId
  });
  
  // Fetch user services
  const { data: services = [] } = useQuery({
    queryKey: [`/api/users/${userNumericId}/services`],
    queryFn: async () => {
      if (!userNumericId) return [];
      const response = await apiRequest('GET', `/api/users/${userNumericId}/services`);
      return await response.json();
    },
    enabled: !!userNumericId
  });
  
  // Calculate profile completion percentage
  const profileCompletionPercentage = calculateOverallProfileCompletion(
    userData,
    experiences,
    educations,
    skills,
    projects,
    services
  );

  // Debug log the calculated percentage value
  console.log("Profile completion percentage:", profileCompletionPercentage);
  console.log("User data being used for calculation:", {
    name: userData?.name,
    photoURL: userData?.photoURL ? "exists" : "missing",
    title: userData?.title,
    location: userData?.location,
    industry: userData?.industry,
    lookingFor: userData?.lookingFor
  });

  const hasSkills = skills && skills.length > 0;
  const isProfileComplete = userData?.profileCompleted === true;
  
  return (
    <div className="bg-white w-full lg:w-80 border-l border-gray-200 p-0 overflow-y-auto flex flex-col h-full">
      {/* Mobile-responsive layout: hide profile section on small screens */}
      <div className="hidden lg:block p-5 border-b border-gray-200">
        <div className="mb-6">
          <div className="flex items-center">
            <div className="h-12 w-12 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
              <img 
                className="h-full w-full object-cover" 
                src={photoURL || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"} 
                alt="User profile"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80";
                }}
              />
            </div>
            <div className="ml-3">
              <h2 className="text-base font-medium text-gray-900">{displayName}</h2>
              {userTitle && <p className="text-sm text-gray-500">{userTitle}</p>}
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-200 pt-4 mb-6">
          <h3 className="text-sm font-medium text-primary mb-3">Profile Completion</h3>
          <div className="flex items-center">
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div className="bg-primary h-2 rounded-full" style={{ width: `${profileCompletionPercentage}%` }}></div>
            </div>
            <span className="ml-3 text-sm font-medium text-gray-900">{profileCompletionPercentage}/100</span>
          </div>
          <p className="mt-2 text-xs text-gray-500">
            Complete your profile to improve your visibility to recruiters and clients.
          </p>
        </div>
      
        {/* Skills section - show regardless of profile completion status */}
        {hasSkills ? (
          <div className="border-t border-gray-200 pt-4 mb-6">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Skill Development</h3>
            <div className="space-y-3">
              {skills?.slice(0, 3).map((skill: Skill, index: number) => (
                <SkillBar 
                  key={skill.id} 
                  name={skill.name} 
                  level={skill.level || 'Beginner'} 
                  percentage={skill.proficiency || 0}
                  color={skill.level === 'Advanced' ? 'green' : skill.level === 'Intermediate' ? 'yellow' : 'red'}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="border-t border-gray-200 pt-4 mb-6">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Skill Development</h3>
            <div className="flex flex-col items-center justify-center py-2 text-center text-gray-500">
              <p className="text-xs">Add skills to your profile to showcase your expertise</p>
            </div>
          </div>
        )}
        
        {isProfileComplete && (
          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Notifications</h3>
            <div className="flex flex-col items-center justify-center py-4 text-center text-gray-500">
              <p className="text-xs">No notifications yet</p>
            </div>
          </div>
        )}
      </div>
      
      {/* Nowboard Section - Always visible and mobile responsive */}
      <div className="flex-1 p-0">
        <NowboardPanelSimple />
      </div>
    </div>
  );
}
