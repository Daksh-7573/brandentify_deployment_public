import React, { useEffect, useState } from 'react';
import SharedCardView from '@/components/profile/shared-card-view';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import VisitingCardPreview from '@/components/profile/visiting-card-preview';

interface SharedCardPageProps {
  userId: string;
}

// Define the user data interface
interface UserData {
  id: number;
  username: string;
  name: string;
  email: string;
  phoneNumber: string | null;
  photoURL: string | null;
  title: string | null;
  aboutMe: string | null;
  location: string | null;
  industry: string | null;
  domain: string | null;
  lookingFor: string | null;
  whatIOffer: string | null;
  visitingCardType: string;
  profileCompleted: number;
  createdAt: Date | null;
}

const SharedCardPage: React.FC<SharedCardPageProps> = ({ userId }) => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        console.log("Original userId from URL:", userId);
        
        // Check if userId is valid
        if (!userId || userId === 'undefined' || userId === 'null') {
          setError("Invalid user ID provided");
          setLoading(false);
          return;
        }
        
        // Trim any whitespace and unwanted characters
        const cleaned = userId.trim();
        console.log("Processing shared card for ID:", cleaned);
        
        // Direct fetch to the shared card API endpoint
        try {
          console.log("Fetching from dedicated shared card endpoint:", cleaned);
          
          // Use the dedicated shared-card endpoint with better handling
          const response = await fetch(`/api/shared-card/${cleaned}`);
          
          if (!response.ok) {
            throw new Error(`Failed to fetch shared card data: ${response.status}`);
          }
          
          const data = await response.json();
          console.log("Shared card data received:", data);
          
          // Validate the data
          if (!data || typeof data !== 'object' || !data.id || !data.name) {
            throw new Error("Received invalid user data");
          }
          
          // Map the data to our UserData type
          const mappedUserData: UserData = {
            id: data.id,
            username: data.username || '',
            email: data.email || '',
            name: data.name || 'Anonymous User',
            phoneNumber: data.phoneNumber || '',
            photoURL: data.photoURL || '',
            title: data.title || 'Professional',
            aboutMe: data.aboutMe || '',
            location: data.location || '',
            industry: data.industry || '',
            domain: data.domain || '',
            lookingFor: data.lookingFor || null,
            whatIOffer: data.whatIOffer || null,
            visitingCardType: data.visitingCardType || 'professional-renewed',
            profileCompleted: data.profileCompleted || 0,
            createdAt: data.createdAt ? new Date(data.createdAt) : null,
          };
          
          setUserData(mappedUserData);
          setLoading(false);
          return;
          
        } catch (err) {
          console.error("Error fetching from shared card endpoint:", err);
          setError("Could not load this Quantum Card. It may not exist or has been removed.");
          setLoading(false);
        }
      } catch (err) {
        console.error("Error processing shared card request:", err);
        setError("Error processing shared card request");
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [userId]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
          <h2 className="text-xl font-medium">Loading Quantum Card...</h2>
          <p className="text-gray-500 mt-2">Please wait while we prepare this professional's card</p>
        </div>
      </div>
    );
  }

  if (error || !userData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="rounded-full bg-red-100 p-3 w-12 h-12 mx-auto mb-4 flex items-center justify-center">
            <span className="text-red-500 text-2xl font-bold">!</span>
          </div>
          <h2 className="text-xl font-medium">Card Not Found</h2>
          <p className="text-gray-500 mt-2">{error || "Could not load this Quantum Card. It may not exist or has been removed."}</p>
          <Button asChild className="mt-6">
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Return to Home
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  // Render the card directly here, don't use the component that might add additional complexity
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-8">
          <Link href="/">
            <Button variant="ghost" className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-800">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Home</span>
            </Button>
          </Link>
          <div className="ml-auto">
            <Button asChild variant="outline">
              <Link href="/signup">Sign Up Free</Link>
            </Button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold">{userData.name}'s Quantum Card</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              View this professional's digital visiting card
            </p>
          </div>

          <div className="flex flex-col items-center justify-center">
            <div className="w-full max-w-[350px]">
              <VisitingCardPreview
                userData={userData}
                cardType={userData.visitingCardType || 'professional-renewed'}
              />
            </div>

            <div className="mt-12 text-center">
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Create your own professional Quantum Card in minutes
              </p>
              <Button asChild className="bg-blue-600 hover:bg-blue-700">
                <Link href="/signup">Create Your Free Quantum Card</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SharedCardPage;