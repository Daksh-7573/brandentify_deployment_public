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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

type WorkExperienceItem = {
  id: number;
  userId: number;
  title: string;
  company: string;
  location: string;
  industry: string;
  startDate: string;
  endDate?: string;
  description: string;
};

export default function WorkExperience() {
  const { user, isDemoMode } = useAuth();
  // Use the UID directly as a string instead of trying to parse it as an integer
  const userId = isDemoMode ? 1 : (user?.uid || "");
  
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
    industry: '',
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
      industry: '',
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
      // Validate form - require title, company, industry, and start date
      if (!newExperience.title || !newExperience.company) {
        toast({
          title: "Missing information",
          description: "Please provide at least the job title and company name",
          variant: "destructive"
        });
        return;
      }
      
      // Check if industry is provided
      if (!newExperience.industry) {
        toast({
          title: "Missing industry",
          description: "Please select an industry for this work experience",
          variant: "destructive"
        });
        return;
      }
      
      // Check if we have the month and year for the start date
      if (!startDate && !newExperience.startDate) {
        toast({
          title: "Missing start date",
          description: "Please provide at least the month and year for your start date",
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
      
      // Add userId to the experience
      // For Firebase users, this will be a string UID, for demo users it will be a number
      const experienceToSave = {
        ...newExperience,
        userId: userId
      };
      
      console.log("Saving experience with userId:", userId);
      console.log("Experience data to save:", experienceToSave);
      
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
          industry: '',
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
                      <p className="text-sm text-gray-500 mt-1">{exp.industry && `${exp.industry} • `}{exp.startDate} - {exp.endDate || 'Present'}</p>
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
              <div className="col-span-3">
                <Select
                  value={newExperience.location}
                  onValueChange={(value) => setNewExperience({...newExperience, location: value})}
                >
                  <SelectTrigger id="location" className="w-full">
                    <SelectValue placeholder="Select a location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Remote">Remote</SelectItem>
                    <SelectItem value="San Francisco, CA">San Francisco, CA</SelectItem>
                    <SelectItem value="New York, NY">New York, NY</SelectItem>
                    <SelectItem value="Seattle, WA">Seattle, WA</SelectItem>
                    <SelectItem value="Austin, TX">Austin, TX</SelectItem>
                    <SelectItem value="Chicago, IL">Chicago, IL</SelectItem>
                    <SelectItem value="Los Angeles, CA">Los Angeles, CA</SelectItem>
                    <SelectItem value="Boston, MA">Boston, MA</SelectItem>
                    <SelectItem value="Denver, CO">Denver, CO</SelectItem>
                    <SelectItem value="Washington, DC">Washington, DC</SelectItem>
                    <SelectItem value="Atlanta, GA">Atlanta, GA</SelectItem>
                    <SelectItem value="Toronto, Canada">Toronto, Canada</SelectItem>
                    <SelectItem value="London, UK">London, UK</SelectItem>
                    <SelectItem value="Berlin, Germany">Berlin, Germany</SelectItem>
                    <SelectItem value="Paris, France">Paris, France</SelectItem>
                    <SelectItem value="Mumbai, India">Mumbai, India</SelectItem>
                    <SelectItem value="Bangalore, India">Bangalore, India</SelectItem>
                    <SelectItem value="Sydney, Australia">Sydney, Australia</SelectItem>
                    <SelectItem value="Tokyo, Japan">Tokyo, Japan</SelectItem>
                    <SelectItem value="Singapore">Singapore</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4 mb-2 border-b border-gray-100 pb-2">
              <Label htmlFor="industry" className="text-right font-medium">
                Industry*
              </Label>
              <div className="col-span-3">
                <Select
                  value={newExperience.industry}
                  onValueChange={(value) => setNewExperience({...newExperience, industry: value})}
                >
                  <SelectTrigger id="industry" className="w-full bg-blue-50">
                    <SelectValue placeholder="Select an industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Technology">Technology</SelectItem>
                    <SelectItem value="Healthcare">Healthcare</SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                    <SelectItem value="Education">Education</SelectItem>
                    <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                    <SelectItem value="Retail">Retail</SelectItem>
                    <SelectItem value="Media">Media</SelectItem>
                    <SelectItem value="Consulting">Consulting</SelectItem>
                    <SelectItem value="Government">Government</SelectItem>
                    <SelectItem value="Non-profit">Non-profit</SelectItem>
                    <SelectItem value="Entertainment">Entertainment</SelectItem>
                    <SelectItem value="Transportation">Transportation</SelectItem>
                    <SelectItem value="Energy">Energy</SelectItem>
                    <SelectItem value="Real Estate">Real Estate</SelectItem>
                    <SelectItem value="Telecommunications">Telecommunications</SelectItem>
                    <SelectItem value="Agriculture">Agriculture</SelectItem>
                    <SelectItem value="Construction">Construction</SelectItem>
                    <SelectItem value="Hospitality">Hospitality</SelectItem>
                    <SelectItem value="Legal Services">Legal Services</SelectItem>
                    <SelectItem value="Biotechnology">Biotechnology</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
                      {startDate ? format(startDate, "MMM yyyy") : <span>Pick month and year</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <div className="p-3">
                      <div className="flex flex-col gap-2">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label htmlFor="startMonth">Month</Label>
                            <Select 
                              value={startDate ? format(startDate, "MM") : ""} 
                              onValueChange={(value) => {
                                try {
                                  const month = parseInt(value, 10) - 1; // JavaScript months are 0-indexed
                                  const year = startDate ? startDate.getFullYear() : new Date().getFullYear();
                                  const newDate = new Date(year, month, 1);
                                  setStartDate(newDate);
                                  setNewExperience({
                                    ...newExperience,
                                    startDate: format(newDate, "MMM yyyy")
                                  });
                                } catch (error) {
                                  console.error("Error setting month:", error);
                                }
                              }}
                            >
                              <SelectTrigger id="startMonth" className="w-full">
                                <SelectValue placeholder="Month" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="01">January</SelectItem>
                                <SelectItem value="02">February</SelectItem>
                                <SelectItem value="03">March</SelectItem>
                                <SelectItem value="04">April</SelectItem>
                                <SelectItem value="05">May</SelectItem>
                                <SelectItem value="06">June</SelectItem>
                                <SelectItem value="07">July</SelectItem>
                                <SelectItem value="08">August</SelectItem>
                                <SelectItem value="09">September</SelectItem>
                                <SelectItem value="10">October</SelectItem>
                                <SelectItem value="11">November</SelectItem>
                                <SelectItem value="12">December</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="startYear">Year</Label>
                            <Select 
                              value={startDate ? startDate.getFullYear().toString() : ""} 
                              onValueChange={(value) => {
                                try {
                                  const year = parseInt(value, 10);
                                  const month = startDate ? startDate.getMonth() : 0;
                                  const newDate = new Date(year, month, 1);
                                  setStartDate(newDate);
                                  setNewExperience({
                                    ...newExperience,
                                    startDate: format(newDate, "MMM yyyy")
                                  });
                                } catch (error) {
                                  console.error("Error setting year:", error);
                                }
                              }}
                            >
                              <SelectTrigger id="startYear" className="w-full">
                                <SelectValue placeholder="Year" />
                              </SelectTrigger>
                              <SelectContent>
                                {Array.from({ length: 41 }, (_, i) => 1990 + i).map(year => (
                                  <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    </div>
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
                          {endDate ? format(endDate, "MMM yyyy") : <span>Select month and year</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <div className="p-3">
                          <div className="flex flex-col gap-2">
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <Label htmlFor="endMonth">Month</Label>
                                <Select 
                                  value={endDate ? format(endDate, "MM") : ""} 
                                  onValueChange={(value) => {
                                    try {
                                      const month = parseInt(value, 10) - 1; // JavaScript months are 0-indexed
                                      const year = endDate ? endDate.getFullYear() : new Date().getFullYear();
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
                                      setNewExperience({
                                        ...newExperience,
                                        endDate: format(newDate, "MMM yyyy")
                                      });
                                    } catch (error) {
                                      console.error("Error setting month:", error);
                                    }
                                  }}
                                >
                                  <SelectTrigger id="endMonth" className="w-full">
                                    <SelectValue placeholder="Month" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="01">January</SelectItem>
                                    <SelectItem value="02">February</SelectItem>
                                    <SelectItem value="03">March</SelectItem>
                                    <SelectItem value="04">April</SelectItem>
                                    <SelectItem value="05">May</SelectItem>
                                    <SelectItem value="06">June</SelectItem>
                                    <SelectItem value="07">July</SelectItem>
                                    <SelectItem value="08">August</SelectItem>
                                    <SelectItem value="09">September</SelectItem>
                                    <SelectItem value="10">October</SelectItem>
                                    <SelectItem value="11">November</SelectItem>
                                    <SelectItem value="12">December</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label htmlFor="endYear">Year</Label>
                                <Select 
                                  value={endDate ? endDate.getFullYear().toString() : ""} 
                                  onValueChange={(value) => {
                                    try {
                                      const year = parseInt(value, 10);
                                      const month = endDate ? endDate.getMonth() : 0;
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
                                      setNewExperience({
                                        ...newExperience,
                                        endDate: format(newDate, "MMM yyyy")
                                      });
                                    } catch (error) {
                                      console.error("Error setting year:", error);
                                    }
                                  }}
                                >
                                  <SelectTrigger id="endYear" className="w-full">
                                    <SelectValue placeholder="Year" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {Array.from({ length: 41 }, (_, i) => 1990 + i).map(year => (
                                      <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </div>
                        </div>
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
