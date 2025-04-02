import { useState, useEffect, useRef } from "react";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Loader2, CalendarIcon } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

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
                          
  // For the modal form
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCurrentlyStudying, setIsCurrentlyStudying] = useState(false);
  const [newEducation, setNewEducation] = useState<Partial<EducationItem>>({
    degree: '',
    institution: '',
    location: '',
    startDate: '',
    endDate: ''
  });
  
  // For date pickers
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  
  const { toast } = useToast();

  const handleAdd = () => {
    setIsAddModalOpen(true);
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
    // Reset date pickers
    setStartDate(undefined);
    setEndDate(undefined);
    // Reset currently studying checkbox
    setIsCurrentlyStudying(false);
  };
  
  const handleSaveEducation = async () => {
    try {
      // Validate form
      if (!newEducation.degree || !newEducation.institution || !newEducation.startDate) {
        toast({
          title: "Missing information",
          description: "Please fill in all required fields",
          variant: "destructive"
        });
        return;
      }
      
      // Check if end date is required (not "Currently studying here")
      if (!isCurrentlyStudying && !newEducation.endDate) {
        toast({
          title: "Missing information",
          description: "Please provide an end date or check 'I currently study here'",
          variant: "destructive"
        });
        return;
      }
      
      // Validate that end date is after start date if both are provided
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
      
      // Add userId to the education if it's not already there
      const educationToSave = {
        ...newEducation,
        userId: userId
      };
      
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
        
        // Reset date pickers
        setStartDate(undefined);
        setEndDate(undefined);
      } else {
        throw new Error(`Failed to ${newEducation.id ? 'update' : 'save'} education`);
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
      
      // Set the date pickers
      if (educationToEdit.startDate) {
        try {
          setStartDate(new Date(educationToEdit.startDate));
        } catch (error) {
          console.error("Failed to parse start date:", error);
        }
      }
      
      // Check if "Currently studying here" applies and set state accordingly
      if (educationToEdit.endDate === 'Present') {
        setIsCurrentlyStudying(true);
        setEndDate(undefined);
      } else if (educationToEdit.endDate) {
        setIsCurrentlyStudying(false);
        try {
          setEndDate(new Date(educationToEdit.endDate));
        } catch (error) {
          console.error("Failed to parse end date:", error);
        }
      } else {
        // Handle null or empty end date as "Currently studying here"
        setIsCurrentlyStudying(true);
        setEndDate(undefined);
      }
      
      setIsAddModalOpen(true);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await apiRequest('DELETE', `/api/educations/${id}`);
      if (response.ok) {
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
        throw new Error("Failed to delete education");
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
      
      {/* Education Modal */}
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
                placeholder="University of Technology"
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
                placeholder="San Francisco, CA"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="startDate" className="text-right">
                Start Date*
              </Label>
              <div className="col-span-3">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={(date) => {
                        if (date) {
                          setStartDate(date);
                          try {
                            const formattedDate = format(date, "MMM yyyy");
                            setNewEducation({
                              ...newEducation,
                              startDate: formattedDate
                            });
                          } catch (error) {
                            console.error("Error formatting start date:", error);
                          }
                        }
                      }}
                      initialFocus
                      captionLayout="dropdown-buttons"
                      fromYear={1990}
                      toYear={2030}
                    />
                  </PopoverContent>
                </Popover>
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
                    isCurrentlyStudying ? "opacity-50" : ""
                  )}>
                    <Popover>
                      <PopoverTrigger asChild disabled={isCurrentlyStudying}>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !endDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {endDate ? format(endDate, "PPP") : <span>Select end date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={endDate}
                          onSelect={(date) => {
                            try {
                              // Only allow dates after start date
                              if (startDate && date && date < startDate) {
                                toast({
                                  title: "Invalid date",
                                  description: "End date must be after start date",
                                  variant: "destructive"
                                });
                                return;
                              }
                              
                              if (date) {
                                setEndDate(date);
                                const formattedDate = format(date, "MMM yyyy");
                                setNewEducation({
                                  ...newEducation,
                                  endDate: formattedDate
                                });
                              } else {
                                // If date is cleared or null
                                setEndDate(undefined);
                                setNewEducation({
                                  ...newEducation,
                                  endDate: ''
                                });
                              }
                            } catch (error) {
                              console.error("Error handling end date selection:", error);
                            }
                          }}
                          fromDate={startDate || undefined}
                          initialFocus
                          captionLayout="dropdown-buttons"
                          fromYear={1990}
                          toYear={2030}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="currentEducation"
                      checked={isCurrentlyStudying}
                      onCheckedChange={(checked) => {
                        const isChecked = checked === true;
                        setIsCurrentlyStudying(isChecked);
                        
                        if (isChecked) {
                          setNewEducation({
                            ...newEducation,
                            endDate: 'Present'
                          });
                          setEndDate(undefined);
                        } else {
                          setNewEducation({
                            ...newEducation,
                            endDate: ''
                          });
                        }
                      }}
                    />
                    <label 
                      htmlFor="currentEducation" 
                      className="text-sm text-gray-600 cursor-pointer"
                      onClick={() => {
                        const newValue = !isCurrentlyStudying;
                        setIsCurrentlyStudying(newValue);
                        
                        if (newValue) {
                          setNewEducation({
                            ...newEducation,
                            endDate: 'Present'
                          });
                          setEndDate(undefined);
                        } else {
                          setNewEducation({
                            ...newEducation,
                            endDate: ''
                          });
                        }
                      }}
                    >
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
