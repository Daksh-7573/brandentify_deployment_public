import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import VisitingCardBuilder from "@/components/profile/visiting-card-builder";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { NeoGlassLayout, NeoGlassSection } from "@/components/layout/neo-glass-layout";
import Header from "@/components/layout/header";
import { UserData } from "@/types/user";

export default function QuantumCardPage() {
  const { user } = useAuth();

  // Fetch user data
  const { data: userData, isLoading } = useQuery({
    queryKey: [`/api/users/${user?.uid}`],
    enabled: !!user?.uid,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
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
    <div className="flex h-screen flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden pt-16">
        <div className="flex-1 overflow-auto">
          <NeoGlassLayout className="mt-3 mx-6">
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
                    onClick={() => window.location.href = '/profile'}
                    variant="outline"
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Profile
                  </Button>
                </div>
              </div>
            </div>

            <NeoGlassSection className="neo-glass-card border border-white/10 shadow-lg">
              <div className="p-6">
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
      </div>
    </div>
  );
}