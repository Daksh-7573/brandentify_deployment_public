import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface SkillItem {
  id: number;
  name: string;
  level: string;
  proficiency: number;
  userId: number;
}

const CardSkeleton = () => (
  <div className="neo-glass-card p-4 animate-pulse">
    <div className="h-6 bg-white/10 rounded mb-2"></div>
    <div className="h-4 bg-white/5 rounded mb-1"></div>
    <div className="h-4 bg-white/5 rounded w-2/3"></div>
  </div>
);

export default function Skills() {
  const { user, isDemoMode } = useAuth();
  const userId = isDemoMode ? 1 : (user?.uid || 1);
  const userNumericId = user?.id || 2;
  
  // Fetch skills with normal caching
  const { data: serverSkills, isLoading, refetch } = useQuery({
    queryKey: [`/api/users/${userId}/skills`],
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
  
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

  const queryClient = useQueryClient();

  const addSkillMutation = useMutation({
    mutationFn: (skillData: any) => apiRequest(`/api/users/${userNumericId}/skills`, {
      method: 'POST',
      body: JSON.stringify(skillData)
    }),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Skill added successfully",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/skills`] });
      setIsAddModalOpen(false);
      refetch();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add skill",
        variant: "destructive",
      });
    }
  });

  const deleteSkillMutation = useMutation({
    mutationFn: (skillId: number) => apiRequest(`/api/users/${userId}/skills/${skillId}`, {
      method: 'DELETE'
    }),
    onSuccess: () => {
      toast({
        title: "Success", 
        description: "Skill deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/skills`] });
      refetch();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete skill",
        variant: "destructive",
      });
    }
  });

  const handleAddSkill = () => {
    if (!newSkill.name?.trim()) {
      toast({
        title: "Error",
        description: "Skill name is required",
        variant: "destructive",
      });
      return;
    }

    addSkillMutation.mutate({
      name: newSkill.name.trim(),
      level: newSkill.level || 'Intermediate',
      proficiency: sliderValue
    });
  };

  const handleDeleteSkill = (skillId: number) => {
    deleteSkillMutation.mutate(skillId);
  };

  const handleEditSkill = (skill: SkillItem) => {
    // Edit functionality can be added later
    console.log('Edit skill:', skill);
  };

  return (
    <div className="p-1">
      <div className="flex flex-row items-center justify-between space-y-0 pb-4 mb-4 border-b border-gray-800">
        <div>
          <h2 className="text-xl font-bold text-white">Skills & Expertise</h2>
          <p className="text-sm text-gray-300">Showcase your professional skills</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="neo-glass-button flex items-center gap-1 py-1.5 px-3 whitespace-nowrap"
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
                      className="text-red-400/60 hover:text-red-400 focus:outline-none rounded-full p-1 hover:bg-red-500/10 backdrop-blur-sm transition-all duration-200"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-400 mt-2">{skill.level}</p>
                <div className="mt-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-500">Proficiency</span>
                    <span className="text-xs text-blue-400 font-medium">{skill.proficiency}%</span>
                  </div>
                  <div className="w-full bg-gray-700/50 rounded-full h-1.5">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${skill.proficiency}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-4">
              <div className="w-16 h-16 bg-gray-800 rounded-full mx-auto mb-3 flex items-center justify-center">
                <Plus className="h-8 w-8 text-gray-600" />
              </div>
              <p className="text-lg font-medium">No skills added yet</p>
              <p className="text-sm text-gray-500">Showcase your expertise by adding your first skill</p>
            </div>
            <Button
              onClick={handleOpenAddModal}
              className="neo-glass-button"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Skill
            </Button>
          </div>
        )}
      </div>

      {/* Add Skill Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="neo-glass-card border-0 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Add New Skill</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label className="text-white">Skill Name</Label>
              <Input
                value={newSkill.name || ''}
                onChange={(e) => setNewSkill(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., JavaScript, Project Management"
                className="neo-glass-input"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-white">Level</Label>
              <Select
                value={newSkill.level || 'Intermediate'}
                onValueChange={(value) => setNewSkill(prev => ({ ...prev, level: value }))}
              >
                <SelectTrigger className="neo-glass-input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="neo-glass-card border-gray-700">
                  {levelOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value} className="text-white hover:bg-white/10">
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label className="text-white">Proficiency: {sliderValue}%</Label>
              <Slider
                value={[sliderValue]}
                onValueChange={(value) => setSliderValue(value[0])}
                max={100}
                step={5}
                className="w-full"
              />
            </div>
            
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsAddModalOpen(false)}
                className="flex-1 neo-glass-button-secondary"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddSkill}
                disabled={addSkillMutation.isPending || !newSkill.name?.trim()}
                className="flex-1 neo-glass-button-primary"
              >
                {addSkillMutation.isPending ? 'Adding...' : 'Add Skill'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}