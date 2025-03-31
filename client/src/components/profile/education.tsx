import { useState, useEffect } from "react";
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
  
  // Fetch educations from the API
  const { data: serverEducations, isLoading } = useQuery({
    queryKey: [`/api/users/${userId}/educations`],
    enabled: !!userId,
  });
  
  // Use fetched data if available, otherwise use empty array
  const [educations, setEducations] = useState<EducationItem[]>([]);
  
  // Update educations state when server data changes
  useEffect(() => {
    if (serverEducations && Array.isArray(serverEducations)) {
      setEducations(serverEducations);
    }
  }, [serverEducations]);

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
        ) : educations && educations.length > 0 ? (
          <div className="space-y-6">
            {educations.map((edu) => (
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
