import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import SkillBar from "@/components/common/skill-bar";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";
import { Skill } from "@shared/schema";

export default function RightSidebar() {
  const { user, isDemoMode } = useAuth();
  
  // Get the user ID for queries
  const userId = isDemoMode ? 1 : user?.uid;
  
  // Use TanStack Query to fetch and cache user data
  const { data: userData } = useQuery({
    queryKey: [`/api/users/${userId}`],
    queryFn: async () => {
      if (!userId) return null;
      
      console.log(`RightSidebar: Fetching user data with ID: ${userId}`);
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

  // Determine which photo URL to use (prioritize userData if available)
  const photoURL = userData?.photoURL || user?.photoURL;
  const displayName = userData?.name || user?.name || 'User';
  const userTitle = userData?.title || '';

  // Fetch user's skills to check if any exist
  const { data: skills } = useQuery<Skill[]>({
    queryKey: [`/api/users/${userId}/skills`],
    queryFn: async () => {
      if (!userId) return [];
      const response = await apiRequest('GET', `/api/users/${userId}/skills`);
      return await response.json();
    },
    enabled: !!userId
  });

  const hasSkills = skills && skills.length > 0;
  const isProfileComplete = userData?.profileCompleted === true;
  
  return (
    <div className="bg-white w-80 border-l border-gray-200 p-5 overflow-y-auto">
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
      
      {!isProfileComplete && (
        <div className="border-t border-gray-200 pt-4 mb-6">
          <h3 className="text-sm font-medium text-primary mb-3">Complete Your Profile</h3>
          <p className="text-xs text-gray-500">
            To get the most out of Brandentifier, complete your profile with your professional information.
          </p>
        </div>
      )}
      
      {isProfileComplete && (
        <>
          <div className="border-t border-gray-200 pt-4 mb-6">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Resume Score</h3>
            <div className="flex items-center">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: '72%' }}></div>
              </div>
              <span className="ml-3 text-sm font-medium text-gray-900">72/100</span>
            </div>
            <p className="mt-2 text-xs text-gray-500">Your resume outperforms 65% of professionals in your field.</p>
          </div>
          
          {hasSkills && (
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
          )}

          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Notifications</h3>
            <div className="flex flex-col items-center justify-center py-4 text-center text-gray-500">
              <p className="text-xs">No notifications yet</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
