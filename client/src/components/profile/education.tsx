import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

type EducationItem = {
  id: number;
  userId: number;
  degree: string;
  institution: string;
  location: string;
  startDate: string;
  endDate: string;
};

export default function Education() {
  const { user, isDemoMode } = useAuth();
  const userId = isDemoMode ? 1 : (user?.uid ? parseInt(user.uid) : 1);
  
  // Fetch educations from the API with advanced options
  const { data: serverEducations, isLoading, refetch } = useQuery({
    queryKey: [`/api/users/${userId}/educations`],
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
      console.log(`Education - Directly fetching latest education data (${timestamp})`);
      try {
        const response = await fetch(`/api/users/${userId}/educations?_=${timestamp}`, {
          method: 'GET',
          headers: { 
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });
        const freshData = await response.json();
        console.log("Education - Got direct fetch data:", freshData);
        // Force update
        if (freshData && Array.isArray(freshData)) {
          setEducations([...freshData]);
          // Update the ref as well
          latestDataRef.current = [...freshData];
        }
      } catch (error) {
        console.error("Error during direct education fetch:", error);
      }
    }
    
    directFetch();
    
    // Poll every second
    const interval = setInterval(directFetch, 1000);
    return () => clearInterval(interval);
  }, [userId]); // Only re-run when userId changes
  
  // Initialize with an empty array, but use the ref for the actual display data
  const [educations, setEducations] = useState<EducationItem[]>([]);
  
  // Reference to hold the most recent data
  const latestDataRef = useRef<EducationItem[]>([]);
  
  // CRITICAL IMPROVEMENT: Initialize educations from serverEducations on first load
  useEffect(() => {
    if (serverEducations && Array.isArray(serverEducations) && serverEducations.length > 0) {
      console.log("Education: Initial data from server:", serverEducations);
      setEducations(serverEducations);
      latestDataRef.current = serverEducations;
    }
  }, []);
  
  // Update educations state when server data changes
  useEffect(() => {
    if (serverEducations && Array.isArray(serverEducations)) {
      console.log("Education received updated data:", serverEducations);
      
      // Always update our reference with the latest data
      latestDataRef.current = [...serverEducations];
      
      // Update the state too to trigger re-renders
      setEducations([...serverEducations]);
    }
  }, [serverEducations]);
  
  // Always use the latest data for display, using direct ref access as a fallback
  const displayEducations = educations.length > 0 ? educations : 
                          (latestDataRef.current.length > 0 ? latestDataRef.current : []);

  const handleAdd = () => {
    // In a real app, this would open a form modal
    console.log("Add new education");
  };

  const handleEdit = (id: number) => {
    // In a real app, this would open a form modal with the education data
    console.log("Edit education", id);
  };

  const handleDelete = (id: number) => {
    // In a real app, this would show a confirmation dialog
    setEducations(educations.filter(edu => edu.id !== id));
  };

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900">Education</h2>
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
        ) : displayEducations && displayEducations.length > 0 ? (
          <div className="space-y-6">
            {displayEducations.map((edu) => (
              <div key={edu.id} className="border-b border-gray-200 pb-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-medium text-gray-900">{edu.degree}</h3>
                    <p className="text-sm text-gray-500 mt-1">{edu.institution} • {edu.location}</p>
                    <p className="text-sm text-gray-500 mt-1">{edu.startDate} - {edu.endDate}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      className="text-gray-400 hover:text-gray-500 focus:outline-none"
                      onClick={() => handleEdit(edu.id)}
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    <button 
                      className="text-gray-400 hover:text-gray-500 focus:outline-none"
                      onClick={() => handleDelete(edu.id)}
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500">
            No education added yet. Add your education history or upload a resume to populate this section.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
