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
  console.log('=== TEST FORM MOUNTED ===');
  console.log('userData:', userData);
  
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState(userData.name || "");
  const [brandName, setBrandName] = useState(userData.brandName || "");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleSave = async () => {
    console.log('=== SAVE BUTTON CLICKED ===');
    setIsLoading(true);
    
    try {
      const updateData = {
        name: name.trim(),
        brandName: brandName.trim() || null,
      };

      console.log('Saving data:', updateData);
      console.log('User identifier:', userData.username || userData.id);

      const userIdentifier = userData.username || userData.id;
      await apiRequest("PUT", `/api/users/${userIdentifier}`, updateData);

      await queryClient.invalidateQueries({ queryKey: [`/api/users/${userData.username}`] });
      await queryClient.invalidateQueries({ queryKey: [`/api/users/${userData.id}`] });

      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
        variant: "default",
      });

      onSave();
    } catch (error) {
      console.error('Error updating profile:', error);
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
    <div className="p-6 space-y-6 bg-black/40 backdrop-blur-xl border border-white/20 rounded-xl">
      <h2 className="text-xl font-semibold text-white">Test Edit Form</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Full Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent"
            placeholder="Enter your full name"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Brand Name
          </label>
          <input
            type="text"
            value={brandName}
            onChange={(e) => setBrandName(e.target.value)}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent"
            placeholder="Enter your brand name"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <button
          onClick={onCancel}
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