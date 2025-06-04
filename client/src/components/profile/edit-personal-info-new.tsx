import { useState } from 'react';
import { X, Save } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

interface EditPersonalInfoNewProps {
  userData: {
    id: number;
    username: string;
    name: string;
    brandName?: string | null;
    phoneNumber?: string | null;
    title?: string | null;
    location?: string | null;
    industry?: string | null;
    domain?: string | null;
    aboutMe?: string | null;
    lookingFor?: string | null;
  };
  onSave: () => void;
}

const EditPersonalInfoNew = ({ userData, onSave }: EditPersonalInfoNewProps) => {
  console.log('=== EDIT COMPONENT MOUNTED ===');
  console.log('User data received:', userData);

  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: userData.name || '',
    brandName: userData.brandName || '',
    phoneNumber: userData.phoneNumber ? userData.phoneNumber.replace('+91 ', '') : '',
    title: userData.title || '',
    location: userData.location || '',
    industry: userData.industry || '',
    domain: userData.domain || '',
    aboutMe: userData.aboutMe || '',
    lookingFor: userData.lookingFor || ''
  });

  const handleSubmit = async () => {
    console.log('=== FORM SUBMIT TRIGGERED ===');
    console.log('Form data:', formData);
    
    setIsLoading(true);
    
    try {
      const updateData = {
        name: formData.name.trim(),
        brandName: formData.brandName.trim() || null,
        phoneNumber: formData.phoneNumber.trim() ? `+91 ${formData.phoneNumber.trim()}` : null,
        title: formData.title.trim() || null,
        location: formData.location.trim() || null,
        industry: formData.industry || null,
        domain: formData.domain || null,
        aboutMe: formData.aboutMe.trim() || null,
        lookingFor: formData.lookingFor || null,
      };

      console.log('Sending update data:', updateData);
      
      const userIdentifier = userData.username || userData.id;
      console.log('Using user identifier:', userIdentifier);

      await apiRequest("PUT", `/api/users/${userIdentifier}`, updateData);

      // Invalidate cache
      await queryClient.invalidateQueries({ queryKey: [`/api/users/${userData.username}`] });
      await queryClient.invalidateQueries({ queryKey: [`/api/users/${userData.id}`] });

      toast({
        title: "Success",
        description: "Profile updated successfully",
        variant: "default",
      });

      onSave();
    } catch (error) {
      console.error('Update error:', error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="neo-glass p-6 max-w-2xl mx-auto">
      <h2 className="text-xl font-semibold text-white mb-6">Edit Profile Information</h2>
      
      <div className="space-y-4">
        {/* Full Name */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Full Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
            placeholder="Enter your full name"
            required
          />
        </div>

        {/* Brand Name */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Brand Name
          </label>
          <input
            type="text"
            value={formData.brandName}
            onChange={(e) => setFormData(prev => ({ ...prev, brandName: e.target.value }))}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
            placeholder="Enter your brand name"
          />
        </div>

        {/* Phone Number */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Phone Number
          </label>
          <div className="flex gap-2">
            <select className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-400">
              <option value="+91">+91</option>
            </select>
            <input
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
              className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
              placeholder="Enter phone number"
            />
          </div>
        </div>

        {/* Job Title */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Job Title
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
            placeholder="Enter your job title"
          />
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Location
          </label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
            placeholder="Enter your location"
          />
        </div>

        {/* Industry */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Industry
          </label>
          <select
            value={formData.industry}
            onChange={(e) => setFormData(prev => ({ ...prev, industry: e.target.value }))}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-400"
          >
            <option value="">Select Industry</option>
            <option value="Technology">Technology</option>
            <option value="Healthcare">Healthcare</option>
            <option value="Finance">Finance</option>
            <option value="Education">Education</option>
            <option value="Marketing">Marketing</option>
            <option value="Retail">Retail</option>
            <option value="Manufacturing">Manufacturing</option>
            <option value="Consulting">Consulting</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Domain */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Domain
          </label>
          <input
            type="text"
            value={formData.domain}
            onChange={(e) => setFormData(prev => ({ ...prev, domain: e.target.value }))}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
            placeholder="Enter your domain expertise"
          />
        </div>

        {/* About Me */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            About Me
          </label>
          <textarea
            value={formData.aboutMe}
            onChange={(e) => setFormData(prev => ({ ...prev, aboutMe: e.target.value }))}
            rows={3}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 resize-none"
            placeholder="Tell us about yourself"
          />
        </div>

        {/* Looking For */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Looking For
          </label>
          <select
            value={formData.lookingFor}
            onChange={(e) => setFormData(prev => ({ ...prev, lookingFor: e.target.value }))}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-400"
          >
            <option value="">Select what you're looking for</option>
            <option value="job_opportunities">Job Opportunities</option>
            <option value="networking">Networking</option>
            <option value="collaboration">Collaboration</option>
            <option value="mentorship">Mentorship</option>
            <option value="investment">Investment</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 mt-6">
        <button
          type="button"
          onClick={onSave}
          className="flex items-center gap-2 py-2 px-4 text-gray-300 hover:text-white transition-colors"
        >
          <X className="h-4 w-4" />
          Cancel
        </button>
        
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isLoading}
          className="flex items-center gap-2 py-2.5 px-6 text-white bg-gradient-to-r from-blue-500/20 to-purple-500/20 hover:from-blue-500/30 hover:to-purple-500/30 border border-white/20 hover:border-white/30 rounded-lg transition-all duration-200 backdrop-blur-sm shadow-lg disabled:opacity-50"
          style={{ backgroundColor: 'red', border: '2px solid yellow' }}
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

export default EditPersonalInfoNew;