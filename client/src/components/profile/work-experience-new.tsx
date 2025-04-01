import { useState, useEffect, useRef } from "react";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Loader2, CalendarIcon, Plus, Pencil, Trash } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  const [startMonth, setStartMonth] = useState<string>("");
  const [startYear, setStartYear] = useState<string>("");
  const [endMonth, setEndMonth] = useState<string>("");
  const [endYear, setEndYear] = useState<string>("");

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
    setStartMonth("");
    setStartYear("");
    setEndMonth("");
    setEndYear("");
  };

  const updateStartDate = () => {
    if (startMonth && startYear) {
      try {
        const month = parseInt(startMonth, 10) - 1;
        const year = parseInt(startYear, 10);
        const newDate = new Date(year, month, 1);
        setStartDate(newDate);
        
        const formattedDate = format(newDate, "MMM yyyy");
        setNewExperience({
          ...newExperience,
          startDate: formattedDate
        });
      } catch (error) {
        console.error("Error setting start date:", error);
      }
    }
  };
  
  const updateEndDate = () => {
    if (endMonth && endYear) {
      try {
        const month = parseInt(endMonth, 10) - 1;
        const year = parseInt(endYear, 10);
        const newDate = new Date(year, month, 1);
        
        // Validate that end date is after start date
        if (startDate && newDate < startDate) {
          toast({
            title: "Invalid date",
            description: "End date must be after start date",
            variant: "destructive"
          });
          return;
        }
        
        setEndDate(newDate);
        const formattedDate = format(newDate, "MMM yyyy");
        setNewExperience({
          ...newExperience,
          endDate: formattedDate
        });
      } catch (error) {
        console.error("Error setting end date:", error);
      }
    }
  };
  
  useEffect(() => {
    updateStartDate();
  }, [startMonth, startYear]);
  
  useEffect(() => {
    updateEndDate();
  }, [endMonth, endYear]);
  
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
        setStartMonth("");
        setStartYear("");
        setEndMonth("");
        setEndYear("");
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
          const date = new Date(experienceToEdit.startDate);
          setStartDate(date);
          setStartMonth(format(date, "MM"));
          setStartYear(date.getFullYear().toString());
        } catch (error) {
          console.error("Failed to parse start date:", error);
        }
      }
      
      if (experienceToEdit.endDate && experienceToEdit.endDate !== 'Present') {
        try {
          const date = new Date(experienceToEdit.endDate);
          setEndDate(date);
          setEndMonth(format(date, "MM"));
          setEndYear(date.getFullYear().toString());
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

  // Generate year options from 1990 to current year
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1990 + 10 }, (_, i) => (1990 + i).toString());

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
              <Plus className="mr-1 h-4 w-4" /> Add
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
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button 
                        className="text-gray-400 hover:text-gray-500 focus:outline-none"
                        onClick={() => handleDelete(exp.id)}
                      >
                        <Trash className="h-4 w-4" />
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
              <div className="col-span-3 grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="startMonth" className="mb-1 block text-sm">Month</Label>
                  <Select value={startMonth} onValueChange={setStartMonth}>
                    <SelectTrigger id="startMonth">
                      <SelectValue placeholder="Month" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[200px] overflow-y-auto">
                      {months.map(month => (
                        <SelectItem key={month.value} value={month.value} className="cursor-pointer">
                          {month.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="startYear" className="mb-1 block text-sm">Year</Label>
                  <Select value={startYear} onValueChange={setStartYear}>
                    <SelectTrigger id="startYear">
                      <SelectValue placeholder="Year" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[200px] overflow-y-auto">
                      {years.map(year => (
                        <SelectItem key={year} value={year} className="cursor-pointer">
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="endDate" className="text-right">
                End Date
              </Label>
              <div className="col-span-3">
                <div className="flex space-x-2 items-center">
                  <div className={cn(
                    "flex-1 grid grid-cols-2 gap-2",
                    newExperience.endDate === 'Present' ? "opacity-50 pointer-events-none" : ""
                  )}>
                    <div>
                      <Label htmlFor="endMonth" className="mb-1 block text-sm">Month</Label>
                      <Select 
                        value={endMonth} 
                        onValueChange={setEndMonth}
                        disabled={newExperience.endDate === 'Present'}>
                        <SelectTrigger id="endMonth">
                          <SelectValue placeholder="Month" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[200px] overflow-y-auto">
                          {months.map(month => (
                            <SelectItem key={month.value} value={month.value} className="cursor-pointer">
                              {month.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="endYear" className="mb-1 block text-sm">Year</Label>
                      <Select 
                        value={endYear} 
                        onValueChange={setEndYear}
                        disabled={newExperience.endDate === 'Present'}>
                        <SelectTrigger id="endYear">
                          <SelectValue placeholder="Year" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[200px] overflow-y-auto">
                          {years.map(year => (
                            <SelectItem key={year} value={year} className="cursor-pointer">
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-2">
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
                          setEndMonth("");
                          setEndYear("");
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