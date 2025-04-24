import React, { useEffect, useState, Suspense } from 'react';
import { ArrowLeft, Check, Copy, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import VisitingCardPreview from '@/components/profile/visiting-card-preview';
import { useToast } from '@/hooks/use-toast';
import type { UserData as UserDataType } from '@/types/user';

interface SharedCardPageProps {
  userId: string;
}

// Define mapping interface for our API data
interface UserDataAPI {
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
  profileCompleted: number | boolean; // Handle both types
  createdAt: string | Date | null;
}

const SharedCardPage: React.FC<SharedCardPageProps> = ({ userId }) => {
  const [userData, setUserData] = useState<UserDataType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    // Create an AbortController to cancel fetch if component unmounts
    const controller = new AbortController();
    const signal = controller.signal;
    
    const fetchUserData = async () => {
      try {
        // Check if userId is valid
        if (!userId || userId === 'undefined' || userId === 'null') {
          setError("Invalid user ID provided");
          setLoading(false);
          return;
        }
        
        // Set a timeout for the fetch to prevent long loading times
        const timeoutId = setTimeout(() => {
          if (loading) {
            controller.abort();
            setError("Request took too long to complete. Please try again.");
            setLoading(false);
          }
        }, 8000); // 8 second timeout
        
        // Trim any whitespace and unwanted characters
        const cleaned = userId.trim();
        
        try {
          // Pre-fill placeholder data structure to improve perceived loading time
          const placeholderData: UserDataType = {
            id: parseInt(cleaned, 10) || 0,
            username: '',
            email: '',
            name: 'Loading...',
            phoneNumber: '',
            photoURL: '',
            title: 'Professional',
            aboutMe: '',
            location: '',
            industry: '',
            domain: '',
            lookingFor: null,
            whatIOffer: null,
            visitingCardType: 'professional-renewed', // Default for initial load
            profileCompleted: false,
            createdAt: new Date(),
          };
          
          // Create placeholder to reduce the visual switch
          setUserData(placeholderData);
          
          // Use the dedicated shared-card endpoint with better handling
          const response = await fetch(`/api/shared-card/${cleaned}`, {
            method: 'GET',
            signal,
            headers: {
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache'
            }
          });
          
          // Clear the timeout since we got a response
          clearTimeout(timeoutId);
          
          if (!response.ok) {
            throw new Error(`Failed to fetch shared card data: ${response.status}`);
          }
          
          const data = await response.json();
          
          // Validate the data
          if (!data || typeof data !== 'object' || !data.id || !data.name) {
            throw new Error("Received invalid user data");
          }
          
          // Map the API data to our UserDataType
          const mappedUserData: UserDataType = {
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
            // Convert the profileCompleted to boolean if needed
            profileCompleted: typeof data.profileCompleted === 'number' 
              ? Boolean(data.profileCompleted) 
              : Boolean(data.profileCompleted),
            createdAt: data.createdAt ? new Date(data.createdAt) : null,
          };
          
          // Update with real data
          setUserData(mappedUserData);
          setLoading(false);
          
        } catch (err: any) {
          // Handle aborted requests differently
          if (err.name === 'AbortError') {
            console.warn('Request was aborted due to timeout');
          } else {
            console.error("Error fetching from shared card endpoint:", err);
            setError("Could not load this Quantum Card. It may not exist or has been removed.");
            setLoading(false);
          }
        }
      } catch (err) {
        console.error("Error processing shared card request:", err);
        setError("Error processing shared card request");
        setLoading(false);
      }
    };
    
    fetchUserData();
    
    // Cleanup function to abort fetch if component unmounts
    return () => {
      controller.abort();
    };
  }, [userId]);

  // Don't show a separate loading screen since we're using placeholders
  // This improves perceived performance by instantly showing a shell
  if (loading && !userData) {
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
            {/* Create a preloaded card container to avoid loading flashes */}
            <div className="visiting-card-container" style={{ 
              width: "280px", 
              margin: "0 auto",
              position: "relative" 
            }}>
              <Suspense fallback={
                <div className="p-4 flex items-center justify-center" style={{height: "490px"}}>
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                </div>
              }>
                <VisitingCardPreview
                  userData={userData}
                  cardType={userData.visitingCardType || 'professional-renewed'}
                />
              </Suspense>
            </div>
            
            {/* Share link box */}
            <div className="mt-8 w-full max-w-md mx-auto">
              <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md p-3 flex items-center justify-between">
                <div className="flex-1 truncate text-sm px-2">
                  <span className="font-medium">{window.location.href}</span>
                </div>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    setIsCopied(true);
                    toast({
                      title: "Link Copied!",
                      description: "The link has been copied to clipboard.",
                      duration: 3000,
                    });
                    setTimeout(() => setIsCopied(false), 2000);
                  }}
                >
                  {isCopied ? (
                    <>
                      <Check className="h-4 w-4 mr-1" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-1" />
                      Copy Link
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="mt-8 text-center">
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