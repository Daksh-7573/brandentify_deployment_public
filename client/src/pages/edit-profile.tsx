import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import ProfileSteps from "@/components/onboarding/profile-steps";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Loader2, ArrowLeft, Save, User, Briefcase, GraduationCap, Lightbulb, BookOpen, BadgeCheck } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";

export default function EditProfilePage() {
  const { user, isAuthenticated, isDemoMode } = useAuth();
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("all about me");
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  
  // Fetch user data
  const { data: userData, isLoading: isLoadingUserData } = useQuery({
    queryKey: ['/api/users', user?.id],
    enabled: !!user?.id && isAuthenticated,
  });
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated && !isDemoMode) {
      setLocation('/login');
    }
  }, [isAuthenticated, isDemoMode, setLocation]);
  
  // Update completion percentage based on user data
  useEffect(() => {
    if (userData) {
      setCompletionPercentage(userData.profileCompleted || 0);
    }
  }, [userData]);
  
  // Handler for when editing is complete
  const handleEditingComplete = () => {
    setIsSaving(true);
    
    // Simulate saving delay for better UX
    setTimeout(() => {
      setIsSaving(false);
      setShowSuccessMessage(true);
      
      toast({
        title: "Profile updated!",
        description: "Your profile has been successfully updated.",
        variant: "default",
      });
      
      // Hide success message after a delay and redirect
      setTimeout(() => {
        setShowSuccessMessage(false);
        setLocation('/profile');
      }, 1500);
    }, 800);
  };
  
  // Handle cancel editing
  const handleCancel = () => {
    if (window.confirm("Are you sure you want to cancel? Any unsaved changes will be lost.")) {
      setLocation('/profile');
    }
  };
  
  // Map tab names to more user-friendly display names
  const tabDisplayNames: Record<string, { label: string, icon: React.ReactNode }> = {
    "all about me": { label: "All About Me", icon: <User className="h-4 w-4 mr-2" /> },
    "what i'm good at": { label: "What I'm Good At", icon: <Lightbulb className="h-4 w-4 mr-2" /> },
    "what i offer": { label: "What I Offer", icon: <BadgeCheck className="h-4 w-4 mr-2" /> },
    "showcase": { label: "Showcase", icon: <BookOpen className="h-4 w-4 mr-2" /> },
    "career path": { label: "Career Path", icon: <Briefcase className="h-4 w-4 mr-2" /> },
    "academic background": { label: "Academic Background", icon: <GraduationCap className="h-4 w-4 mr-2" /> },
    "personal information": { label: "Personal Information", icon: <BadgeCheck className="h-4 w-4 mr-2" /> },
  };
  
  // Tabs order
  const tabOrder = [
    "all about me", 
    "what i'm good at", 
    "what i offer", 
    "showcase", 
    "career path", 
    "academic background", 
    "personal information"
  ];
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Include the standard header */}
      <Header />
      
      <div className="pt-20 pb-6 container max-w-6xl px-4 sm:px-6 lg:px-8 mx-auto">
        {/* Top section with progress indicator */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 space-y-4 md:space-y-0">
          <div>
            <Button 
              variant="ghost" 
              className="mb-2 pl-0 text-gray-600 hover:text-gray-900"
              onClick={() => setLocation('/profile')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Profile
            </Button>
            
            <h1 className="text-3xl font-bold text-gray-900">
              Edit Your Profile
            </h1>
            <p className="text-gray-600 mt-1">
              Enhance your professional presence to attract the right opportunities
            </p>
          </div>
          
          <div className="flex items-center w-full md:w-auto max-w-xs">
            <div className="mr-3 text-sm font-medium text-gray-700 whitespace-nowrap">
              {completionPercentage}% Complete
            </div>
            <div className="w-full md:w-40">
              <Progress value={completionPercentage} className="h-2" />
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left sidebar - tab navigation */}
          <div className="lg:col-span-3">
            <Card className="sticky top-24">
              <CardContent className="p-0">
                <div className="p-4 border-b bg-gray-50">
                  <h3 className="font-medium text-gray-900">Edit Sections</h3>
                </div>
                <ScrollArea className="h-[calc(100vh-240px)] py-2">
                  <div className="space-y-1 p-2">
                    {tabOrder.map((tabId) => (
                      <Button
                        key={tabId}
                        variant={activeTab === tabId ? "default" : "ghost"}
                        size="sm"
                        className={`w-full justify-start ${activeTab === tabId ? "" : "text-gray-700"}`}
                        onClick={() => setActiveTab(tabId)}
                      >
                        {tabDisplayNames[tabId]?.icon}
                        {tabDisplayNames[tabId]?.label}
                      </Button>
                    ))}
                  </div>
                </ScrollArea>
                
                <div className="p-4 border-t bg-gray-50">
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      className="flex-1" 
                      onClick={handleCancel}
                    >
                      Cancel
                    </Button>
                    <Button 
                      className="flex-1" 
                      onClick={handleEditingComplete}
                      disabled={isSaving || showSuccessMessage}
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving
                        </>
                      ) : showSuccessMessage ? (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Saved!
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Main content area */}
          <div className="lg:col-span-9">
            <Card className="shadow-sm">
              <CardContent className="p-0">
                {/* Loading state */}
                {isLoadingUserData ? (
                  <div className="flex justify-center items-center p-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  /* Edit profile steps - we configure it to show only the active tab */
                  <ProfileSteps
                    isEditing={true}
                    onComplete={handleEditingComplete}
                    startStep={tabOrder.indexOf(activeTab) + 1}
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}