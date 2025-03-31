import { useState, useEffect } from "react";
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
  const { data: serverExperiences, isLoading } = useQuery({
    queryKey: [`/api/users/${userId}/experiences`],
    enabled: !!userId,
    staleTime: 1000, // Consider data stale after 1 second to force refresh
    refetchOnMount: true, // Always refetch when component mounts
    refetchOnWindowFocus: true, // Refetch when window regains focus
  });
  
  // Use fetched data if available, otherwise use empty array
  const [experiences, setExperiences] = useState<WorkExperienceItem[]>([]);

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

  // Update experiences state when server data changes
  useEffect(() => {
    if (serverExperiences && Array.isArray(serverExperiences)) {
      setExperiences(serverExperiences);
    }
  }, [serverExperiences]);

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
        ) : experiences && experiences.length > 0 ? (
          <div className="space-y-6">
            {experiences.map((exp) => (
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
