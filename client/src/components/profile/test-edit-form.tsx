import React, { useState } from "react";
import { Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useQueryClient } from "@tanstack/react-query";

interface TestEditFormProps {
  userData: any;
  onCancel: () => void;
  onSave: () => void;
}

const TestEditForm: React.FC<TestEditFormProps> = ({ userData, onCancel, onSave }) => {
  console.log('=== COMPREHENSIVE EDIT FORM MOUNTED ===');
  console.log('userData:', userData);
  
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: userData.name || "",
    brandName: userData.brandName || "",
    title: userData.title || "",
    aboutMe: userData.aboutMe || "",
    location: userData.location || "",
    industry: userData.industry || "",
    domain: userData.domain || "",
    lookingFor: userData.lookingFor || ""
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleInputChange = (field: string, value: string) => {
    console.log(`=== FIELD CHANGE: ${field} = ${value} ===`);
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    console.log('=== SAVE BUTTON CLICKED ===');
    console.log('Form data before save:', formData);
    setIsLoading(true);
    
    try {
      const updateData = {
        name: formData.name.trim(),
        brandName: formData.brandName.trim() || null,
        title: formData.title.trim(),
        aboutMe: formData.aboutMe.trim(),
        location: formData.location.trim(),
        industry: formData.industry.trim(),
        domain: formData.domain.trim(),
        lookingFor: formData.lookingFor
      };

      console.log('=== SENDING UPDATE DATA ===', updateData);
      console.log('User identifier:', userData.username || userData.id);

      const userIdentifier = userData.username || userData.id;
      const response = await apiRequest("PUT", `/api/users/${userIdentifier}`, updateData);
      
      console.log('=== UPDATE RESPONSE ===', response);

      // Invalidate queries to refresh data
      await queryClient.invalidateQueries({ queryKey: [`/api/users/${userData.username}`] });
      await queryClient.invalidateQueries({ queryKey: [`/api/users/${userData.id}`] });
      await queryClient.invalidateQueries({ queryKey: [`/api/users/Unvhj38FHSg36vbagvGL8MvDJuL2`] });

      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
        variant: "default",
      });

      console.log('=== SAVE COMPLETED SUCCESSFULLY ===');
      onSave();
    } catch (error) {
      console.error('=== ERROR UPDATING PROFILE ===', error);
      toast({
        title: "Update Failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6 bg-black/40 backdrop-blur-xl border border-white/20 rounded-xl max-h-[80vh] overflow-y-auto">
      <h2 className="text-xl font-semibold text-white">Edit Profile Information</h2>
      
      <div className="space-y-4">
        {/* Full Name */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Full Name
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent"
            placeholder="Enter your full name"
          />
        </div>
        
        {/* Brand Name */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Brand Name
          </label>
          <input
            type="text"
            value={formData.brandName}
            onChange={(e) => handleInputChange('brandName', e.target.value)}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent"
            placeholder="Enter your brand name"
          />
        </div>

        {/* Job Title */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Job Title
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent"
            placeholder="e.g., Senior Software Engineer"
          />
        </div>

        {/* Professional Overview */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Professional Overview
          </label>
          <textarea
            value={formData.aboutMe}
            onChange={(e) => handleInputChange('aboutMe', e.target.value)}
            rows={4}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent resize-none"
            placeholder="Tell us about your professional background and expertise..."
          />
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Location
          </label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => handleInputChange('location', e.target.value)}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent"
            placeholder="e.g., San Francisco, CA"
          />
        </div>

        {/* Industry */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Industry
          </label>
          <input
            type="text"
            value={formData.industry}
            onChange={(e) => handleInputChange('industry', e.target.value)}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent"
            placeholder="e.g., Technology, Healthcare, Finance"
          />
        </div>

        {/* Domain */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Domain
          </label>
          <input
            type="text"
            value={formData.domain}
            onChange={(e) => handleInputChange('domain', e.target.value)}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent"
            placeholder="e.g., Software Development, Data Science"
          />
        </div>

        {/* Looking For */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            I am looking for
          </label>
          <select
            value={formData.lookingFor}
            onChange={(e) => handleInputChange('lookingFor', e.target.value)}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent"
          >
            <option value="" className="bg-gray-800 text-white">Select an option</option>
            <option value="job_opportunities" className="bg-gray-800 text-white">Job Opportunities</option>
            <option value="networking" className="bg-gray-800 text-white">Networking</option>
            <option value="collaborations" className="bg-gray-800 text-white">Collaborations</option>
            <option value="mentorship" className="bg-gray-800 text-white">Mentorship</option>
            <option value="freelance_work" className="bg-gray-800 text-white">Freelance Work</option>
            <option value="partnerships" className="bg-gray-800 text-white">Partnerships</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <button
          onClick={() => {
            console.log('=== CANCEL CLICKED ===');
            onCancel();
          }}
          disabled={isLoading}
          className="flex items-center gap-2 py-2.5 px-6 text-white bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 rounded-lg transition-all duration-200"
        >
          <X className="h-4 w-4" />
          Cancel
        </button>
        
        <button
          onClick={handleSave}
          disabled={isLoading}
          className="flex items-center gap-2 py-2.5 px-6 text-white bg-gradient-to-r from-blue-500/20 to-purple-500/20 hover:from-blue-500/30 hover:to-purple-500/30 border border-white/20 hover:border-white/30 rounded-lg transition-all duration-200"
        >
          {isLoading ? (
            <>
              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save Changes
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default TestEditForm;