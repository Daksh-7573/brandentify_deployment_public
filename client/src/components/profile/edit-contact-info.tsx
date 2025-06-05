import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, Loader2, Check, AlertCircle } from 'lucide-react';
import { UserData } from '@/types/user';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface EditContactInfoProps {
  userData: UserData;
  onCancel: () => void;
  onSave: () => void;
}

const EditContactInfo: React.FC<EditContactInfoProps> = ({ userData, onCancel, onSave }) => {
  const [phoneNumber, setPhoneNumber] = useState(userData.phoneNumber || "");
  const [brandName, setBrandName] = useState(userData.brandName || "");
  const [isLoading, setIsLoading] = useState(false);
  const [brandNameStatus, setBrandNameStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'error'>('idle');
  const [brandNameMessage, setBrandNameMessage] = useState('');
  const { toast } = useToast();

  // Debounced brand name availability check
  useEffect(() => {
    if (!brandName || brandName.length < 3) {
      setBrandNameStatus('idle');
      setBrandNameMessage('');
      return;
    }

    // Don't check if it's the same as current brand name
    if (brandName === userData.brandName) {
      setBrandNameStatus('available');
      setBrandNameMessage('Current brand name');
      return;
    }

    const timeoutId = setTimeout(async () => {
      setBrandNameStatus('checking');
      setBrandNameMessage('Checking availability...');

      try {
        const response = await fetch(`/api/users/check-brand-name/${brandName}?currentUserId=${userData.id}`);
        const result = await response.json();

        if (result.available) {
          setBrandNameStatus('available');
          setBrandNameMessage('Brand name is available');
        } else {
          setBrandNameStatus('taken');
          setBrandNameMessage(result.reason || 'Brand name is not available');
        }
      } catch (error) {
        setBrandNameStatus('error');
        setBrandNameMessage('Error checking availability');
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [brandName, userData.brandName, userData.id]);

  const handleSave = async () => {
    // Validate brand name availability before saving
    if (brandName && brandNameStatus === 'taken') {
      toast({
        title: "Cannot save changes",
        description: "Please choose a different brand name as the current one is already taken.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      await apiRequest('PATCH', `/api/users/${userData.username}`, {
        phoneNumber: phoneNumber || null,
        brandName: brandName || null
      });
      
      toast({
        title: "Contact information updated",
        description: "Your contact details have been saved successfully."
      });
      
      onSave();
    } catch (error) {
      console.error('Failed to update contact info:', error);
      toast({
        title: "Update failed",
        description: "There was an error updating your contact information.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[rgba(18,18,18,0.95)] backdrop-blur-md border border-white/20 rounded-lg shadow-2xl">
        <div className="flex flex-row items-center justify-between p-6 pb-4">
          <div>
            <h2 className="text-xl font-semibold text-white">Contact Information</h2>
            <p className="text-sm text-white/70 mt-1">
              Update your contact details and brand name
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

        <div className="p-6 space-y-6">
          {/* Email (read-only) */}
          <div className="space-y-2">
            <Label className="text-white text-sm font-medium">Email Address</Label>
            <div className="w-full h-10 px-3 py-2 border border-white/20 bg-white/5 rounded-md text-white/60 text-sm flex items-center">
              {userData.email}
            </div>
            <p className="text-xs text-white/50">Email is managed by your Google account and cannot be changed here.</p>
          </div>

          {/* Phone Number */}
          <div className="space-y-2">
            <Label htmlFor="phoneNumber" className="text-white">Phone Number</Label>
            <Input
              id="phoneNumber"
              type="tel"
              placeholder="Enter your phone number..."
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="neo-glass-input bg-[rgba(18,18,18,0.95)] text-white border-white/20"
            />
          </div>

          {/* Brand Name */}
          <div className="space-y-2">
            <Label htmlFor="brandName" className="text-white">Brand Name</Label>
            <div className="relative">
              <Input
                id="brandName"
                type="text"
                placeholder="Enter your brand or company name..."
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                className="neo-glass-input bg-[rgba(18,18,18,0.95)] text-white border-white/20 pr-10"
              />
              {/* Availability Status Icon */}
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                {brandNameStatus === 'checking' && (
                  <Loader2 className="h-4 w-4 animate-spin text-white/60" />
                )}
                {brandNameStatus === 'available' && (
                  <Check className="h-4 w-4 text-green-400" />
                )}
                {brandNameStatus === 'taken' && (
                  <AlertCircle className="h-4 w-4 text-red-400" />
                )}
                {brandNameStatus === 'error' && (
                  <AlertCircle className="h-4 w-4 text-yellow-400" />
                )}
              </div>
            </div>
            {/* Availability Status Message */}
            {brandNameMessage && (
              <p className={`text-xs ${
                brandNameStatus === 'available' ? 'text-green-400' :
                brandNameStatus === 'taken' ? 'text-red-400' :
                brandNameStatus === 'error' ? 'text-yellow-400' :
                'text-white/60'
              }`}>
                {brandNameMessage}
              </p>
            )}
            {brandName && brandNameStatus === 'available' && brandName !== userData.brandName && (
              <p className="text-xs text-white/50">
                Profile URL: {window.location.origin}/{brandName.toLowerCase().replace(/\s+/g, '-')}
              </p>
            )}
          </div>



          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={onCancel}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30 backdrop-blur-sm"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isLoading || brandNameStatus === 'taken' || brandNameStatus === 'checking'}
              className="neo-glass-button"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditContactInfo;