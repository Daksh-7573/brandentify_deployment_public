import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Loader2, Pencil, Trash2, Plus, Lightbulb } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { NeoGlassSection } from "@/components/layout/neo-glass-layout";
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
  
  // Fetch skills from the API with proper caching
  const { data: serverSkills, isLoading, refetch } = useQuery({
    queryKey: [`/api/users/${userId}/skills`],
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnMount: false, // Prevent automatic refetch on mount
    refetchOnWindowFocus: false, // Disable refetch on window focus
    refetchInterval: false, // Disable polling
  });
  
  // Removed infinite loop causing useEffect completely
  
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
      <div className="mb-6">
        <div className="flex flex-row items-center justify-between space-y-0 pb-4 mb-4 border-b border-gray-800">
          <div>
            <h2 className="text-xl font-bold text-white">What I'm Good At</h2>
            <p className="text-sm text-gray-300">Add your professional skills and expertise levels</p>
          </div>
          <button
            className="neo-glass-button flex items-center gap-1 py-1.5 px-3 whitespace-nowrap"
            onClick={handleOpenAddModal}
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Skill</span>
          </button>
        </div>
        <div className="p-1">
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
                  className="neo-glass-card p-4 transition-all hover:translate-y-[-3px] hover:shadow-lg"
                >
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium text-base line-clamp-2 flex-1 text-white">{skill.name}</h3>
                    <div className="flex items-center space-x-1 ml-2">
                      <button 
                        onClick={() => handleEditSkill(skill)} 
                        className="text-white/60 hover:text-white focus:outline-none rounded-full p-1 hover:bg-white/10 backdrop-blur-sm transition-all duration-200"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button 
                        onClick={() => handleDeleteSkill(skill.id)} 
                        className="text-red-300/70 hover:text-red-200 focus:outline-none rounded-full p-1 hover:bg-red-500/20 backdrop-blur-sm transition-all duration-200"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-2">
                    <span className="inline-block text-xs text-white/80 px-2 py-0.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-2">
                      {skill.level || 'No level set'}
                    </span>
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-white/70">Proficiency</span>
                        <span className="text-white/90 font-medium">{skill.proficiency}%</span>
                      </div>
                      <div className="w-full bg-white/10 backdrop-blur-sm rounded-full h-1.5 border border-white/20">
                        <div 
                          className="bg-gradient-to-r from-white/60 to-white/80 h-1.5 rounded-full transition-all duration-300" 
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
              <Lightbulb className="mx-auto h-10 w-10 text-gray-500/50" />
              <p className="mt-2 text-gray-400">Nothing added yet. Share what you're good at!</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Add/Edit Skill Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[550px] neo-glass-card">
          <DialogHeader>
            <DialogTitle className="text-white text-lg font-bold">{newSkill.id ? 'Edit What You\'re Good At' : 'Add What You\'re Good At'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-5">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-white">
                What You're Good At*
              </Label>
              <Input
                id="name"
                value={newSkill.name}
                onChange={(e) => setNewSkill({...newSkill, name: e.target.value})}
                className="bg-[rgba(18,18,18,0.95)] backdrop-blur-md text-white border-white/20 shadow-md transition-all hover:border-white/30 w-full h-12 py-3 px-3 rounded-md border placeholder-white/50 focus:border-white/50 focus:ring-2 focus:ring-white/30 focus:outline-none"
                placeholder="e.g., JavaScript, Project Management, Public Speaking"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="level" className="text-sm font-medium text-white">
                Proficiency Level*
              </Label>
              <div className="relative">
                <select
                  id="level"
                  value={newSkill.level || ''}
                  onChange={(e) => handleLevelChange(e.target.value)}
                  className="bg-[rgba(18,18,18,0.95)] backdrop-blur-md text-white border-white/20 shadow-md transition-all hover:border-white/30 w-full h-12 py-3 px-3 pr-10 rounded-md border appearance-none cursor-pointer focus:border-white/50 focus:ring-2 focus:ring-white/30 focus:outline-none"
                >
                  <option value="">Select proficiency level</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Expert">Expert</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="h-4 w-4 text-white/70" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right text-white">
                Proficiency Percentage <span className="text-xs text-white/60">(auto-set based on level)</span>
              </Label>
              <div className="col-span-3 px-2">
                <div className="mb-2 flex justify-between">
                  <span className="text-xs text-white/60">Beginner</span>
                  <span className="text-xs text-white/60">Intermediate</span>
                  <span className="text-xs text-white/60">Advanced</span>
                  <span className="text-xs text-white/60">Expert</span>
                </div>
                <div className="mb-3">
                  <Slider
                    value={[sliderValue]}
                    min={0}
                    max={100}
                    step={1}
                    onValueChange={handleSliderChange}
                    className="[&_[role=slider]]:bg-[rgba(18,18,18,0.95)] [&_[role=slider]]:backdrop-blur-md [&_[role=slider]]:border-white/30 [&_[role=slider]]:border-2 [&_[role=slider]]:shadow-md [&>.relative>.absolute]:bg-white/70 [&>.relative]:bg-[rgba(18,18,18,0.7)] [&>.relative]:backdrop-blur-sm [&>.relative]:border [&>.relative]:border-white/20"
                  />
                </div>
                <div className="flex justify-between items-center">
                  <div className="w-full bg-[rgba(18,18,18,0.95)] backdrop-blur-md border border-white/20 rounded-full h-2 mb-2 shadow-md">
                    <div 
                      className={`${getColor(sliderValue)} h-2 rounded-full backdrop-blur-sm shadow-sm`} 
                      style={{ width: `${sliderValue}%` }}
                    ></div>
                  </div>
                  <span className="text-xs font-medium text-white ml-2">{sliderValue}%</span>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="flex justify-end pt-4">
            <button 
              type="button" 
              className="neo-glass-button flex items-center gap-2 py-2 px-4"
              onClick={handleSaveSkill}
            >
              Save
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}