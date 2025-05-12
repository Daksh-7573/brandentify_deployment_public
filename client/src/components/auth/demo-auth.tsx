import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/auth-context";

export function DemoAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { login } = useAuth();

  const handleDemoLogin = async () => {
    try {
      setIsLoading(true);
      
      // Generate a unique email for the demo user
      const timestamp = Date.now();
      const demoEmail = `demo_${timestamp}@brandentifier.demo`;
      const demoPassword = `demo_${timestamp}`;
      
      console.log("Attempting demo login with:", { demoEmail });
      
      // Create a demo user object directly
      // This simulates a successful login response with a demo user
      const demoUser = {
        id: timestamp,
        username: `demo_user_${timestamp}`,
        email: demoEmail,
        name: "Demo User",
        photoURL: null,
        title: "Demo Account",
        role: "user",
        emailVerified: true,
        profileCompleted: 70,
        aboutMe: "This is a demo account for testing purposes",
        location: "Demo City",
        industry: "Technology",
        domain: "Software Development",
        lookingFor: "Testing the application",
        createdAt: new Date()
      };
      
      // Log the user in with the demo user
      login(demoUser);
      
      toast({
        title: "Demo account created",
        description: "You are now logged in with a demo account",
      });
    } catch (error: any) {
      console.error("Demo login error:", error);
      toast({
        title: "Login failed",
        description: error.message || "An error occurred during demo login",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium"
      size="lg"
      onClick={handleDemoLogin}
      disabled={isLoading}
    >
      {isLoading ? (
        <span className="flex items-center justify-center gap-2">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
          Creating Demo Account...
        </span>
      ) : (
        <span className="flex items-center justify-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
          Use Demo Account
        </span>
      )}
    </Button>
  );
}