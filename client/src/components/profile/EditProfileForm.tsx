import React, { useState, useEffect } from 'react';
import { User, Save, X, User as UserIcon, MapPin, Building, Briefcase, Phone, Globe, Heart, AlertCircle } from 'lucide-react';

interface UserData {
  id: number;
  name: string | null;
  brandName: string | null;
  phoneNumber: string | null;
  title: string | null;
  location: string | null;
  industry: string | null;
  domain: string | null;
  aboutMe: string | null;
  lookingFor: string | null;
}

interface EditProfileFormProps {
  userData: UserData;
  onClose: () => void;
  onSave: () => void;
}

const EditProfileForm: React.FC<EditProfileFormProps> = ({ userData, onClose, onSave }) => {
  // Form state
  const [formData, setFormData] = useState({
    name: userData.name || '',
    brandName: userData.brandName || '',
    phoneNumber: userData.phoneNumber || '',
    title: userData.title || '',
    location: userData.location || '',
    industry: userData.industry || '',
    domain: userData.domain || '',
    aboutMe: userData.aboutMe || '',
    lookingFor: userData.lookingFor || '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Handle input changes
  const handleInputChange = (field: string, value: string) => {
    console.log(`[FORM] Field ${field} changed to:`, value);
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError(null);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('[FORM] Submit triggered');
    
    setIsLoading(true);
    setError(null);

    try {
      // Prepare update data
      const updateData = {
        name: formData.name.trim() || null,
        brandName: formData.brandName.trim() || null,
        phoneNumber: formData.phoneNumber.trim() || null,
        title: formData.title.trim() || null,
        location: formData.location.trim() || null,
        industry: formData.industry || null,
        domain: formData.domain || null,
        aboutMe: formData.aboutMe.trim() || null,
        lookingFor: formData.lookingFor || null,
      };

      console.log('[FORM] Sending update to API:', updateData);
      console.log('[FORM] User ID:', userData.id);

      // Make API call
      const response = await fetch(`/api/users/${userData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      console.log('[FORM] API Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[FORM] API Error:', errorText);
        throw new Error(`Failed to update profile: ${response.status}`);
      }

      const result = await response.json();
      console.log('[FORM] API Success:', result);

      setSuccess(true);
      
      // Close form after short delay
      setTimeout(() => {
        onSave();
        onClose();
      }, 1500);

    } catch (error) {
      console.error('[FORM] Error:', error);
      setError(error instanceof Error ? error.message : 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  // Industry options
  const industryOptions = [
    'Technology',
    'Healthcare',
    'Finance',
    'Education',
    'Manufacturing',
    'Retail',
    'Real Estate',
    'Consulting',
    'Marketing',
    'Media',
    'Other'
  ];

  // Looking for options
  const lookingForOptions = [
    { value: 'job_opportunities', label: 'Job Opportunities' },
    { value: 'networking', label: 'Networking' },
    { value: 'mentorship', label: 'Mentorship' },
    { value: 'collaboration', label: 'Collaboration' },
    { value: 'learning', label: 'Learning Opportunities' },
    { value: 'career_guidance', label: 'Career Guidance' },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="neo-glass-card backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-2xl shadow-2xl p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-white/10 backdrop-blur-sm">
                <UserIcon className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-white">Edit Profile Information</h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 rounded-lg bg-green-500/20 border border-green-500/30 text-green-100">
              Profile updated successfully! Closing form...
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-500/20 border border-red-500/30 text-red-100 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          {/* Form Fields */}
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Brand Name
                </label>
                <input
                  type="text"
                  value={formData.brandName}
                  onChange={(e) => handleInputChange('brandName', e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
                  placeholder="Your personal brand name"
                />
              </div>
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2 flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
                  placeholder="City, Country"
                />
              </div>
            </div>

            {/* Professional Information */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2 flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Job Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
                placeholder="Your current or desired job title"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2 flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  Industry
                </label>
                <select
                  value={formData.industry}
                  onChange={(e) => handleInputChange('industry', e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
                >
                  <option value="" className="bg-gray-800">Select Industry</option>
                  {industryOptions.map((industry) => (
                    <option key={industry} value={industry} className="bg-gray-800">
                      {industry}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2 flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Domain/Specialization
                </label>
                <input
                  type="text"
                  value={formData.domain}
                  onChange={(e) => handleInputChange('domain', e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
                  placeholder="e.g., Artificial Intelligence, Marketing"
                />
              </div>
            </div>

            {/* About Me */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                About Me
              </label>
              <textarea
                value={formData.aboutMe}
                onChange={(e) => handleInputChange('aboutMe', e.target.value)}
                rows={4}
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all resize-none"
                placeholder="Tell us about yourself, your experience, and what makes you unique..."
              />
            </div>

            {/* Looking For */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2 flex items-center gap-2">
                <Heart className="h-4 w-4" />
                Looking For
              </label>
              <select
                value={formData.lookingFor}
                onChange={(e) => handleInputChange('lookingFor', e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
              >
                <option value="" className="bg-gray-800">What are you looking for?</option>
                {lookingForOptions.map((option) => (
                  <option key={option.value} value={option.value} className="bg-gray-800">
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="neo-glass-button flex items-center gap-2 py-2.5 px-6 text-white/80 bg-white/5 hover:bg-white/10 border border-white/20 hover:border-white/30 rounded-lg transition-all duration-200 backdrop-blur-sm"
            >
              <X className="h-4 w-4" />
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !formData.name.trim()}
              className="neo-glass-button flex items-center gap-2 py-2.5 px-6 text-white bg-gradient-to-r from-blue-500/20 to-purple-500/20 hover:from-blue-500/30 hover:to-purple-500/30 border border-white/20 hover:border-white/30 rounded-lg transition-all duration-200 backdrop-blur-sm shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
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
        </form>
      </div>
    </div>
  );
};

export default EditProfileForm;