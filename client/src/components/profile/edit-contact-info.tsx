import React from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { UserData } from '@/types/user';

interface EditContactInfoProps {
  userData: UserData;
  onCancel: () => void;
  onSave: () => void;
}

const EditContactInfo: React.FC<EditContactInfoProps> = ({ userData, onCancel, onSave }) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white/10 backdrop-blur-md border border-white/20 rounded-lg shadow-2xl">
        <div className="flex flex-row items-center justify-between p-6 pb-4">
          <div>
            <h2 className="text-xl font-semibold text-white">Contact Information</h2>
            <p className="text-sm text-white/70 mt-1">
              Contact fields have been removed per your request
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onCancel}
            className="h-8 w-8 text-white hover:bg-white/20"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6">
          <div className="text-center py-8">
            <p className="text-white/80 mb-4">Brand Name, Email, and Phone Number fields have been removed from this form.</p>
            <Button
              onClick={onSave}
              className="min-w-[100px]"
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditContactInfo;