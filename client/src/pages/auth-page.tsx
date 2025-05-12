import { useState, useEffect } from "react";
import { useAuth } from "../context/auth-context";
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
import { Mail, Phone, Check, Bug, LifeBuoy } from "lucide-react";
import { GoogleAuth } from "@/components/auth/google-auth";
import { PhoneAuth } from "@/components/auth/phone-auth";
import { EmailAuth } from "@/components/auth/email-auth";
import { DemoAuth } from "@/components/auth/demo-auth";
import DevelopmentAuth from "@/components/auth/development-auth";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Check if we're in development environment or Replit
const isDevelopment = process.env.NODE_ENV === 'development' || 
                     window.location.hostname.includes('.replit.app') ||
                     window.location.hostname.includes('picard.replit.dev');

export default function AuthPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const [_, setLocation] = useLocation();
  const [authMethod, setAuthMethod] = useState<"email" | "phone" | "development">("email");

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
            <Tabs 
              defaultValue={isDevelopment ? "development" : "email"} 
              onValueChange={(v) => setAuthMethod(v as "email" | "phone" | "development")}
            >
              <TabsList className={`grid ${isDevelopment ? "grid-cols-3" : "grid-cols-2"} mb-6`}>
                <TabsTrigger value="email" className="flex items-center gap-1.5">
                  <Mail className="h-4 w-4" />
                  <span>Email</span>
                </TabsTrigger>
                <TabsTrigger value="phone" className="flex items-center gap-1.5">
                  <Phone className="h-4 w-4" />
                  <span>Phone</span>
                </TabsTrigger>
                {isDevelopment && (
                  <TabsTrigger value="development" className="flex items-center gap-1.5 bg-amber-50">
                    <Bug className="h-4 w-4 text-amber-600" />
                    <span className="text-amber-800">Development</span>
                  </TabsTrigger>
                )}
              </TabsList>

              {/* Development Authentication - Bypasses security */}
              {isDevelopment && (
                <TabsContent value="development">
                  <Alert className="mb-4 bg-amber-50 border-amber-200">
                    <LifeBuoy className="h-4 w-4 text-amber-600" />
                    <AlertTitle>Authentication Security Bypass</AlertTitle>
                    <AlertDescription>
                      This mode disables cookie restrictions to allow login in Replit.
                    </AlertDescription>
                  </Alert>
                  <DevelopmentAuth />
                </TabsContent>
              )}

              {/* Email Authentication */}
              <TabsContent value="email">
                <div className="space-y-6">
                  <EmailAuth />
                  
                  <div className="relative w-full">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-gray-500">or sign in with</span>
                    </div>
                  </div>
                  
                  {/* Add Demo Auth as a more reliable option */}
                  <DemoAuth />
                  
                  <div className="relative w-full">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-gray-500">or use</span>
                    </div>
                  </div>
                  
                  <GoogleAuth />
                  
                  {isDevelopment && (
                    <div className="pt-4">
                      <Button 
                        variant="outline" 
                        className="w-full text-amber-600 border-amber-300 hover:bg-amber-50"
                        onClick={() => setAuthMethod("development")}
                      >
                        <Bug className="mr-2 h-4 w-4" />
                        Switch to Development Login
                      </Button>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Phone Authentication */}
              <TabsContent value="phone">
                <div className="space-y-6">
                  <PhoneAuth />
                  
                  <div className="relative w-full">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-gray-500">or try demo account</span>
                    </div>
                  </div>
                  
                  {/* Add Demo Auth to phone tab as well */}
                  <DemoAuth />
                  
                  {isDevelopment && (
                    <div className="pt-4">
                      <Button 
                        variant="outline" 
                        className="w-full text-amber-600 border-amber-300 hover:bg-amber-50"
                        onClick={() => setAuthMethod("development")}
                      >
                        <Bug className="mr-2 h-4 w-4" />
                        Switch to Development Login
                      </Button>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
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
            {isDevelopment && (
              <div className="pt-4 mt-4 border-t border-blue-500">
                <div className="bg-amber-500 text-white p-3 rounded-lg">
                  <h3 className="font-bold flex items-center gap-2">
                    <Bug className="h-5 w-5" />
                    Development Mode Active
                  </h3>
                  <p className="text-sm mt-1">
                    Security restrictions have been bypassed to enable login in Replit environment.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}