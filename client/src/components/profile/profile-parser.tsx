import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/use-auth";
import ResumeUpload from "./resume-upload";
import LinkedInImport from "./linkedin-import";
import { Upload, Linkedin } from "lucide-react";

/**
 * Profile Parser Component
 * 
 * This component provides a unified interface for parsing profile data from 
 * both resume uploads and LinkedIn profiles, based on the algorithm.
 */
export default function ProfileParser() {
  const [activeTab, setActiveTab] = useState("resume");
  const { user } = useAuth();
  
  return (
    <Card className="mb-8">
      <CardContent className="pt-6">
        <div className="flex flex-col space-y-4">
          <h2 className="text-xl font-semibold">Import Your Professional Profile</h2>
          
          <Alert className="mb-2">
            <AlertTitle>Automatic Profile Population</AlertTitle>
            <AlertDescription>
              Upload your resume or connect your LinkedIn profile to automatically populate your professional information.
              You'll be able to review all extracted data before it's added to your profile.
            </AlertDescription>
          </Alert>
          
          <Separator className="my-4" />
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 mb-6">
              <TabsTrigger value="resume" className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Resume Upload
              </TabsTrigger>
              <TabsTrigger value="linkedin" className="flex items-center gap-2">
                <Linkedin className="h-4 w-4" />
                LinkedIn Import
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="resume" className="mt-0">
              <ResumeUpload />
            </TabsContent>
            
            <TabsContent value="linkedin" className="mt-0">
              <LinkedInImport />
            </TabsContent>
          </Tabs>
          
          <Separator className="my-4" />
          
          <div className="text-sm text-gray-500">
            <h3 className="font-medium mb-2">Our Profile Import Algorithm:</h3>
            <ol className="list-decimal pl-5 space-y-1">
              <li>Upload your resume or connect your LinkedIn profile</li>
              <li>We'll extract and clean your professional data</li>
              <li>Empty fields will remain blank rather than being auto-generated</li>
              <li>You'll review all data before it's saved to your profile</li>
              <li>Your profile will be updated with the information you approve</li>
            </ol>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}