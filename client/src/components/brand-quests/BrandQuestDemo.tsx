import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

/**
 * Helper component to easily test the Brand Quests feature
 * This component can be embedded anywhere to provide easy access to the
 * Brand Quests demo with properly initialized demo user
 */
export function BrandQuestDemo() {
  const { toast } = useToast();
  
  const gotoQuestDemo = () => {
    // Ensure demo user is set in localStorage
    localStorage.setItem('demo_user_id', '1');
    
    // Navigate to the brand quests demo
    window.location.href = '/quest-demo';
    
    toast({
      title: "Loading Quest Demo",
      description: "Please wait while we prepare the demo...",
    });
  };
  
  return (
    <div className="flex flex-col items-center space-y-3 p-4 border border-green-200 rounded-md bg-green-50 dark:bg-green-900/20 dark:border-green-800">
      <h3 className="text-lg font-medium">Test Brand Quests</h3>
      <p className="text-sm text-muted-foreground text-center">
        Access the Brand Quests demo to see your 3 weekly quests
      </p>
      <Button 
        onClick={gotoQuestDemo}
        className="bg-green-600 hover:bg-green-700"
      >
        Launch Brand Quests Demo
      </Button>
    </div>
  );
}