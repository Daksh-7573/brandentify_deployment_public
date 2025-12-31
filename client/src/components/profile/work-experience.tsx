import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Plus, 
  Building, 
  MapPin, 
  Calendar as CalendarIcon, 
  Edit, 
  Trash2, 
  Briefcase,
  X,
  Loader2,
  FileText,
  Globe,
  AlertCircle,
  Info
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';

// Form validation schema
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

// Import constants for industry and domain mappings
import { INDUSTRIES, INDUSTRY_DOMAINS } from '@shared/constants';
import { useProfileExperiences } from "@/contexts/profile-data-context";

// Work Experience Schema
const workExperienceFormSchema = z.object({
  id: z.number().optional(),
  title: z.string().min(1, "Job title is required"),
  company: z.string().min(1, "Company name is required"),
  location: z.string().min(1, "Location is required"),
  industry: z.string().min(1, "Industry is required"),
  domain: z.string().min(1, "Domain is required"),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  keyResponsibilities: z.array(z.string()).default([]),
  isCurrentlyWorking: z.boolean().default(false),
  userId: z.number()
});

// Location dropdown options
const workExperienceLocations = [
  "Remote",
  "San Francisco, CA", 
  "New York, NY",
  "Los Angeles, CA",
  "Chicago, IL",
  "Austin, TX",
  "Seattle, WA",
  "Boston, MA",
  "Denver, CO",
  "Miami, FL"
];

