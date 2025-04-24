import React, { useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import Header from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import PersonalInfoSection from "@/components/profile/personal-info-section";
import EditPersonalInfo from "@/components/profile/edit-personal-info";
import VisitingCardBuilder from "@/components/profile/visiting-card-builder";
import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import { UserData } from "@/types/user";
import { apiRequest } from "@/lib/queryClient";

const PersonalDetailsPage: React.FC = () => {
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const userId = user?.uid;
  const [showEditPersonalInfo, setShowEditPersonalInfo] = useState(false);
  const [selectedCardType, setSelectedCardType] = useState<string>("");

  // Fetch user data
  const { data: userData, isLoading } = useQuery<UserData>({
    queryKey: [`/api/users/${userId}`],
    enabled: !!userId,
  });

  // Define mutation to save card preference
  const saveCardPreference = useMutation({
    mutationFn: (cardType: string) => {
      return apiRequest({
        url: `/api/users/${userId}`,
        method: 'PUT',
        data: { visitingCardType: cardType },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}`] });
    },
    onError: (error) => {
      console.error("Error saving card preference:", error);
    }
  });

  // Handle card type selection
  const handleCardTypeSelect = (cardType: string) => {
    setSelectedCardType(cardType);
    saveCardPreference.mutate(cardType);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <div className="flex-1 p-6 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Edit personal info dialog */}
      {userData && (
        <Dialog open={showEditPersonalInfo} onOpenChange={setShowEditPersonalInfo}>
          <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Personal Information</DialogTitle>
              <DialogDescription>
                Update your contact details and profile information
              </DialogDescription>
            </DialogHeader>
            <EditPersonalInfo 
              userData={userData}
              onCancel={() => setShowEditPersonalInfo(false)}
              onSave={() => {
                setShowEditPersonalInfo(false);
                // Refetch user data
                queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}`] });
              }}
            />
          </DialogContent>
        </Dialog>
      )}
      
      <Header />
      
      <div className="flex-1 p-6 container max-w-4xl mx-auto">
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-10 w-10 rounded-full mr-2"
            onClick={() => navigate('/profile')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-semibold">Personal Details</h1>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>
              Your contact details and quantum card settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            {userData && (
              <>
                <PersonalInfoSection 
                  userData={userData} 
                  onEdit={() => setShowEditPersonalInfo(true)}
                />
                
                {/* Quantum Card Builder Component */}
                <VisitingCardBuilder 
                  userData={userData}
                  selectedCardType={userData.visitingCardType || selectedCardType}
                  onCardTypeSelect={handleCardTypeSelect}
                />
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PersonalDetailsPage;