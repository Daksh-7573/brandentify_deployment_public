import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Loader2 } from "lucide-react";

type WorkExperienceItem = {
  id: number;
  userId: number;
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate?: string;
  description: string;
};

export default function WorkExperience() {
  const { user, isDemoMode } = useAuth();
  const userId = isDemoMode ? 1 : (user?.uid ? parseInt(user.uid) : 1);
  
  // Fetch work experiences from the API with advanced options
  const { data: serverExperiences, isLoading, refetch } = useQuery({
    queryKey: [`/api/users/${userId}/experiences`],
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
      console.log(`Work Experience - Directly fetching latest experiences data (${timestamp})`);
      try {
        const response = await fetch(`/api/users/${userId}/experiences?_=${timestamp}`, {
          method: 'GET',
          headers: { 
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });
        const freshData = await response.json();
        console.log("Work Experience - Got direct fetch data:", freshData);
        // Force update
        if (freshData && Array.isArray(freshData)) {
          setExperiences([...freshData]);
          // Update the ref as well
          latestDataRef.current = [...freshData];
        }
      } catch (error) {
        console.error("Error during direct fetch:", error);
      }
    }
    
    directFetch();
    
    // Poll every second
    const interval = setInterval(directFetch, 1000);
    return () => clearInterval(interval);
  }, [userId]); // Only re-run when userId changes
  
  // Initialize with an empty array, but use the ref for the actual display data
  const [experiences, setExperiences] = useState<WorkExperienceItem[]>([]);
  
  // Reference to hold the most recent data
  const latestDataRef = useRef<WorkExperienceItem[]>([]);

  const handleAdd = () => {
    // In a real app, this would open a form modal
    console.log("Add new work experience");
  };

  const handleEdit = (id: number) => {
    // In a real app, this would open a form modal with the experience data
    console.log("Edit experience", id);
  };

  const handleDelete = (id: number) => {
    // In a real app, this would show a confirmation dialog
    setExperiences(experiences.filter(exp => exp.id !== id));
  };
  
  // CRITICAL IMPROVEMENT: Initialize experiences from serverExperiences on first load
  useEffect(() => {
    if (serverExperiences && Array.isArray(serverExperiences) && serverExperiences.length > 0) {
      console.log("WorkExperience: Initial data from server:", serverExperiences);
      setExperiences(serverExperiences);
      latestDataRef.current = serverExperiences;
    }
  }, []);
  
  // Update experiences state when server data changes
  useEffect(() => {
    if (serverExperiences && Array.isArray(serverExperiences)) {
      console.log("WorkExperience received updated data:", serverExperiences);
      
      // Always update our reference with the latest data
      latestDataRef.current = [...serverExperiences];
      
      // Update the state too to trigger re-renders
      setExperiences([...serverExperiences]);
    }
  }, [serverExperiences]);
  
  // Always use the latest data for display, using direct ref access as a fallback
  const displayExperiences = experiences.length > 0 ? experiences : 
                           (latestDataRef.current.length > 0 ? latestDataRef.current : []);

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900">Work Experience</h2>
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
        ) : displayExperiences && displayExperiences.length > 0 ? (
          <div className="space-y-6">
            {displayExperiences.map((exp) => (
              <div key={exp.id} className="border-b border-gray-200 pb-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-medium text-gray-900">{exp.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">{exp.company} • {exp.location}</p>
                    <p className="text-sm text-gray-500 mt-1">{exp.startDate} - {exp.endDate || 'Present'}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      className="text-gray-400 hover:text-gray-500 focus:outline-none"
                      onClick={() => handleEdit(exp.id)}
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    <button 
                      className="text-gray-400 hover:text-gray-500 focus:outline-none"
                      onClick={() => handleDelete(exp.id)}
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
                <p className="mt-2 text-sm text-gray-600">
                  {exp.description}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500">
            No work experience yet. Add your work experience or upload a resume to populate this section.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
