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
import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";

export default function Profile() {
  const { user, isAuthenticated, isLoading, isDemoMode } = useAuth();
  const [_, setLocation] = useLocation();
  
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
                  <h2 className="text-xl font-bold text-gray-900">{userData?.name || user?.name || 'User'}</h2>
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
