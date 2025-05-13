import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, Phone, Check } from "lucide-react";
import { GoogleAuth } from "@/components/auth/google-auth";
import { PhoneAuth } from "@/components/auth/phone-auth";
import { EmailAuth } from "@/components/auth/email-auth";
import { DemoLogin } from "@/components/auth/demo-login";

export default function AuthPage() {
  const { isAuthenticated, isLoading, signInWithPhone } = useAuth();
  const [_, setLocation] = useLocation();
  const [authMethod, setAuthMethod] = useState<"email" | "phone">("email");
  const [useDemoBypass, setUseDemoBypass] = useState(false);
  
  // Check if we're on the problematic domain that needs bypass
  useEffect(() => {
    const currentHostname = window.location.hostname;
    // If we're on the problematic domain that firebase doesn't work with
    if (currentHostname === "25d68c5d-166d-4f92-b5c1-cdfc68146e33-00-2kol6l2kz9i0s.picard.replit.dev") {
      console.log("Detected problematic domain - enabling demo bypass");
      setUseDemoBypass(true);
    }
  }, []);

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      setLocation("/dashboard");
    }
  }, [isAuthenticated, setLocation]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 flex flex-col items-center justify-center p-4">
      <div className="grid md:grid-cols-2 gap-8 max-w-4xl w-full">
        {/* Left column - Auth forms */}
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              Welcome to Brandentifier
            </CardTitle>
            <CardDescription className="text-center">
              Sign in to accelerate your professional growth
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="email" onValueChange={(v) => setAuthMethod(v as "email" | "phone")}>
              <TabsList className="grid grid-cols-2 mb-6">
                <TabsTrigger value="email" className="flex items-center gap-1.5">
                  <Mail className="h-4 w-4" />
                  <span>Email</span>
                </TabsTrigger>
                <TabsTrigger value="phone" className="flex items-center gap-1.5">
                  <Phone className="h-4 w-4" />
                  <span>Phone</span>
                </TabsTrigger>
              </TabsList>

              {/* Email Authentication */}
              <TabsContent value="email">
                <div className="space-y-6">
                  {useDemoBypass ? (
                    <>
                      <div className="bg-blue-50 px-3 py-2 rounded-lg mb-4 text-sm text-blue-700">
                        Using direct demo login for this domain
                      </div>
                      <DemoLogin />
                    </>
                  ) : (
                    <>
                      <EmailAuth />
                      
                      <div className="relative w-full">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t border-gray-300" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-white px-2 text-gray-500">or</span>
                        </div>
                      </div>
                      
                      <GoogleAuth />
                      
                      <div className="mt-6 pt-4 border-t border-gray-200">
                        <div className="flex flex-col gap-2">
                          <p className="text-xs text-gray-500 text-center">Having trouble with Google login?</p>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full text-sm border-blue-300 hover:bg-blue-50"
                            onClick={() => window.location.href = '/auth-test'}
                          >
                            Try Firebase Authentication Test Page
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </TabsContent>

              {/* Phone Authentication */}
              <TabsContent value="phone">
                {useDemoBypass ? (
                  <>
                    <div className="bg-blue-50 px-3 py-2 rounded-lg mb-4 text-sm text-blue-700">
                      Using direct demo login for this domain
                    </div>
                    <DemoLogin />
                  </>
                ) : (
                  <PhoneAuth />
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
          {/* Footer content removed */}
        </Card>

        {/* Right column - Hero content */}
        <div className="flex flex-col justify-center p-4 space-y-6 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl text-white hidden md:flex">
          <h2 className="text-3xl font-bold">Elevate Your Career</h2>
          <p className="text-lg">
            Brandentifier helps you discover your professional strengths and connect with opportunities that match your unique profile.
          </p>
          <div className="space-y-4">
            <div className="flex items-start space-x-2">
              <Check className="h-5 w-5 mt-0.5 text-green-300" />
              <p>AI-powered career guidance tailored to your experience</p>
            </div>
            <div className="flex items-start space-x-2">
              <Check className="h-5 w-5 mt-0.5 text-green-300" />
              <p>Smart networking with professionals in your field</p>
            </div>
            <div className="flex items-start space-x-2">
              <Check className="h-5 w-5 mt-0.5 text-green-300" />
              <p>Automatic resume parsing and profile enhancement</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}