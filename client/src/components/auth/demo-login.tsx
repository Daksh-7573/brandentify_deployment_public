import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function DemoLogin() {
  const { signInWithPhone } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleDemoLogin = async () => {
    try {
      setIsLoading(true);
      
      // Get the demo user data from the server
      console.log("Loading demo user...");
      const demoUserResponse = await apiRequest('GET', '/api/users/1');
      
      if (!demoUserResponse.ok) {
        throw new Error('Failed to get demo user');
      }
      
      const demoUser = await demoUserResponse.json();
      
      // Sign in with the demo user
      console.log("Signing in with demo user:", demoUser);
      signInWithPhone(demoUser);
      
      toast({
        title: "Demo Mode Active",
        description: "You're now using Brandentifier in demo mode.",
      });
    } catch (error) {
      console.error("Error logging in with demo account:", error);
      toast({
        title: "Demo Login Failed",
        description: "There was a problem activating demo mode. Using fallback demo user.",
        variant: "destructive",
      });
      
      // Fallback to hardcoded user if API call fails
      signInWithPhone({
        id: 1,
        username: "demo_user",
        name: "Demo User",
        email: "demo@example.com",
        photoURL: null,
        password: null,
        phoneNumber: null,
        title: "Full Stack Developer",
        aboutMe: "Demo user for testing purposes",
        location: "San Francisco, CA",
        industry: "Technology",
        domain: "Web Development",
        lookingFor: "New opportunities",
        whatIOffer: "Full stack development skills",
        visitingCardType: null,
        profileCompleted: 100,
        emailVerified: 1,
        emailVerificationToken: null,
        emailVerificationExpires: null,
        createdAt: new Date()
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handleDemoLogin}
      disabled={isLoading}
      className="w-full border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700"
    >
      {isLoading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <span className="mr-2">🚀</span>
      )}
      Instant Demo Login
    </Button>
  );
}