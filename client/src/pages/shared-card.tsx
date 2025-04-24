import React, { useEffect, useState } from 'react';
import SharedCardView from '@/components/profile/shared-card-view';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';

interface SharedCardPageProps {
  userId: string;
}

const SharedCardPage: React.FC<SharedCardPageProps> = ({ userId }) => {
  const [sanitizedUserId, setSanitizedUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Process and sanitize the userId
    const processUserId = () => {
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
        console.log("Cleaned userId:", cleaned);
        
        // Verify it's either a valid numeric ID or a Firebase UID
        const isNumeric = /^\d+$/.test(cleaned);
        const isFirebaseUID = cleaned.length > 20 && /[A-Za-z0-9_-]+/.test(cleaned);
        
        if (!isNumeric && !isFirebaseUID) {
          console.error("User ID is neither numeric nor a valid Firebase UID:", cleaned);
          setError("Invalid user ID format");
          setLoading(false);
          return;
        }
        
        // Set the sanitized user ID
        setSanitizedUserId(cleaned);
        setLoading(false);
      } catch (err) {
        console.error("Error processing user ID:", err);
        setError("Error processing user ID");
        setLoading(false);
      }
    };
    
    processUserId();
  }, [userId]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
          <h2 className="text-xl font-medium">Preparing Quantum Card...</h2>
          <p className="text-gray-500 mt-2">Please wait while we load this card</p>
        </div>
      </div>
    );
  }

  if (error || !sanitizedUserId) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="rounded-full bg-red-100 p-3 w-12 h-12 mx-auto mb-4 flex items-center justify-center">
            <span className="text-red-500 text-2xl font-bold">!</span>
          </div>
          <h2 className="text-xl font-medium">Invalid Quantum Card Link</h2>
          <p className="text-gray-500 mt-2">{error || "The link you followed is not valid or the card doesn't exist."}</p>
          <Button asChild className="mt-6">
            <Link href="/">
              Return to Home
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return <SharedCardView userId={sanitizedUserId} />;
};

export default SharedCardPage;