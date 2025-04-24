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
import { Skeleton } from "@/components/ui/skeleton";
import { CardSkeleton } from "@/components/ui/skeleton-loaders";
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
  // Don't try to parse Firebase UID as an integer - use the string directly for Firebase auth users
  const userId = isDemoMode ? 1 : (user?.uid || 1);
  
  // Get the numeric user ID if available from auth context (for database operations)
  const userNumericId = user?.id || 2;
  console.log("Skills component - Using userNumericId:", userNumericId);
  
  // Fetch skills from the API with advanced options
  const { data: serverSkills, isLoading, refetch } = useQuery({
    queryKey: [`/api/users/${userId}/skills`],
    enabled: !!userId,
    staleTime: 0, // Always consider data stale to force refresh
    refetchOnMount: 'always', // Always refetch when component mounts
    refetchOnWindowFocus: true, // Refetch when window regains focus
    refetchInterval: 1000, // Poll every second to keep data fresh
  });
  
  // Enhanced direct fetch with retry mechanism
  useEffect(() => {
    // Track if component is mounted to prevent state updates after unmount
    let isMounted = true;
    const MAX_RETRIES = 3;
    const RETRY_DELAY = 1000; // 1 second between retries
    
    async function directFetch(retryCount = 0) {
      const timestamp = new Date().getTime(); // Add timestamp to prevent caching
      console.log(`Skills - Directly fetching latest skills data (${timestamp}), attempt: ${retryCount + 1}`);
      
      try {
        // Try numeric ID first if available
        const endpointUrl = userNumericId 
          ? `/api/users/${userNumericId}/skills?_=${timestamp}` 
          : `/api/users/${userId}/skills?_=${timestamp}`;
        
        const response = await fetch(endpointUrl, {
          method: 'GET',
          headers: { 
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });
        
        // Check if response is OK
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const freshData = await response.json();
        console.log("Skills - Got direct fetch data:", freshData);
        
        // Only update state if component is still mounted
        if (isMounted && freshData && Array.isArray(freshData)) {
          setSkills(freshData);
        }
      } catch (error) {
        console.error(`Error fetching skills (attempt ${retryCount + 1}):`, error);
        
        // Try alternative endpoint on error if we're using firebaseUid
        if (userId !== userNumericId && retryCount === 0) {
          console.log("Skills - Trying alternative endpoint with numeric ID");
          try {
            const fallbackResponse = await fetch(`/api/users/${userNumericId}/skills?_=${timestamp}`, {
              method: 'GET',
              headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' }
            });
            
            if (fallbackResponse.ok) {
              const fallbackData = await fallbackResponse.json();
              console.log("Skills - Got fallback data with numeric ID:", fallbackData);
              if (isMounted && fallbackData && Array.isArray(fallbackData)) {
                setSkills(fallbackData);
                return; // Success with fallback, no need to retry
              }
            }
          } catch (fallbackError) {
            console.error("Error with fallback skills endpoint:", fallbackError);
          }
        }
        
        // Retry logic
        if (retryCount < MAX_RETRIES && isMounted) {
          console.log(`Skills - Retrying fetch in ${RETRY_DELAY}ms (${retryCount + 1}/${MAX_RETRIES})`);
          setTimeout(() => {
            if (isMounted) directFetch(retryCount + 1);
          }, RETRY_DELAY);
        }
      }
    }
    
    directFetch();
    
    // Cleanup function to prevent memory leaks
    return () => {
      isMounted = false;
    };
  }, [userId, userNumericId]);
  
  const [skills, setSkills] = useState<SkillItem[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newSkill, setNewSkill] = useState<Partial<SkillItem>>({
    name: '',
    level: 'Intermediate',
    proficiency: 50
  });
  const [sliderValue, setSliderValue] = useState(50);
  const { toast } = useToast();
  
  // Update local skills when server skills change
  useEffect(() => {
    if (serverSkills && Array.isArray(serverSkills)) {
      setSkills(serverSkills);
    }
  }, [serverSkills]);
  
  const levelOptions = [
    { value: 'Beginner', label: 'Beginner' },
    { value: 'Intermediate', label: 'Intermediate' },
    { value: 'Advanced', label: 'Advanced' },
    { value: 'Expert', label: 'Expert' }
  ];
  
  const handleOpenAddModal = () => {
    setNewSkill({
      name: '',
      level: 'Intermediate',
      proficiency: 50
    });
    setSliderValue(50);
    setIsAddModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsAddModalOpen(false);
  };
  
  const handleSliderChange = (value: number[]) => {
    const proficiency = value[0];
    setSliderValue(proficiency);
    
    // Also update the proficiency level based on the slider value
    let level = 'Intermediate';
    if (proficiency <= 25) level = 'Beginner';
    else if (proficiency <= 50) level = 'Intermediate';
    else if (proficiency <= 75) level = 'Advanced';
    else level = 'Expert';
    
    setNewSkill(prev => ({ ...prev, proficiency, level }));
  };
  
  const handleLevelChange = (value: string) => {
    // Automatically set a matching proficiency value based on level
    let proficiency = 50;
    if (value === 'Beginner') proficiency = 25;
    else if (value === 'Intermediate') proficiency = 50;
    else if (value === 'Advanced') proficiency = 75;
    else if (value === 'Expert') proficiency = 100;
    
    setSliderValue(proficiency);
    setNewSkill(prev => ({ ...prev, level: value, proficiency }));
  };
  
  const handleEditSkill = (skill: SkillItem) => {
    setNewSkill(skill);
    setSliderValue(skill.proficiency);
    setIsAddModalOpen(true);
  };
  
  const handleDeleteSkill = async (skillId: number) => {
    if (!skillId) return;
    
    try {
      console.log("Deleting skill with ID:", skillId);
      
      await apiRequest({
        method: 'DELETE', 
        url: `/api/skills/${skillId}`
      });
      
      setSkills(prev => prev.filter(skill => skill.id !== skillId));
      
      toast({
        title: "Skill deleted",
        description: "Skill has been removed from your profile",
      });
      
      // Invalidate both Firebase UID and numeric user ID query keys to ensure all caches are refreshed
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/skills`] });
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userNumericId}/skills`] });
      
    } catch (error) {
      console.error("Error deleting skill:", error);
      toast({
        title: "Error",
        description: "Failed to delete skill. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const handleSaveSkill = async () => {
    // Validate both skill name and proficiency level are provided
    if (!newSkill.name) {
      toast({
        title: "Validation Error",
        description: "Skill name is required",
        variant: "destructive",
      });
      return;
    }
    
    if (!newSkill.level) {
      toast({
        title: "Validation Error",
        description: "Proficiency level is required",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const method = newSkill.id ? 'PUT' : 'POST';
      const url = newSkill.id ? `/api/skills/${newSkill.id}` : '/api/skills';
      
      // Use the numeric user ID from auth context for database operations
      const data = {
        ...newSkill,
        userId: userNumericId // Use the numeric ID for database operations
      };
      
      console.log("Saving skill with data:", data);
      
      await apiRequest({
        method,
        url,
        data
      });
      
      toast({
        title: newSkill.id ? "Skill updated" : "Skill added",
        description: newSkill.id ? 
          "Skill has been updated successfully" : 
          "Skill has been added to your profile",
      });
      
      // Invalidate the skills query to trigger a refresh
      // Invalidate both Firebase UID and numeric user ID query keys to ensure all caches are refreshed
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/skills`] });
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userNumericId}/skills`] });
      setIsAddModalOpen(false);
      
    } catch (error) {
      console.error("Error saving skill:", error);
      toast({
        title: "Error",
        description: "Failed to save skill. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Function to determine color based on proficiency
  const getColor = (proficiency: number) => {
    if (proficiency < 33) return 'bg-red-500';
    if (proficiency < 66) return 'bg-yellow-500';
    return 'bg-green-500';
  };
  
  return (
    <>
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-xl font-bold">What I'm Good At</CardTitle>
            <CardDescription>Add your professional skills and expertise levels</CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1"
            onClick={handleOpenAddModal}
          >
            <Plus className="h-3.5 w-3.5" />
            Add Skill
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </div>
          ) : skills.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {skills.map((skill) => (
                <div 
                  key={skill.id} 
                  className="border bg-background rounded-lg p-4 transition-all hover:shadow-md hover:border-primary/30"
                >
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium text-base line-clamp-2 flex-1">{skill.name}</h3>
                    <div className="flex items-center space-x-1 ml-2">
                      <button 
                        onClick={() => handleEditSkill(skill)} 
                        className="text-muted-foreground hover:text-primary focus:outline-none rounded-full p-1 hover:bg-muted"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button 
                        onClick={() => handleDeleteSkill(skill.id)} 
                        className="text-muted-foreground hover:text-destructive focus:outline-none rounded-full p-1 hover:bg-muted"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-2">
                    <span className="inline-block text-xs text-muted-foreground px-2 py-0.5 rounded-full bg-muted mb-2">
                      {skill.level || 'No level set'}
                    </span>
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Proficiency Percentage</span>
                        <span>{skill.proficiency}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div 
                          className={`${getColor(skill.proficiency)} h-1.5 rounded-full`} 
                          style={{ width: `${skill.proficiency}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-6 text-center">
              <Lightbulb className="mx-auto h-10 w-10 text-muted-foreground/50" />
              <p className="mt-2 text-muted-foreground">Nothing added yet. Share what you're good at!</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Add/Edit Skill Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>{newSkill.id ? 'Edit What You\'re Good At' : 'Add What You\'re Good At'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                What You're Good At*
              </Label>
              <Input
                id="name"
                value={newSkill.name}
                onChange={(e) => setNewSkill({...newSkill, name: e.target.value})}
                className="col-span-3"
                placeholder="e.g., JavaScript, Project Management, Public Speaking"
                required
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="level" className="text-right">
                Proficiency Level*
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
                Proficiency Percentage <span className="text-xs text-gray-500">(auto-set based on level)</span>
              </Label>
              <div className="col-span-3 px-2">
                <div className="mb-2 flex justify-between">
                  <span className="text-xs text-gray-600">Beginner</span>
                  <span className="text-xs text-gray-600">Intermediate</span>
                  <span className="text-xs text-gray-600">Advanced</span>
                  <span className="text-xs text-gray-600">Expert</span>
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