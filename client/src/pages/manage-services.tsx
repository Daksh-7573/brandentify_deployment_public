import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import ServicesManager from "@/components/profile/services-manager";

export default function ManageServicesPage() {
  const { user, loading: authLoading } = useAuth();
  const [userId, setUserId] = useState<number | null>(null);
  const [, setLocation] = useLocation();

  useEffect(() => {
    // If user auth is complete and no user, redirect to login
    if (!authLoading && !user) {
      setLocation("/login");
      return;
    }
    
    // Fetch numeric user ID if we have a firebase user
    if (user?.uid) {
      const fetchUserId = async () => {
        try {
          // Try to get the user profile by firebase UID
          const response = await fetch(`/api/users/by-username/${user.uid}`);
          
          if (response.ok) {
            const userData = await response.json();
            setUserId(userData.id); // Set the numeric user ID
          } else {
            console.error("Could not fetch user profile");
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
        }
      };
      
      fetchUserId();
    }
  }, [user, authLoading, setLocation]);

  if (authLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <DashboardLayout>
      <div className="container max-w-6xl mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-6">Manage Services</h1>
        <p className="text-gray-600 mb-8">
          Control which services you offer to potential clients. Active services will be displayed on your profile.
        </p>
        
        {userId ? (
          <ServicesManager userId={userId} />
        ) : (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}