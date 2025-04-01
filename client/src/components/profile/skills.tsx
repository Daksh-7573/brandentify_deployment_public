import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

type SkillItem = {
  id: number;
  userId: number;
  name: string;
  level: string; // "Beginner", "Intermediate", "Advanced"
  proficiency: number; // Percentage 0-100
};

export default function Skills() {
  const { user, isDemoMode } = useAuth();
  const userId = isDemoMode ? 1 : (user?.uid ? parseInt(user.uid) : 1);
  
  // Fetch skills from the API with advanced options
  const { data: serverSkills, isLoading, refetch } = useQuery({
    queryKey: [`/api/users/${userId}/skills`],
    enabled: !!userId,
    staleTime: 0, // Always consider data stale to force refresh
    refetchOnMount: 'always', // Always refetch when component mounts
    refetchOnWindowFocus: true, // Refetch when window regains focus
    refetchInterval: 1000, // Poll every second to keep data fresh
  });
  
  // Force a direct fetch every time the component renders
  useEffect(() => {
    async function directFetch() {
      const timestamp = new Date().getTime(); // Add timestamp to prevent caching
      console.log(`Skills - Directly fetching latest skills data (${timestamp})`);
      try {
        const response = await fetch(`/api/users/${userId}/skills?_=${timestamp}`, {
          method: 'GET',
          headers: { 
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });
        const freshData = await response.json();
        console.log("Skills - Got direct fetch data:", freshData);
        // Force update
        if (freshData && Array.isArray(freshData)) {
          setSkills([...freshData]);
          // Update the ref as well
          latestDataRef.current = [...freshData];
        }
      } catch (error) {
        console.error("Error during direct skills fetch:", error);
      }
    }
    
    directFetch();
    
    // Poll every second
    const interval = setInterval(directFetch, 1000);
    return () => clearInterval(interval);
  }, [userId]); // Only re-run when userId changes
  
  // Initialize with an empty array, but use the ref for the actual display data
  const [skills, setSkills] = useState<SkillItem[]>([]);
  
  // Reference to hold the most recent data
  const latestDataRef = useRef<SkillItem[]>([]);
  
  // CRITICAL IMPROVEMENT: Initialize skills from serverSkills on first load
  useEffect(() => {
    if (serverSkills && Array.isArray(serverSkills) && serverSkills.length > 0) {
      console.log("Skills: Initial data from server:", serverSkills);
      setSkills(serverSkills);
      latestDataRef.current = serverSkills;
    }
  }, []);
  
  // Update skills state when server data changes
  useEffect(() => {
    if (serverSkills && Array.isArray(serverSkills)) {
      console.log("Skills received updated data:", serverSkills);
      
      // Always update our reference with the latest data
      latestDataRef.current = [...serverSkills];
      
      // Update the state too to trigger re-renders
      setSkills([...serverSkills]);
    }
  }, [serverSkills]);
  
  // Always use the latest data for display, using direct ref access as a fallback
  const displaySkills = skills.length > 0 ? skills : 
                       (latestDataRef.current.length > 0 ? latestDataRef.current : []);

  const handleAdd = () => {
    // In a real app, this would open a form modal
    console.log("Add new skill");
  };

  // Get color based on proficiency
  const getColor = (proficiency: number) => {
    if (proficiency >= 80) return "bg-green-500";
    if (proficiency >= 50) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900">Skills</h2>
          <Button 
            variant="ghost" 
            className="text-primary hover:text-primary-600 hover:bg-transparent"
            onClick={handleAdd}
          >
            <i className="fas fa-plus mr-1"></i> Add
          </Button>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : displaySkills && displaySkills.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {displaySkills.map((skill) => (
              <div key={skill.id} className="border border-gray-200 rounded-md p-3">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">{skill.name}</span>
                  <span className="text-xs text-gray-500">{skill.level}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div 
                    className={`${getColor(skill.proficiency)} h-1.5 rounded-full`} 
                    style={{ width: `${skill.proficiency}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500">
            No skills added yet. Add your skills or upload a resume to populate this section.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
