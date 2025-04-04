import { useState, useEffect, useRef } from "react";
import { 
  Card, 
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Loader2, Pencil, Trash2, Plus, Lightbulb } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { CustomSelect } from "@/components/ui/custom-select";

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

  // For the modal form
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newSkill, setNewSkill] = useState<Partial<SkillItem>>({
    name: '',
    level: 'Beginner',
    proficiency: 50
  });
  
  // For Slider state
  const [sliderValue, setSliderValue] = useState(50);
  
  const { toast } = useToast();
  
  // Map level to proficiency ranges
  const levelToProficiency = {
    'Beginner': { min: 10, max: 40 },
    'Intermediate': { min: 41, max: 75 },
    'Advanced': { min: 76, max: 100 },
    'Expert': { min: 90, max: 100 }
  };
  
  // Calculate level from proficiency
  const getProficiencyLevel = (proficiency: number): string => {
    if (proficiency >= 76) return 'Advanced';
    if (proficiency >= 41) return 'Intermediate';
    return 'Beginner';
  };
  
  // Define level options for our custom select
  const levelOptions = [
    { value: "Beginner", label: "Beginner" },
    { value: "Intermediate", label: "Intermediate" },
    { value: "Advanced", label: "Advanced" },
    { value: "Expert", label: "Expert" }
  ];

  const handleAdd = () => {
    setIsAddModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    // Reset form
    setNewSkill({
      name: '',
      level: 'Beginner',
      proficiency: 50
    });
    // Reset slider
    setSliderValue(50);
  };
  
  const handleSaveSkill = async () => {
    try {
      // Validate form
      if (!newSkill.name) {
        toast({
          title: "Missing information",
          description: "Please enter a skill name",
          variant: "destructive"
        });
        return;
      }
      
      // Add userId to the skill
      const skillToSave = {
        ...newSkill,
        userId: userId,
        proficiency: sliderValue // Use the slider value
      };
      
      let response;
      let successMessage;
      
      // Check if we're editing an existing skill (has an id) or creating a new one
      if (newSkill.id) {
        // Update existing skill
        response = await apiRequest('PUT', `/api/skills/${newSkill.id}`, skillToSave);
        successMessage = "Your skill has been updated successfully";
      } else {
        // Create new skill
        response = await apiRequest('POST', '/api/skills', skillToSave);
        successMessage = "Your skill has been added successfully";
      }
      
      if (response.ok) {
        // Close modal
        setIsAddModalOpen(false);
        
        // Refresh data
        refetch();
        
        // Show success message
        toast({
          title: newSkill.id ? "Skill updated" : "Skill added",
          description: successMessage,
        });
        
        // Reset form
        setNewSkill({
          name: '',
          level: 'Beginner',
          proficiency: 50
        });
        
        // Reset slider
        setSliderValue(50);
      } else {
        throw new Error(`Failed to ${newSkill.id ? 'update' : 'save'} skill`);
      }
    } catch (error) {
      console.error("Error saving skill:", error);
      toast({
        title: "Error",
        description: `Failed to ${newSkill.id ? 'update' : 'save'} your skill. Please try again.`,
        variant: "destructive"
      });
    }
  };

  const handleEditSkill = (id: number) => {
    // Find the skill to edit
    const skillToEdit = displaySkills.find(skill => skill.id === id);
    if (skillToEdit) {
      setNewSkill({
        ...skillToEdit
      });
      
      // Set the slider value
      setSliderValue(skillToEdit.proficiency);
      
      setIsAddModalOpen(true);
    }
  };

  const handleDeleteSkill = async (id: number) => {
    try {
      const response = await apiRequest('DELETE', `/api/skills/${id}`);
      if (response.ok) {
        // Update local state immediately for responsiveness
        setSkills(skills.filter(skill => skill.id !== id));
        
        // Show success message
        toast({
          title: "Skill deleted",
          description: "Your skill has been deleted successfully",
        });
        
        // Refresh data
        refetch();
      } else {
        throw new Error("Failed to delete skill");
      }
    } catch (error) {
      console.error("Error deleting skill:", error);
      toast({
        title: "Error",
        description: "Failed to delete your skill. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  // Handle level change
  const handleLevelChange = (value: string) => {
    setNewSkill({...newSkill, level: value});
    
    // Set a default proficiency for the level
    const { min, max } = levelToProficiency[value as keyof typeof levelToProficiency];
    const defaultValue = Math.floor((min + max) / 2);
    setSliderValue(defaultValue);
  };
  
  // Handle slider change
  const handleSliderChange = (value: number[]) => {
    const newValue = value[0];
    setSliderValue(newValue);
    
    // Update the level based on the proficiency
    const level = getProficiencyLevel(newValue);
    setNewSkill({...newSkill, level, proficiency: newValue});
  };

  // Get color based on proficiency
  const getColor = (proficiency: number) => {
    if (proficiency >= 80) return "bg-green-500";
    if (proficiency >= 50) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <>
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-xl font-bold">Skills</CardTitle>
            <CardDescription>Add your professional skills</CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8 gap-1" 
            onClick={handleAdd}
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add</span>
          </Button>
        </CardHeader>
        
        <CardContent>
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
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500">{skill.level}</span>
                      <button 
                        className="text-gray-400 hover:text-gray-600 focus:outline-none"
                        onClick={() => handleEditSkill(skill.id)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button 
                        className="text-gray-400 hover:text-gray-600 focus:outline-none"
                        onClick={() => handleDeleteSkill(skill.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
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
            <div className="py-8 text-center">
              <div className="bg-muted/30 rounded-full p-4 w-20 h-20 mx-auto mb-3 flex items-center justify-center">
                <Lightbulb className="h-10 w-10 text-primary/60" />
              </div>
              <h3 className="text-lg font-medium mb-1">Showcase your expertise</h3>
              <p className="text-muted-foreground mb-4 max-w-md mx-auto">Adding your skills helps potential clients and employers find you for relevant opportunities.</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsAddModalOpen(true)} 
                className="mx-auto"
              >
                <Plus className="h-4 w-4 mr-1" /> Add Skills
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Add/Edit Skill Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>{newSkill.id ? 'Edit Skill' : 'Add Skill'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Skill Name*
              </Label>
              <Input
                id="name"
                value={newSkill.name}
                onChange={(e) => setNewSkill({...newSkill, name: e.target.value})}
                className="col-span-3"
                placeholder="JavaScript"
                required
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="level" className="text-right">
                Proficiency Level
              </Label>
              <div className="col-span-3">
                <CustomSelect 
                  value={newSkill.level || ''} 
                  onValueChange={handleLevelChange}
                  placeholder="Select level"
                  options={levelOptions}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">
                Proficiency
              </Label>
              <div className="col-span-3 px-2">
                <div className="mb-2 flex justify-between">
                  <span className="text-xs text-gray-600">Beginner</span>
                  <span className="text-xs text-gray-600">Advanced</span>
                </div>
                <Slider
                  value={[sliderValue]}
                  min={0}
                  max={100}
                  step={1}
                  onValueChange={handleSliderChange}
                  className="mb-3"
                />
                <div className="flex justify-between items-center">
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mb-2">
                    <div 
                      className={`${getColor(sliderValue)} h-1.5 rounded-full`} 
                      style={{ width: `${sliderValue}%` }}
                    ></div>
                  </div>
                  <span className="text-xs font-medium text-gray-700 ml-2">{sliderValue}%</span>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button onClick={handleSaveSkill}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
