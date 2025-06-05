import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import VisitingCardPreview from '@/components/profile/visiting-card-preview';
import { useToast } from '@/hooks/use-toast';
import type { UserData } from '@/types/user';

interface BrandProfilePageProps {
  brandName: string;
}

const BrandProfilePage: React.FC<BrandProfilePageProps> = ({ brandName }) => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPublicProfile = async () => {
      if (!brandName) {
        setError('No brand name provided');
        setIsLoading(false);
        return;
      }

      try {
        console.log(`[BrandProfilePage] Fetching public profile for brand: ${brandName}`);
        
        const response = await fetch(`/api/public-profile/${brandName}`, {
          method: 'GET',
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Profile not found');
          }
          throw new Error(`Failed to fetch profile: ${response.status}`);
        }

        const data = await response.json();
        
        // Validate the data
        if (!data || typeof data !== 'object' || !data.id || !data.name) {
          throw new Error('Received invalid profile data');
        }

        // Map the API data to UserData type
        const mappedUserData: UserData = {
          id: data.id,
          username: data.username || '',
          email: data.email || '',
          name: data.name || 'Anonymous User',
          phoneNumber: data.phoneNumber || '',
          brandName: data.brandName || '',
          photoURL: data.photoURL || '',
          title: data.title || 'Professional',
          aboutMe: data.aboutMe || '',
          location: data.location || '',
          industry: data.industry || '',
          domain: data.domain || '',
          lookingFor: data.lookingFor || null,
          whatIOffer: data.whatIOffer || null,
          visitingCardType: data.visitingCardType || 'professional-renewed',
          profileCompleted: Boolean(data.profileCompleted),
          emailVerified: data.emailVerified || false,
          createdAt: data.createdAt || new Date(),
          profileUrl: null
        };

        console.log(`[BrandProfilePage] Successfully loaded profile for: ${brandName}`);
        setUserData(mappedUserData);
        setError(null);
      } catch (err) {
        console.error('[BrandProfilePage] Error fetching public profile:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to load profile';
        setError(errorMessage);
        
        if (errorMessage === 'Profile not found') {
          toast({
            title: "Profile not found",
            description: `No public profile found for "${brandName}"`,
            variant: "destructive"
          });
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchPublicProfile();
  }, [brandName, toast]);

  const handleBackClick = () => {
    navigate('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-white" />
          <p className="text-white/70">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !userData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-white mb-4">
            {error === 'Profile not found' ? 'Profile Not Found' : 'Error Loading Profile'}
          </h1>
          <p className="text-white/70 mb-6">
            {error === 'Profile not found' 
              ? `The profile "${brandName}" doesn't exist or has been removed.`
              : error || 'Something went wrong while loading this profile.'
            }
          </p>
          <Button 
            onClick={handleBackClick}
            className="bg-white/10 hover:bg-white/20 text-white border border-white/20"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              onClick={handleBackClick}
              className="text-white hover:bg-white/10"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-xl font-semibold text-white">
              {userData.name}'s Profile
            </h1>
            <div className="w-20" /> {/* Spacer for center alignment */}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-center">
          <div className="w-full max-w-md">
            <VisitingCardPreview 
              userData={userData}
              cardType={userData.visitingCardType || 'professional-renewed'}
            />
          </div>
        </div>
        
        {/* Additional Profile Info */}
        <div className="mt-8 text-center">
          <p className="text-white/50 text-sm">
            Public profile • {userData.brandName}
          </p>
          {userData.location && (
            <p className="text-white/40 text-xs mt-1">
              📍 {userData.location}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default BrandProfilePage;