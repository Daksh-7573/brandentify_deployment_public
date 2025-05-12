import { useState } from "react";
import { useContext } from "react";
import { AuthContext } from "@/context/auth-context";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export function DemoAuth() {
  const { signInWithEmail } = useContext(AuthContext);
  const [_, setLocation] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  // Handle demo login by creating a temporary user account
  const handleDemoLogin = async () => {
    try {
      setIsSubmitting(true);
      
      // Create a demo user with a timestamp to make it unique
      const timestamp = new Date().getTime();
      const demoEmail = `demo_${timestamp}@brandentifier.demo`;
      const demoPassword = `demo${timestamp}`;
      const demoName = "Demo User";
      
      // First register the demo user
      const registerResponse = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: demoName,
          email: demoEmail,
          password: demoPassword,
          username: `demo_${timestamp}`,
          profileCompleted: 40,
          // Mark as demo account for special handling
          isDemo: true,
          // Skip email verification for demo accounts
          emailVerified: true
        }),
      });
      
      if (!registerResponse.ok) {
        const data = await registerResponse.json();
        throw new Error(data.message || "Demo registration failed");
      }
      
      const registerData = await registerResponse.json();
      
      // Immediately log in with the demo account
      const loginResponse = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: demoEmail,
          password: demoPassword,
        }),
      });
      
      if (!loginResponse.ok) {
        const data = await loginResponse.json();
        throw new Error(data.message || "Demo login failed");
      }
      
      const userData = await loginResponse.json();
      
      // Use Auth Context to set the user
      signInWithEmail(userData);
      
      toast({
        title: "Demo login successful!",
        description: "Welcome to Brandentifier. You're using a demo account.",
      });
      
      // Redirect to dashboard
      setTimeout(() => {
        setLocation("/dashboard");
      }, 1000);
      
    } catch (error: any) {
      console.error("Demo login error:", error);
      toast({
        title: "Demo login failed",
        description: error.message || "Failed to create demo account",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Button
      variant="outline"
      onClick={handleDemoLogin}
      disabled={isSubmitting}
      className="w-full"
    >
      {isSubmitting ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating Demo Account...
        </>
      ) : (
        "Try Demo Account"
      )}
    </Button>
  );
}