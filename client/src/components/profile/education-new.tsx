import { useState, useEffect, useRef } from "react";
import { format, parse } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Loader2, CalendarIcon, Plus, Pencil, Trash } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select/index.new";
import { cn } from "@/lib/utils";
import { SimpleDatePicker } from "@/components/ui/simple-date-picker";

type EducationItem = {
  id: number;
  userId: number;
  degree: string;
  institution: string;
  location: string;
  startDate: string;
  endDate?: string;
};

export default function Education() {
  const { user, isDemoMode } = useAuth();
  const userId = isDemoMode ? 1 : (user?.uid ? parseInt(user.uid) : 1);
  
  // Fetch education items from the API with advanced options
  const { data: serverEducations, isLoading, refetch } = useQuery({
    queryKey: [`/api/users/${userId}/educations`],
    enabled: !!userId,
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchInterval: 1000,
  });
  
  // Force a direct fetch every time the component renders
  useEffect(() => {
    async function directFetch() {
      const timestamp = new Date().getTime();
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
        if (freshData && Array.isArray(freshData)) {
          setEducations([...freshData]);
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
  }, [userId]);
  
  const [educations, setEducations] = useState<EducationItem[]>([]);
  const latestDataRef = useRef<EducationItem[]>([]);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newEducation, setNewEducation] = useState<Partial<EducationItem>>({
    degree: '',
    institution: '',
    location: '',
    startDate: '',
    endDate: ''
  });
  
  // Track if we're in 'Present' status for end date
  const [isCurrentlyStudying, setIsCurrentlyStudying] = useState(false);

  const handleAdd = () => {
    setIsAddModalOpen(true);
    setIsCurrentlyStudying(false);
  };
  
  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    // Reset form
    setNewEducation({
      degree: '',
      institution: '',
      location: '',
      startDate: '',
      endDate: ''
    });
    setIsCurrentlyStudying(false);
  };

  // We don't need the date update functions anymore as SimpleDatePicker handles this
  
  const handleSaveEducation = async () => {
    try {
      console.log("Attempting to save education:", newEducation);
      
      // Validate form
      if (!newEducation.degree || !newEducation.institution || !newEducation.startDate) {
        toast({
          title: "Missing information",
          description: "Please fill in all required fields",
          variant: "destructive"
        });
        return;
      }
      
      // Validate that end date is after start date if both are provided and end date is not "Present"
      if (
        newEducation.startDate && 
        newEducation.endDate && 
        newEducation.endDate !== 'Present'
      ) {
        const startDateObj = new Date(newEducation.startDate);
        const endDateObj = new Date(newEducation.endDate);
        
        if (endDateObj < startDateObj) {
          toast({
            title: "Invalid date range",
            description: "End date must be after start date",
            variant: "destructive"
          });
          return;
        }
      }
      
      // Handle "Present" end date
      let endDateForServer: string | undefined = newEducation.endDate;
      if (isCurrentlyStudying || newEducation.endDate === 'Present') {
        endDateForServer = undefined;
      }
      
      // Add userId to the education if it's not already there
      const educationToSave = {
        ...newEducation,
        userId: userId,
        endDate: endDateForServer
      };
      
      console.log("Prepared education object for server:", educationToSave);
      
      let response;
      let successMessage;
      
      // Check if we're editing an existing education (has an id) or creating a new one
      if (newEducation.id) {
        // Update existing education
        response = await apiRequest('PUT', `/api/educations/${newEducation.id}`, educationToSave);
        successMessage = "Your education has been updated successfully";
      } else {
        // Create new education
        response = await apiRequest('POST', '/api/educations', educationToSave);
        successMessage = "Your education has been added successfully";
      }
      
      if (response.ok) {
        console.log("Education saved successfully, response:", response);
        // Close modal
        setIsAddModalOpen(false);
        
        // Refresh data
        refetch();
        
        // Show success message
        toast({
          title: newEducation.id ? "Education updated" : "Education added",
          description: successMessage,
        });
        
        // Reset form
        setNewEducation({
          degree: '',
          institution: '',
          location: '',
          startDate: '',
          endDate: ''
        });
        setIsCurrentlyStudying(false);
        
        // No need to reset date pickers as SimpleDatePicker manages its own state
      } else {
        const errorData = await response.json();
        console.error("Server error response:", errorData);
        throw new Error(`Failed to ${newEducation.id ? 'update' : 'save'} education: ${JSON.stringify(errorData)}`);
      }
    } catch (error) {
      console.error("Error saving education:", error);
      toast({
        title: "Error",
        description: `Failed to ${newEducation.id ? 'update' : 'save'} your education. Please try again.`,
        variant: "destructive"
      });
    }
  };

  const handleEdit = (id: number) => {
    // Find the education to edit
    const educationToEdit = displayEducations.find(edu => edu.id === id);
    if (educationToEdit) {
      setNewEducation({
        ...educationToEdit
      });
      
      // Check if this is currently studying
      if (educationToEdit.endDate === 'Present') {
        setIsCurrentlyStudying(true);
      } else {
        setIsCurrentlyStudying(false);
      }
      
      setIsAddModalOpen(true);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      console.log("Deleting education with ID:", id);
      const response = await apiRequest('DELETE', `/api/educations/${id}`);
      
      if (response.ok) {
        console.log("Education deleted successfully");
        // Update local state immediately for responsiveness
        setEducations(educations.filter(edu => edu.id !== id));
        
        // Show success message
        toast({
          title: "Education deleted",
          description: "Your education has been deleted successfully",
        });
        
        // Refresh data
        refetch();
      } else {
        const errorData = await response.json();
        console.error("Server error response:", errorData);
        throw new Error(`Failed to delete education: ${JSON.stringify(errorData)}`);
      }
    } catch (error) {
      console.error("Error deleting education:", error);
      toast({
        title: "Error",
        description: "Failed to delete your education. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  // Initialize educations from serverEducations on first load
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
      latestDataRef.current = [...serverEducations];
      setEducations([...serverEducations]);
    }
  }, [serverEducations]);
  
  // Always use the latest data for display, using direct ref access as a fallback
  const unfilteredEducations = educations.length > 0 ? educations : 
                             (latestDataRef.current.length > 0 ? latestDataRef.current : []);
  
  // Sort educations by start date (newest first)
  const displayEducations = [...unfilteredEducations].sort((a, b) => {
    const dateA = a.startDate;
    const dateB = b.startDate;
    return dateB.localeCompare(dateA); // Reverse order for newest first
  });

  const { toast } = useToast();

  // Generate month options
  const months = [
    { value: "01", label: "January" },
    { value: "02", label: "February" },
    { value: "03", label: "March" },
    { value: "04", label: "April" },
    { value: "05", label: "May" },
    { value: "06", label: "June" },
    { value: "07", label: "July" },
    { value: "08", label: "August" },
    { value: "09", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" }
  ];

  // Generate year options from 1990 to current year + 5
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1990 + 10 }, (_, i) => (1990 + i).toString());

  return (
    <>
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">Education</h2>
            <Button 
              variant="ghost" 
              className="text-primary hover:text-primary-600 hover:bg-transparent"
              onClick={handleAdd}
            >
              <Plus className="mr-1 h-4 w-4" /> Add
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
                      <p className="text-sm text-gray-500 mt-1">{edu.startDate} - {edu.endDate || 'Present'}</p>
                    </div>
                    <div className="flex space-x-2">
                      <button 
                        className="text-gray-400 hover:text-gray-500 focus:outline-none"
                        onClick={() => handleEdit(edu.id)}
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button 
                        className="text-gray-400 hover:text-gray-500 focus:outline-none"
                        onClick={() => handleDelete(edu.id)}
                      >
                        <Trash className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500">
              No education yet. Add your education or upload a resume to populate this section.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Education Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>{newEducation.id ? 'Edit Education' : 'Add Education'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="degree" className="text-right">
                Degree*
              </Label>
              <Input
                id="degree"
                value={newEducation.degree}
                onChange={(e) => setNewEducation({...newEducation, degree: e.target.value})}
                className="col-span-3"
                placeholder="Bachelor of Science"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="institution" className="text-right">
                Institution*
              </Label>
              <Input
                id="institution"
                value={newEducation.institution}
                onChange={(e) => setNewEducation({...newEducation, institution: e.target.value})}
                className="col-span-3"
                placeholder="University of California"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="location" className="text-right">
                Location
              </Label>
              <Input
                id="location"
                value={newEducation.location}
                onChange={(e) => setNewEducation({...newEducation, location: e.target.value})}
                className="col-span-3"
                placeholder="Berkeley, CA"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="startDate" className="text-right">
                Start Date*
              </Label>
              <div className="col-span-3">
                <SimpleDatePicker 
                  value={newEducation.startDate || ""}
                  onChange={(value) => {
                    setNewEducation({
                      ...newEducation,
                      startDate: value
                    });
                  }}
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="endDate" className="text-right">
                End Date
              </Label>
              <div className="col-span-3">
                <div className="flex space-x-2 items-center">
                  <div className={cn(
                    "flex-1",
                    isCurrentlyStudying || newEducation.endDate === 'Present' ? "opacity-50 pointer-events-none" : ""
                  )}>
                    <SimpleDatePicker 
                      value={newEducation.endDate === 'Present' ? '' : (newEducation.endDate || '')}
                      onChange={(value) => {
                        setNewEducation({
                          ...newEducation,
                          endDate: value
                        });
                      }}
                      disabled={isCurrentlyStudying || newEducation.endDate === 'Present'}
                    />
                  </div>

                  <div className="flex items-center space-x-2 ml-2">
                    <input
                      type="checkbox"
                      id="currentEducation"
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                      checked={isCurrentlyStudying || newEducation.endDate === 'Present'}
                      onChange={(e) => {
                        const isChecked = e.target.checked;
                        console.log("Current education checkbox changed:", isChecked);
                        setIsCurrentlyStudying(isChecked);
                        if (isChecked) {
                          setNewEducation({
                            ...newEducation,
                            endDate: 'Present'
                          });
                        } else {
                          setNewEducation({
                            ...newEducation,
                            endDate: ''
                          });
                        }
                      }}
                    />
                    <label htmlFor="currentEducation" className="text-sm text-gray-600">
                      I currently study here
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button onClick={handleSaveEducation}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}