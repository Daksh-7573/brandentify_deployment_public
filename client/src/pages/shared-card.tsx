import React, { useEffect, useState } from 'react';
import { ArrowLeft, Check, Copy, Loader2, Mail, Phone, Globe, Briefcase, MapPin, Code, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import type { UserData as UserDataType } from '@/types/user';

// Optimized lightweight card display for faster loading
interface OptimizedCardDisplayProps {
  userData: UserDataType;
  cardType: string;
}

const OptimizedCardDisplay: React.FC<OptimizedCardDisplayProps> = ({ userData, cardType }) => {
  // Format profile link
  const profileLink = `brandentifier.com/@${userData.name ? userData.name.replace(/\s+/g, '') : userData.username}`;
  
  // Debug card type
  console.log("Rendering card with type:", cardType);
  console.log("User data visiting card type:", userData.visitingCardType);
  
  // Convert the card type to a normalized format for comparison
  const normalizedCardType = String(cardType).toLowerCase().trim();
  console.log("Normalized card type:", normalizedCardType);
  
  // For holographic card style (transparent glass effect)
  if (normalizedCardType === "holographic") {
    return (
      <div className="w-full h-full rounded-lg overflow-hidden shadow-lg flex flex-col"
        style={{
          background: "rgba(255, 255, 255, 0.4)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
        }}>
        {/* Profile header section */}
        <div className="h-[140px] relative" 
          style={{
            background: "linear-gradient(135deg, rgba(255, 255, 255, 0.4), rgba(255, 255, 255, 0.1))",
            borderBottom: "1px solid rgba(255, 255, 255, 0.2)"
          }}>
          <div className="absolute left-1/2 top-[70px] -translate-x-1/2 w-[80px] h-[80px] rounded-full overflow-hidden border-4 border-white shadow-md flex items-center justify-center">
            {userData.photoURL ? (
              <img 
                src={userData.photoURL} 
                alt={userData.name || "Profile"} 
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = `https://ui-avatars.com/api/?name=${userData.name || "User"}`;
                }}
              />
            ) : (
              <img 
                src={`https://ui-avatars.com/api/?name=${userData.name || "User"}`}
                alt={userData.name || "Profile"}
                className="w-full h-full object-cover"
              />
            )}
          </div>
        </div>
        
        {/* Main content */}
        <div className="flex-1 px-4 pt-12 pb-4 flex flex-col"
          style={{
            background: "linear-gradient(135deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.1))"
          }}>
          {/* Name and title */}
          <div className="text-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              {userData.name || "Your Name"}
            </h2>
            <p className="text-sm text-gray-700">
              {userData.title || "Professional"}
            </p>
          </div>
          
          <div className="flex-1 space-y-2 text-xs">
            {/* Domain */}
            {userData.domain && (
              <div className="flex items-center gap-2">
                <Code className="h-3.5 w-3.5 text-gray-500" />
                <span className="text-gray-800">
                  {userData.domain === "all" ? "General" : userData.domain}
                </span>
              </div>
            )}
            
            {/* Industry */}
            {userData.industry && (
              <div className="flex items-center gap-2">
                <Building2 className="h-3.5 w-3.5 text-gray-500" />
                <span className="text-gray-800">
                  {userData.industry}
                </span>
              </div>
            )}
            
            {/* Location */}
            {userData.location && (
              <div className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-gray-500" />
                <span className="text-gray-800">
                  {userData.location}
                </span>
              </div>
            )}
            
            {/* Email */}
            <div className="flex items-center gap-2">
              <Mail className="h-3.5 w-3.5 text-gray-500" />
              <span className="text-gray-800">{userData.email}</span>
            </div>
            
            {/* Phone */}
            <div className="flex items-center gap-2">
              <Phone className="h-3.5 w-3.5 text-gray-500" />
              <span className="text-gray-800">{userData.phoneNumber || "Add phone number"}</span>
            </div>
            
            {/* Profile Link */}
            <div className="flex items-center gap-2">
              <Globe className="h-3.5 w-3.5 text-gray-500" />
              <span className="text-blue-600">{profileLink}</span>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="h-[30px] flex items-center justify-center"
          style={{
            background: "linear-gradient(135deg, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.1))",
            borderTop: "1px solid rgba(255, 255, 255, 0.2)",
          }}>
          <span className="text-xs font-light text-gray-800">Quantum Card</span>
        </div>
      </div>
    );
  }
  
  // For neoglow card style (dark theme with neon elements)
  if (normalizedCardType === "neoglow") {
    return (
      <div className="w-full h-full rounded-lg overflow-hidden shadow-lg flex flex-col"
        style={{
          background: "linear-gradient(to bottom, #111827, #1e293b)",
          color: "white",
        }}>
        {/* Profile header with neon border */}
        <div className="h-[140px] relative bg-[#0c1222] border-b-2 border-[#0ea5e9]">
          <div className="absolute left-1/2 top-[70px] -translate-x-1/2 w-[80px] h-[80px] rounded-full overflow-hidden border-4 border-[#0ea5e9] shadow-[0_0_15px_#0ea5e9] flex items-center justify-center">
            {userData.photoURL ? (
              <img 
                src={userData.photoURL} 
                alt={userData.name || "Profile"} 
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = `https://ui-avatars.com/api/?name=${userData.name || "User"}`;
                }}
              />
            ) : (
              <img 
                src={`https://ui-avatars.com/api/?name=${userData.name || "User"}`}
                alt={userData.name || "Profile"}
                className="w-full h-full object-cover"
              />
            )}
          </div>
        </div>
        
        {/* Main content */}
        <div className="flex-1 px-4 pt-12 pb-4 flex flex-col">
          {/* Name and title */}
          <div className="text-center mb-4">
            <h2 className="text-xl font-bold text-white" style={{ textShadow: "0 0 10px #0ea5e9" }}>
              {userData.name || "Your Name"}
            </h2>
            <p className="text-sm text-gray-400">
              {userData.title || "Professional"}
            </p>
          </div>
          
          <div className="flex-1 space-y-2 text-xs">
            {/* Domain */}
            {userData.domain && (
              <div className="flex items-center gap-2">
                <Code className="h-3.5 w-3.5 text-[#0ea5e9]" />
                <span className="text-gray-300">
                  {userData.domain === "all" ? "General" : userData.domain}
                </span>
              </div>
            )}
            
            {/* Industry */}
            {userData.industry && (
              <div className="flex items-center gap-2">
                <Building2 className="h-3.5 w-3.5 text-[#0ea5e9]" />
                <span className="text-gray-300">
                  {userData.industry}
                </span>
              </div>
            )}
            
            {/* Location */}
            {userData.location && (
              <div className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-[#0ea5e9]" />
                <span className="text-gray-300">
                  {userData.location}
                </span>
              </div>
            )}
            
            {/* Email */}
            <div className="flex items-center gap-2">
              <Mail className="h-3.5 w-3.5 text-[#0ea5e9]" />
              <span className="text-gray-300">{userData.email}</span>
            </div>
            
            {/* Phone */}
            <div className="flex items-center gap-2">
              <Phone className="h-3.5 w-3.5 text-[#0ea5e9]" />
              <span className="text-gray-300">{userData.phoneNumber || "Add phone number"}</span>
            </div>
            
            {/* Profile Link */}
            <div className="flex items-center gap-2">
              <Globe className="h-3.5 w-3.5 text-[#0ea5e9]" />
              <span className="text-[#0ea5e9]">{profileLink}</span>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="h-[30px] bg-[rgba(14,165,233,0.2)] border-t border-[#0ea5e9] flex items-center justify-center">
          <span className="text-xs font-light text-[#0ea5e9]" style={{ textShadow: "0 0 5px #0ea5e9" }}>Quantum Card</span>
        </div>
      </div>
    );
  }
  
  // For 3D animated card style
  if (normalizedCardType === "3d-animated") {
    return (
      <div className="w-full h-full rounded-lg overflow-hidden shadow-lg flex flex-col transform"
        style={{
          background: "linear-gradient(135deg, #e2e8f0, #f8fafc)",
          color: "#334155",
          transform: "perspective(1000px) rotateX(5deg) rotateY(-5deg)",
          boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1), 0 5px 10px rgba(0, 0, 0, 0.05)",
        }}>
        {/* Profile header section */}
        <div className="h-[140px] relative" style={{ background: "linear-gradient(135deg, #60a5fa, #3b82f6)" }}>
          <div className="absolute left-1/2 top-[70px] -translate-x-1/2 w-[80px] h-[80px] rounded-full overflow-hidden border-4 border-white shadow-md flex items-center justify-center">
            {userData.photoURL ? (
              <img 
                src={userData.photoURL} 
                alt={userData.name || "Profile"} 
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = `https://ui-avatars.com/api/?name=${userData.name || "User"}`;
                }}
              />
            ) : (
              <img 
                src={`https://ui-avatars.com/api/?name=${userData.name || "User"}`}
                alt={userData.name || "Profile"}
                className="w-full h-full object-cover"
              />
            )}
          </div>
        </div>
        
        {/* Main content */}
        <div className="flex-1 px-4 pt-12 pb-4 flex flex-col bg-white">
          {/* Name and title */}
          <div className="text-center mb-4">
            <h2 className="text-xl font-bold text-gray-700">
              {userData.name || "Your Name"}
            </h2>
            <p className="text-sm text-gray-500">
              {userData.title || "Professional"}
            </p>
          </div>
          
          <div className="flex-1 space-y-2 text-xs">
            {/* Domain */}
            {userData.domain && (
              <div className="flex items-center gap-2">
                <Code className="h-3.5 w-3.5 text-blue-500" />
                <span className="text-gray-600">
                  {userData.domain === "all" ? "General" : userData.domain}
                </span>
              </div>
            )}
            
            {/* Industry */}
            {userData.industry && (
              <div className="flex items-center gap-2">
                <Building2 className="h-3.5 w-3.5 text-blue-500" />
                <span className="text-gray-600">
                  {userData.industry}
                </span>
              </div>
            )}
            
            {/* Location */}
            {userData.location && (
              <div className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-blue-500" />
                <span className="text-gray-600">
                  {userData.location}
                </span>
              </div>
            )}
            
            {/* Email */}
            <div className="flex items-center gap-2">
              <Mail className="h-3.5 w-3.5 text-blue-500" />
              <span className="text-gray-600">{userData.email}</span>
            </div>
            
            {/* Phone */}
            <div className="flex items-center gap-2">
              <Phone className="h-3.5 w-3.5 text-blue-500" />
              <span className="text-gray-600">{userData.phoneNumber || "Add phone number"}</span>
            </div>
            
            {/* Profile Link */}
            <div className="flex items-center gap-2">
              <Globe className="h-3.5 w-3.5 text-blue-500" />
              <span className="text-blue-500">{profileLink}</span>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="h-[30px] flex items-center justify-center" style={{ background: "linear-gradient(135deg, #60a5fa, #3b82f6)" }}>
          <span className="text-xs font-light text-white">Quantum Card</span>
        </div>
      </div>
    );
  }
  
  // Default professional card style
  return (
    <div className="w-full h-full rounded-lg overflow-hidden shadow-lg flex flex-col bg-white">
      {/* Profile header section */}
      <div className="h-[140px] relative bg-gray-100">
        <div className="absolute left-1/2 top-[70px] -translate-x-1/2 w-[80px] h-[80px] rounded-full overflow-hidden border-4 border-white bg-gray-50 flex items-center justify-center">
          {userData.photoURL ? (
            <img 
              src={userData.photoURL} 
              alt={userData.name || "Profile"} 
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = `https://ui-avatars.com/api/?name=${userData.name || "User"}`;
              }}
            />
          ) : (
            <img 
              src={`https://ui-avatars.com/api/?name=${userData.name || "User"}`}
              alt={userData.name || "Profile"}
              className="w-full h-full object-cover"
            />
          )}
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 px-4 pt-12 pb-4 flex flex-col">
        {/* Name and title */}
        <div className="text-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            {userData.name || "Your Name"}
          </h2>
          <p className="text-sm text-gray-600">
            {userData.title || "Professional"}
          </p>
        </div>
        
        <div className="flex-1 space-y-2 text-xs">
          {/* Domain */}
          {userData.domain && (
            <div className="flex items-center gap-2">
              <Code className="h-3.5 w-3.5 text-blue-500" />
              <span className="text-gray-700">
                {userData.domain === "all" ? "General" : userData.domain}
              </span>
            </div>
          )}
          
          {/* Industry */}
          {userData.industry && (
            <div className="flex items-center gap-2">
              <Building2 className="h-3.5 w-3.5 text-blue-500" />
              <span className="text-gray-700">
                {userData.industry}
              </span>
            </div>
          )}
          
          {/* Location */}
          {userData.location && (
            <div className="flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5 text-blue-500" />
              <span className="text-gray-700">
                {userData.location}
              </span>
            </div>
          )}
          
          {/* Email */}
          <div className="flex items-center gap-2">
            <Mail className="h-3.5 w-3.5 text-blue-500" />
            <span className="text-gray-700">{userData.email}</span>
          </div>
          
          {/* Phone */}
          <div className="flex items-center gap-2">
            <Phone className="h-3.5 w-3.5 text-blue-500" />
            <span className="text-gray-700">{userData.phoneNumber || "Add phone number"}</span>
          </div>
          
          {/* Profile Link */}
          <div className="flex items-center gap-2">
            <Globe className="h-3.5 w-3.5 text-blue-500" />
            <span className="text-blue-500">{profileLink}</span>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="h-[30px] bg-blue-500 flex items-center justify-center">
        <span className="text-xs font-light text-white">Quantum Card</span>
      </div>
    </div>
  );
};

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

// Inline loading component to display immediately
const InstantLoadingIndicator = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-white dark:bg-gray-900 z-50">
    <div className="text-center space-y-4">
      <div className="inline-block w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-gray-600 dark:text-gray-300">Loading Quantum Card...</p>
    </div>
  </div>
);

const SharedCardPage: React.FC<SharedCardPageProps> = ({ userId }) => {
  const [userData, setUserData] = useState<UserDataType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const [isCopied, setIsCopied] = useState(false);
  const [instantLoading, setInstantLoading] = useState(true);

  // Show immediate loading indicator
  useEffect(() => {
    // Hide the instant loader after a short delay to show main content
    const timer = setTimeout(() => {
      setInstantLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

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

  // Show the instant loading indicator first
  if (instantLoading) {
    return <InstantLoadingIndicator />;
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
            {/* Fast-loading optimized card display */}
            <div style={{ 
              width: "280px", 
              height: "490px",
              margin: "0 auto"
            }}>
              <div className="visiting-card-preview w-full h-full aspect-[2/3.5]">
                <OptimizedCardDisplay 
                  userData={userData}
                  cardType={userData.visitingCardType || 'professional-renewed'}
                />
              </div>
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