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
      className="w-full"
      variant="outline"
      onClick={handleDemoLogin}
      disabled={isLoading}
    >
      {isLoading ? "Creating Demo Account..." : "Try Demo Account"}
    </Button>
  );
}