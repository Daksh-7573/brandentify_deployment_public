import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
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
      
      // Register a temporary demo user
      const response = await fetch("/api/demo-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email: demoEmail, password: demoPassword }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Demo login failed");
      }
      
      const user = await response.json();
      
      // Log the user in
      login(user);
      
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