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
    <div className="min-h-screen bg-black text-white">
      <Header />
      <div className="pt-20"> {/* Add padding to account for fixed header */}
        <NeoGlassLayout>
          <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-6">
                <Button variant="ghost" asChild className="neo-glass-button text-white hover:bg-white/10">
                  <Link href="/profile">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Profile
                  </Link>
                </Button>
              </div>
              
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold mb-2 text-white bg-clip-text bg-gradient-to-r from-white to-white/80">Quantum Card</h1>
                <p className="text-white/70 text-lg">
                  Create and customize your professional digital visiting card
                </p>
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