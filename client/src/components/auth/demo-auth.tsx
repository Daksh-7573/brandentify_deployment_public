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
      
      console.log("Activating demo mode...");
      
      // Create a demo user account - note that we use POST, not GET
      const response = await apiRequest('POST', '/api/demo-login');
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Demo login failed:", errorData);
        throw new Error(errorData.message || "Failed to enter demo mode");
      }
      
      const result = await response.json();
      console.log("Demo mode activation result:", result);
      
      if (!result.success || !result.demoUser) {
        throw new Error("Demo user data missing from response");
      }
      
      // Call the callback with the demo user data
      onDemoLogin(result.demoUser);
      
      toast({
        title: "Demo mode activated!",
        description: "You can now explore all features without creating an account",
      });
      
      // Store demo mode flag in localStorage for persistent sessions
      localStorage.setItem('demoMode', 'true');
      localStorage.setItem('demoUserId', result.demoUser.id.toString());
      
    } catch (error) {
      console.error("Demo mode error:", error);
      toast({
        title: "Demo mode error",
        description: error instanceof Error ? error.message : "Unable to activate demo mode. Please try again.",
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
          Quick Test Preview
        </h3>
        <p className="text-xs text-amber-700 mt-1">
          Try the platform features with temporary access. For full features and data persistence, please sign in with Google.
        </p>
      </div>
      
      <Button
        variant="outline"
        className="w-full border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100"
        onClick={startDemoMode}
        disabled={isLoading}
      >
        {isLoading ? "Setting up preview..." : "Try Platform Preview"}
        {!isLoading && <ArrowRight className="w-4 h-4 ml-2" />}
      </Button>
    </div>
  );
}