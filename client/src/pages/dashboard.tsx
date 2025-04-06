import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import RightSidebar from "@/components/layout/right-sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ProfileCompletion from "@/components/common/profile-completion";
import { calculateOverallProfileCompletion } from "@/lib/profile-utils";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function Dashboard() {
  const { user, isAuthenticated, isLoading, isDemoMode } = useAuth();
  const [_, setLocation] = useLocation();
  
  // Get the user ID for queries
  const userId = isDemoMode ? 1 : user?.uid;
  
  // Use TanStack Query to fetch user data
  const { data: userData } = useQuery({
    queryKey: [`/api/users/${userId}`],
    queryFn: async () => {
      if (!userId) return null;
      const response = await apiRequest('GET', `/api/users/${userId}`);
      if (response.status === 404) return null;
      return await response.json();
    },
    enabled: !!userId
  });
  
  // Fetch user experiences
  const { data: experiences = [] } = useQuery({
    queryKey: [`/api/users/${userId}/experiences`],
    queryFn: async () => {
      if (!userId) return [];
      const response = await apiRequest('GET', `/api/users/${userId}/experiences`);
      return await response.json();
    },
    enabled: !!userId
  });
  
  // Fetch user education
  const { data: educations = [] } = useQuery({
    queryKey: [`/api/users/${userId}/educations`],
    queryFn: async () => {
      if (!userId) return [];
      const response = await apiRequest('GET', `/api/users/${userId}/educations`);
      return await response.json();
    },
    enabled: !!userId
  });
  
  // Fetch user skills
  const { data: skills = [] } = useQuery({
    queryKey: [`/api/users/${userId}/skills`],
    queryFn: async () => {
      if (!userId) return [];
      const response = await apiRequest('GET', `/api/users/${userId}/skills`);
      return await response.json();
    },
    enabled: !!userId
  });
  
  // Fetch user projects
  const { data: projects = [] } = useQuery({
    queryKey: [`/api/users/${userId}/projects`],
    queryFn: async () => {
      if (!userId) return [];
      const response = await apiRequest('GET', `/api/users/${userId}/projects`);
      return await response.json();
    },
    enabled: !!userId
  });
  
  // Calculate profile completion percentage
  const profileCompletionPercentage = calculateOverallProfileCompletion(
    userData,
    experiences,
    educations,
    skills,
    projects
  );

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
      <div className="flex-1 flex overflow-hidden pt-16"> {/* Added padding-top (pt-16) to account for fixed header */}
        {/* Sidebar */}
        <Sidebar activePage="dashboard" />

        {/* Center content */}
        <div className="flex-1 overflow-auto p-6 bg-gray-50">
          <div className="mx-auto max-w-4xl">
            <h1 className="text-2xl font-semibold text-gray-900 mb-6">Welcome back, {user?.name?.split(' ')[0] || 'User'}!</h1>
            
            {/* Completion Progress */}
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-medium text-gray-900">Profile Completion</h2>
                  <span className="text-sm font-medium text-primary">{profileCompletionPercentage}%</span>
                </div>
                <ProfileCompletion percentage={profileCompletionPercentage} />
                <p className="mt-3 text-sm text-gray-500">Complete your profile to get more accurate job matches and career insights.</p>
                <Button 
                  variant="outline" 
                  className="mt-4 text-primary bg-primary-50 hover:bg-primary-100"
                  onClick={() => setLocation('/profile')}
                >
                  Complete Profile
                </Button>
              </CardContent>
            </Card>
            
            {/* AI Insights */}
            <Card className="mb-6">
              <CardContent className="pt-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">AI Career Insights</h2>
                <div className="space-y-4">
                  <div className="border-l-4 border-primary pl-4 py-2">
                    <p className="text-sm text-gray-600">Based on your profile, you have a strong foundation in data analysis.</p>
                    <p className="text-sm font-medium text-gray-900 mt-1">Consider developing skills in data visualization and advanced SQL to become more competitive.</p>
                  </div>
                  <div className="border-l-4 border-green-500 pl-4 py-2">
                    <p className="text-sm text-gray-600">Industry trends show growing demand for your skills.</p>
                    <p className="text-sm font-medium text-gray-900 mt-1">Financial analysis roles are projected to grow 10% in the next year.</p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  className="mt-4 text-primary bg-primary-50 hover:bg-primary-100"
                  onClick={() => setLocation('/ai-career')}
                >
                  Get Personalized Advice
                </Button>
              </CardContent>
            </Card>
            
            {/* Recent Job Matches */}
            <Card className="mb-6">
              <CardContent className="pt-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Job Matches</h2>
                <div className="divide-y divide-gray-200">
                  <div className="py-4">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="text-base font-medium text-gray-900">Senior Data Analyst</h3>
                        <p className="text-sm text-gray-500">TechCorp Inc. • New York, NY</p>
                      </div>
                      <div className="flex items-center">
                        <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
                          95% Match
                        </Badge>
                      </div>
                    </div>
                    <p className="mt-2 text-sm text-gray-600 line-clamp-2">Seeking an experienced data analyst with strong SQL skills and experience with visualization tools like Tableau.</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">SQL</Badge>
                      <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">Tableau</Badge>
                      <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">Data Analysis</Badge>
                    </div>
                  </div>
                  <div className="py-4">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="text-base font-medium text-gray-900">Business Intelligence Analyst</h3>
                        <p className="text-sm text-gray-500">Global Finance • Remote</p>
                      </div>
                      <div className="flex items-center">
                        <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
                          88% Match
                        </Badge>
                      </div>
                    </div>
                    <p className="mt-2 text-sm text-gray-600 line-clamp-2">Looking for a BI professional to help build dashboards and generate actionable insights from financial data.</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">Power BI</Badge>
                      <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">Financial Analysis</Badge>
                    </div>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  className="mt-4 text-primary bg-primary-50 hover:bg-primary-100"
                >
                  View All Job Matches
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right sidebar */}
        <RightSidebar />
      </div>
    </div>
  );
}
