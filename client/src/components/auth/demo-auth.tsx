import { Rocket, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";

interface DemoAuthProps {
  onDemoLogin: (userData: any) => void;
}

export function DemoAuth({ onDemoLogin }: DemoAuthProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const startDemoMode = async () => {
    try {
      setIsLoading(true);
      // Create a demo user account
      const response = await apiRequest('GET', '/api/demo-mode/login');
      
      if (!response.ok) {
        throw new Error("Failed to enter demo mode");
      }
      
      const userData = await response.json();
      console.log("Demo mode activated, user data:", userData);
      
      // Call the callback with the demo user data
      onDemoLogin(userData);
      
      toast({
        title: "Demo mode activated!",
        description: "You can now explore all features without creating an account",
      });
      
    } catch (error) {
      console.error("Demo mode error:", error);
      toast({
        title: "Demo mode error",
        description: "Unable to activate demo mode. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="bg-amber-50 border border-amber-200 rounded-md p-3 mb-2">
        <h3 className="text-sm font-medium text-amber-800 flex items-center">
          <Rocket className="w-4 h-4 mr-2" />
          Skip the sign-in process
        </h3>
        <p className="text-xs text-amber-700 mt-1">
          Experience all features instantly with our demo mode. No account creation required.
        </p>
      </div>
      
      <Button
        variant="outline"
        className="w-full border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100"
        onClick={startDemoMode}
        disabled={isLoading}
      >
        {isLoading ? "Setting up demo..." : "Enter Demo Mode"}
        {!isLoading && <ArrowRight className="w-4 h-4 ml-2" />}
      </Button>
    </div>
  );
}