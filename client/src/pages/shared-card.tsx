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
          // Always show skeleton for at least 2 seconds to ensure we see it
          setLoading(true);
          
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
          
          // Artificially delay the fetch to ensure loading state is visible
          // REMOVE THIS DELAY IN PRODUCTION - only here to demo the skeleton
          await new Promise(resolve => setTimeout(resolve, 2000));
          
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

  // Show a page skeleton instead of just a loader
  if (loading && !userData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Skeleton header */}
          <div className="flex items-center mb-8">
            <div className="w-24 h-10 bg-gray-300 dark:bg-gray-700 rounded-md animate-pulse"></div>
            <div className="ml-auto">
              <div className="w-24 h-10 bg-gray-300 dark:bg-gray-700 rounded-md animate-pulse"></div>
            </div>
          </div>
          
          {/* Main content skeleton */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 animate-pulse">
            {/* Title skeleton */}
            <div className="flex flex-col items-center mb-8">
              <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
            
            {/* Card skeleton */}
            <div className="flex flex-col items-center justify-center">
              <div className="rounded-lg overflow-hidden shadow-lg" 
                   style={{height: "490px", width: "280px"}}>
                {/* Card header skeleton */}
                <div className="h-24 bg-gray-300 dark:bg-gray-700 relative">
                  <div className="absolute left-1/2 transform -translate-x-1/2 top-12">
                    <div className="h-20 w-20 rounded-full border-4 border-white dark:border-slate-900 bg-gray-400 dark:bg-gray-600"></div>
                  </div>
                </div>
                
                {/* Card content skeleton */}
                <div className="bg-white dark:bg-gray-800 pt-14 pb-4 px-4 flex-1 h-[400px]">
                  {/* Name and title placeholders */}
                  <div className="flex flex-col items-center space-y-2 mb-3">
                    <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
                  </div>
                  
                  {/* Fields placeholders */}
                  <div className="space-y-3 mt-6">
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded-full bg-gray-300 dark:bg-gray-700"></div>
                      <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded-full bg-gray-300 dark:bg-gray-700"></div>
                      <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded-full bg-gray-300 dark:bg-gray-700"></div>
                      <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded-full bg-gray-300 dark:bg-gray-700"></div>
                      <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded-full bg-gray-300 dark:bg-gray-700"></div>
                      <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
                    </div>
                  </div>
                </div>
                
                {/* Card footer skeleton */}
                <div className="h-6 bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
                  <div className="h-3 bg-gray-400 dark:bg-gray-600 rounded w-1/3"></div>
                </div>
              </div>
              
              {/* Share box skeleton */}
              <div className="mt-8 w-full max-w-md mx-auto">
                <div className="bg-gray-300 dark:bg-gray-700 rounded-md h-12"></div>
              </div>
              
              {/* Bottom CTA skeleton */}
              <div className="mt-8 text-center">
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mx-auto mb-4"></div>
                <div className="h-10 bg-gray-400 dark:bg-gray-600 rounded-md w-48 mx-auto"></div>
              </div>
            </div>
          </div>
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
            {/* Create a preloaded card container with liquid skeleton loading */}
            <div className="visiting-card-container" style={{ 
              width: "280px", 
              margin: "0 auto",
              position: "relative" 
            }}>
              <Suspense fallback={
                <div className="animate-pulse rounded-lg overflow-hidden shadow-lg" 
                     style={{height: "490px", width: "280px"}}>
                  {/* Liquid skeleton header */}
                  <div className="h-24 bg-gray-300 dark:bg-gray-700 relative">
                    <div className="absolute left-1/2 transform -translate-x-1/2 top-12">
                      <div className="h-20 w-20 rounded-full border-4 border-white dark:border-slate-900 bg-gray-400 dark:bg-gray-600"></div>
                    </div>
                  </div>
                  
                  {/* Liquid skeleton main content */}
                  <div className="bg-white dark:bg-gray-800 pt-14 pb-4 px-4 flex-1 h-[400px]">
                    {/* Name and title placeholders */}
                    <div className="flex flex-col items-center space-y-2 mb-3">
                      <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
                    </div>
                    
                    {/* Fields placeholders */}
                    <div className="space-y-3 mt-6">
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 rounded-full bg-gray-300 dark:bg-gray-700"></div>
                        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 rounded-full bg-gray-300 dark:bg-gray-700"></div>
                        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 rounded-full bg-gray-300 dark:bg-gray-700"></div>
                        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 rounded-full bg-gray-300 dark:bg-gray-700"></div>
                        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 rounded-full bg-gray-300 dark:bg-gray-700"></div>
                        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Liquid skeleton footer */}
                  <div className="h-6 bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
                    <div className="h-3 bg-gray-400 dark:bg-gray-600 rounded w-1/3"></div>
                  </div>
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