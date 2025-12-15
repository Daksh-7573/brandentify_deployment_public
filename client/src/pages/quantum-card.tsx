import { useAuth } from "@/hooks/use-auth";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useFeatureAccess } from "@/hooks/use-feature-access";
import VisitingCardBuilder from "@/components/profile/visiting-card-builder";
import PersonalInfoSection from "@/components/profile/personal-info-section";
import EditContactInfo from "@/components/profile/edit-contact-info";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Lock, Crown } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import {
  NeoGlassLayout,
  NeoGlassSection,
} from "@/components/layout/neo-glass-layout";
import Header from "@/components/layout/header";
import { UserData } from "@/types/user";
import { useState } from "react";
import { PortfolioPageSkeleton } from "@/components/ui/page-skeletons/portfolio-skeleton";
import { PremiumBadge } from "@/components/ui/premium-badge";

export default function QuantumCardPage() {
  const { user } = useAuth();
  const { isPremium, canAccessVisitingCard } = useFeatureAccess();
  const { toast } = useToast();
  const [_, navigate] = useLocation();
  const queryClient = useQueryClient();
  const [showEditContactInfo, setShowEditContactInfo] = useState(false);
  
  // Premium card access control using feature access system
  const canAccessCard = (cardType: string) => {
    const result = canAccessVisitingCard(cardType);
    return result.hasAccess;
  };

  // Fetch user data
  const { data: userData, isLoading } = useQuery({
    queryKey: [`/api/users/${user?.id}`],
    enabled: !!user?.id,
  });

  if (isLoading) {
    return <PortfolioPageSkeleton />;
  }

  if (!userData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="text-center max-w-md px-4">
          <h2 className="text-xl font-medium text-white mb-4">
            Profile Required
          </h2>
          <p className="text-white/70 mb-6">
            Please complete your profile to create your Quantum Card.
          </p>
          <Button asChild>
            <Link href="/profile">Complete Profile</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col k1">
      <Header />
      <NeoGlassLayout className="mx-6 mt-3 relative z-10 k2">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white">
                Quantum Card
              </h1>
              <p className="text-white/80 mt-1">
                Create and customize your professional digital visiting card
              </p>
            </div>
            <div className="flex items-center gap-3 mt-4 md:mt-0">
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
        <NeoGlassSection className="neo-glass-card border border-white/10 shadow-lg overflow-visible">
          <div className="p-6">
            {userData ? (
              <VisitingCardBuilder
                userData={userData as any}
                selectedCardType={
                  (userData as any)?.visitingCardType || "professional"
                }
                onCardTypeSelect={(cardType) => {
                  console.log("Selected card type:", cardType);
                }}
                isPremium={isPremium}
                canAccessCard={canAccessCard}
                canAccessVisitingCard={canAccessVisitingCard}
              />
            ) : (
              <div className="text-center py-8">
                <p className="text-white/70">Loading your quantum card...</p>
              </div>
            )}
          </div>
        </NeoGlassSection>
      </NeoGlassLayout>

      {/* Edit Contact Information Dialog */}
      {userData && showEditContactInfo && (
        <EditContactInfo
          userData={userData as UserData}
          onCancel={() => setShowEditContactInfo(false)}
          onSave={() => {
            setShowEditContactInfo(false);
            queryClient.invalidateQueries({
              queryKey: [`/api/users/${user?.id}`],
            });
          }}
        />
      )}
    </div>
  );
}
