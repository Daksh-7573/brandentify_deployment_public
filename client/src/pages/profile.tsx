import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import WorkExperience from "@/components/profile/work-experience";
import Education from "@/components/profile/education";
import Skills from "@/components/profile/skills";
import ResumeUpload from "@/components/profile/resume-upload";

export default function Profile() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [_, setLocation] = useLocation();

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
              <CardContent className="relative">
                <div className="absolute -top-16 left-6">
                  <img 
                    className="h-24 w-24 rounded-full ring-4 ring-white" 
                    src={user?.photoURL || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"} 
                    alt="User profile"
                  />
                </div>
                <div className="mt-8">
                  <h2 className="text-xl font-bold text-gray-900">{user?.name || 'User'}</h2>
                  <p className="text-sm text-gray-500">Data Analyst at TechCorp Inc.</p>
                  <p className="text-sm text-gray-500 mt-1">New York, NY</p>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">Data Analysis</Badge>
                  <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">SQL</Badge>
                  <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">Python</Badge>
                  <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">Excel</Badge>
                  <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">Data Visualization</Badge>
                </div>
              </CardContent>
            </Card>
            
            {/* Resume Upload */}
            <ResumeUpload />
            
            {/* Work Experience */}
            <WorkExperience />
            
            {/* Education */}
            <Education />
            
            {/* Skills */}
            <Skills />
            
            {/* Save Button */}
            <div className="flex justify-end mb-6">
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
