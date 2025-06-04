import React, { useState } from 'react';
import { X, Save } from 'lucide-react';

interface SimpleProfileEditorProps {
  userData: any;
  onCancel: () => void;
  onSave: () => void;
}

const SimpleProfileEditor: React.FC<SimpleProfileEditorProps> = ({ userData, onCancel, onSave }) => {
  const [name, setName] = useState(userData.name || '');
  const [title, setTitle] = useState(userData.title || '');
  const [location, setLocation] = useState(userData.location || '');
  const [industry, setIndustry] = useState(userData.industry || '');
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    console.log("=== SIMPLE EDITOR SAVE STARTED ===");
    setIsLoading(true);
    
    try {
      const updateData = {
        name: name.trim(),
        title: title.trim() || null,
        location: location.trim() || null,
        industry: industry || null,
      };

      console.log("Making API call with data:", updateData);
      
      const response = await fetch(`/api/users/${userData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error(`Failed: ${response.status}`);
      }

      const result = await response.json();
      console.log("Success! Updated user:", result);
      
      alert("Profile updated successfully!");
      
      // Force page reload to show updated data immediately
      window.location.reload();
    } catch (error) {
      console.error('Update failed:', error);
      alert("Update failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h2 className="text-xl font-bold mb-4">Edit Profile</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your full name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Job Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your job title"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your location"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Industry</label>
            <select
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Industry</option>
              <option value="Technology">Technology</option>
              <option value="Healthcare">Healthcare</option>
              <option value="Finance">Finance</option>
              <option value="Education">Education</option>
              <option value="Marketing">Marketing</option>
              <option value="Consulting">Consulting</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>
        
        <div className="flex gap-3 mt-6">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
          >
            <X className="h-4 w-4 inline mr-2" />
            Cancel
          </button>
          
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <div className="inline-block h-4 w-4 mr-2 animate-spin border-2 border-white border-t-transparent rounded-full"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 inline mr-2" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SimpleProfileEditor;