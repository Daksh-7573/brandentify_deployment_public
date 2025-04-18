import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useEffect } from "react";
import ProfileSteps from "@/components/onboarding/profile-steps";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/layout/header";

export default function EditProfilePage() {
  const { user, isAuthenticated, isDemoMode } = useAuth();
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated && !isDemoMode) {
      setLocation('/login');
    }
  }, [isAuthenticated, isDemoMode, setLocation]);
  
  // Handler for when editing is complete
  const handleEditingComplete = () => {
    toast({
      title: "Profile updated!",
      description: "Your profile has been successfully updated.",
    });
    
    // Redirect to profile page
    setLocation('/profile');
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Include the standard header */}
      <Header />
      
      <div className="pt-24 pb-6 container max-w-4xl px-4 sm:px-6 lg:px-8 mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Edit Your Profile
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Update your professional profile information to stay current and make the right connections.
          </p>
        </div>
        
        {/* Edit profile steps */}
        <ProfileSteps isEditing={true} onComplete={handleEditingComplete} />
      </div>
    </div>
  );
}