import { useAuth } from "@/hooks/use-auth";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import VisitingCardBuilder from "@/components/profile/visiting-card-builder";
import PersonalInfoSection from "@/components/profile/personal-info-section";
import EditContactInfo from "@/components/profile/edit-contact-info";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link, useLocation } from "wouter";
import { NeoGlassLayout, NeoGlassSection } from "@/components/layout/neo-glass-layout";
import Header from "@/components/layout/header";
import { UserData } from "@/types/user";
import { useState } from "react";
import { FeedSkeleton } from "@/components/ui/skeleton-components";

export default function QuantumCardPage() {
  const { user } = useAuth();
  const [_, navigate] = useLocation();
  const queryClient = useQueryClient();
  const [showEditContactInfo, setShowEditContactInfo] = useState(false);

  // Fetch user data
  const { data: userData, isLoading } = useQuery({
    queryKey: [`/api/users/${user?.id}`],
    enabled: !!user?.id,
  });

  if (isLoading) {
    return <FeedSkeleton count={2} />;
  }

  if (!userData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="text-center max-w-md px-4">
          <h2 className="text-xl font-medium text-white mb-4">Profile Required</h2>
          <p className="text-white/70 mb-6">
            Please complete your profile to create your Quantum Card.
          </p>
          <Button asChild>
            <Link href="/profile">
              Complete Profile
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
        <NeoGlassLayout className="mx-6 mt-3 relative z-10">
            {/* Page Header */}
            <div className="mb-8">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight text-white">Quantum Card</h1>
                  <p className="text-white/80 mt-1">
                    Create and customize your professional digital visiting card
                  </p>
                </div>
                <div className="flex items-center gap-4 mt-4 md:mt-0">
                  <Button
                    onClick={() => navigate("/profile")}
                    variant="outline"
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Profile
                  </Button>
                </div>
              </div>
            </div>

            {/* Contact Information Section */}
            <NeoGlassSection className="neo-glass-card border border-white/10 shadow-lg mb-6 overflow-visible">
              <div className="p-6">
                <PersonalInfoSection 
                  userData={userData as any} 
                  onEdit={() => setShowEditContactInfo(true)}
                />
              </div>
            </NeoGlassSection>

            {/* Quantum Card Builder Section */}
            <div className="w-full mb-6 p-4 bg-blue-500/20 border border-blue-400 rounded-lg">
              <h2 className="text-white text-xl mb-4">🔧 DEBUG: Quantum Card Builder Section</h2>
              <NeoGlassSection className="neo-glass-card border border-white/10 shadow-lg overflow-visible">
                <div className="p-6">
                  <h3 className="text-white text-lg mb-4">Card Builder Component</h3>
                  <VisitingCardBuilder 
                    userData={userData as any}
                    selectedCardType={(userData as any)?.visitingCardType || 'quantum'}
                    onCardTypeSelect={(cardType) => {
                      // Handle card type selection if needed
                      console.log('Selected card type:', cardType);
                    }}
                  />
                </div>
              </NeoGlassSection>
            </div>
        </NeoGlassLayout>

      {/* Edit Contact Information Dialog */}
      {userData && showEditContactInfo && (
        <EditContactInfo
          userData={userData as UserData}
          onCancel={() => setShowEditContactInfo(false)}
          onSave={() => {
            setShowEditContactInfo(false);
            queryClient.invalidateQueries({ queryKey: [`/api/users/${user?.id}`] });
          }}
        />
      )}
    </div>
  );
}