import { useAuth } from "@/hooks/use-auth";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useFeatureAccess } from "@/hooks/use-feature-access";
import VisitingCardBuilder from "@/components/profile/visiting-card-builder";
import PersonalInfoSection from "@/components/profile/personal-info-section";
import EditContactInfo from "@/components/profile/edit-contact-info";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, AlertCircle } from "lucide-react";
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
import { isProfileComplete, getProfileCompletionMessage } from "@/lib/profile-completion";

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

  // Check if profile is complete before allowing access
  const profileIsComplete = isProfileComplete(userData);
  if (!profileIsComplete) {
    const message = getProfileCompletionMessage(userData);
    return (
      <div className="flex min-h-screen flex-col responsive-background">
        <Header />
        <div className="flex flex-1 flex-col items-center justify-center px-4">
          <NeoGlassLayout className="w-full max-w-md">
            <NeoGlassSection className="neo-glass-card border border-orange-500/30 bg-orange-500/10">
              <div className="p-8 text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-orange-500/20 rounded-full">
                    <AlertCircle className="h-8 w-8 text-orange-400" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Complete Your Profile
                </h2>
                <p className="text-white/70 mb-6">
                  {message} Please fill in all required information to unlock your Quantum Card.
                </p>
                <div className="space-y-3">
                  <Button asChild className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white">
                    <Link href="/profile">
                      Complete Profile
                    </Link>
                  </Button>
                  <Button
                    onClick={() => navigate("/")}
                    variant="outline"
                    className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20"
                  >
                    Back Home
                  </Button>
                </div>
              </div>
            </NeoGlassSection>
          </NeoGlassLayout>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col responsive-background">
      <Header />
      <NeoGlassLayout className="mx-6 mt-3 relative z-10">
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

        {/* Tabbed Content */}
        <Tabs defaultValue="card-design" className="w-full">
          <TabsList className="grid w-full grid-cols-2 dark-tabs-list border border-white/5 mb-6">
            <TabsTrigger 
              value="card-design" 
              className="dark-tabs-trigger"
              data-testid="tab-card-design"
            >
              Card Design
            </TabsTrigger>
            <TabsTrigger 
              value="contact-info" 
              className="dark-tabs-trigger"
              data-testid="tab-contact-info"
            >
              Contact Details
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Card Design */}
          <TabsContent value="card-design">
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
          </TabsContent>

          {/* Tab 2: Contact Details */}
          <TabsContent value="contact-info">
            <NeoGlassSection className="neo-glass-card border border-white/10 shadow-lg overflow-visible">
              <div className="p-6">
                <PersonalInfoSection
                  userData={userData as any}
                  onEdit={() => setShowEditContactInfo(true)}
                />
              </div>
            </NeoGlassSection>
          </TabsContent>
        </Tabs>
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
