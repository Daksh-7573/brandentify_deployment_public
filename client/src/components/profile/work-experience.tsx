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

// Form validation schema
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

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

// Industry options
const industryOptions = [
  { key: 'technology', value: 'technology', label: 'Technology' },
  { key: 'finance', value: 'finance', label: 'Finance & Banking' },
  { key: 'healthcare', value: 'healthcare', label: 'Healthcare' },
  { key: 'education', value: 'education', label: 'Education' },
  { key: 'retail', value: 'retail', label: 'Retail & E-commerce' },
  { key: 'manufacturing', value: 'manufacturing', label: 'Manufacturing' },
  { key: 'consulting', value: 'consulting', label: 'Consulting' },
  { key: 'media', value: 'media', label: 'Media & Entertainment' }
];

export default function WorkExperience() {
  const { toast } = useToast();
  
  // Use demo user ID for now
  const userNumericId = 2;
  
  // State for form management
  const [showAddDialog, setShowAddDialog] = useState(false);
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

  // Queries and mutations
  const queryClient = useQueryClient();

  const { data: experiences = [], isLoading } = useQuery<any[]>({
    queryKey: [`/api/users/${userNumericId}/experiences`],
    enabled: !!userNumericId
  });

  const createExperienceMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch(`/api/users/${userNumericId}/experiences`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to create experience');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userNumericId}/experiences`] });
      setShowAddDialog(false);
      resetForm();
      toast({ title: "Success", description: "Career path added successfully!" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to add career path", variant: "destructive" });
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
      title: formData.title,
      company: formData.company,
      location: formData.location,
      industry: formData.industry,
      domain: formData.domain,
      startDate: formData.startDate,
      endDate: formData.endDate,
      keyResponsibilities: formData.keyResponsibilities.split('\n').filter(line => line.trim()),
      isCurrentlyWorking: formData.isCurrentlyWorking,
      userId: userNumericId
    };

    createExperienceMutation.mutate(experienceData);
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
          <DialogContent className="sm:max-w-[550px] neo-glass-card max-h-[90vh] overflow-hidden">
            <div className="space-y-6 py-5 max-h-[85vh] overflow-y-auto overflow-x-hidden"
                 style={{
                   scrollbarWidth: 'thin',
                   scrollbarColor: 'rgba(255,255,255,0.3) transparent'
                 }}>
              <DialogHeader>
                <DialogTitle className="text-white flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
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
                      {industryOptions.map((option) => (
                        <SelectItem 
                          key={option.key} 
                          value={option.value}
                          className="cursor-pointer transition-colors"
                          style={{
                            color: 'rgba(255,255,255,0.9)',
                            padding: '12px 16px'
                          }}
                        >
                          {option.label}
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
                  <input
                    id="domain"
                    type="text"
                    name="domain"
                    value={formData.domain}
                    onChange={handleInputChange}
                    placeholder="Enter domain..."
                    className="bg-[rgba(18,18,18,0.95)] backdrop-blur-md text-white border-white/20 shadow-md transition-all hover:border-white/30 w-full h-12 py-3 px-3 rounded-md border placeholder-white/50 focus:border-white/50 focus:ring-2 focus:ring-white/30 focus:outline-none"
                  />
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
                      className="bg-[rgba(18,18,18,0.95)] backdrop-blur-md text-white border-white/20 shadow-md transition-all hover:border-white/30 w-full h-12 py-3 px-3 rounded-md border focus:border-white/50 focus:ring-2 focus:ring-white/30 focus:outline-none"
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
                      className="bg-[rgba(18,18,18,0.95)] backdrop-blur-md text-white border-white/20 shadow-md transition-all hover:border-white/30 w-full h-12 py-3 px-3 rounded-md border focus:border-white/50 focus:ring-2 focus:ring-white/30 focus:outline-none"
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
                    className="bg-[rgba(18,18,18,0.95)] backdrop-blur-md text-white border-white/20 shadow-md transition-all hover:border-white/30 w-full py-3 px-3 rounded-md border placeholder-white/50 focus:border-white/50 focus:ring-2 focus:ring-white/30 focus:outline-none resize-none"
                  />
                </div>

                {/* Form Action Buttons */}
                <div className="flex justify-end gap-3 pt-6 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setShowAddDialog(false)}
                    className="px-6 py-3 bg-[rgba(40,40,40,0.8)] backdrop-blur-md text-white border border-white/20 rounded-md shadow-md transition-all hover:bg-[rgba(60,60,60,0.9)] hover:border-white/30 focus:outline-none focus:ring-2 focus:ring-white/30"
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
                  <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
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
                  <Button variant="ghost" size="sm" className="text-white hover:text-blue-400">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-white hover:text-red-400">
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