export default function WorkExperience() {
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Use consistent user ID logic matching other components (Skills, Projects)
  // Primary: numeric ID, Fallback: username, uid, or default to 1
  const userIdentifier = user?.id?.toString() || user?.username || user?.uid || '1';
  
  console.log("WorkExperience component - user object:", {
    id: user?.id,
    username: user?.username, 
    uid: user?.uid,
    email: user?.email
  });
  console.log("WorkExperience component - Using userIdentifier:", userIdentifier);
  
  // State for form management
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingExperience, setEditingExperience] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    industry: '',
    domain: '',
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
    keyResponsibilities: '',
    isCurrentlyWorking: false
  });
  
  // State for domain options based on selected industry
  const [domains, setDomains] = useState<string[]>([]);
  
  // Update domains when industry changes
  useEffect(() => {
    if (formData.industry && INDUSTRY_DOMAINS[formData.industry]) {
      const newDomains = INDUSTRY_DOMAINS[formData.industry];
      setDomains(newDomains);
      // Only reset domain if the current domain is not valid for the new industry
      if (formData.domain && !newDomains.includes(formData.domain)) {
        setFormData(prev => ({ ...prev, domain: '' }));
      }
    } else {
      setDomains([]);
    }
  }, [formData.industry]);

  // Queries and mutations
  const queryClient = useQueryClient();
  
  const batchData = useProfileExperiences();

  const { data: serverExperiences = [], isLoading: queryLoading } = useQuery<any[]>({
    queryKey: [`/api/users/${userIdentifier}/experiences`],
    enabled: !!userIdentifier && !batchData.isFromBatch
  });
  
  const experiences = batchData.isFromBatch ? (batchData.data || []) : serverExperiences;
  const isLoading = batchData.isFromBatch ? batchData.isLoading : queryLoading;

  const createExperienceMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch(`/api/experiences`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to create experience');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userIdentifier}/experiences`] });
      setShowAddDialog(false);
      resetForm();
      toast({ title: "Success", description: "Career path added successfully!" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to add career path", variant: "destructive" });
    }
  });

  const updateExperienceMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch(`/api/experiences/${data.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to update experience');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userIdentifier}/experiences`] });
      setShowEditDialog(false);
      setEditingExperience(null);
      resetForm();
      toast({ title: "Success", description: "Career path updated successfully!" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update career path", variant: "destructive" });
    }
  });

  const deleteExperienceMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/experiences/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete experience');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userIdentifier}/experiences`] });
      toast({ title: "Success", description: "Career path deleted successfully!" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete career path", variant: "destructive" });
    }
  });

  // Helper functions
  const formatDate = (date: Date) => {
    return format(date, 'MMM yyyy');
  };

  const resetForm = () => {
    setFormData({
      title: '',
      company: '',
      location: '',
      industry: '',
      domain: '',
      startDate: undefined,
      endDate: undefined,
      keyResponsibilities: '',
      isCurrentlyWorking: false
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const experienceData = {
      userId: parseInt(userIdentifier), // Convert to number for backend validation
      title: formData.title,
      company: formData.company,
      location: formData.location,
      industry: formData.industry,
      domain: formData.domain,
      startDate: formData.startDate?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0], // Format as YYYY-MM-DD or use current date
      endDate: formData.endDate?.toISOString().split('T')[0] || null,
      keyResponsibilities: formData.keyResponsibilities.split('\n').filter(line => line.trim()),
      isCurrentlyWorking: formData.isCurrentlyWorking
    };

    createExperienceMutation.mutate(experienceData);
  };

  const handleEditClick = (experience: any) => {
    setEditingExperience(experience);
    setFormData({
      title: experience.title || '',
      company: experience.company || '',
      location: experience.location || '',
      industry: experience.industry || '',
      domain: experience.domain || '',
      startDate: experience.startDate ? new Date(experience.startDate) : undefined,
      endDate: experience.endDate ? new Date(experience.endDate) : undefined,
      keyResponsibilities: Array.isArray(experience.keyResponsibilities) 
        ? experience.keyResponsibilities.join('\n') 
        : '',
      isCurrentlyWorking: experience.isCurrentlyWorking || false
    });
    setShowEditDialog(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const experienceData = {
      id: editingExperience.id,
      userId: parseInt(userIdentifier),
      title: formData.title,
      company: formData.company,
      location: formData.location,
      industry: formData.industry,
      domain: formData.domain,
      startDate: formData.startDate?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
      endDate: formData.endDate?.toISOString().split('T')[0] || null,
      keyResponsibilities: formData.keyResponsibilities.split('\n').filter(line => line.trim()),
      isCurrentlyWorking: formData.isCurrentlyWorking
    };

    updateExperienceMutation.mutate(experienceData);
  };

  const handleDeleteClick = (experienceId: number) => {
    if (window.confirm('Are you sure you want to delete this career path entry?')) {
      deleteExperienceMutation.mutate(experienceId);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Career Path</h3>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="h-20 bg-gray-200 rounded"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Career Path</h3>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="neo-glass-button">
              <Plus className="w-4 h-4 mr-2" />
              Add Career Path
            </Button>
          </DialogTrigger>
          
          {/* Add Experience Dialog - Beautiful Glass UI */}
          <DialogContent className="sm:max-w-[550px] neo-glass-card max-h-[90vh] overflow-hidden" hideCloseButton>
            <div className="space-y-6 py-5 overflow-x-hidden">
              <DialogHeader>
                <DialogTitle className="text-white">
                  Add Career Path
                </DialogTitle>
              </DialogHeader>

              <form onSubmit={handleAddSubmit} className="space-y-4">
                {/* Job Title */}
                <div className="space-y-2">
                  <label htmlFor="title" className="text-sm font-medium text-white">
                    Job Title
                  </label>
                  <input
                    id="title"
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Enter job title..."
                    className="bg-[rgba(18,18,18,0.95)] backdrop-blur-md text-white border-white/20 shadow-md transition-all hover:border-white/30 w-full h-12 py-3 px-3 rounded-md border placeholder-white/50 focus:border-white/50 focus:ring-2 focus:ring-white/30 focus:outline-none"
                    required
                  />
                </div>

                {/* Company */}
                <div className="space-y-2">
                  <label htmlFor="company" className="text-sm font-medium text-white">
                    Company
                  </label>
                  <input
                    id="company"
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    placeholder="Enter company name..."
                    className="bg-[rgba(18,18,18,0.95)] backdrop-blur-md text-white border-white/20 shadow-md transition-all hover:border-white/30 w-full h-12 py-3 px-3 rounded-md border placeholder-white/50 focus:border-white/50 focus:ring-2 focus:ring-white/30 focus:outline-none"
                    required
                  />
                </div>

                {/* Location */}
                <div className="space-y-2">
                  <label htmlFor="location" className="text-sm font-medium text-white">
                    Location
                  </label>
                  <Select 
                    value={formData.location} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, location: value }))}
                  >
                    <SelectTrigger 
                      className="w-full h-12 py-3 px-3 rounded-md border transition-all focus:outline-none"
                      style={{
                        background: 'rgba(18,18,18,0.95)',
                        backdropFilter: 'blur(12px)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        color: 'white',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    >
                      <SelectValue placeholder="Select location..." style={{ color: 'white' }} />
                    </SelectTrigger>
                    <SelectContent 
                      style={{
                        background: 'rgba(40,40,40,0.98)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255,255,255,0.3)',
                        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.7)'
                      }}
                    >
                      {workExperienceLocations.map((location) => (
                        <SelectItem 
                          key={location} 
                          value={location}
                          className="cursor-pointer transition-colors"
                          style={{
                            color: 'rgba(255,255,255,0.9)',
                            padding: '12px 16px'
                          }}
                        >
                          {location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Industry */}
                <div className="space-y-2">
                  <label htmlFor="industry" className="text-sm font-medium text-white">
                    Industry
                  </label>
                  <Select 
                    value={formData.industry} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, industry: value }))}
                  >
                    <SelectTrigger 
                      className="w-full h-12 py-3 px-3 rounded-md border transition-all focus:outline-none"
                      style={{
                        background: 'rgba(18,18,18,0.95)',
                        backdropFilter: 'blur(12px)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        color: 'white',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    >
                      <SelectValue placeholder="Select industry..." style={{ color: 'white' }} />
                    </SelectTrigger>
                    <SelectContent 
                      style={{
                        background: 'rgba(40,40,40,0.98)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255,255,255,0.3)',
                        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.7)'
                      }}
                    >
                      {INDUSTRIES.map((industry) => (
                        <SelectItem 
                          key={industry} 
                          value={industry}
                          className="cursor-pointer transition-colors"
                          style={{
                            color: 'rgba(255,255,255,0.9)',
                            padding: '12px 16px'
                          }}
                        >
                          {industry}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Domain */}
                <div className="space-y-2">
                  <label htmlFor="domain" className="text-sm font-medium text-white">
                    Domain
                  </label>
                  <Select 
                    value={formData.domain} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, domain: value }))}
                    disabled={!formData.industry}
                  >
                    <SelectTrigger 
                      className="w-full h-12 py-3 px-3 rounded-md border transition-all focus:outline-none"
                      style={{
                        background: 'rgba(18,18,18,0.95)',
                        backdropFilter: 'blur(12px)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        color: 'white',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        opacity: formData.industry ? 1 : 0.5
                      }}
                    >
                      <SelectValue 
                        placeholder={formData.industry ? "Select domain..." : "Select industry first"} 
                        style={{ color: 'white' }} 
                      />
                    </SelectTrigger>
                    <SelectContent 
                      style={{
                        background: 'rgba(40,40,40,0.98)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255,255,255,0.3)',
                        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.7)'
                      }}
                    >
                      {domains.map((domain) => (
                        <SelectItem 
                          key={domain} 
                          value={domain}
                          className="cursor-pointer transition-colors"
                          style={{
                            color: 'rgba(255,255,255,0.9)',
                            padding: '12px 16px'
                          }}
                        >
                          {domain}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Date Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="startDate" className="text-sm font-medium text-white">
                      Start Date
                    </label>
                    <input
                      id="startDate"
                      type="date"
                      name="startDate"
                      value={formData.startDate ? format(formData.startDate, 'yyyy-MM-dd') : ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value ? new Date(e.target.value) : undefined }))}
                      className="w-full h-12 py-3 px-3 rounded-md border transition-all focus:outline-none"
                      style={{
                        background: 'rgba(18,18,18,0.95)',
                        backdropFilter: 'blur(12px)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        color: 'white',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        colorScheme: 'dark'
                      }}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="endDate" className="text-sm font-medium text-white">
                      End Date
                    </label>
                    <input
                      id="endDate"
                      type="date"
                      name="endDate"
                      value={formData.endDate ? format(formData.endDate, 'yyyy-MM-dd') : ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value ? new Date(e.target.value) : undefined }))}
                      className="w-full h-12 py-3 px-3 rounded-md border transition-all focus:outline-none"
                      style={{
                        background: 'rgba(18,18,18,0.95)',
                        backdropFilter: 'blur(12px)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        color: 'white',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        colorScheme: 'dark'
                      }}
                    />
                  </div>
                </div>

                {/* Key Responsibilities */}
                <div className="space-y-2">
                  <label htmlFor="keyResponsibilities" className="text-sm font-medium text-white">
                    Key Responsibilities
                  </label>
                  <textarea
                    id="keyResponsibilities"
                    name="keyResponsibilities"
                    value={formData.keyResponsibilities}
                    onChange={handleInputChange}
                    placeholder="Describe your main responsibilities and achievements..."
                    rows={4}
                    className="w-full py-3 px-3 rounded-md border transition-all focus:outline-none resize-none"
                    style={{
                      background: 'rgba(18,18,18,0.95)',
                      backdropFilter: 'blur(12px)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      color: 'white',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                </div>

                {/* Form Action Buttons */}
                <div className="flex justify-end gap-3 pt-6 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setShowAddDialog(false)}
                    className="px-6 py-3 bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30 backdrop-blur-md rounded-md shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-white/30"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createExperienceMutation.isPending}
                    className="px-6 py-3 neo-glass-button text-white font-medium rounded-md shadow-lg transition-all hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-white/30"
                  >
                    {createExperienceMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Adding...
                      </>
                    ) : (
                      "Add Career Path"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Experience Dialog */}
        <Dialog open={showEditDialog} onOpenChange={(open) => {
          setShowEditDialog(open);
          if (!open) {
            setEditingExperience(null);
            resetForm();
          }
        }}>
          <DialogContent className="sm:max-w-[550px] neo-glass-card max-h-[90vh] overflow-hidden" hideCloseButton>
            <div className="space-y-6 py-5 overflow-x-hidden">
              <DialogHeader>
                <DialogTitle className="text-white">
                  Edit Career Path
                </DialogTitle>
              </DialogHeader>

              <form onSubmit={handleEditSubmit} className="space-y-4">
                {/* Job Title */}
                <div className="space-y-2">
                  <label htmlFor="edit-title" className="text-sm font-medium text-white">
                    Job Title
                  </label>
                  <input
                    id="edit-title"
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Enter job title..."
                    className="bg-[rgba(18,18,18,0.95)] backdrop-blur-md text-white border-white/20 shadow-md transition-all hover:border-white/30 w-full h-12 py-3 px-3 rounded-md border placeholder-white/50 focus:border-white/50 focus:ring-2 focus:ring-white/30 focus:outline-none"
                    required
                  />
                </div>

                {/* Company */}
                <div className="space-y-2">
                  <label htmlFor="edit-company" className="text-sm font-medium text-white">
                    Company
                  </label>
                  <input
                    id="edit-company"
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    placeholder="Enter company name..."
                    className="bg-[rgba(18,18,18,0.95)] backdrop-blur-md text-white border-white/20 shadow-md transition-all hover:border-white/30 w-full h-12 py-3 px-3 rounded-md border placeholder-white/50 focus:border-white/50 focus:ring-2 focus:ring-white/30 focus:outline-none"
                    required
                  />
                </div>

                {/* Location */}
                <div className="space-y-2">
                  <label htmlFor="edit-location" className="text-sm font-medium text-white">
                    Location
                  </label>
                  <Select 
                    value={formData.location} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, location: value }))}
                  >
                    <SelectTrigger 
                      className="w-full h-12 py-3 px-3 rounded-md border transition-all focus:outline-none"
                      style={{
                        background: 'rgba(18,18,18,0.95)',
                        backdropFilter: 'blur(12px)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        color: 'white',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    >
                      <SelectValue placeholder="Select location..." style={{ color: 'white' }} />
                    </SelectTrigger>
                    <SelectContent 
                      style={{
                        background: 'rgba(40,40,40,0.98)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255,255,255,0.3)',
                        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.7)'
                      }}
                    >
                      {workExperienceLocations.map((location) => (
                        <SelectItem 
                          key={location} 
                          value={location}
                          className="cursor-pointer transition-colors"
                          style={{
                            color: 'rgba(255,255,255,0.9)',
                            padding: '12px 16px'
                          }}
                        >
                          {location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Industry */}
                <div className="space-y-2">
                  <label htmlFor="edit-industry" className="text-sm font-medium text-white">
                    Industry
                  </label>
                  <Select 
                    value={formData.industry} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, industry: value }))}
                  >
                    <SelectTrigger 
                      className="w-full h-12 py-3 px-3 rounded-md border transition-all focus:outline-none"
                      style={{
                        background: 'rgba(18,18,18,0.95)',
                        backdropFilter: 'blur(12px)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        color: 'white',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    >
                      <SelectValue placeholder="Select industry..." style={{ color: 'white' }} />
                    </SelectTrigger>
                    <SelectContent 
                      style={{
                        background: 'rgba(40,40,40,0.98)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255,255,255,0.3)',
                        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.7)'
                      }}
                    >
                      {INDUSTRIES.map((industry) => (
                        <SelectItem 
                          key={industry} 
                          value={industry}
                          className="cursor-pointer transition-colors"
                          style={{
                            color: 'rgba(255,255,255,0.9)',
                            padding: '12px 16px'
                          }}
                        >
                          {industry}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Domain */}
                <div className="space-y-2">
                  <label htmlFor="edit-domain" className="text-sm font-medium text-white">
                    Domain
                  </label>
                  <Select 
                    value={formData.domain} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, domain: value }))}
                    disabled={!formData.industry}
                  >
                    <SelectTrigger 
                      className="w-full h-12 py-3 px-3 rounded-md border transition-all focus:outline-none"
                      style={{
                        background: 'rgba(18,18,18,0.95)',
                        backdropFilter: 'blur(12px)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        color: 'white',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        opacity: formData.industry ? 1 : 0.5
                      }}
                    >
                      <SelectValue 
                        placeholder={formData.industry ? "Select domain..." : "Select industry first"} 
                        style={{ color: 'white' }} 
                      />
                    </SelectTrigger>
                    <SelectContent 
                      style={{
                        background: 'rgba(40,40,40,0.98)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255,255,255,0.3)',
                        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.7)'
                      }}
                    >
                      {domains.map((domain) => (
                        <SelectItem 
                          key={domain} 
                          value={domain}
                          className="cursor-pointer transition-colors"
                          style={{
                            color: 'rgba(255,255,255,0.9)',
                            padding: '12px 16px'
                          }}
                        >
                          {domain}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Date Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="edit-startDate" className="text-sm font-medium text-white">
                      Start Date
                    </label>
                    <input
                      id="edit-startDate"
                      type="date"
                      name="startDate"
                      value={formData.startDate ? format(formData.startDate, 'yyyy-MM-dd') : ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value ? new Date(e.target.value) : undefined }))}
                      className="w-full h-12 py-3 px-3 rounded-md border transition-all focus:outline-none"
                      style={{
                        background: 'rgba(18,18,18,0.95)',
                        backdropFilter: 'blur(12px)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        color: 'white',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        colorScheme: 'dark'
                      }}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="edit-endDate" className="text-sm font-medium text-white">
                      End Date
                    </label>
                    <input
                      id="edit-endDate"
                      type="date"
                      name="endDate"
                      value={formData.endDate ? format(formData.endDate, 'yyyy-MM-dd') : ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value ? new Date(e.target.value) : undefined }))}
                      className="w-full h-12 py-3 px-3 rounded-md border transition-all focus:outline-none"
                      style={{
                        background: 'rgba(18,18,18,0.95)',
                        backdropFilter: 'blur(12px)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        color: 'white',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        colorScheme: 'dark'
                      }}
                    />
                  </div>
                </div>

                {/* Key Responsibilities */}
                <div className="space-y-2">
                  <label htmlFor="edit-keyResponsibilities" className="text-sm font-medium text-white">
                    Key Responsibilities
                  </label>
                  <textarea
                    id="edit-keyResponsibilities"
                    name="keyResponsibilities"
                    value={formData.keyResponsibilities}
                    onChange={handleInputChange}
                    placeholder="Describe your main responsibilities and achievements..."
                    rows={4}
                    className="w-full py-3 px-3 rounded-md border transition-all focus:outline-none resize-none"
                    style={{
                      background: 'rgba(18,18,18,0.95)',
                      backdropFilter: 'blur(12px)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      color: 'white',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                </div>

                {/* Form Action Buttons */}
                <div className="flex justify-end gap-3 pt-6 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditDialog(false);
                      setEditingExperience(null);
                      resetForm();
                    }}
                    className="px-6 py-3 bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30 backdrop-blur-md rounded-md shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-white/30"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updateExperienceMutation.isPending}
                    className="px-6 py-3 neo-glass-button text-white font-medium rounded-md shadow-lg transition-all hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-white/30"
                    data-testid="button-submit-edit-experience"
                  >
                    {updateExperienceMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Updating...
                      </>
                    ) : (
                      "Update Career Path"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Experience List */}
      <div className="space-y-4">
        {(experiences as any[]).length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Briefcase className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No career experiences added yet.</p>
            <p className="text-sm">Click "Add Career Path" to get started!</p>
          </div>
        ) : (
          (experiences as any[]).map((experience: any) => (
            <div key={experience.id} className="neo-glass-card p-6 rounded-lg">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-white">{experience.title}</h4>
                  <p className="text-blue-400 mb-2">{experience.company}</p>
                  {/* Industry and Domain - First Line */}
                  {(experience.industry || experience.domain) && (
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mb-2">
                      {experience.industry && (
                        <span className="flex items-center gap-1">
                          <Building className="w-4 h-4" />
                          {experience.industry}
                        </span>
                      )}
                      {experience.domain && (
                        <span className="flex items-center gap-1">
                          <Globe className="w-4 h-4" />
                          {experience.domain}
                        </span>
                      )}
                    </div>
                  )}
                  {/* Location and Dates - Second Line */}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mb-3">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {experience.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <CalendarIcon className="w-4 h-4" />
                      {experience.startDate && formatDate(new Date(experience.startDate))} - {experience.endDate ? formatDate(new Date(experience.endDate)) : 'Present'}
                    </span>
                  </div>
                  {experience.keyResponsibilities && experience.keyResponsibilities.length > 0 && (
                    <div className="mt-3">
                      <h5 className="text-sm font-medium text-white mb-2">Key Responsibilities:</h5>
                      <ul className="list-disc list-inside space-y-1 text-sm text-gray-300">
                        {experience.keyResponsibilities.map((responsibility: string, index: number) => (
                          <li key={index}>{responsibility}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-white hover:text-blue-400"
                    onClick={() => handleEditClick(experience)}
                    data-testid={`button-edit-experience-${experience.id}`}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-white hover:text-red-400"
                    onClick={() => handleDeleteClick(experience.id)}
                    data-testid={`button-delete-experience-${experience.id}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}