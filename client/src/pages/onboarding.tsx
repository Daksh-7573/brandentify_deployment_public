import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useEffect } from "react";
import ProfileSteps from "@/components/onboarding/profile-steps";
import { useToast } from "@/hooks/use-toast";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function OnboardingPage() {
  const { user, isAuthenticated, signOut, isDemoMode } = useAuth();
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated && !isDemoMode) {
      setLocation('/login');
    }
  }, [isAuthenticated, isDemoMode, setLocation]);
  
  // Handler for when onboarding is complete
  const handleOnboardingComplete = () => {
    toast({
      title: "Profile setup complete!",
      description: "Your profile has been successfully set up. Welcome to Brandentifier!",
    });
    
    // Redirect to profile page
    setLocation('/profile');
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simple header with logo and sign out */}
      <header className="bg-white shadow-sm py-4 fixed w-full top-0 z-10">
        <div className="container max-w-5xl px-4 sm:px-6 lg:px-8 mx-auto flex justify-between items-center">
          <div className="flex items-center gap-1.5">
            <div className="h-8 w-8 bg-gradient-to-br from-primary to-indigo-600 rounded-lg flex items-center justify-center shadow-sm transition-transform group-hover:scale-105">
              <span className="text-white font-bold text-lg">B</span>
            </div>
            <span className="text-primary text-xl font-bold cursor-pointer bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80">
              Brandentifier
            </span>
          </div>
          
          {/* Sign out button */}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={signOut}
            className="text-gray-600 hover:text-gray-900"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign out
          </Button>
        </div>
      </header>
      
      {/* Welcome section */}
      <div className="pt-24 pb-6 container max-w-4xl px-4 sm:px-6 lg:px-8 mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to Brandentifier, {user?.displayName || 'Professional'}!
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Let's set up your professional profile in a few simple steps. 
            This will help you connect with the right opportunities and professionals.
          </p>
        </div>
        
        {/* Onboarding steps */}
        <ProfileSteps onComplete={handleOnboardingComplete} />
      </div>
    </div>
  );
}