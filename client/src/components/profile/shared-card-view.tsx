import React, { useEffect, useState } from "react";
import { UserData } from "@/types/user";
import VisitingCardPreview from "./visiting-card-preview";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";

interface SharedCardViewProps {
  userId: string;
}

const SharedCardView: React.FC<SharedCardViewProps> = ({ userId }) => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        console.log("Fetching user data for shared card with ID:", userId);
        
        // Determine what kind of ID we have (numeric or Firebase UID)
        // and use the appropriate strategy to fetch the data
        let numericId: number | null = null;
        let firebaseUid: string | null = null;
        
        // Check if the ID is already numeric
        if (!isNaN(Number(userId))) {
          numericId = parseInt(userId as string, 10);
          firebaseUid = null;
          console.log("Using numeric ID for shared card:", numericId);
        } else {
          // Assume it's a Firebase UID
          firebaseUid = userId as string;
          numericId = null;
          console.log("Using Firebase UID for shared card:", firebaseUid);
        }
        
        // Try different approaches to fetch the user data
        let response;
        let fetchSuccessful = false;
        let fetchErrors = [];
        
        // First try: Use numeric ID directly
        if (numericId !== null) {
          try {
            console.log("Attempt 1: Fetching with numeric ID:", numericId);
            response = await apiRequest({
              url: `/api/users/${numericId}`,
              method: 'GET',
              headers: { 'Content-Type': 'application/json' },
              customConfig: {},
              retries: 1
            });
            console.log("Numeric ID fetch succeeded:", response);
            fetchSuccessful = true;
          } catch (err) {
            console.log("Numeric ID fetch failed:", err);
            fetchErrors.push({ method: "numeric", error: err });
          }
        }
        
        // Second try: Use Firebase UID directly
        if (!fetchSuccessful && firebaseUid !== null) {
          try {
            console.log("Attempt 2: Fetching with Firebase UID:", firebaseUid);
            response = await apiRequest({
              url: `/api/users/${firebaseUid}`,
              method: 'GET',
              headers: { 'Content-Type': 'application/json' },
              customConfig: {},
              retries: 1
            });
            console.log("Firebase UID fetch succeeded:", response);
            fetchSuccessful = true;
          } catch (err) {
            console.log("Firebase UID fetch failed:", err);
            fetchErrors.push({ method: "firebase", error: err });
          }
        }
        
        // Third try: Use a different endpoint structure if both previous attempts failed
        if (!fetchSuccessful) {
          try {
            const idToUse = numericId !== null ? numericId : firebaseUid;
            console.log("Attempt 3: Fetching with alternative endpoint structure:", idToUse);
            response = await apiRequest({
              url: `/api/enhanced-user/${idToUse}`,
              method: 'GET',
              headers: { 'Content-Type': 'application/json' },
              customConfig: {},
              retries: 1
            });
            console.log("Alternative endpoint fetch succeeded:", response);
            fetchSuccessful = true;
          } catch (err) {
            console.log("Alternative endpoint fetch failed:", err);
            fetchErrors.push({ method: "alternative", error: err });
          }
        }
        
        if (!fetchSuccessful) {
          console.error("All fetch attempts failed:", fetchErrors);
          throw new Error("Could not fetch user data after multiple attempts");
        }
        
        console.log("Shared card user data:", response);
        
        // Handle empty response
        if (!response || typeof response !== 'object' || Object.keys(response).length === 0) {
          throw new Error("Received empty user data");
        }
        
        setUserData(response as UserData);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching user data for shared card:", err);
        setError("Could not load this Quantum Card. It may not exist or has been removed.");
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserData();
    }
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
          <p className="text-gray-500 mt-2">{error || "This Quantum Card could not be loaded."}</p>
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

export default SharedCardView;