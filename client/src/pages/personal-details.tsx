import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import Header from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import PersonalInfoSection from "@/components/profile/personal-info-section";
import EditPersonalInfo from "@/components/profile/edit-personal-info";
import { ArrowLeft, Edit } from "lucide-react";
import { useLocation } from "wouter";

const PersonalDetailsPage: React.FC = () => {
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const userId = user?.uid;
  const [showEditPersonalInfo, setShowEditPersonalInfo] = useState(false);

  // Define UserData interface
  interface UserData {
    id: number;
    username: string;
    name: string | null;
    email: string;
    photoURL: string | null;
    title: string | null;
    location: string | null;
    industry: string | null;
    lookingFor: string | null;
    phoneNumber: string | null;
  }

  // Fetch user data
  const { data: userData, isLoading } = useQuery<UserData>({
    queryKey: [`/api/users/${userId}`],
    enabled: !!userId,
  });

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
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Edit Personal Information</DialogTitle>
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
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-10 w-10 rounded-full"
              onClick={() => navigate('/profile')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-semibold">Personal Details</h1>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowEditPersonalInfo(true)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </div>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
            <CardDescription>
              Your contact details visible to your connections and network
            </CardDescription>
          </CardHeader>
          <CardContent>
            {userData && <PersonalInfoSection userData={userData} />}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Privacy Settings</CardTitle>
            <CardDescription>
              Control who can see your personal information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Phone Number Visibility</h3>
                  <p className="text-sm text-gray-500">Who can see your phone number</p>
                </div>
                <Button variant="outline" size="sm">Connections Only</Button>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Email Visibility</h3>
                  <p className="text-sm text-gray-500">Who can see your email address</p>
                </div>
                <Button variant="outline" size="sm">Public</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PersonalDetailsPage;