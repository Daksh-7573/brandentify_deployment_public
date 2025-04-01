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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

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

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newExperience, setNewExperience] = useState<Partial<WorkExperienceItem>>({
    title: '',
    company: '',
    location: '',
    startDate: '',
    endDate: '',
    description: ''
  });
  
  // For date pickers
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

  const handleAdd = () => {
    setIsAddModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    // Reset form
    setNewExperience({
      title: '',
      company: '',
      location: '',
      startDate: '',
      endDate: '',
      description: ''
    });
    // Reset date pickers
    setStartDate(undefined);
    setEndDate(undefined);
  };
  
  const handleSaveExperience = async () => {
    try {
      // Validate form
      if (!newExperience.title || !newExperience.company || !newExperience.startDate) {
        toast({
          title: "Missing information",
          description: "Please fill in all required fields",
          variant: "destructive"
        });
        return;
      }
      
      // Validate that end date is after start date if both are provided and end date is not "Present"
      if (
        newExperience.startDate && 
        newExperience.endDate && 
        newExperience.endDate !== 'Present'
      ) {
        const startDateObj = new Date(newExperience.startDate);
        const endDateObj = new Date(newExperience.endDate);
        
        if (endDateObj < startDateObj) {
          toast({
            title: "Invalid date range",
            description: "End date must be after start date",
            variant: "destructive"
          });
          return;
        }
      }
      
      // Add userId to the experience if it's not already there
      const experienceToSave = {
        ...newExperience,
        userId: userId
      };
      
      let response;
      let successMessage;
      
      // Check if we're editing an existing experience (has an id) or creating a new one
      if (newExperience.id) {
        // Update existing experience
        response = await apiRequest('PUT', `/api/experiences/${newExperience.id}`, experienceToSave);
        successMessage = "Your work experience has been updated successfully";
      } else {
        // Create new experience
        response = await apiRequest('POST', '/api/experiences', experienceToSave);
        successMessage = "Your work experience has been added successfully";
      }
      
      if (response.ok) {
        // Close modal
        setIsAddModalOpen(false);
        
        // Refresh data
        refetch();
        
        // Show success message
        toast({
          title: newExperience.id ? "Experience updated" : "Experience added",
          description: successMessage,
        });
        
        // Reset form
        setNewExperience({
          title: '',
          company: '',
          location: '',
          startDate: '',
          endDate: '',
          description: ''
        });
        
        // Reset date pickers
        setStartDate(undefined);
        setEndDate(undefined);
      } else {
        throw new Error(`Failed to ${newExperience.id ? 'update' : 'save'} experience`);
      }
    } catch (error) {
      console.error("Error saving experience:", error);
      toast({
        title: "Error",
        description: `Failed to ${newExperience.id ? 'update' : 'save'} your work experience. Please try again.`,
        variant: "destructive"
      });
    }
  };

  const handleEdit = (id: number) => {
    // Find the experience to edit
    const experienceToEdit = displayExperiences.find(exp => exp.id === id);
    if (experienceToEdit) {
      setNewExperience({
        ...experienceToEdit
      });
      
      // Set the date pickers
      if (experienceToEdit.startDate) {
        try {
          setStartDate(new Date(experienceToEdit.startDate));
        } catch (error) {
          console.error("Failed to parse start date:", error);
        }
      }
      
      if (experienceToEdit.endDate && experienceToEdit.endDate !== 'Present') {
        try {
          setEndDate(new Date(experienceToEdit.endDate));
        } catch (error) {
          console.error("Failed to parse end date:", error);
        }
      }
      
      setIsAddModalOpen(true);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await apiRequest('DELETE', `/api/experiences/${id}`);
      if (response.ok) {
        // Update local state immediately for responsiveness
        setExperiences(experiences.filter(exp => exp.id !== id));
        
        // Show success message
        toast({
          title: "Experience deleted",
          description: "Your work experience has been deleted successfully",
        });
        
        // Refresh data
        refetch();
      } else {
        throw new Error("Failed to delete experience");
      }
    } catch (error) {
      console.error("Error deleting experience:", error);
      toast({
        title: "Error",
        description: "Failed to delete your work experience. Please try again.",
        variant: "destructive"
      });
    }
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
  const unfilteredExperiences = experiences.length > 0 ? experiences : 
                           (latestDataRef.current.length > 0 ? latestDataRef.current : []);
  
  // Sort experiences by start date (newest first)
  const displayExperiences = [...unfilteredExperiences].sort((a, b) => {
    // Try to parse dates or use string comparison if parsing fails
    const dateA = a.startDate;
    const dateB = b.startDate;
    return dateB.localeCompare(dateA); // Reverse order for newest first
  });

  const { toast } = useToast();

  return (
    <>
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

      {/* Add Experience Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>{newExperience.id ? 'Edit Work Experience' : 'Add Work Experience'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Job Title*
              </Label>
              <Input
                id="title"
                value={newExperience.title}
                onChange={(e) => setNewExperience({...newExperience, title: e.target.value})}
                className="col-span-3"
                placeholder="Software Engineer"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="company" className="text-right">
                Company*
              </Label>
              <Input
                id="company"
                value={newExperience.company}
                onChange={(e) => setNewExperience({...newExperience, company: e.target.value})}
                className="col-span-3"
                placeholder="Acme Inc."
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="location" className="text-right">
                Location
              </Label>
              <Input
                id="location"
                value={newExperience.location}
                onChange={(e) => setNewExperience({...newExperience, location: e.target.value})}
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
                        setStartDate(date);
                        if (date) {
                          setNewExperience({
                            ...newExperience,
                            startDate: format(date, "MMM yyyy")
                          });
                        }
                      }}
                      initialFocus
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
                    newExperience.endDate === 'Present' ? "opacity-50" : ""
                  )}>
                    <Popover>
                      <PopoverTrigger asChild disabled={newExperience.endDate === 'Present'}>
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
                            // Only allow dates after start date
                            if (startDate && date && date < startDate) {
                              toast({
                                title: "Invalid date",
                                description: "End date must be after start date",
                                variant: "destructive"
                              });
                              return;
                            }
                            
                            setEndDate(date);
                            if (date) {
                              setNewExperience({
                                ...newExperience,
                                endDate: format(date, "MMM yyyy")
                              });
                            } else {
                              // If date is cleared, keep as empty (will be handled as Present if checkbox is checked)
                              setNewExperience({
                                ...newExperience,
                                endDate: ''
                              });
                            }
                          }}
                          fromDate={startDate || undefined}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="currentJob"
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                      checked={newExperience.endDate === 'Present'}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setNewExperience({
                            ...newExperience,
                            endDate: 'Present'
                          });
                          setEndDate(undefined);
                        } else {
                          setNewExperience({
                            ...newExperience,
                            endDate: ''
                          });
                        }
                      }}
                    />
                    <label htmlFor="currentJob" className="text-sm text-gray-600">
                      I currently work here
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="description" className="text-right pt-2">
                Description
              </Label>
              <Textarea
                id="description"
                value={newExperience.description}
                onChange={(e) => setNewExperience({...newExperience, description: e.target.value})}
                className="col-span-3"
                placeholder="Describe your responsibilities and achievements..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button onClick={handleSaveExperience}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
